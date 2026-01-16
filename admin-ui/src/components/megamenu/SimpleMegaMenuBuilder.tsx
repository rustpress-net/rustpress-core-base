import React, { useState, useCallback, useMemo, createContext, useContext, useRef, useEffect } from 'react';
import { usePosts, useCategories, useTags, useProducts, useTeamMembers, FALLBACK_DATA, PostData, CategoryData, TagData, ProductData, TeamMemberData } from '../../hooks/useMegaMenuData';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  X,
  Columns,
  LayoutGrid,
  Image,
  FileText,
  Link as LinkIcon,
  Save,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Settings,
  Palette,
  Type,
  List,
  Grid,
  ShoppingBag,
  Tag,
  Folder,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  Maximize2,
  Sparkles,
  Wand2,
  Check,
  ArrowRight,
  ExternalLink,
  // Additional icons for 50+ widgets
  Video,
  Music,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  Users,
  User,
  UserCheck,
  Briefcase,
  Star,
  Heart,
  MessageCircle,
  Share2,
  Download,
  Upload,
  Search,
  Filter,
  Sliders,
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  Zap,
  Award,
  Gift,
  Percent,
  DollarSign,
  CreditCard,
  Truck,
  Package,
  Box,
  Layers,
  Layout,
  Sidebar,
  Menu,
  MoreHorizontal,
  Hash,
  AtSign,
  Globe,
  Rss,
  Podcast,
  Radio,
  Tv,
  Camera,
  Film,
  Aperture,
  Sun,
  Moon,
  Cloud,
  Umbrella,
  Thermometer,
  Wind,
  Droplet,
  Flame,
  Leaf,
  TreeDeciduous,
  Mountain,
  Waves,
  Anchor,
  Plane,
  Car,
  Train,
  Bike,
  Navigation,
  Compass,
  Map,
  Flag,
  Bookmark,
  Bell,
  AlertCircle,
  Info,
  HelpCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Shield,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Scan,
  QrCode,
  Printer,
  FileImage,
  FileVideo,
  FileAudio,
  FilePlus,
  FolderOpen,
  Archive,
  Clipboard,
  Copy,
  Scissors,
  Edit3,
  Pencil,
  Eraser,
  Highlighter,
  PenTool,
  Brush,
  Pipette,
  Crop,
  Move,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Minimize2,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Diamond,
  Crown,
  Gem,
  Coins,
  Wallet,
  PiggyBank,
  Landmark,
  Building,
  Building2,
  Home,
  Hotel,
  Warehouse,
  Factory,
  Store,
  GraduationCap,
  BookOpen,
  Library,
  Newspaper,
  ScrollText,
  FileCheck,
  ClipboardList,
  ListChecks,
  ListOrdered,
  Table,
  Kanban,
  GanttChart,
  Target,
  Crosshair,
  Focus,
  Glasses,
  Microscope,
  ScanEye,
  Satellite,
  Rocket,
  Atom,
  Dna,
  Pill,
  Stethoscope,
  Syringe,
  HeartPulse,
  Brain,
  Bone,
  Ear,
  Hand,
  Footprints,
  Baby,
  PersonStanding,
  Accessibility,
  Gamepad2,
  Puzzle,
  Dice1,
  Trophy,
  Medal,
  Timer,
  Hourglass,
  History,
  FastForward,
  Rewind,
  Play,
  Pause,
  StopCircle,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Headphones,
  Speaker,
  Radio as RadioIcon,
  Wifi,
  WifiOff,
  Bluetooth,
  Cast,
  Airplay,
  ScreenShare,
  MonitorPlay,
  Presentation,
  Projector,
  Cpu,
  HardDrive,
  Database,
  Server,
  Cloud as CloudIcon,
  Upload as CloudUploadIcon,
  Download as CloudDownloadIcon,
  RefreshCw,
  Repeat,
  Shuffle,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Code,
  Code2,
  Terminal,
  Binary,
  Braces,
  FileCode,
  Bug,
  TestTube,
  Beaker,
  FlaskConical,
  Sparkle,
  PartyPopper,
  Cake,
  IceCream,
  Pizza,
  Coffee,
  Wine,
  Beer,
  Utensils,
  ChefHat,
  Apple,
  Banana,
  Cherry,
  Citrus,
  Grape,
  Carrot,
  Salad,
  Sandwich,
  Soup,
  Egg,
  Croissant,
  Cookie,
  Candy,
  Popcorn,
  Drumstick,
  Fish,
  Beef,
  Milk,
  CupSoda,
  GlassWater,
  Martini,
  Cigarette,
  Pill as PillIcon,
  Siren,
  AlarmClock,
  BellRing,
  Megaphone,
  Speech,
  Quote,
  Languages,
  SpellCheck,
  TextCursor,
  Subscript,
  Superscript,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Indent,
  Outdent,
  WrapText,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Pilcrow,
  ListTree,
  ListMinus,
  ListPlus,
  Minus,
  Equal,
  Divide,
  Sigma,
  Infinity,
  Pi,
  Percent as PercentIcon,
  Hash as HashIcon,
  Asterisk,
  Variable,
  Regex,
  FormInput,
  ToggleLeft,
  ToggleRight,
  CheckSquare,
  XSquare,
  MinusSquare,
  PlusSquare,
  CircleDot,
  CircleSlash,
  SplitSquareHorizontal,
  SplitSquareVertical,
  PanelLeftClose,
  PanelRightClose,
  PanelTopClose,
  PanelBottomClose,
  Rows,
  Columns as ColumnsIcon,
  LayoutDashboard,
  LayoutList,
  LayoutPanelLeft,
  LayoutPanelTop,
  LayoutTemplate,
  Component,
  Blocks,
  BoxSelect,
  Frame,
  Ruler,
  PencilRuler,
  Ratio,
  Scaling,
  ScanLine,
  Shapes,
  Spline,
  Workflow
} from 'lucide-react';
import clsx from 'clsx';
import type { MegaMenuConfig, MegaMenuColumn, MegaMenuWidget, WidgetType, BackgroundEffectType, BackgroundEffectConfig, WidgetStyle } from './MegaMenuBuilder';
import { getDefaultMegaMenuConfig, BACKGROUND_EFFECT_PRESETS } from './MegaMenuBuilder';

// ==================== CSS STYLE LIBRARY ====================

interface SavedCssStyle {
  id: string;
  name: string;
  category: 'animation' | 'shadow' | 'border' | 'effect' | 'layout' | 'custom';
  css: string;
  createdAt: number;
}

const STYLE_LIBRARY_KEY = 'rustpress-megamenu-style-library';

// Built-in style presets that come with the system
const BUILTIN_STYLE_PRESETS: SavedCssStyle[] = [
  // Animations
  { id: 'builtin-fade-in', name: 'Fade In', category: 'animation', css: `animation: fadeIn 0.3s ease-out;\n}\n@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`, createdAt: 0 },
  { id: 'builtin-slide-left', name: 'Slide Left', category: 'animation', css: `animation: slideLeft 0.4s ease-out;\n}\n@keyframes slideLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }`, createdAt: 0 },
  { id: 'builtin-slide-right', name: 'Slide Right', category: 'animation', css: `animation: slideRight 0.4s ease-out;\n}\n@keyframes slideRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }`, createdAt: 0 },
  { id: 'builtin-zoom-in', name: 'Zoom In', category: 'animation', css: `animation: zoomIn 0.3s ease-out;\n}\n@keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`, createdAt: 0 },
  { id: 'builtin-bounce', name: 'Bounce', category: 'animation', css: `animation: bounce 0.5s ease;\n}\n@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }`, createdAt: 0 },
  { id: 'builtin-pulse', name: 'Pulse', category: 'animation', css: `animation: pulse 2s infinite;\n}\n@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }`, createdAt: 0 },
  { id: 'builtin-shake', name: 'Shake', category: 'animation', css: `animation: shake 0.5s ease-in-out;\n}\n@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }`, createdAt: 0 },
  { id: 'builtin-rotate', name: 'Rotate In', category: 'animation', css: `animation: rotateIn 0.4s ease-out;\n}\n@keyframes rotateIn { from { opacity: 0; transform: rotate(-10deg); } to { opacity: 1; transform: rotate(0); } }`, createdAt: 0 },
  { id: 'builtin-flip', name: 'Flip', category: 'animation', css: `animation: flip 0.6s ease-out;\n}\n@keyframes flip { from { opacity: 0; transform: perspective(400px) rotateX(90deg); } to { opacity: 1; transform: perspective(400px) rotateX(0); } }`, createdAt: 0 },
  { id: 'builtin-swing', name: 'Swing', category: 'animation', css: `animation: swing 1s ease-in-out;\n}\n@keyframes swing { 20% { transform: rotate(15deg); } 40% { transform: rotate(-10deg); } 60% { transform: rotate(5deg); } 80% { transform: rotate(-5deg); } 100% { transform: rotate(0); } }`, createdAt: 0 },
  // Shadows
  { id: 'builtin-soft-shadow', name: 'Soft Shadow', category: 'shadow', css: `box-shadow: 0 4px 15px rgba(0,0,0,0.1);`, createdAt: 0 },
  { id: 'builtin-deep-shadow', name: 'Deep Shadow', category: 'shadow', css: `box-shadow: 0 10px 40px rgba(0,0,0,0.15);`, createdAt: 0 },
  { id: 'builtin-hover-shadow', name: 'Hover Shadow', category: 'shadow', css: `box-shadow: 0 4px 15px rgba(0,0,0,0.1);\ntransition: box-shadow 0.3s ease;\n}\n.WIDGET_CLASS:hover {\nbox-shadow: 0 15px 50px rgba(0,0,0,0.2);`, createdAt: 0 },
  { id: 'builtin-colored-shadow', name: 'Colored Shadow', category: 'shadow', css: `box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);`, createdAt: 0 },
  { id: 'builtin-neon-glow', name: 'Neon Glow', category: 'shadow', css: `box-shadow: 0 0 5px #00f7ff, 0 0 10px #00f7ff, 0 0 20px #00f7ff, 0 0 40px #00f7ff;`, createdAt: 0 },
  { id: 'builtin-inset-shadow', name: 'Inset Shadow', category: 'shadow', css: `box-shadow: inset 0 2px 10px rgba(0,0,0,0.1);`, createdAt: 0 },
  // Borders
  { id: 'builtin-gradient-border', name: 'Gradient Border', category: 'border', css: `border: 2px solid transparent;\nbackground: linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box;\nborder-radius: 12px;`, createdAt: 0 },
  { id: 'builtin-rainbow-border', name: 'Rainbow Border', category: 'border', css: `border: 3px solid transparent;\nborder-radius: 12px;\nbackground: linear-gradient(white, white) padding-box, linear-gradient(90deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #ff0000) border-box;\nanimation: rainbowShift 3s linear infinite;\nbackground-size: 100% 100%, 300% 100%;\n}\n@keyframes rainbowShift { 0% { background-position: 0% 0%, 0% 0%; } 100% { background-position: 0% 0%, 300% 0%; } }`, createdAt: 0 },
  { id: 'builtin-accent-border', name: 'Accent Border', category: 'border', css: `border: 2px solid #6366f1;\nborder-radius: 8px;`, createdAt: 0 },
  { id: 'builtin-dashed-border', name: 'Dashed Border', category: 'border', css: `border: 2px dashed #9ca3af;\nborder-radius: 8px;`, createdAt: 0 },
  // Effects
  { id: 'builtin-glass', name: 'Glassmorphism', category: 'effect', css: `background: rgba(255, 255, 255, 0.1);\nbackdrop-filter: blur(10px);\n-webkit-backdrop-filter: blur(10px);\nborder: 1px solid rgba(255, 255, 255, 0.2);\nborder-radius: 16px;`, createdAt: 0 },
  { id: 'builtin-frosted', name: 'Frosted Glass', category: 'effect', css: `background: rgba(255, 255, 255, 0.85);\nbackdrop-filter: blur(8px);\n-webkit-backdrop-filter: blur(8px);\nborder-radius: 12px;`, createdAt: 0 },
  { id: 'builtin-neumorphism', name: 'Neumorphism', category: 'effect', css: `background: #e0e0e0;\nbox-shadow: 5px 5px 10px #bebebe, -5px -5px 10px #ffffff;\nborder-radius: 12px;`, createdAt: 0 },
  { id: 'builtin-scale-hover', name: 'Scale on Hover', category: 'effect', css: `transition: transform 0.3s ease;\n}\n.WIDGET_CLASS:hover {\ntransform: scale(1.02);`, createdAt: 0 },
  { id: 'builtin-lift-hover', name: 'Lift on Hover', category: 'effect', css: `transition: transform 0.3s ease, box-shadow 0.3s ease;\n}\n.WIDGET_CLASS:hover {\ntransform: translateY(-4px);\nbox-shadow: 0 10px 30px rgba(0,0,0,0.15);`, createdAt: 0 },
  { id: 'builtin-3d-tilt', name: '3D Tilt', category: 'effect', css: `transform: perspective(1000px) rotateX(2deg);\ntransition: transform 0.4s ease;\n}\n.WIDGET_CLASS:hover {\ntransform: perspective(1000px) rotateX(0deg);`, createdAt: 0 },
  // Layout
  { id: 'builtin-card-style', name: 'Card Style', category: 'layout', css: `background: white;\nborder-radius: 12px;\npadding: 20px;\nbox-shadow: 0 2px 8px rgba(0,0,0,0.08);`, createdAt: 0 },
  { id: 'builtin-dark-card', name: 'Dark Card', category: 'layout', css: `background: #1f2937;\nborder-radius: 12px;\npadding: 20px;\ncolor: white;`, createdAt: 0 },
  { id: 'builtin-gradient-card', name: 'Gradient Card', category: 'layout', css: `background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\nborder-radius: 12px;\npadding: 20px;\ncolor: white;`, createdAt: 0 },
  { id: 'builtin-bordered-section', name: 'Bordered Section', category: 'layout', css: `border: 1px solid #e5e7eb;\nborder-radius: 8px;\npadding: 16px;\nbackground: #fafafa;`, createdAt: 0 },
];

// Get saved styles from localStorage
const getSavedStyles = (): SavedCssStyle[] => {
  try {
    const saved = localStorage.getItem(STYLE_LIBRARY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

// Save styles to localStorage
const saveStylesToStorage = (styles: SavedCssStyle[]) => {
  try {
    localStorage.setItem(STYLE_LIBRARY_KEY, JSON.stringify(styles));
  } catch (e) {
    console.error('Failed to save styles:', e);
  }
};

// Style Library Context
interface StyleLibraryContextType {
  savedStyles: SavedCssStyle[];
  addStyle: (style: Omit<SavedCssStyle, 'id' | 'createdAt'>) => void;
  removeStyle: (id: string) => void;
  getAllStyles: () => SavedCssStyle[];
}

const StyleLibraryContext = createContext<StyleLibraryContextType | null>(null);

const useStyleLibrary = () => {
  const context = useContext(StyleLibraryContext);
  if (!context) {
    // Return a default implementation if not inside provider
    return {
      savedStyles: [],
      addStyle: () => {},
      removeStyle: () => {},
      getAllStyles: () => BUILTIN_STYLE_PRESETS,
    };
  }
  return context;
};

// ==================== SIMPLIFIED TYPES ====================

interface SimpleMegaMenuBuilderProps {
  menuItemId: string;
  menuItemLabel: string;
  config: MegaMenuConfig | null;
  onSave: (config: MegaMenuConfig) => void;
  onClose: () => void;
}

interface SimpleWidget {
  type: WidgetType;
  label: string;
  icon: any; // LucideIcon type
  description: string;
}

// ==================== CONSTANTS ====================

interface WidgetCategory {
  id: string;
  label: string;
  icon: any;
  widgets: SimpleWidget[];
}

const WIDGET_CATEGORIES: WidgetCategory[] = [
  {
    id: 'navigation',
    label: 'Navigation',
    icon: Navigation,
    widgets: [
      { type: 'links', label: 'Links List', icon: List, description: 'Vertical list of links' },
      { type: 'icon-list', label: 'Icon Links', icon: ListChecks, description: 'Links with icons' },
      { type: 'categories', label: 'Categories', icon: Folder, description: 'Category list' },
      { type: 'tags', label: 'Tags Cloud', icon: Tag, description: 'Tag cloud display' },
      { type: 'tabs', label: 'Tabbed Content', icon: Layers, description: 'Content in tabs' },
      { type: 'accordion', label: 'Accordion', icon: ChevronDown, description: 'Collapsible sections' },
      { type: 'breadcrumbs', label: 'Breadcrumbs', icon: ChevronRight, description: 'Navigation path' },
      { type: 'sitemap', label: 'Sitemap', icon: Map, description: 'Site structure' },
      { type: 'page-tree', label: 'Page Tree', icon: ListTree, description: 'Hierarchical pages' },
    ]
  },
  {
    id: 'content',
    label: 'Content',
    icon: FileText,
    widgets: [
      { type: 'text', label: 'Text Block', icon: Type, description: 'Rich text content' },
      { type: 'html', label: 'HTML Code', icon: Code, description: 'Custom HTML' },
      { type: 'posts', label: 'Recent Posts', icon: FileText, description: 'Blog posts' },
      { type: 'icon-box', label: 'Icon Box', icon: Box, description: 'Icon with text' },
      { type: 'testimonial', label: 'Testimonial', icon: Quote, description: 'Customer quote' },
      { type: 'team-member', label: 'Team Member', icon: User, description: 'Team profile' },
      { type: 'featured-post', label: 'Featured Post', icon: Bookmark, description: 'Highlighted article' },
      { type: 'author-box', label: 'Author Box', icon: UserCheck, description: 'Author profile' },
      { type: 'faq', label: 'FAQ', icon: HelpCircle, description: 'Q&A section' },
    ]
  },
  {
    id: 'media',
    label: 'Media',
    icon: Image,
    widgets: [
      { type: 'image', label: 'Image', icon: Image, description: 'Single image' },
      { type: 'image-gallery', label: 'Gallery', icon: Grid, description: 'Image gallery' },
      { type: 'video', label: 'Video', icon: Video, description: 'Embed video' },
      { type: 'carousel', label: 'Carousel', icon: Layers, description: 'Image slider' },
      { type: 'banner', label: 'Banner', icon: Frame, description: 'Promotional banner' },
      { type: 'audio-player', label: 'Audio Player', icon: Music, description: 'Audio embed' },
      { type: 'podcast', label: 'Podcast', icon: Podcast, description: 'Podcast player' },
      { type: 'lightbox', label: 'Lightbox', icon: Maximize2, description: 'Image lightbox' },
    ]
  },
  {
    id: 'ecommerce',
    label: 'E-Commerce',
    icon: ShoppingBag,
    widgets: [
      { type: 'products', label: 'Products', icon: ShoppingBag, description: 'Product grid' },
      { type: 'pricing-card', label: 'Pricing', icon: DollarSign, description: 'Pricing table' },
      { type: 'sale-banner', label: 'Sale Banner', icon: Percent, description: 'Sale promotion' },
      { type: 'featured-deal', label: 'Featured Deal', icon: Zap, description: 'Special offer' },
      { type: 'cart-preview', label: 'Cart Preview', icon: ShoppingBag, description: 'Mini cart' },
      { type: 'product-card', label: 'Product Card', icon: Package, description: 'Single product' },
      { type: 'coupon-code', label: 'Coupon Code', icon: Gift, description: 'Discount code' },
      { type: 'compare', label: 'Compare', icon: Columns, description: 'Product compare' },
      { type: 'wishlist', label: 'Wishlist', icon: Heart, description: 'Saved items' },
    ]
  },
  {
    id: 'actions',
    label: 'Call to Action',
    icon: ArrowRight,
    widgets: [
      { type: 'cta-button', label: 'Button', icon: ArrowRight, description: 'Action button' },
      { type: 'cta-banner', label: 'CTA Banner', icon: Megaphone, description: 'Full banner CTA' },
      { type: 'newsletter', label: 'Newsletter', icon: Mail, description: 'Email signup' },
      { type: 'search', label: 'Search Box', icon: Search, description: 'Search field' },
      { type: 'download-button', label: 'Download', icon: Download, description: 'Download button' },
      { type: 'app-store', label: 'App Store', icon: Smartphone, description: 'App download links' },
      { type: 'book-demo', label: 'Book Demo', icon: Calendar, description: 'Schedule meeting' },
      { type: 'free-trial', label: 'Free Trial', icon: Rocket, description: 'Trial signup' },
    ]
  },
  {
    id: 'contact',
    label: 'Contact',
    icon: Phone,
    widgets: [
      { type: 'contact-info', label: 'Contact Info', icon: Phone, description: 'Phone/email' },
      { type: 'map', label: 'Map', icon: MapPin, description: 'Location map' },
      { type: 'social-links', label: 'Social Links', icon: Share2, description: 'Social icons' },
      { type: 'business-hours', label: 'Business Hours', icon: Clock, description: 'Opening hours' },
      { type: 'quick-contact', label: 'Quick Contact', icon: MessageCircle, description: 'Contact form' },
      { type: 'live-chat', label: 'Live Chat', icon: MessageCircle, description: 'Chat widget' },
      { type: 'whatsapp', label: 'WhatsApp', icon: Phone, description: 'WhatsApp link' },
      { type: 'support', label: 'Support', icon: HelpCircle, description: 'Help desk link' },
    ]
  },
  {
    id: 'data',
    label: 'Data & Stats',
    icon: BarChart3,
    widgets: [
      { type: 'stats', label: 'Statistics', icon: BarChart3, description: 'Number stats' },
      { type: 'progress-bar', label: 'Progress Bar', icon: Activity, description: 'Progress indicator' },
      { type: 'countdown', label: 'Countdown', icon: Timer, description: 'Timer countdown' },
      { type: 'chart', label: 'Chart', icon: PieChart, description: 'Data chart' },
      { type: 'data-table', label: 'Table', icon: Table, description: 'Data table' },
      { type: 'counter', label: 'Counter', icon: Hash, description: 'Animated counter' },
      { type: 'timeline', label: 'Timeline', icon: History, description: 'Event timeline' },
      { type: 'milestone', label: 'Milestone', icon: Flag, description: 'Achievement marker' },
    ]
  },
  {
    id: 'social',
    label: 'Social',
    icon: Users,
    widgets: [
      { type: 'social-icons', label: 'Social Icons', icon: Share2, description: 'Social buttons' },
      { type: 'twitter-feed', label: 'Twitter Feed', icon: AtSign, description: 'Twitter posts' },
      { type: 'instagram-feed', label: 'Instagram', icon: Camera, description: 'Instagram feed' },
      { type: 'facebook-feed', label: 'Facebook', icon: Users, description: 'Facebook feed' },
      { type: 'youtube-videos', label: 'YouTube', icon: Video, description: 'YouTube videos' },
      { type: 'linkedin-feed', label: 'LinkedIn', icon: Briefcase, description: 'LinkedIn feed' },
      { type: 'tiktok-videos', label: 'TikTok', icon: Music, description: 'TikTok videos' },
      { type: 'discord-widget', label: 'Discord', icon: MessageCircle, description: 'Discord widget' },
    ]
  },
  {
    id: 'utility',
    label: 'Utility',
    icon: Settings,
    widgets: [
      { type: 'divider', label: 'Divider', icon: Minus, description: 'Horizontal line' },
      { type: 'spacer', label: 'Spacer', icon: Square, description: 'Empty space' },
      { type: 'icon', label: 'Icon', icon: Star, description: 'Single icon' },
      { type: 'badge', label: 'Badge', icon: Award, description: 'Label badge' },
      { type: 'alert', label: 'Alert', icon: AlertCircle, description: 'Alert message' },
      { type: 'tooltip', label: 'Tooltip', icon: Info, description: 'Info tooltip' },
      { type: 'notice', label: 'Notice', icon: Bell, description: 'Notification bar' },
      { type: 'qr-code', label: 'QR Code', icon: QrCode, description: 'QR generator' },
    ]
  },
  {
    id: 'advanced',
    label: 'Advanced',
    icon: Sparkles,
    widgets: [
      { type: 'code-block', label: 'Code Block', icon: Terminal, description: 'Code snippet' },
      { type: 'shortcode', label: 'Shortcode', icon: Braces, description: 'RustPress shortcode' },
      { type: 'widget-area', label: 'Widget Area', icon: Layout, description: 'Sidebar widgets' },
      { type: 'template', label: 'Template', icon: LayoutTemplate, description: 'Saved template' },
      { type: 'dynamic-content', label: 'Dynamic', icon: Workflow, description: 'Dynamic content' },
      { type: 'api-data', label: 'API Data', icon: Database, description: 'REST API content' },
      { type: 'rust-component', label: 'Rust Component', icon: Cpu, description: 'Custom Rust widget' },
      { type: 'webhook', label: 'Webhook', icon: Zap, description: 'External webhook' },
    ]
  },
  {
    id: 'forms',
    label: 'Forms',
    icon: FormInput,
    widgets: [
      { type: 'contact-form', label: 'Contact Form', icon: Mail, description: 'Contact submission' },
      { type: 'subscribe-form', label: 'Subscribe', icon: Bell, description: 'Subscription form' },
      { type: 'login-form', label: 'Login', icon: Lock, description: 'Login form' },
      { type: 'register-form', label: 'Register', icon: User, description: 'Registration form' },
      { type: 'survey', label: 'Survey', icon: ClipboardList, description: 'Survey form' },
      { type: 'poll', label: 'Poll', icon: BarChart3, description: 'Voting poll' },
      { type: 'feedback-form', label: 'Feedback', icon: MessageCircle, description: 'Feedback form' },
      { type: 'quiz', label: 'Quiz', icon: Puzzle, description: 'Interactive quiz' },
    ]
  },
  {
    id: 'branding',
    label: 'Branding',
    icon: Crown,
    widgets: [
      { type: 'logo', label: 'Logo', icon: Crown, description: 'Brand logo' },
      { type: 'tagline', label: 'Tagline', icon: Type, description: 'Brand slogan' },
      { type: 'trust-badges', label: 'Trust Badges', icon: Shield, description: 'Security badges' },
      { type: 'certifications', label: 'Certifications', icon: Award, description: 'Cert badges' },
      { type: 'partner-logos', label: 'Partner Logos', icon: Users, description: 'Partner showcase' },
      { type: 'press-mentions', label: 'Press', icon: Newspaper, description: 'Press mentions' },
      { type: 'awards', label: 'Awards', icon: Trophy, description: 'Award display' },
      { type: 'ratings', label: 'Ratings', icon: Star, description: 'Review ratings' },
    ]
  },
];

// Flatten for backward compatibility
const SIMPLE_WIDGETS: SimpleWidget[] = WIDGET_CATEGORIES.flatMap(cat => cat.widgets);

const COLUMN_PRESETS = [
  { columns: 1, label: '1 Column', widths: [100] },
  { columns: 2, label: '2 Columns', widths: [50, 50] },
  { columns: 3, label: '3 Columns', widths: [33, 34, 33] },
  { columns: 4, label: '4 Columns', widths: [25, 25, 25, 25] },
  { columns: 2, label: '2:1 Ratio', widths: [66, 34] },
  { columns: 2, label: '1:2 Ratio', widths: [34, 66] },
  { columns: 3, label: '1:2:1 Ratio', widths: [25, 50, 25] },
];

const BACKGROUND_PRESETS = [
  { label: 'White', color: '#ffffff' },
  { label: 'Light Gray', color: '#f8fafc' },
  { label: 'Dark', color: '#1e293b' },
  { label: 'Primary', color: '#3b82f6' },
  { label: 'Purple', color: '#8b5cf6' },
  { label: 'Gradient Blue', gradient: { type: 'linear' as const, angle: 135, colors: [{ color: '#3b82f6', position: 0 }, { color: '#8b5cf6', position: 100 }] } },
];

// ==================== WIDGET TEMPLATES ====================

interface WidgetTemplate {
  id: string;
  name: string;
  description: string;
  preview?: string; // Preview image or emoji
  config: Record<string, any>;
  style?: WidgetStyle;
}

// Templates for each major widget type
const WIDGET_TEMPLATES: Record<string, WidgetTemplate[]> = {
  // ===== LINKS WIDGET TEMPLATES =====
  'links': [
    { id: 'links-minimal', name: 'Minimal', description: 'Clean simple links', preview: '', config: { links: [{ label: 'Link 1', url: '#' }, { label: 'Link 2', url: '#' }, { label: 'Link 3', url: '#' }], style: { linkColor: '#3b82f6', fontSize: 14, spacing: 6, showBullets: false } } },
    { id: 'links-arrows', name: 'With Arrows', description: 'Links with arrow bullets', preview: '', config: { links: [{ label: 'Link 1', url: '#' }, { label: 'Link 2', url: '#' }, { label: 'Link 3', url: '#' }], style: { linkColor: '#3b82f6', fontSize: 14, spacing: 8, showBullets: true, bulletStyle: 'arrow' } } },
    { id: 'links-dots', name: 'Bullet Points', description: 'Traditional bullet list', preview: '', config: { links: [{ label: 'Link 1', url: '#' }, { label: 'Link 2', url: '#' }, { label: 'Link 3', url: '#' }], style: { linkColor: '#374151', fontSize: 14, spacing: 8, showBullets: true, bulletStyle: 'dot' } } },
    { id: 'links-underline', name: 'Underlined', description: 'Links with underline on hover', preview: '', config: { links: [{ label: 'Link 1', url: '#' }, { label: 'Link 2', url: '#' }, { label: 'Link 3', url: '#' }], style: { linkColor: '#1f2937', fontSize: 15, spacing: 10, showBullets: false, underline: true } } },
    { id: 'links-bold', name: 'Bold Style', description: 'Bold prominent links', preview: '', config: { links: [{ label: 'Link 1', url: '#' }, { label: 'Link 2', url: '#' }, { label: 'Link 3', url: '#' }], style: { linkColor: '#111827', fontSize: 16, fontWeight: 'bold', spacing: 12, showBullets: false } } },
    { id: 'links-colored-bg', name: 'Colored Background', description: 'Links with colored backgrounds', preview: '', config: { links: [{ label: 'Link 1', url: '#' }, { label: 'Link 2', url: '#' }, { label: 'Link 3', url: '#' }], style: { linkColor: '#ffffff', backgroundColor: '#3b82f6', fontSize: 14, spacing: 4, padding: 8, borderRadius: 6 } } },
    { id: 'links-gradient', name: 'Gradient Hover', description: 'Gradient effect on hover', preview: '', config: { links: [{ label: 'Link 1', url: '#' }, { label: 'Link 2', url: '#' }, { label: 'Link 3', url: '#' }], style: { linkColor: '#7c3aed', hoverGradient: 'linear-gradient(135deg, #7c3aed, #db2777)', fontSize: 14, spacing: 8 } } },
    { id: 'links-numbered', name: 'Numbered', description: 'Numbered list style', preview: '', config: { links: [{ label: 'Link 1', url: '#' }, { label: 'Link 2', url: '#' }, { label: 'Link 3', url: '#' }], style: { linkColor: '#374151', fontSize: 14, spacing: 8, showNumbers: true } } },
    { id: 'links-dark', name: 'Dark Mode', description: 'Dark themed links', preview: '', config: { links: [{ label: 'Link 1', url: '#' }, { label: 'Link 2', url: '#' }, { label: 'Link 3', url: '#' }], style: { linkColor: '#93c5fd', backgroundColor: '#1e293b', fontSize: 14, spacing: 10, padding: 12 } } },
    { id: 'links-icons', name: 'With Icons', description: 'Links with leading icons', preview: '', config: { links: [{ label: 'Documentation', url: '#', icon: 'book' }, { label: 'Support', url: '#', icon: 'help' }, { label: 'Contact', url: '#', icon: 'mail' }], style: { linkColor: '#3b82f6', iconColor: '#6b7280', fontSize: 14, spacing: 10 } } },
    { id: 'links-cards', name: 'Card Style', description: 'Each link as a card', preview: '', config: { links: [{ label: 'Link 1', url: '#' }, { label: 'Link 2', url: '#' }, { label: 'Link 3', url: '#' }], style: { linkColor: '#374151', backgroundColor: '#f9fafb', borderColor: '#e5e7eb', fontSize: 14, spacing: 8, padding: 12, borderRadius: 8, borderWidth: 1 } } },
    { id: 'links-mega', name: 'Mega Menu Style', description: 'Large clickable areas', preview: '', config: { links: [{ label: 'Link 1', url: '#', description: 'Description here' }, { label: 'Link 2', url: '#', description: 'Description here' }], style: { linkColor: '#111827', fontSize: 16, fontWeight: 'semibold', spacing: 16, showDescriptions: true } } },
  ],

  // ===== POSTS WIDGET TEMPLATES =====
  'posts': [
    { id: 'posts-list', name: 'Simple List', description: 'Basic title list', preview: '', config: { count: 5, showImage: false, showExcerpt: false, showDate: true, style: { titleColor: '#1f2937', dateColor: '#6b7280', spacing: 8 } } },
    { id: 'posts-cards', name: 'Card Grid', description: 'Posts as cards with images', preview: '', config: { count: 4, showImage: true, showExcerpt: true, showDate: true, layout: 'grid', columns: 2, style: { backgroundColor: '#ffffff', borderRadius: 12, shadow: 'md' } } },
    { id: 'posts-horizontal', name: 'Horizontal Cards', description: 'Side-by-side layout', preview: '', config: { count: 3, showImage: true, showExcerpt: true, layout: 'horizontal', imagePosition: 'left', style: { imageWidth: '120px', spacing: 16 } } },
    { id: 'posts-featured', name: 'Featured First', description: 'Large first post, small rest', preview: '', config: { count: 5, showImage: true, layout: 'featured', style: { featuredImageHeight: '200px', smallImageSize: '60px' } } },
    { id: 'posts-minimal', name: 'Minimal', description: 'Just titles with dates', preview: '', config: { count: 6, showImage: false, showExcerpt: false, showDate: true, showAuthor: false, style: { titleColor: '#374151', fontSize: 14, lineHeight: 1.6 } } },
    { id: 'posts-magazine', name: 'Magazine Style', description: 'Editorial layout', preview: '', config: { count: 4, showImage: true, showExcerpt: true, showCategory: true, layout: 'magazine', style: { categoryColor: '#dc2626', titleSize: 18 } } },
    { id: 'posts-timeline', name: 'Timeline', description: 'Chronological timeline', preview: '', config: { count: 5, showImage: false, showDate: true, layout: 'timeline', style: { lineColor: '#e5e7eb', dotColor: '#3b82f6' } } },
    { id: 'posts-compact', name: 'Compact', description: 'Dense list view', preview: '', config: { count: 8, showImage: false, showExcerpt: false, showDate: true, style: { fontSize: 13, spacing: 4, padding: 4 } } },
    { id: 'posts-thumbnails', name: 'With Thumbnails', description: 'Small thumbnails on left', preview: '', config: { count: 4, showImage: true, showExcerpt: false, showDate: true, imageSize: 'thumbnail', style: { imageWidth: '80px', imageHeight: '60px' } } },
    { id: 'posts-carousel', name: 'Carousel', description: 'Sliding posts', preview: '', config: { count: 6, showImage: true, layout: 'carousel', autoplay: true, showDots: true, style: { cardWidth: '280px' } } },
    { id: 'posts-dark', name: 'Dark Theme', description: 'Dark background posts', preview: '', config: { count: 4, showImage: true, style: { backgroundColor: '#1e293b', titleColor: '#f1f5f9', textColor: '#94a3b8' } } },
  ],

  // ===== SALE BANNER TEMPLATES =====
  'sale-banner': [
    { id: 'sale-gradient', name: 'Gradient Banner', description: 'Bold gradient background', preview: '', config: { title: 'MEGA SALE', subtitle: 'Up to 50% OFF', code: 'SAVE50', style: { background: 'linear-gradient(135deg, #ef4444, #f97316)', textColor: '#ffffff', titleSize: 28, subtitleSize: 16 } } },
    { id: 'sale-minimal', name: 'Minimal', description: 'Clean minimal design', preview: '', config: { title: 'Sale', subtitle: '20% off all items', code: '', style: { background: '#f8fafc', textColor: '#1f2937', borderColor: '#e5e7eb', borderWidth: 1 } } },
    { id: 'sale-neon', name: 'Neon Glow', description: 'Neon effect banner', preview: '', config: { title: 'FLASH SALE', subtitle: 'Limited Time Only', code: 'FLASH', style: { background: '#0f172a', textColor: '#22d3ee', glowColor: '#22d3ee', titleSize: 32 } } },
    { id: 'sale-ribbon', name: 'Ribbon Style', description: 'Corner ribbon design', preview: '', config: { title: '-30%', subtitle: '', style: { background: '#dc2626', textColor: '#ffffff', layout: 'ribbon', position: 'top-right' } } },
    { id: 'sale-countdown', name: 'With Countdown', description: 'Urgency timer', preview: '', config: { title: 'SALE ENDS IN', showCountdown: true, endDate: new Date(Date.now() + 86400000).toISOString(), style: { background: '#7c3aed', textColor: '#ffffff' } } },
    { id: 'sale-holiday', name: 'Holiday Theme', description: 'Festive design', preview: '', config: { title: 'HOLIDAY SALE', subtitle: 'Save Big This Season', code: 'HOLIDAY', style: { background: '#15803d', textColor: '#ffffff', accentColor: '#fbbf24' } } },
    { id: 'sale-black-friday', name: 'Black Friday', description: 'Bold black design', preview: '', config: { title: 'BLACK FRIDAY', subtitle: 'BIGGEST SALE OF THE YEAR', code: 'BF2024', style: { background: '#000000', textColor: '#fbbf24', titleSize: 36 } } },
    { id: 'sale-summer', name: 'Summer Sale', description: 'Bright summer theme', preview: '', config: { title: 'SUMMER SALE', subtitle: 'Hot Deals Inside', code: 'SUMMER', style: { background: 'linear-gradient(135deg, #f59e0b, #ea580c)', textColor: '#ffffff' } } },
    { id: 'sale-clearance', name: 'Clearance', description: 'Clearance sale style', preview: '', config: { title: 'CLEARANCE', subtitle: 'Everything Must Go', code: '', style: { background: '#dc2626', textColor: '#ffffff', pattern: 'stripes' } } },
    { id: 'sale-member', name: 'Members Only', description: 'Exclusive member deal', preview: '', config: { title: 'MEMBERS ONLY', subtitle: 'Exclusive 40% Discount', code: 'VIP40', style: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', textColor: '#ffffff', badge: 'VIP' } } },
    { id: 'sale-animated', name: 'Animated', description: 'With animation effects', preview: '', config: { title: 'SPECIAL OFFER', subtitle: 'Limited Stock', code: 'DEAL', style: { background: '#1e40af', textColor: '#ffffff', animation: 'pulse' } } },
  ],

  // ===== PRODUCTS WIDGET TEMPLATES =====
  'products': [
    { id: 'products-grid', name: 'Product Grid', description: 'Standard product grid', preview: '', config: { count: 4, columns: 2, showPrice: true, showRating: true, style: { cardPadding: 12, imageHeight: '150px' } } },
    { id: 'products-list', name: 'Product List', description: 'Vertical list view', preview: '', config: { count: 4, layout: 'list', showPrice: true, showDescription: true, style: { imageWidth: '100px' } } },
    { id: 'products-carousel', name: 'Product Carousel', description: 'Sliding products', preview: '', config: { count: 6, layout: 'carousel', showPrice: true, autoplay: true, style: { cardWidth: '200px' } } },
    { id: 'products-featured', name: 'Featured Products', description: 'Large featured items', preview: '', config: { count: 3, layout: 'featured', showPrice: true, showBadge: true, badgeText: 'Featured', style: { imageHeight: '200px' } } },
    { id: 'products-minimal', name: 'Minimal Cards', description: 'Clean minimal design', preview: '', config: { count: 4, columns: 2, showPrice: true, showRating: false, style: { borderRadius: 4, shadow: 'none' } } },
    { id: 'products-hover', name: 'Hover Effects', description: 'Interactive hover cards', preview: '', config: { count: 4, columns: 2, showPrice: true, hoverEffect: 'zoom', style: { transition: '0.3s' } } },
    { id: 'products-sale', name: 'Sale Products', description: 'With sale badges', preview: '', config: { count: 4, filter: 'sale', showOriginalPrice: true, showBadge: true, badgeText: 'SALE', style: { badgeColor: '#ef4444' } } },
    { id: 'products-compact', name: 'Compact View', description: 'Small compact cards', preview: '', config: { count: 6, columns: 3, showPrice: true, showRating: false, style: { imageHeight: '100px', fontSize: 12 } } },
    { id: 'products-dark', name: 'Dark Theme', description: 'Dark mode products', preview: '', config: { count: 4, columns: 2, style: { backgroundColor: '#1e293b', textColor: '#f1f5f9', priceColor: '#22d3ee' } } },
    { id: 'products-bestseller', name: 'Best Sellers', description: 'Top products badge', preview: '', config: { count: 4, filter: 'bestseller', showBadge: true, badgeText: 'Best Seller', style: { badgeColor: '#f59e0b' } } },
    { id: 'products-new', name: 'New Arrivals', description: 'New products highlight', preview: '', config: { count: 4, filter: 'new', showBadge: true, badgeText: 'NEW', style: { badgeColor: '#10b981' } } },
  ],

  // ===== CATEGORIES WIDGET TEMPLATES =====
  'categories': [
    { id: 'cats-list', name: 'Simple List', description: 'Basic category list', preview: '', config: { showCount: true, showIcon: false, style: { linkColor: '#374151', fontSize: 14, spacing: 8 } } },
    { id: 'cats-icons', name: 'With Icons', description: 'Categories with icons', preview: '', config: { showCount: true, showIcon: true, style: { iconSize: 20, iconColor: '#3b82f6' } } },
    { id: 'cats-cards', name: 'Card Style', description: 'Category cards', preview: '', config: { layout: 'cards', columns: 2, showCount: true, showImage: true, style: { borderRadius: 8, padding: 12 } } },
    { id: 'cats-pills', name: 'Pill Buttons', description: 'Rounded pill style', preview: '', config: { layout: 'pills', showCount: true, style: { backgroundColor: '#eff6ff', textColor: '#3b82f6', borderRadius: 20 } } },
    { id: 'cats-dropdown', name: 'Dropdown', description: 'Expandable dropdown', preview: '', config: { layout: 'dropdown', showCount: true, collapsible: true, style: { iconRotation: true } } },
    { id: 'cats-grid', name: 'Grid Layout', description: '2-column grid', preview: '', config: { layout: 'grid', columns: 2, showCount: false, style: { spacing: 8 } } },
    { id: 'cats-hierarchical', name: 'Hierarchical', description: 'Nested categories', preview: '', config: { showChildren: true, maxDepth: 2, showCount: true, style: { indentSize: 16 } } },
    { id: 'cats-images', name: 'Image Cards', description: 'Large image backgrounds', preview: '', config: { layout: 'image-cards', showImage: true, showCount: false, style: { imageHeight: '100px', overlay: true } } },
    { id: 'cats-badges', name: 'With Badges', description: 'Count as badges', preview: '', config: { showCount: true, countStyle: 'badge', style: { badgeColor: '#ef4444', badgeSize: 'small' } } },
    { id: 'cats-minimal', name: 'Minimal', description: 'Ultra minimal style', preview: '', config: { showCount: false, showIcon: false, style: { linkColor: '#6b7280', fontSize: 13, spacing: 6 } } },
    { id: 'cats-featured', name: 'Featured', description: 'Highlighted categories', preview: '', config: { layout: 'featured', showImage: true, showDescription: true, style: { imageHeight: '80px' } } },
  ],

  // ===== CTA BUTTON TEMPLATES =====
  'cta-button': [
    { id: 'cta-primary', name: 'Primary Button', description: 'Standard primary CTA', preview: '', config: { text: 'Get Started', url: '#', style: { backgroundColor: '#3b82f6', textColor: '#ffffff', fontSize: 16, padding: '12px 24px', borderRadius: 8 } } },
    { id: 'cta-gradient', name: 'Gradient', description: 'Gradient background', preview: '', config: { text: 'Start Free Trial', url: '#', style: { background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', textColor: '#ffffff', fontSize: 16, padding: '14px 28px', borderRadius: 8 } } },
    { id: 'cta-outline', name: 'Outline', description: 'Bordered button', preview: '', config: { text: 'Learn More', url: '#', style: { backgroundColor: 'transparent', textColor: '#3b82f6', borderColor: '#3b82f6', borderWidth: 2, fontSize: 16, padding: '12px 24px', borderRadius: 8 } } },
    { id: 'cta-rounded', name: 'Pill Shape', description: 'Fully rounded', preview: '', config: { text: 'Sign Up Free', url: '#', style: { backgroundColor: '#10b981', textColor: '#ffffff', fontSize: 16, padding: '12px 32px', borderRadius: 50 } } },
    { id: 'cta-icon', name: 'With Icon', description: 'Button with arrow icon', preview: '', config: { text: 'Shop Now', url: '#', icon: 'arrow-right', iconPosition: 'right', style: { backgroundColor: '#f59e0b', textColor: '#ffffff', fontSize: 16, padding: '12px 24px', borderRadius: 8 } } },
    { id: 'cta-large', name: 'Large CTA', description: 'Extra large button', preview: '', config: { text: 'Get Started Today', url: '#', style: { backgroundColor: '#dc2626', textColor: '#ffffff', fontSize: 20, padding: '16px 40px', borderRadius: 12, fontWeight: 'bold' } } },
    { id: 'cta-subtle', name: 'Subtle', description: 'Soft background', preview: '', config: { text: 'View Details', url: '#', style: { backgroundColor: '#f3f4f6', textColor: '#374151', fontSize: 14, padding: '10px 20px', borderRadius: 6 } } },
    { id: 'cta-dark', name: 'Dark', description: 'Dark theme button', preview: '', config: { text: 'Download', url: '#', style: { backgroundColor: '#1e293b', textColor: '#ffffff', fontSize: 16, padding: '12px 24px', borderRadius: 8 } } },
    { id: 'cta-neon', name: 'Neon Glow', description: 'Glowing effect', preview: '', config: { text: 'Join Now', url: '#', style: { backgroundColor: '#22d3ee', textColor: '#0f172a', fontSize: 16, padding: '12px 24px', borderRadius: 8, boxShadow: '0 0 20px #22d3ee' } } },
    { id: 'cta-animated', name: 'Animated', description: 'Hover animation', preview: '', config: { text: 'Subscribe', url: '#', style: { backgroundColor: '#8b5cf6', textColor: '#ffffff', fontSize: 16, padding: '12px 24px', borderRadius: 8, animation: 'bounce' } } },
    { id: 'cta-split', name: 'Split Button', description: 'Button with dropdown', preview: '', config: { text: 'Add to Cart', url: '#', hasDropdown: true, style: { backgroundColor: '#059669', textColor: '#ffffff', fontSize: 16, padding: '12px 24px', borderRadius: 8 } } },
  ],

  // ===== SOCIAL ICONS TEMPLATES =====
  'social-icons': [
    { id: 'social-colored', name: 'Colored', description: 'Brand colored icons', preview: '', config: { platforms: ['facebook', 'twitter', 'instagram', 'linkedin'], colorMode: 'brand', size: 32, spacing: 12 } },
    { id: 'social-monochrome', name: 'Monochrome', description: 'Single color icons', preview: '', config: { platforms: ['facebook', 'twitter', 'instagram', 'linkedin'], colorMode: 'mono', color: '#6b7280', size: 32, spacing: 12 } },
    { id: 'social-circles', name: 'Circle Background', description: 'Icons in circles', preview: '', config: { platforms: ['facebook', 'twitter', 'instagram', 'linkedin'], style: 'circle', colorMode: 'brand', size: 40, spacing: 8 } },
    { id: 'social-squares', name: 'Square Background', description: 'Icons in squares', preview: '', config: { platforms: ['facebook', 'twitter', 'instagram', 'linkedin'], style: 'square', colorMode: 'brand', size: 40, spacing: 8, borderRadius: 8 } },
    { id: 'social-outline', name: 'Outlined', description: 'Border only icons', preview: '', config: { platforms: ['facebook', 'twitter', 'instagram', 'linkedin'], style: 'outline', borderWidth: 2, size: 40, spacing: 10 } },
    { id: 'social-minimal', name: 'Minimal', description: 'Simple small icons', preview: '', config: { platforms: ['facebook', 'twitter', 'instagram', 'linkedin'], colorMode: 'mono', color: '#9ca3af', size: 24, spacing: 16 } },
    { id: 'social-gradient', name: 'Gradient', description: 'Gradient backgrounds', preview: '', config: { platforms: ['facebook', 'twitter', 'instagram', 'linkedin'], style: 'circle', gradient: true, size: 44, spacing: 10 } },
    { id: 'social-dark', name: 'Dark Theme', description: 'Dark background style', preview: '', config: { platforms: ['facebook', 'twitter', 'instagram', 'linkedin'], style: 'circle', backgroundColor: '#1e293b', iconColor: '#ffffff', size: 40, spacing: 8 } },
    { id: 'social-animated', name: 'Animated', description: 'Hover animations', preview: '', config: { platforms: ['facebook', 'twitter', 'instagram', 'linkedin'], colorMode: 'brand', size: 36, spacing: 12, hoverAnimation: 'bounce' } },
    { id: 'social-labels', name: 'With Labels', description: 'Icons with text', preview: '', config: { platforms: ['facebook', 'twitter', 'instagram', 'linkedin'], showLabels: true, labelPosition: 'below', size: 28, spacing: 16 } },
    { id: 'social-stacked', name: 'Stacked', description: 'Vertical stack', preview: '', config: { platforms: ['facebook', 'twitter', 'instagram', 'linkedin'], layout: 'vertical', colorMode: 'brand', size: 32, spacing: 8 } },
  ],

  // ===== TESTIMONIAL TEMPLATES =====
  'testimonial': [
    { id: 'testimonial-card', name: 'Card Style', description: 'Standard testimonial card', preview: '', config: { quote: 'Amazing product!', author: 'John Doe', role: 'CEO', avatar: '', rating: 5, style: { backgroundColor: '#ffffff', borderRadius: 12, shadow: 'md' } } },
    { id: 'testimonial-minimal', name: 'Minimal', description: 'Clean minimal design', preview: '', config: { quote: 'Amazing product!', author: 'John Doe', role: 'CEO', showAvatar: false, showRating: false, style: { borderLeft: '4px solid #3b82f6' } } },
    { id: 'testimonial-bubble', name: 'Speech Bubble', description: 'Quote bubble style', preview: '', config: { quote: 'Amazing product!', author: 'John Doe', role: 'CEO', style: { bubbleStyle: true, backgroundColor: '#f3f4f6' } } },
    { id: 'testimonial-centered', name: 'Centered', description: 'Center aligned', preview: '', config: { quote: 'Amazing product!', author: 'John Doe', role: 'CEO', avatar: '', alignment: 'center', style: { fontSize: 18, quoteMarks: true } } },
    { id: 'testimonial-large', name: 'Large Quote', description: 'Big quote display', preview: '', config: { quote: 'Amazing product!', author: 'John Doe', role: 'CEO', style: { fontSize: 24, fontStyle: 'italic', quoteColor: '#3b82f6' } } },
    { id: 'testimonial-photo', name: 'With Large Photo', description: 'Prominent author photo', preview: '', config: { quote: 'Amazing product!', author: 'John Doe', role: 'CEO', avatarSize: 'large', style: { avatarSize: 80 } } },
    { id: 'testimonial-company', name: 'With Company', description: 'Shows company logo', preview: '', config: { quote: 'Amazing product!', author: 'John Doe', role: 'CEO', company: 'Acme Inc', showLogo: true, style: { logoHeight: 32 } } },
    { id: 'testimonial-gradient', name: 'Gradient Background', description: 'Colorful gradient', preview: '', config: { quote: 'Amazing product!', author: 'John Doe', style: { background: 'linear-gradient(135deg, #667eea, #764ba2)', textColor: '#ffffff' } } },
    { id: 'testimonial-video', name: 'Video Testimonial', description: 'With video thumbnail', preview: '', config: { quote: 'Amazing product!', author: 'John Doe', hasVideo: true, videoUrl: '', style: { playButtonSize: 48 } } },
    { id: 'testimonial-stars', name: 'Star Rating', description: 'Prominent star rating', preview: '', config: { quote: 'Amazing product!', author: 'John Doe', rating: 5, showRating: true, style: { starColor: '#fbbf24', starSize: 20 } } },
  ],

  // ===== NEWSLETTER TEMPLATES =====
  'newsletter': [
    { id: 'newsletter-inline', name: 'Inline Form', description: 'Horizontal input + button', preview: '', config: { title: 'Subscribe', placeholder: 'Enter your email', buttonText: 'Subscribe', style: { layout: 'inline', buttonColor: '#3b82f6' } } },
    { id: 'newsletter-stacked', name: 'Stacked', description: 'Vertical layout', preview: '', config: { title: 'Join our newsletter', subtitle: 'Get updates in your inbox', placeholder: 'Email address', buttonText: 'Sign Up', style: { layout: 'stacked', buttonColor: '#10b981' } } },
    { id: 'newsletter-minimal', name: 'Minimal', description: 'Simple email input', preview: '', config: { title: '', placeholder: 'Email', buttonText: '', showIcon: true, style: { layout: 'inline', minimal: true } } },
    { id: 'newsletter-boxed', name: 'Boxed', description: 'With background', preview: '', config: { title: 'Stay Updated', subtitle: 'No spam, we promise', placeholder: 'Your email', buttonText: 'Subscribe', style: { backgroundColor: '#f3f4f6', padding: 24, borderRadius: 12 } } },
    { id: 'newsletter-gradient', name: 'Gradient', description: 'Colorful background', preview: '', config: { title: 'Join 10,000+ subscribers', placeholder: 'Email address', buttonText: 'Get Started', style: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', textColor: '#ffffff' } } },
    { id: 'newsletter-dark', name: 'Dark Theme', description: 'Dark background', preview: '', config: { title: 'Newsletter', placeholder: 'Enter email', buttonText: 'Subscribe', style: { backgroundColor: '#1e293b', textColor: '#ffffff', inputBg: '#334155' } } },
    { id: 'newsletter-popup', name: 'Popup Style', description: 'Modal-like design', preview: '', config: { title: 'Wait!', subtitle: "Don't miss our updates", placeholder: 'Email', buttonText: 'Yes, Sign Me Up', style: { backgroundColor: '#ffffff', shadow: 'xl', borderRadius: 16 } } },
    { id: 'newsletter-icon', name: 'With Icon', description: 'Mail icon included', preview: '', config: { title: 'Subscribe', placeholder: 'Email', buttonText: 'Join', showIcon: true, iconType: 'mail', style: { layout: 'inline' } } },
    { id: 'newsletter-social', name: 'With Social Proof', description: 'Shows subscriber count', preview: '', config: { title: 'Join 50,000+ readers', placeholder: 'Email', buttonText: 'Subscribe', showSocialProof: true, style: { layout: 'stacked' } } },
    { id: 'newsletter-animated', name: 'Animated', description: 'Animated button', preview: '', config: { title: 'Get Updates', placeholder: 'Your email', buttonText: 'Subscribe', style: { buttonAnimation: 'pulse', buttonColor: '#ef4444' } } },
  ],

  // ===== IMAGE WIDGET TEMPLATES =====
  'image': [
    { id: 'image-simple', name: 'Simple', description: 'Basic image display', preview: '', config: { alt: 'Image', style: { borderRadius: 0, shadow: 'none' } } },
    { id: 'image-rounded', name: 'Rounded', description: 'Rounded corners', preview: '', config: { alt: 'Image', style: { borderRadius: 12, shadow: 'sm' } } },
    { id: 'image-circle', name: 'Circle', description: 'Circular image', preview: '', config: { alt: 'Image', style: { borderRadius: '50%', aspectRatio: '1/1' } } },
    { id: 'image-shadow', name: 'With Shadow', description: 'Drop shadow effect', preview: '', config: { alt: 'Image', style: { borderRadius: 8, shadow: 'lg' } } },
    { id: 'image-bordered', name: 'Bordered', description: 'With border', preview: '', config: { alt: 'Image', style: { borderWidth: 4, borderColor: '#e5e7eb', borderRadius: 8 } } },
    { id: 'image-polaroid', name: 'Polaroid', description: 'Polaroid style', preview: '', config: { alt: 'Image', caption: 'Photo caption', style: { padding: 16, paddingBottom: 48, backgroundColor: '#ffffff', shadow: 'md' } } },
    { id: 'image-overlay', name: 'With Overlay', description: 'Text overlay', preview: '', config: { alt: 'Image', overlayText: 'Caption here', style: { overlayColor: 'rgba(0,0,0,0.5)', textColor: '#ffffff' } } },
    { id: 'image-hover-zoom', name: 'Hover Zoom', description: 'Zooms on hover', preview: '', config: { alt: 'Image', style: { overflow: 'hidden', borderRadius: 8, hoverZoom: 1.1 } } },
    { id: 'image-gradient-border', name: 'Gradient Border', description: 'Colorful border', preview: '', config: { alt: 'Image', style: { borderWidth: 4, borderGradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: 12 } } },
    { id: 'image-vintage', name: 'Vintage', description: 'Sepia filter', preview: '', config: { alt: 'Image', style: { filter: 'sepia(0.3)', borderRadius: 4 } } },
  ],

  // ===== ICON BOX TEMPLATES =====
  'icon-box': [
    { id: 'iconbox-simple', name: 'Simple', description: 'Icon with text', preview: '', config: { icon: 'star', title: 'Feature', description: 'Description here', style: { iconColor: '#3b82f6', iconSize: 32 } } },
    { id: 'iconbox-circled', name: 'Circle Icon', description: 'Icon in circle', preview: '', config: { icon: 'star', title: 'Feature', description: 'Description here', style: { iconColor: '#ffffff', iconBg: '#3b82f6', iconSize: 48, iconPadding: 12, iconBorderRadius: '50%' } } },
    { id: 'iconbox-squared', name: 'Square Icon', description: 'Icon in square', preview: '', config: { icon: 'star', title: 'Feature', description: 'Description here', style: { iconColor: '#ffffff', iconBg: '#10b981', iconSize: 48, iconPadding: 12, iconBorderRadius: 8 } } },
    { id: 'iconbox-left', name: 'Left Aligned', description: 'Icon on left', preview: '', config: { icon: 'star', title: 'Feature', description: 'Description here', layout: 'horizontal', style: { iconColor: '#f59e0b', iconSize: 40 } } },
    { id: 'iconbox-minimal', name: 'Minimal', description: 'Just icon and title', preview: '', config: { icon: 'star', title: 'Feature', description: '', style: { iconColor: '#6b7280', iconSize: 24 } } },
    { id: 'iconbox-gradient', name: 'Gradient Icon', description: 'Gradient background', preview: '', config: { icon: 'star', title: 'Feature', description: 'Description here', style: { iconBg: 'linear-gradient(135deg, #6366f1, #8b5cf6)', iconColor: '#ffffff', iconSize: 48 } } },
    { id: 'iconbox-outlined', name: 'Outlined', description: 'Border icon style', preview: '', config: { icon: 'star', title: 'Feature', description: 'Description here', style: { iconColor: '#3b82f6', iconBorderWidth: 2, iconBorderColor: '#3b82f6', iconSize: 48 } } },
    { id: 'iconbox-card', name: 'Card Style', description: 'Full card with shadow', preview: '', config: { icon: 'star', title: 'Feature', description: 'Description here', style: { backgroundColor: '#ffffff', padding: 24, borderRadius: 12, shadow: 'md', iconColor: '#ef4444' } } },
    { id: 'iconbox-hover', name: 'Hover Effect', description: 'Interactive hover', preview: '', config: { icon: 'star', title: 'Feature', description: 'Description here', style: { iconColor: '#3b82f6', hoverScale: 1.1, transition: '0.3s' } } },
    { id: 'iconbox-numbered', name: 'Numbered', description: 'Number instead of icon', preview: '', config: { number: 1, title: 'Step One', description: 'First step', useNumber: true, style: { numberBg: '#3b82f6', numberColor: '#ffffff', numberSize: 40 } } },
  ],

  // ===== CONTACT INFO TEMPLATES =====
  'contact-info': [
    { id: 'contact-simple', name: 'Simple List', description: 'Basic contact info', preview: '', config: { phone: '+1 234 567 890', email: 'hello@example.com', address: '123 Main St', style: { iconColor: '#6b7280', fontSize: 14, spacing: 8 } } },
    { id: 'contact-icons', name: 'With Icons', description: 'Icons for each item', preview: '', config: { phone: '+1 234 567 890', email: 'hello@example.com', address: '123 Main St', showIcons: true, style: { iconColor: '#3b82f6', iconSize: 20, spacing: 12 } } },
    { id: 'contact-cards', name: 'Card Style', description: 'Each item as card', preview: '', config: { phone: '+1 234 567 890', email: 'hello@example.com', address: '123 Main St', layout: 'cards', style: { cardBg: '#f9fafb', padding: 12, borderRadius: 8 } } },
    { id: 'contact-horizontal', name: 'Horizontal', description: 'Side by side layout', preview: '', config: { phone: '+1 234 567 890', email: 'hello@example.com', layout: 'horizontal', style: { spacing: 24 } } },
    { id: 'contact-minimal', name: 'Minimal', description: 'Text only', preview: '', config: { phone: '+1 234 567 890', email: 'hello@example.com', showIcons: false, style: { fontSize: 13, textColor: '#6b7280' } } },
    { id: 'contact-circled', name: 'Circle Icons', description: 'Icons in circles', preview: '', config: { phone: '+1 234 567 890', email: 'hello@example.com', address: '123 Main St', style: { iconBg: '#eff6ff', iconColor: '#3b82f6', iconBorderRadius: '50%', iconPadding: 10 } } },
    { id: 'contact-dark', name: 'Dark Theme', description: 'Dark background', preview: '', config: { phone: '+1 234 567 890', email: 'hello@example.com', style: { backgroundColor: '#1e293b', textColor: '#f1f5f9', iconColor: '#60a5fa' } } },
    { id: 'contact-bordered', name: 'Bordered', description: 'With borders', preview: '', config: { phone: '+1 234 567 890', email: 'hello@example.com', style: { borderWidth: 1, borderColor: '#e5e7eb', padding: 16, borderRadius: 8 } } },
    { id: 'contact-clickable', name: 'Clickable', description: 'Links for contact', preview: '', config: { phone: '+1 234 567 890', email: 'hello@example.com', clickable: true, style: { linkColor: '#3b82f6', hoverUnderline: true } } },
    { id: 'contact-compact', name: 'Compact', description: 'Dense layout', preview: '', config: { phone: '+1 234 567 890', email: 'hello@example.com', style: { fontSize: 12, spacing: 4, iconSize: 14 } } },
  ],

  // ===== TEAM MEMBER TEMPLATES =====
  'team-member': [
    { id: 'team-card', name: 'Card Style', description: 'Standard team card', preview: '', config: { name: 'John Doe', role: 'CEO', bio: 'Bio text here', style: { backgroundColor: '#ffffff', borderRadius: 12, shadow: 'md', avatarSize: 80 } } },
    { id: 'team-minimal', name: 'Minimal', description: 'Clean minimal design', preview: '', config: { name: 'John Doe', role: 'CEO', showBio: false, style: { avatarSize: 64 } } },
    { id: 'team-horizontal', name: 'Horizontal', description: 'Side by side layout', preview: '', config: { name: 'John Doe', role: 'CEO', bio: 'Bio text', layout: 'horizontal', style: { avatarSize: 100 } } },
    { id: 'team-circular', name: 'Circular Photo', description: 'Round avatar', preview: '', config: { name: 'John Doe', role: 'CEO', style: { avatarBorderRadius: '50%', avatarSize: 100 } } },
    { id: 'team-social', name: 'With Social', description: 'Social media links', preview: '', config: { name: 'John Doe', role: 'CEO', social: ['twitter', 'linkedin'], showSocial: true, style: { socialIconSize: 20 } } },
    { id: 'team-overlay', name: 'Image Overlay', description: 'Text over image', preview: '', config: { name: 'John Doe', role: 'CEO', layout: 'overlay', style: { overlayColor: 'rgba(0,0,0,0.6)', textColor: '#ffffff' } } },
    { id: 'team-bordered', name: 'Bordered', description: 'With border', preview: '', config: { name: 'John Doe', role: 'CEO', style: { borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 8, padding: 16 } } },
    { id: 'team-gradient', name: 'Gradient Border', description: 'Colorful border', preview: '', config: { name: 'John Doe', role: 'CEO', style: { avatarBorder: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', avatarBorderWidth: 4 } } },
    { id: 'team-compact', name: 'Compact', description: 'Small inline style', preview: '', config: { name: 'John Doe', role: 'CEO', layout: 'compact', style: { avatarSize: 40, fontSize: 13 } } },
    { id: 'team-featured', name: 'Featured', description: 'Large prominent card', preview: '', config: { name: 'John Doe', role: 'CEO', bio: 'Full bio here', style: { avatarSize: 120, padding: 24, shadow: 'lg' } } },
  ],

  // ===== ICON LIST TEMPLATES =====
  'icon-list': [
    { id: 'iconlist-simple', name: 'Simple', description: 'Basic icon links', preview: '', config: { items: [{ icon: 'check', label: 'Item 1', url: '#' }], style: { iconColor: '#10b981', spacing: 8 } } },
    { id: 'iconlist-colored', name: 'Colored Icons', description: 'Colorful icons', preview: '', config: { items: [{ icon: 'star', label: 'Item 1', url: '#' }], style: { iconColor: '#f59e0b', spacing: 10 } } },
    { id: 'iconlist-circled', name: 'Circled Icons', description: 'Icons in circles', preview: '', config: { items: [{ icon: 'check', label: 'Item 1', url: '#' }], style: { iconBg: '#dcfce7', iconColor: '#16a34a', iconPadding: 8, borderRadius: '50%' } } },
    { id: 'iconlist-squared', name: 'Squared Icons', description: 'Icons in squares', preview: '', config: { items: [{ icon: 'arrow-right', label: 'Item 1', url: '#' }], style: { iconBg: '#eff6ff', iconColor: '#3b82f6', iconPadding: 8, borderRadius: 6 } } },
    { id: 'iconlist-large', name: 'Large Icons', description: 'Bigger icon size', preview: '', config: { items: [{ icon: 'zap', label: 'Item 1', url: '#' }], style: { iconSize: 28, fontSize: 16, spacing: 14 } } },
    { id: 'iconlist-minimal', name: 'Minimal', description: 'Subtle design', preview: '', config: { items: [{ icon: 'chevron-right', label: 'Item 1', url: '#' }], style: { iconColor: '#9ca3af', iconSize: 16, fontSize: 13 } } },
    { id: 'iconlist-gradient', name: 'Gradient Icons', description: 'Gradient backgrounds', preview: '', config: { items: [{ icon: 'star', label: 'Item 1', url: '#' }], style: { iconBg: 'linear-gradient(135deg, #6366f1, #8b5cf6)', iconColor: '#ffffff' } } },
    { id: 'iconlist-dark', name: 'Dark Theme', description: 'Dark background', preview: '', config: { items: [{ icon: 'check', label: 'Item 1', url: '#' }], style: { backgroundColor: '#1e293b', textColor: '#f1f5f9', iconColor: '#60a5fa' } } },
    { id: 'iconlist-hover', name: 'Hover Effect', description: 'Interactive hover', preview: '', config: { items: [{ icon: 'arrow-right', label: 'Item 1', url: '#' }], style: { hoverBg: '#f3f4f6', hoverScale: 1.02, transition: '0.2s' } } },
    { id: 'iconlist-badges', name: 'With Badges', description: 'Count badges', preview: '', config: { items: [{ icon: 'folder', label: 'Category', url: '#', badge: '12' }], style: { badgeBg: '#ef4444', badgeColor: '#ffffff' } } },
  ],

  // ===== TAGS TEMPLATES =====
  'tags': [
    { id: 'tags-pills', name: 'Pill Tags', description: 'Rounded pill style', preview: '', config: { style: { backgroundColor: '#eff6ff', textColor: '#3b82f6', borderRadius: 20, padding: '4px 12px' } } },
    { id: 'tags-outlined', name: 'Outlined', description: 'Border only', preview: '', config: { style: { backgroundColor: 'transparent', borderColor: '#d1d5db', borderWidth: 1, textColor: '#6b7280', borderRadius: 4 } } },
    { id: 'tags-colored', name: 'Colored', description: 'Solid background', preview: '', config: { style: { backgroundColor: '#3b82f6', textColor: '#ffffff', borderRadius: 4, padding: '4px 10px' } } },
    { id: 'tags-minimal', name: 'Minimal', description: 'Simple text tags', preview: '', config: { style: { backgroundColor: 'transparent', textColor: '#6b7280', fontSize: 12, spacing: 8 } } },
    { id: 'tags-gradient', name: 'Gradient', description: 'Gradient backgrounds', preview: '', config: { style: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', textColor: '#ffffff', borderRadius: 6 } } },
    { id: 'tags-dark', name: 'Dark Theme', description: 'Dark style tags', preview: '', config: { style: { backgroundColor: '#374151', textColor: '#f3f4f6', borderRadius: 4 } } },
    { id: 'tags-hashtag', name: 'Hashtag Style', description: 'With # prefix', preview: '', config: { showHash: true, style: { textColor: '#3b82f6', fontSize: 14, fontWeight: 500 } } },
    { id: 'tags-cloud', name: 'Tag Cloud', description: 'Varied sizes', preview: '', config: { layout: 'cloud', sizeByCount: true, style: { minSize: 12, maxSize: 24 } } },
    { id: 'tags-hoverable', name: 'Hover Effect', description: 'Interactive hover', preview: '', config: { style: { backgroundColor: '#f3f4f6', hoverBg: '#3b82f6', hoverColor: '#ffffff', transition: '0.2s' } } },
    { id: 'tags-compact', name: 'Compact', description: 'Tight spacing', preview: '', config: { style: { fontSize: 11, padding: '2px 8px', spacing: 4, borderRadius: 3 } } },
  ],

  // ===== TABS TEMPLATES =====
  'tabs': [
    { id: 'tabs-default', name: 'Default', description: 'Standard tabs', preview: '', config: { items: [{ label: 'Tab 1', content: 'Content 1' }], style: { activeColor: '#3b82f6', borderBottom: true } } },
    { id: 'tabs-pills', name: 'Pill Tabs', description: 'Rounded pill style', preview: '', config: { items: [{ label: 'Tab 1', content: 'Content 1' }], style: { activeBg: '#3b82f6', activeColor: '#ffffff', borderRadius: 20 } } },
    { id: 'tabs-boxed', name: 'Boxed', description: 'Boxed tab style', preview: '', config: { items: [{ label: 'Tab 1', content: 'Content 1' }], style: { activeBg: '#ffffff', borderColor: '#e5e7eb', borderRadius: 8 } } },
    { id: 'tabs-underline', name: 'Underline', description: 'Underlined active', preview: '', config: { items: [{ label: 'Tab 1', content: 'Content 1' }], style: { activeColor: '#3b82f6', underlineWidth: 3 } } },
    { id: 'tabs-vertical', name: 'Vertical', description: 'Vertical tabs', preview: '', config: { items: [{ label: 'Tab 1', content: 'Content 1' }], layout: 'vertical', style: { activeBg: '#eff6ff', activeColor: '#3b82f6' } } },
    { id: 'tabs-icons', name: 'With Icons', description: 'Icon tabs', preview: '', config: { items: [{ label: 'Home', icon: 'home', content: 'Content' }], showIcons: true, style: { iconSize: 18 } } },
    { id: 'tabs-minimal', name: 'Minimal', description: 'Simple style', preview: '', config: { items: [{ label: 'Tab 1', content: 'Content 1' }], style: { fontSize: 13, spacing: 16 } } },
    { id: 'tabs-dark', name: 'Dark Theme', description: 'Dark background', preview: '', config: { items: [{ label: 'Tab 1', content: 'Content 1' }], style: { backgroundColor: '#1e293b', textColor: '#94a3b8', activeColor: '#ffffff' } } },
    { id: 'tabs-gradient', name: 'Gradient Active', description: 'Gradient highlight', preview: '', config: { items: [{ label: 'Tab 1', content: 'Content 1' }], style: { activeBg: 'linear-gradient(135deg, #6366f1, #8b5cf6)', activeColor: '#ffffff' } } },
    { id: 'tabs-centered', name: 'Centered', description: 'Center aligned', preview: '', config: { items: [{ label: 'Tab 1', content: 'Content 1' }], alignment: 'center', style: { spacing: 24 } } },
  ],

  // ===== ACCORDION TEMPLATES =====
  'accordion': [
    { id: 'accordion-default', name: 'Default', description: 'Standard accordion', preview: '', config: { items: [{ title: 'Section 1', content: 'Content' }], style: { borderColor: '#e5e7eb', borderRadius: 8 } } },
    { id: 'accordion-bordered', name: 'Bordered', description: 'Full border', preview: '', config: { items: [{ title: 'Section 1', content: 'Content' }], style: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, spacing: 8 } } },
    { id: 'accordion-minimal', name: 'Minimal', description: 'Clean minimal', preview: '', config: { items: [{ title: 'Section 1', content: 'Content' }], style: { borderBottom: true, borderColor: '#f3f4f6' } } },
    { id: 'accordion-filled', name: 'Filled Header', description: 'Background header', preview: '', config: { items: [{ title: 'Section 1', content: 'Content' }], style: { headerBg: '#f9fafb', headerColor: '#1f2937', borderRadius: 8 } } },
    { id: 'accordion-arrows', name: 'With Arrows', description: 'Arrow indicators', preview: '', config: { items: [{ title: 'Section 1', content: 'Content' }], iconType: 'arrow', style: { iconColor: '#6b7280' } } },
    { id: 'accordion-plus', name: 'Plus/Minus', description: '+/- indicators', preview: '', config: { items: [{ title: 'Section 1', content: 'Content' }], iconType: 'plus', style: { iconSize: 18 } } },
    { id: 'accordion-dark', name: 'Dark Theme', description: 'Dark background', preview: '', config: { items: [{ title: 'Section 1', content: 'Content' }], style: { backgroundColor: '#1e293b', textColor: '#f1f5f9', borderColor: '#374151' } } },
    { id: 'accordion-gradient', name: 'Gradient Header', description: 'Colorful headers', preview: '', config: { items: [{ title: 'Section 1', content: 'Content' }], style: { headerBg: 'linear-gradient(135deg, #6366f1, #8b5cf6)', headerColor: '#ffffff' } } },
    { id: 'accordion-spaced', name: 'Spaced', description: 'Gap between items', preview: '', config: { items: [{ title: 'Section 1', content: 'Content' }], style: { spacing: 12, borderRadius: 8 } } },
    { id: 'accordion-shadow', name: 'With Shadow', description: 'Shadow effect', preview: '', config: { items: [{ title: 'Section 1', content: 'Content' }], style: { shadow: 'sm', borderRadius: 8, spacing: 8 } } },
  ],

  // ===== BREADCRUMBS TEMPLATES =====
  'breadcrumbs': [
    { id: 'bread-default', name: 'Default', description: 'Standard breadcrumbs', preview: '', config: { separator: '/', style: { textColor: '#6b7280', activeColor: '#1f2937' } } },
    { id: 'bread-arrows', name: 'Arrows', description: 'Arrow separators', preview: '', config: { separator: '>', style: { textColor: '#6b7280', activeColor: '#3b82f6' } } },
    { id: 'bread-chevron', name: 'Chevrons', description: 'Chevron icons', preview: '', config: { separator: 'chevron', style: { iconSize: 14, iconColor: '#9ca3af' } } },
    { id: 'bread-dots', name: 'Dots', description: 'Dot separators', preview: '', config: { separator: '•', style: { spacing: 12, textColor: '#6b7280' } } },
    { id: 'bread-pills', name: 'Pill Style', description: 'Pill background', preview: '', config: { style: { backgroundColor: '#f3f4f6', padding: '4px 12px', borderRadius: 16 } } },
    { id: 'bread-icons', name: 'With Icons', description: 'Icon prefix', preview: '', config: { showHomeIcon: true, style: { iconSize: 16, iconColor: '#6b7280' } } },
    { id: 'bread-dark', name: 'Dark Theme', description: 'Dark background', preview: '', config: { style: { textColor: '#94a3b8', activeColor: '#ffffff', separatorColor: '#4b5563' } } },
    { id: 'bread-underline', name: 'Underlined', description: 'Underline links', preview: '', config: { style: { textDecoration: 'underline', textColor: '#3b82f6' } } },
    { id: 'bread-large', name: 'Large', description: 'Bigger text', preview: '', config: { style: { fontSize: 16, spacing: 16 } } },
    { id: 'bread-compact', name: 'Compact', description: 'Smaller size', preview: '', config: { style: { fontSize: 12, spacing: 6 } } },
  ],

  // ===== TEXT TEMPLATES =====
  'text': [
    { id: 'text-paragraph', name: 'Paragraph', description: 'Standard paragraph', preview: '', config: { content: 'Your text here...', style: { fontSize: 14, lineHeight: 1.6, textColor: '#374151' } } },
    { id: 'text-heading', name: 'Heading', description: 'Large heading', preview: '', config: { content: 'Heading Text', style: { fontSize: 24, fontWeight: 'bold', textColor: '#111827' } } },
    { id: 'text-subheading', name: 'Subheading', description: 'Medium heading', preview: '', config: { content: 'Subheading', style: { fontSize: 18, fontWeight: '600', textColor: '#374151' } } },
    { id: 'text-caption', name: 'Caption', description: 'Small caption', preview: '', config: { content: 'Caption text', style: { fontSize: 12, textColor: '#6b7280', fontStyle: 'italic' } } },
    { id: 'text-quote', name: 'Quote', description: 'Blockquote style', preview: '', config: { content: 'Quote text...', style: { borderLeft: '4px solid #3b82f6', paddingLeft: 16, fontStyle: 'italic' } } },
    { id: 'text-highlight', name: 'Highlighted', description: 'With background', preview: '', config: { content: 'Important text', style: { backgroundColor: '#fef3c7', padding: 8, borderRadius: 4 } } },
    { id: 'text-gradient', name: 'Gradient Text', description: 'Colorful gradient', preview: '', config: { content: 'Gradient Text', style: { background: 'linear-gradient(135deg, #6366f1, #ec4899)', backgroundClip: 'text', textFillColor: 'transparent', fontSize: 28, fontWeight: 'bold' } } },
    { id: 'text-dark', name: 'Dark Theme', description: 'Light on dark', preview: '', config: { content: 'Dark theme text', style: { textColor: '#f1f5f9', fontSize: 14 } } },
    { id: 'text-centered', name: 'Centered', description: 'Center aligned', preview: '', config: { content: 'Centered text', style: { textAlign: 'center', fontSize: 16 } } },
    { id: 'text-lead', name: 'Lead Text', description: 'Intro paragraph', preview: '', config: { content: 'Lead paragraph...', style: { fontSize: 18, lineHeight: 1.8, textColor: '#4b5563' } } },
  ],

  // ===== HTML TEMPLATES =====
  'html': [
    { id: 'html-basic', name: 'Basic HTML', description: 'Simple container', preview: '', config: { content: '<div>Your HTML here</div>' } },
    { id: 'html-embed', name: 'Embed Code', description: 'For embeds', preview: '', config: { content: '<!-- Paste embed code here -->' } },
    { id: 'html-iframe', name: 'iFrame', description: 'Embedded iframe', preview: '', config: { content: '<iframe src="" width="100%" height="300"></iframe>' } },
    { id: 'html-script', name: 'Script Tag', description: 'External script', preview: '', config: { content: '<script src=""></script>' } },
    { id: 'html-styled', name: 'With Styles', description: 'Styled container', preview: '', config: { content: '<div style="padding: 20px; background: #f3f4f6; border-radius: 8px;">Content</div>' } },
    { id: 'html-flexbox', name: 'Flexbox Layout', description: 'Flex container', preview: '', config: { content: '<div style="display: flex; gap: 16px;"><!-- items --></div>' } },
    { id: 'html-grid', name: 'Grid Layout', description: 'CSS Grid', preview: '', config: { content: '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;"><!-- items --></div>' } },
    { id: 'html-card', name: 'Card Container', description: 'Card wrapper', preview: '', config: { content: '<div style="padding: 24px; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Card content</div>' } },
    { id: 'html-table', name: 'HTML Table', description: 'Data table', preview: '', config: { content: '<table style="width: 100%; border-collapse: collapse;"><tr><th>Header</th></tr><tr><td>Data</td></tr></table>' } },
    { id: 'html-list', name: 'Custom List', description: 'Styled list', preview: '', config: { content: '<ul style="list-style: none; padding: 0;"><li>Item 1</li><li>Item 2</li></ul>' } },
  ],

  // ===== VIDEO TEMPLATES =====
  'video': [
    { id: 'video-youtube', name: 'YouTube', description: 'YouTube embed', preview: '', config: { type: 'youtube', style: { borderRadius: 8, aspectRatio: '16/9' } } },
    { id: 'video-vimeo', name: 'Vimeo', description: 'Vimeo embed', preview: '', config: { type: 'vimeo', style: { borderRadius: 8 } } },
    { id: 'video-self', name: 'Self Hosted', description: 'Local video', preview: '', config: { type: 'self', controls: true, style: { borderRadius: 8 } } },
    { id: 'video-autoplay', name: 'Autoplay', description: 'Auto-playing video', preview: '', config: { autoplay: true, muted: true, loop: true, style: { borderRadius: 0 } } },
    { id: 'video-thumbnail', name: 'With Thumbnail', description: 'Custom thumbnail', preview: '', config: { showThumbnail: true, style: { borderRadius: 12, playButtonSize: 64 } } },
    { id: 'video-rounded', name: 'Rounded', description: 'Rounded corners', preview: '', config: { style: { borderRadius: 16, overflow: 'hidden' } } },
    { id: 'video-shadow', name: 'With Shadow', description: 'Drop shadow', preview: '', config: { style: { borderRadius: 8, shadow: 'lg' } } },
    { id: 'video-fullwidth', name: 'Full Width', description: '100% width', preview: '', config: { style: { width: '100%', borderRadius: 0 } } },
    { id: 'video-compact', name: 'Compact', description: 'Smaller size', preview: '', config: { style: { maxWidth: '400px', borderRadius: 8 } } },
    { id: 'video-cinema', name: 'Cinema Mode', description: 'Dark background', preview: '', config: { style: { backgroundColor: '#000000', padding: 20, borderRadius: 8 } } },
  ],

  // ===== MAP TEMPLATES =====
  'map': [
    { id: 'map-default', name: 'Default', description: 'Standard map', preview: '', config: { height: 300, zoom: 14, style: { borderRadius: 8 } } },
    { id: 'map-large', name: 'Large', description: 'Bigger map', preview: '', config: { height: 450, zoom: 15, style: { borderRadius: 12 } } },
    { id: 'map-compact', name: 'Compact', description: 'Smaller map', preview: '', config: { height: 200, zoom: 13, style: { borderRadius: 6 } } },
    { id: 'map-rounded', name: 'Rounded', description: 'More rounded', preview: '', config: { height: 300, style: { borderRadius: 20, overflow: 'hidden' } } },
    { id: 'map-bordered', name: 'Bordered', description: 'With border', preview: '', config: { height: 300, style: { borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 8 } } },
    { id: 'map-shadow', name: 'With Shadow', description: 'Drop shadow', preview: '', config: { height: 300, style: { shadow: 'lg', borderRadius: 12 } } },
    { id: 'map-satellite', name: 'Satellite', description: 'Satellite view', preview: '', config: { mapType: 'satellite', height: 350, style: { borderRadius: 8 } } },
    { id: 'map-terrain', name: 'Terrain', description: 'Terrain view', preview: '', config: { mapType: 'terrain', height: 300, style: { borderRadius: 8 } } },
    { id: 'map-marker', name: 'Custom Marker', description: 'With marker', preview: '', config: { showMarker: true, markerColor: '#ef4444', height: 300, style: { borderRadius: 8 } } },
    { id: 'map-fullwidth', name: 'Full Width', description: '100% width', preview: '', config: { height: 250, style: { borderRadius: 0, width: '100%' } } },
  ],

  // ===== STATS TEMPLATES =====
  'stats': [
    { id: 'stats-simple', name: 'Simple', description: 'Basic stats', preview: '', config: { stats: [{ value: '100+', label: 'Customers' }], style: { valueColor: '#3b82f6', labelColor: '#6b7280' } } },
    { id: 'stats-large', name: 'Large Numbers', description: 'Big value display', preview: '', config: { stats: [{ value: '10K+', label: 'Users' }], style: { valueSize: 48, valueColor: '#1f2937', fontWeight: 'bold' } } },
    { id: 'stats-gradient', name: 'Gradient Text', description: 'Colorful values', preview: '', config: { stats: [{ value: '500+', label: 'Projects' }], style: { valueGradient: 'linear-gradient(135deg, #6366f1, #ec4899)', valueSize: 36 } } },
    { id: 'stats-cards', name: 'Card Style', description: 'Stats in cards', preview: '', config: { stats: [{ value: '99%', label: 'Uptime' }], layout: 'cards', style: { backgroundColor: '#f9fafb', padding: 20, borderRadius: 12 } } },
    { id: 'stats-icons', name: 'With Icons', description: 'Icon prefix', preview: '', config: { stats: [{ value: '50K', label: 'Downloads', icon: 'download' }], showIcons: true, style: { iconColor: '#10b981' } } },
    { id: 'stats-horizontal', name: 'Horizontal', description: 'Side by side', preview: '', config: { stats: [{ value: '24/7', label: 'Support' }], layout: 'horizontal', style: { spacing: 24 } } },
    { id: 'stats-bordered', name: 'Bordered', description: 'With borders', preview: '', config: { stats: [{ value: '1M+', label: 'Users' }], style: { borderWidth: 1, borderColor: '#e5e7eb', padding: 16, borderRadius: 8 } } },
    { id: 'stats-dark', name: 'Dark Theme', description: 'Dark background', preview: '', config: { stats: [{ value: '99.9%', label: 'Accuracy' }], style: { backgroundColor: '#1e293b', valueColor: '#60a5fa', labelColor: '#94a3b8' } } },
    { id: 'stats-animated', name: 'Animated', description: 'Count animation', preview: '', config: { stats: [{ value: '1000', label: 'Happy Clients' }], animated: true, style: { valueColor: '#10b981' } } },
    { id: 'stats-centered', name: 'Centered', description: 'Center aligned', preview: '', config: { stats: [{ value: '5★', label: 'Rating' }], alignment: 'center', style: { valueSize: 32, valueColor: '#f59e0b' } } },
  ],

  // ===== PROGRESS BAR TEMPLATES =====
  'progress-bar': [
    { id: 'progress-default', name: 'Default', description: 'Standard progress', preview: '', config: { value: 75, style: { barColor: '#3b82f6', trackColor: '#e5e7eb', height: 8, borderRadius: 4 } } },
    { id: 'progress-gradient', name: 'Gradient', description: 'Gradient bar', preview: '', config: { value: 60, style: { barGradient: 'linear-gradient(90deg, #6366f1, #ec4899)', height: 10, borderRadius: 5 } } },
    { id: 'progress-thin', name: 'Thin', description: 'Slim progress bar', preview: '', config: { value: 80, style: { height: 4, barColor: '#10b981', borderRadius: 2 } } },
    { id: 'progress-thick', name: 'Thick', description: 'Bold progress bar', preview: '', config: { value: 45, style: { height: 16, barColor: '#f59e0b', borderRadius: 8, showLabel: true } } },
    { id: 'progress-striped', name: 'Striped', description: 'Striped pattern', preview: '', config: { value: 70, striped: true, style: { barColor: '#3b82f6', height: 12, borderRadius: 6 } } },
    { id: 'progress-animated', name: 'Animated', description: 'Moving stripes', preview: '', config: { value: 65, striped: true, animated: true, style: { barColor: '#8b5cf6', height: 12 } } },
    { id: 'progress-labeled', name: 'With Label', description: 'Shows percentage', preview: '', config: { value: 85, showLabel: true, style: { barColor: '#10b981', height: 20, borderRadius: 10 } } },
    { id: 'progress-dark', name: 'Dark Theme', description: 'Dark background', preview: '', config: { value: 55, style: { trackColor: '#374151', barColor: '#60a5fa', height: 8 } } },
    { id: 'progress-success', name: 'Success', description: 'Green success', preview: '', config: { value: 100, style: { barColor: '#10b981', trackColor: '#d1fae5', height: 10 } } },
    { id: 'progress-warning', name: 'Warning', description: 'Yellow warning', preview: '', config: { value: 40, style: { barColor: '#f59e0b', trackColor: '#fef3c7', height: 10 } } },
  ],

  // ===== COUNTDOWN TEMPLATES =====
  'countdown': [
    { id: 'countdown-default', name: 'Default', description: 'Standard countdown', preview: '', config: { style: { boxBg: '#f3f4f6', numberColor: '#1f2937', labelColor: '#6b7280', numberSize: 32 } } },
    { id: 'countdown-dark', name: 'Dark Theme', description: 'Dark background', preview: '', config: { style: { boxBg: '#1e293b', numberColor: '#ffffff', labelColor: '#94a3b8', numberSize: 36 } } },
    { id: 'countdown-gradient', name: 'Gradient', description: 'Colorful boxes', preview: '', config: { style: { boxBg: 'linear-gradient(135deg, #6366f1, #8b5cf6)', numberColor: '#ffffff', labelColor: '#e0e7ff' } } },
    { id: 'countdown-minimal', name: 'Minimal', description: 'Clean minimal', preview: '', config: { style: { boxBg: 'transparent', numberColor: '#1f2937', labelColor: '#6b7280', borderWidth: 1, borderColor: '#e5e7eb' } } },
    { id: 'countdown-large', name: 'Large', description: 'Big numbers', preview: '', config: { style: { numberSize: 48, boxPadding: 20, borderRadius: 12 } } },
    { id: 'countdown-compact', name: 'Compact', description: 'Smaller size', preview: '', config: { style: { numberSize: 20, boxPadding: 8, spacing: 8 } } },
    { id: 'countdown-circles', name: 'Circles', description: 'Circular boxes', preview: '', config: { style: { boxBg: '#eff6ff', borderRadius: '50%', boxSize: 80, numberColor: '#3b82f6' } } },
    { id: 'countdown-flip', name: 'Flip Style', description: 'Flip clock look', preview: '', config: { style: { boxBg: '#1f2937', numberColor: '#ffffff', borderRadius: 4, shadow: 'lg' } } },
    { id: 'countdown-neon', name: 'Neon', description: 'Glowing effect', preview: '', config: { style: { boxBg: '#0f172a', numberColor: '#22d3ee', glow: '0 0 20px #22d3ee', numberSize: 40 } } },
    { id: 'countdown-separator', name: 'With Separator', description: 'Colon separators', preview: '', config: { showSeparator: true, separator: ':', style: { separatorColor: '#6b7280', separatorSize: 28 } } },
  ],

  // ===== DIVIDER TEMPLATES =====
  'divider': [
    { id: 'divider-solid', name: 'Solid', description: 'Simple solid line', preview: '', config: { style: 'solid', color: '#e5e7eb', thickness: 1 } },
    { id: 'divider-dashed', name: 'Dashed', description: 'Dashed line', preview: '', config: { style: 'dashed', color: '#d1d5db', thickness: 1 } },
    { id: 'divider-dotted', name: 'Dotted', description: 'Dotted line', preview: '', config: { style: 'dotted', color: '#9ca3af', thickness: 2 } },
    { id: 'divider-double', name: 'Double', description: 'Double line', preview: '', config: { style: 'double', color: '#e5e7eb', thickness: 3 } },
    { id: 'divider-thick', name: 'Thick', description: 'Bold line', preview: '', config: { style: 'solid', color: '#3b82f6', thickness: 4 } },
    { id: 'divider-gradient', name: 'Gradient', description: 'Gradient line', preview: '', config: { gradient: 'linear-gradient(90deg, transparent, #3b82f6, transparent)', thickness: 2 } },
    { id: 'divider-text', name: 'With Text', description: 'Text in middle', preview: '', config: { text: 'OR', style: 'solid', color: '#e5e7eb', textColor: '#6b7280' } },
    { id: 'divider-icon', name: 'With Icon', description: 'Icon in middle', preview: '', config: { icon: 'star', style: 'solid', color: '#e5e7eb', iconColor: '#f59e0b' } },
    { id: 'divider-short', name: 'Short', description: 'Centered short', preview: '', config: { width: '50%', alignment: 'center', color: '#3b82f6', thickness: 2 } },
    { id: 'divider-dark', name: 'Dark Theme', description: 'For dark bg', preview: '', config: { style: 'solid', color: '#374151', thickness: 1 } },
  ],

  // ===== SPACER TEMPLATES =====
  'spacer': [
    { id: 'spacer-xs', name: 'Extra Small', description: '8px space', preview: '', config: { height: 8 } },
    { id: 'spacer-sm', name: 'Small', description: '16px space', preview: '', config: { height: 16 } },
    { id: 'spacer-md', name: 'Medium', description: '24px space', preview: '', config: { height: 24 } },
    { id: 'spacer-lg', name: 'Large', description: '32px space', preview: '', config: { height: 32 } },
    { id: 'spacer-xl', name: 'Extra Large', description: '48px space', preview: '', config: { height: 48 } },
    { id: 'spacer-2xl', name: '2X Large', description: '64px space', preview: '', config: { height: 64 } },
    { id: 'spacer-3xl', name: '3X Large', description: '96px space', preview: '', config: { height: 96 } },
    { id: 'spacer-responsive', name: 'Responsive', description: 'Adapts to screen', preview: '', config: { height: 40, responsiveHeight: { mobile: 20, tablet: 30 } } },
    { id: 'spacer-section', name: 'Section Gap', description: 'Between sections', preview: '', config: { height: 80 } },
    { id: 'spacer-mini', name: 'Mini', description: '4px space', preview: '', config: { height: 4 } },
  ],

  // ===== PRICING CARD TEMPLATES =====
  'pricing-card': [
    { id: 'pricing-basic', name: 'Basic', description: 'Simple pricing', preview: '', config: { name: 'Basic', price: '29', period: 'mo', style: { backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: 12 } } },
    { id: 'pricing-featured', name: 'Featured', description: 'Highlighted plan', preview: '', config: { name: 'Pro', price: '49', period: 'mo', featured: true, style: { backgroundColor: '#3b82f6', textColor: '#ffffff', borderRadius: 12, shadow: 'lg' } } },
    { id: 'pricing-gradient', name: 'Gradient', description: 'Gradient background', preview: '', config: { name: 'Premium', price: '99', period: 'mo', style: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', textColor: '#ffffff', borderRadius: 16 } } },
    { id: 'pricing-dark', name: 'Dark Theme', description: 'Dark background', preview: '', config: { name: 'Enterprise', price: '199', period: 'mo', style: { backgroundColor: '#1e293b', textColor: '#f1f5f9', priceColor: '#60a5fa' } } },
    { id: 'pricing-minimal', name: 'Minimal', description: 'Clean design', preview: '', config: { name: 'Starter', price: '19', period: 'mo', style: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8 } } },
    { id: 'pricing-annual', name: 'Annual', description: 'Yearly billing', preview: '', config: { name: 'Pro', price: '399', period: 'year', savings: 'Save 20%', style: { badgeBg: '#10b981', badgeColor: '#ffffff' } } },
    { id: 'pricing-popular', name: 'Most Popular', description: 'With badge', preview: '', config: { name: 'Business', price: '79', period: 'mo', badge: 'Most Popular', style: { borderColor: '#3b82f6', borderWidth: 2 } } },
    { id: 'pricing-enterprise', name: 'Enterprise', description: 'Contact sales', preview: '', config: { name: 'Enterprise', price: 'Custom', showContact: true, style: { backgroundColor: '#f8fafc' } } },
    { id: 'pricing-compact', name: 'Compact', description: 'Smaller card', preview: '', config: { name: 'Basic', price: '9', period: 'mo', compact: true, style: { padding: 16, borderRadius: 8 } } },
    { id: 'pricing-comparison', name: 'Comparison', description: 'Feature list', preview: '', config: { name: 'Pro', price: '49', period: 'mo', features: ['Feature 1', 'Feature 2'], style: { showFeatures: true } } },
  ],

  // ===== BANNER TEMPLATES =====
  'banner': [
    { id: 'banner-simple', name: 'Simple', description: 'Basic banner', preview: '', config: { text: 'Welcome!', style: { backgroundColor: '#3b82f6', textColor: '#ffffff', padding: 16 } } },
    { id: 'banner-gradient', name: 'Gradient', description: 'Gradient background', preview: '', config: { text: 'Special Offer', style: { background: 'linear-gradient(135deg, #6366f1, #ec4899)', textColor: '#ffffff', padding: 20 } } },
    { id: 'banner-image', name: 'With Image', description: 'Background image', preview: '', config: { text: 'Explore More', hasImage: true, style: { overlay: 'rgba(0,0,0,0.5)', textColor: '#ffffff' } } },
    { id: 'banner-cta', name: 'With CTA', description: 'Action button', preview: '', config: { text: 'Join Now', buttonText: 'Sign Up', style: { backgroundColor: '#1e293b', textColor: '#ffffff' } } },
    { id: 'banner-dismissible', name: 'Dismissible', description: 'Can be closed', preview: '', config: { text: 'Notice', dismissible: true, style: { backgroundColor: '#fef3c7', textColor: '#92400e' } } },
    { id: 'banner-countdown', name: 'With Timer', description: 'Countdown banner', preview: '', config: { text: 'Sale Ends In', showCountdown: true, style: { backgroundColor: '#dc2626', textColor: '#ffffff' } } },
    { id: 'banner-fullwidth', name: 'Full Width', description: '100% width', preview: '', config: { text: 'Announcement', style: { width: '100%', backgroundColor: '#0f172a', textColor: '#ffffff' } } },
    { id: 'banner-sticky', name: 'Sticky', description: 'Stays on scroll', preview: '', config: { text: 'Important', sticky: true, style: { backgroundColor: '#ef4444', textColor: '#ffffff' } } },
    { id: 'banner-animated', name: 'Animated', description: 'With animation', preview: '', config: { text: 'New Feature!', animated: true, style: { animation: 'pulse', backgroundColor: '#8b5cf6', textColor: '#ffffff' } } },
    { id: 'banner-split', name: 'Split Layout', description: 'Text and image', preview: '', config: { text: 'Discover', layout: 'split', style: { backgroundColor: '#f9fafb' } } },
  ],

  // ===== ALERT TEMPLATES =====
  'alert': [
    { id: 'alert-info', name: 'Info', description: 'Information alert', preview: '', config: { type: 'info', message: 'Information message', style: { backgroundColor: '#eff6ff', textColor: '#1e40af', borderColor: '#3b82f6' } } },
    { id: 'alert-success', name: 'Success', description: 'Success alert', preview: '', config: { type: 'success', message: 'Success message', style: { backgroundColor: '#dcfce7', textColor: '#166534', borderColor: '#22c55e' } } },
    { id: 'alert-warning', name: 'Warning', description: 'Warning alert', preview: '', config: { type: 'warning', message: 'Warning message', style: { backgroundColor: '#fef3c7', textColor: '#92400e', borderColor: '#f59e0b' } } },
    { id: 'alert-error', name: 'Error', description: 'Error alert', preview: '', config: { type: 'error', message: 'Error message', style: { backgroundColor: '#fef2f2', textColor: '#991b1b', borderColor: '#ef4444' } } },
    { id: 'alert-minimal', name: 'Minimal', description: 'Clean minimal', preview: '', config: { message: 'Alert message', style: { borderLeftWidth: 4, borderColor: '#3b82f6', paddingLeft: 16 } } },
    { id: 'alert-icon', name: 'With Icon', description: 'Icon prefix', preview: '', config: { message: 'Alert', showIcon: true, icon: 'info', style: { iconColor: '#3b82f6' } } },
    { id: 'alert-dismissible', name: 'Dismissible', description: 'Can close', preview: '', config: { message: 'Dismissible alert', dismissible: true, style: { backgroundColor: '#f3f4f6' } } },
    { id: 'alert-dark', name: 'Dark Theme', description: 'Dark background', preview: '', config: { message: 'Dark alert', style: { backgroundColor: '#1e293b', textColor: '#f1f5f9' } } },
    { id: 'alert-bordered', name: 'Bordered', description: 'Full border', preview: '', config: { message: 'Bordered alert', style: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8 } } },
    { id: 'alert-action', name: 'With Action', description: 'Action button', preview: '', config: { message: 'Take action', actionText: 'Learn More', style: { backgroundColor: '#eff6ff' } } },
  ],

  // ===== BADGE TEMPLATES =====
  'badge': [
    { id: 'badge-default', name: 'Default', description: 'Standard badge', preview: '', config: { text: 'Badge', style: { backgroundColor: '#3b82f6', textColor: '#ffffff', borderRadius: 4, padding: '2px 8px' } } },
    { id: 'badge-pill', name: 'Pill', description: 'Rounded pill', preview: '', config: { text: 'New', style: { backgroundColor: '#10b981', textColor: '#ffffff', borderRadius: 20, padding: '4px 12px' } } },
    { id: 'badge-outlined', name: 'Outlined', description: 'Border only', preview: '', config: { text: 'Beta', style: { backgroundColor: 'transparent', borderColor: '#3b82f6', borderWidth: 1, textColor: '#3b82f6' } } },
    { id: 'badge-success', name: 'Success', description: 'Green badge', preview: '', config: { text: 'Active', style: { backgroundColor: '#dcfce7', textColor: '#166534' } } },
    { id: 'badge-warning', name: 'Warning', description: 'Yellow badge', preview: '', config: { text: 'Pending', style: { backgroundColor: '#fef3c7', textColor: '#92400e' } } },
    { id: 'badge-error', name: 'Error', description: 'Red badge', preview: '', config: { text: 'Error', style: { backgroundColor: '#fef2f2', textColor: '#991b1b' } } },
    { id: 'badge-dot', name: 'With Dot', description: 'Status dot', preview: '', config: { text: 'Online', showDot: true, style: { dotColor: '#22c55e' } } },
    { id: 'badge-icon', name: 'With Icon', description: 'Icon badge', preview: '', config: { text: 'Verified', icon: 'check', style: { backgroundColor: '#3b82f6', textColor: '#ffffff' } } },
    { id: 'badge-gradient', name: 'Gradient', description: 'Gradient background', preview: '', config: { text: 'Pro', style: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', textColor: '#ffffff' } } },
    { id: 'badge-dark', name: 'Dark', description: 'Dark badge', preview: '', config: { text: 'Dark', style: { backgroundColor: '#1e293b', textColor: '#f1f5f9' } } },
  ],

  // ===== LOGO TEMPLATES =====
  'logo': [
    { id: 'logo-simple', name: 'Simple', description: 'Basic logo', preview: '', config: { style: { maxHeight: 40 } } },
    { id: 'logo-large', name: 'Large', description: 'Bigger logo', preview: '', config: { style: { maxHeight: 60 } } },
    { id: 'logo-small', name: 'Small', description: 'Compact logo', preview: '', config: { style: { maxHeight: 30 } } },
    { id: 'logo-centered', name: 'Centered', description: 'Center aligned', preview: '', config: { alignment: 'center', style: { maxHeight: 50 } } },
    { id: 'logo-left', name: 'Left Aligned', description: 'Left position', preview: '', config: { alignment: 'left', style: { maxHeight: 40 } } },
    { id: 'logo-dark', name: 'For Dark BG', description: 'Light version', preview: '', config: { variant: 'light', style: { maxHeight: 40 } } },
    { id: 'logo-light', name: 'For Light BG', description: 'Dark version', preview: '', config: { variant: 'dark', style: { maxHeight: 40 } } },
    { id: 'logo-text', name: 'With Text', description: 'Logo + company name', preview: '', config: { showText: true, text: 'Company', style: { fontSize: 18, fontWeight: 'bold' } } },
    { id: 'logo-stacked', name: 'Stacked', description: 'Logo above text', preview: '', config: { layout: 'stacked', showText: true, style: { spacing: 8 } } },
    { id: 'logo-responsive', name: 'Responsive', description: 'Adapts to screen', preview: '', config: { responsive: true, style: { maxHeight: 50, mobileHeight: 32 } } },
  ],

  // ===== SEARCH TEMPLATES =====
  'search': [
    { id: 'search-default', name: 'Default', description: 'Standard search', preview: '', config: { placeholder: 'Search...', style: { borderRadius: 8, borderColor: '#e5e7eb' } } },
    { id: 'search-rounded', name: 'Rounded', description: 'Pill shape', preview: '', config: { placeholder: 'Search...', style: { borderRadius: 50, padding: '10px 20px' } } },
    { id: 'search-icon', name: 'With Icon', description: 'Search icon', preview: '', config: { placeholder: 'Search...', showIcon: true, style: { iconColor: '#9ca3af' } } },
    { id: 'search-button', name: 'With Button', description: 'Search button', preview: '', config: { placeholder: 'Search...', showButton: true, buttonText: 'Search', style: { buttonBg: '#3b82f6' } } },
    { id: 'search-minimal', name: 'Minimal', description: 'Clean minimal', preview: '', config: { placeholder: 'Type to search...', style: { borderWidth: 0, borderBottomWidth: 1, borderRadius: 0 } } },
    { id: 'search-dark', name: 'Dark Theme', description: 'Dark background', preview: '', config: { placeholder: 'Search...', style: { backgroundColor: '#374151', textColor: '#f3f4f6', borderColor: '#4b5563' } } },
    { id: 'search-large', name: 'Large', description: 'Bigger search', preview: '', config: { placeholder: 'What are you looking for?', style: { fontSize: 16, padding: '14px 20px', borderRadius: 12 } } },
    { id: 'search-compact', name: 'Compact', description: 'Smaller search', preview: '', config: { placeholder: 'Search', style: { fontSize: 13, padding: '6px 12px', borderRadius: 6 } } },
    { id: 'search-expandable', name: 'Expandable', description: 'Expands on focus', preview: '', config: { expandable: true, style: { initialWidth: 200, expandedWidth: 350 } } },
    { id: 'search-autocomplete', name: 'Autocomplete', description: 'With suggestions', preview: '', config: { autocomplete: true, placeholder: 'Search...', style: { borderRadius: 8 } } },
  ],

  // ===== FAQ TEMPLATES =====
  'faq': [
    { id: 'faq-default', name: 'Default', description: 'Standard FAQ', preview: '', config: { items: [{ question: 'Question?', answer: 'Answer...' }], style: { borderColor: '#e5e7eb' } } },
    { id: 'faq-bordered', name: 'Bordered', description: 'With borders', preview: '', config: { items: [{ question: 'Question?', answer: 'Answer...' }], style: { borderWidth: 1, borderRadius: 8, spacing: 12 } } },
    { id: 'faq-minimal', name: 'Minimal', description: 'Clean minimal', preview: '', config: { items: [{ question: 'Question?', answer: 'Answer...' }], style: { borderBottom: true } } },
    { id: 'faq-icons', name: 'With Icons', description: 'Question icons', preview: '', config: { items: [{ question: 'Question?', answer: 'Answer...' }], showIcon: true, style: { iconColor: '#3b82f6' } } },
    { id: 'faq-numbered', name: 'Numbered', description: 'Number prefix', preview: '', config: { items: [{ question: 'Question?', answer: 'Answer...' }], numbered: true, style: { numberColor: '#3b82f6' } } },
    { id: 'faq-cards', name: 'Card Style', description: 'Each as card', preview: '', config: { items: [{ question: 'Question?', answer: 'Answer...' }], style: { backgroundColor: '#f9fafb', padding: 16, borderRadius: 8, spacing: 12 } } },
    { id: 'faq-dark', name: 'Dark Theme', description: 'Dark background', preview: '', config: { items: [{ question: 'Question?', answer: 'Answer...' }], style: { backgroundColor: '#1e293b', textColor: '#f1f5f9' } } },
    { id: 'faq-gradient', name: 'Gradient Header', description: 'Colorful headers', preview: '', config: { items: [{ question: 'Question?', answer: 'Answer...' }], style: { questionBg: 'linear-gradient(135deg, #6366f1, #8b5cf6)', questionColor: '#ffffff' } } },
    { id: 'faq-compact', name: 'Compact', description: 'Dense layout', preview: '', config: { items: [{ question: 'Question?', answer: 'Answer...' }], style: { fontSize: 14, spacing: 8 } } },
    { id: 'faq-search', name: 'Searchable', description: 'With search', preview: '', config: { items: [{ question: 'Question?', answer: 'Answer...' }], searchable: true, style: { searchBorderRadius: 8 } } },
  ],

  // ===== BUSINESS HOURS TEMPLATES =====
  'business-hours': [
    { id: 'hours-simple', name: 'Simple', description: 'Basic hours', preview: '', config: { hours: [{ day: 'Mon-Fri', time: '9AM - 5PM' }], style: { fontSize: 14, spacing: 8 } } },
    { id: 'hours-detailed', name: 'Detailed', description: 'Each day', preview: '', config: { hours: [{ day: 'Monday', time: '9:00 - 17:00' }], detailed: true, style: { spacing: 6 } } },
    { id: 'hours-icons', name: 'With Icons', description: 'Clock icons', preview: '', config: { hours: [{ day: 'Mon-Fri', time: '9AM - 5PM' }], showIcon: true, style: { iconColor: '#3b82f6' } } },
    { id: 'hours-today', name: 'Today Highlight', description: 'Highlights today', preview: '', config: { hours: [{ day: 'Monday', time: '9AM - 5PM' }], highlightToday: true, style: { todayBg: '#eff6ff' } } },
    { id: 'hours-status', name: 'Open Status', description: 'Shows if open', preview: '', config: { hours: [{ day: 'Mon-Fri', time: '9AM - 5PM' }], showStatus: true, style: { openColor: '#22c55e', closedColor: '#ef4444' } } },
    { id: 'hours-card', name: 'Card Style', description: 'In a card', preview: '', config: { hours: [{ day: 'Mon-Fri', time: '9AM - 5PM' }], style: { backgroundColor: '#f9fafb', padding: 16, borderRadius: 8 } } },
    { id: 'hours-dark', name: 'Dark Theme', description: 'Dark background', preview: '', config: { hours: [{ day: 'Mon-Fri', time: '9AM - 5PM' }], style: { backgroundColor: '#1e293b', textColor: '#f1f5f9' } } },
    { id: 'hours-compact', name: 'Compact', description: 'Dense layout', preview: '', config: { hours: [{ day: 'Mon-Fri', time: '9AM - 5PM' }], style: { fontSize: 12, spacing: 4 } } },
    { id: 'hours-table', name: 'Table Style', description: 'Tabular layout', preview: '', config: { hours: [{ day: 'Monday', time: '9AM - 5PM' }], layout: 'table', style: { borderColor: '#e5e7eb' } } },
    { id: 'hours-minimal', name: 'Minimal', description: 'Just text', preview: '', config: { hours: [{ day: 'Mon-Fri', time: '9AM - 5PM' }], style: { textColor: '#6b7280', fontSize: 13 } } },
  ],

  // ===== QR CODE TEMPLATES =====
  'qr-code': [
    { id: 'qr-default', name: 'Default', description: 'Standard QR', preview: '', config: { size: 128, style: { padding: 8 } } },
    { id: 'qr-large', name: 'Large', description: 'Bigger QR code', preview: '', config: { size: 200, style: { padding: 16 } } },
    { id: 'qr-small', name: 'Small', description: 'Compact QR', preview: '', config: { size: 80, style: { padding: 4 } } },
    { id: 'qr-rounded', name: 'Rounded', description: 'Rounded modules', preview: '', config: { size: 128, rounded: true, style: { borderRadius: 8 } } },
    { id: 'qr-colored', name: 'Colored', description: 'Custom colors', preview: '', config: { size: 128, fgColor: '#3b82f6', bgColor: '#ffffff' } },
    { id: 'qr-logo', name: 'With Logo', description: 'Center logo', preview: '', config: { size: 150, showLogo: true, style: { logoSize: 30 } } },
    { id: 'qr-bordered', name: 'Bordered', description: 'With border', preview: '', config: { size: 128, style: { borderWidth: 2, borderColor: '#e5e7eb', borderRadius: 8, padding: 12 } } },
    { id: 'qr-dark', name: 'Dark Theme', description: 'Dark QR', preview: '', config: { size: 128, fgColor: '#ffffff', bgColor: '#1e293b' } },
    { id: 'qr-gradient', name: 'Gradient', description: 'Gradient colors', preview: '', config: { size: 128, gradient: true, gradientColors: ['#6366f1', '#ec4899'] } },
    { id: 'qr-card', name: 'Card Style', description: 'In a card', preview: '', config: { size: 120, style: { backgroundColor: '#ffffff', shadow: 'md', borderRadius: 12, padding: 16 } } },
  ],

  // ===== SOCIAL LINKS (EXTENDED) TEMPLATES =====
  'social-links': [
    { id: 'social-links-default', name: 'Default', description: 'Standard social links', preview: '', config: { links: [{ platform: 'facebook', url: '#' }], style: { iconSize: 24, spacing: 12 } } },
    { id: 'social-links-colored', name: 'Brand Colors', description: 'Platform colors', preview: '', config: { links: [{ platform: 'facebook', url: '#' }], colorMode: 'brand', style: { iconSize: 28 } } },
    { id: 'social-links-mono', name: 'Monochrome', description: 'Single color', preview: '', config: { links: [{ platform: 'facebook', url: '#' }], colorMode: 'mono', style: { iconColor: '#6b7280' } } },
    { id: 'social-links-circles', name: 'Circle Buttons', description: 'Circular icons', preview: '', config: { links: [{ platform: 'facebook', url: '#' }], shape: 'circle', style: { size: 40, iconSize: 20 } } },
    { id: 'social-links-squares', name: 'Square Buttons', description: 'Square icons', preview: '', config: { links: [{ platform: 'facebook', url: '#' }], shape: 'square', style: { size: 40, borderRadius: 8 } } },
    { id: 'social-links-outline', name: 'Outlined', description: 'Border only', preview: '', config: { links: [{ platform: 'facebook', url: '#' }], variant: 'outline', style: { borderWidth: 2 } } },
    { id: 'social-links-vertical', name: 'Vertical', description: 'Stacked layout', preview: '', config: { links: [{ platform: 'facebook', url: '#' }], layout: 'vertical', style: { spacing: 8 } } },
    { id: 'social-links-labels', name: 'With Labels', description: 'Text labels', preview: '', config: { links: [{ platform: 'facebook', url: '#' }], showLabels: true, style: { fontSize: 14 } } },
    { id: 'social-links-dark', name: 'Dark Theme', description: 'For dark bg', preview: '', config: { links: [{ platform: 'facebook', url: '#' }], style: { iconColor: '#ffffff', bgColor: '#374151' } } },
    { id: 'social-links-animated', name: 'Animated', description: 'Hover effects', preview: '', config: { links: [{ platform: 'facebook', url: '#' }], animated: true, style: { hoverScale: 1.1 } } },
  ],

  // ===== SHORTCODE TEMPLATES =====
  'shortcode': [
    { id: 'shortcode-basic', name: 'Basic', description: 'Simple shortcode', preview: '', config: { code: '[shortcode]' } },
    { id: 'shortcode-attrs', name: 'With Attributes', description: 'Parameterized', preview: '', config: { code: '[shortcode attr="value"]' } },
    { id: 'shortcode-content', name: 'With Content', description: 'Enclosing shortcode', preview: '', config: { code: '[shortcode]content[/shortcode]' } },
    { id: 'shortcode-gallery', name: 'Gallery', description: 'Image gallery', preview: '', config: { code: '[gallery ids="1,2,3"]' } },
    { id: 'shortcode-video', name: 'Video', description: 'Video embed', preview: '', config: { code: '[video src="url"]' } },
    { id: 'shortcode-audio', name: 'Audio', description: 'Audio embed', preview: '', config: { code: '[audio src="url"]' } },
    { id: 'shortcode-embed', name: 'Embed', description: 'oEmbed content', preview: '', config: { code: '[embed]url[/embed]' } },
    { id: 'shortcode-button', name: 'Button', description: 'Action button', preview: '', config: { code: '[button url="#" text="Click Me"]' } },
    { id: 'shortcode-form', name: 'Form', description: 'Contact form', preview: '', config: { code: '[contact-form id="1"]' } },
    { id: 'shortcode-map', name: 'Map', description: 'Location map', preview: '', config: { code: '[map address="Location" zoom="14"]' } },
  ],

  // ===== NOTICE TEMPLATES =====
  'notice': [
    { id: 'notice-info', name: 'Info', description: 'Information notice', preview: '', config: { type: 'info', message: 'Notice message', style: { backgroundColor: '#eff6ff', textColor: '#1e40af', iconColor: '#3b82f6' } } },
    { id: 'notice-success', name: 'Success', description: 'Success notice', preview: '', config: { type: 'success', message: 'Success message', style: { backgroundColor: '#dcfce7', textColor: '#166534', iconColor: '#22c55e' } } },
    { id: 'notice-warning', name: 'Warning', description: 'Warning notice', preview: '', config: { type: 'warning', message: 'Warning message', style: { backgroundColor: '#fef3c7', textColor: '#92400e', iconColor: '#f59e0b' } } },
    { id: 'notice-error', name: 'Error', description: 'Error notice', preview: '', config: { type: 'error', message: 'Error message', style: { backgroundColor: '#fef2f2', textColor: '#991b1b', iconColor: '#ef4444' } } },
    { id: 'notice-minimal', name: 'Minimal', description: 'Clean design', preview: '', config: { message: 'Notice', style: { borderLeftWidth: 4, borderColor: '#3b82f6' } } },
    { id: 'notice-sticky', name: 'Sticky', description: 'Top bar notice', preview: '', config: { message: 'Announcement', sticky: true, style: { padding: '8px 16px' } } },
    { id: 'notice-dismissible', name: 'Dismissible', description: 'Can close', preview: '', config: { message: 'Dismissible', dismissible: true, style: { borderRadius: 8 } } },
    { id: 'notice-action', name: 'With Action', description: 'Action button', preview: '', config: { message: 'Update available', actionText: 'Update Now', style: { backgroundColor: '#f3f4f6' } } },
    { id: 'notice-icon', name: 'With Icon', description: 'Icon prefix', preview: '', config: { message: 'Notice', showIcon: true, icon: 'bell', style: { iconSize: 20 } } },
    { id: 'notice-dark', name: 'Dark Theme', description: 'Dark background', preview: '', config: { message: 'Notice', style: { backgroundColor: '#1e293b', textColor: '#f1f5f9' } } },
  ],

  // ===== FEATURED POST TEMPLATES =====
  'featured-post': [
    { id: 'feat-card', name: 'Card Style', description: 'Post in card', preview: '', config: { showImage: true, showExcerpt: true, style: { borderRadius: 12, shadow: 'md' } } },
    { id: 'feat-overlay', name: 'Image Overlay', description: 'Text on image', preview: '', config: { showImage: true, layout: 'overlay', style: { overlayGradient: 'linear-gradient(transparent, rgba(0,0,0,0.8))' } } },
    { id: 'feat-horizontal', name: 'Horizontal', description: 'Side by side', preview: '', config: { showImage: true, layout: 'horizontal', style: { imageWidth: '40%' } } },
    { id: 'feat-large', name: 'Large', description: 'Big featured post', preview: '', config: { showImage: true, imageHeight: 300, style: { fontSize: 24 } } },
    { id: 'feat-minimal', name: 'Minimal', description: 'Clean design', preview: '', config: { showImage: false, showExcerpt: true, style: { borderLeft: '4px solid #3b82f6' } } },
    { id: 'feat-badge', name: 'With Badge', description: 'Featured badge', preview: '', config: { showBadge: true, badgeText: 'Featured', style: { badgeBg: '#ef4444' } } },
    { id: 'feat-meta', name: 'With Meta', description: 'Date and author', preview: '', config: { showDate: true, showAuthor: true, style: { metaColor: '#6b7280' } } },
    { id: 'feat-dark', name: 'Dark Theme', description: 'Dark background', preview: '', config: { showImage: true, style: { backgroundColor: '#1e293b', textColor: '#f1f5f9' } } },
    { id: 'feat-gradient', name: 'Gradient', description: 'Gradient background', preview: '', config: { style: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', textColor: '#ffffff' } } },
    { id: 'feat-compact', name: 'Compact', description: 'Smaller size', preview: '', config: { showImage: true, imageHeight: 150, style: { padding: 12 } } },
  ],

  // ===== AUTHOR BOX TEMPLATES =====
  'author-box': [
    { id: 'author-default', name: 'Default', description: 'Standard author box', preview: '', config: { showAvatar: true, showBio: true, style: { avatarSize: 80, borderRadius: 8 } } },
    { id: 'author-horizontal', name: 'Horizontal', description: 'Side layout', preview: '', config: { showAvatar: true, layout: 'horizontal', style: { avatarSize: 60 } } },
    { id: 'author-card', name: 'Card Style', description: 'In a card', preview: '', config: { showAvatar: true, showBio: true, style: { backgroundColor: '#f9fafb', padding: 20, borderRadius: 12 } } },
    { id: 'author-minimal', name: 'Minimal', description: 'Clean design', preview: '', config: { showAvatar: true, showBio: false, style: { avatarSize: 48 } } },
    { id: 'author-social', name: 'With Social', description: 'Social links', preview: '', config: { showAvatar: true, showSocial: true, style: { socialIconSize: 20 } } },
    { id: 'author-centered', name: 'Centered', description: 'Center aligned', preview: '', config: { showAvatar: true, alignment: 'center', style: { avatarSize: 100 } } },
    { id: 'author-bordered', name: 'Bordered', description: 'With border', preview: '', config: { showAvatar: true, style: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8 } } },
    { id: 'author-dark', name: 'Dark Theme', description: 'Dark background', preview: '', config: { showAvatar: true, style: { backgroundColor: '#1e293b', textColor: '#f1f5f9' } } },
    { id: 'author-compact', name: 'Compact', description: 'Dense layout', preview: '', config: { showAvatar: true, showBio: false, style: { avatarSize: 40, fontSize: 13 } } },
    { id: 'author-featured', name: 'Featured', description: 'Large prominent', preview: '', config: { showAvatar: true, showBio: true, style: { avatarSize: 120, shadow: 'lg', padding: 24 } } },
  ],
};

// Get templates for a specific widget type
const getWidgetTemplates = (widgetType: string): WidgetTemplate[] => {
  return WIDGET_TEMPLATES[widgetType] || [];
};

// ==================== HELPERS ====================

const generateId = () => Math.random().toString(36).substr(2, 9);

// Common style defaults
const DEFAULT_COLORS = {
  primary: '#3b82f6',
  secondary: '#6b7280',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  text: '#1f2937',
  textLight: '#6b7280',
  background: '#ffffff',
  border: '#e5e7eb',
};

const getDefaultWidgetConfig = (type: WidgetType): any => {
  const baseStyle = {
    textColor: DEFAULT_COLORS.text,
    backgroundColor: 'transparent',
    borderColor: DEFAULT_COLORS.border,
    borderRadius: 8,
    padding: 0,
  };

  switch (type) {
    case 'links':
      return {
        links: [
          { id: generateId(), label: 'Link 1', url: '#', target: '_self', icon: '' },
          { id: generateId(), label: 'Link 2', url: '#', target: '_self', icon: '' },
          { id: generateId(), label: 'Link 3', url: '#', target: '_self', icon: '' },
        ],
        style: {
          ...baseStyle,
          linkColor: DEFAULT_COLORS.primary,
          hoverColor: '#2563eb',
          fontSize: 14,
          spacing: 8,
          showBullets: false,
          bulletStyle: 'arrow',
        }
      };

    case 'icon-list':
      return {
        items: [
          { id: generateId(), label: 'Feature 1', url: '#', icon: 'check', description: 'Description text' },
          { id: generateId(), label: 'Feature 2', url: '#', icon: 'check', description: 'Description text' },
          { id: generateId(), label: 'Feature 3', url: '#', icon: 'check', description: 'Description text' },
        ],
        style: {
          ...baseStyle,
          iconColor: DEFAULT_COLORS.primary,
          iconSize: 20,
          iconBackground: '#eff6ff',
          fontSize: 14,
          spacing: 12,
          layout: 'vertical',
        }
      };

    case 'image':
      return {
        image: {
          src: 'https://via.placeholder.com/300x200',
          alt: 'Mega menu image',
          link: '',
          openInNewTab: false,
        },
        style: {
          ...baseStyle,
          objectFit: 'cover',
          aspectRatio: '16:9',
          width: '100%',
          maxHeight: 200,
          borderRadius: 8,
          shadow: 'sm',
          hoverEffect: 'zoom',
        }
      };

    case 'text':
      return {
        text: {
          content: 'Add your content here. You can describe your products, services, or any other information.',
        },
        style: {
          ...baseStyle,
          fontSize: 14,
          lineHeight: 1.6,
          textAlign: 'left',
          fontWeight: 'normal',
        }
      };

    case 'posts':
      return {
        posts: {
          count: 3,
          category: '',
          orderBy: 'date',
        },
        display: {
          showImage: true,
          showExcerpt: true,
          showDate: true,
          showAuthor: false,
          showCategory: false,
          layout: 'list',
          imagePosition: 'left',
        },
        style: {
          ...baseStyle,
          imageSize: 60,
          spacing: 12,
          titleSize: 14,
          excerptLines: 2,
        }
      };

    case 'categories':
      return {
        categories: {
          showCount: true,
          hierarchical: false,
          limit: 6,
          exclude: [],
        },
        style: {
          ...baseStyle,
          fontSize: 14,
          spacing: 8,
          showIcons: true,
          iconColor: DEFAULT_COLORS.primary,
          countBackground: '#f3f4f6',
        }
      };

    case 'tags':
      return {
        tags: {
          limit: 10,
          orderBy: 'count',
        },
        style: {
          ...baseStyle,
          fontSize: 12,
          backgroundColor: '#f3f4f6',
          textColor: DEFAULT_COLORS.text,
          hoverBackground: DEFAULT_COLORS.primary,
          hoverTextColor: '#ffffff',
          borderRadius: 16,
          padding: 8,
          gap: 8,
        }
      };

    case 'products':
      return {
        products: {
          count: 4,
          category: '',
          orderBy: 'featured',
          onSale: false,
        },
        display: {
          showPrice: true,
          showRating: true,
          showBadge: true,
          showAddToCart: false,
          layout: 'grid',
          columns: 2,
        },
        style: {
          ...baseStyle,
          imageHeight: 120,
          spacing: 12,
          priceColor: DEFAULT_COLORS.primary,
          saleColor: DEFAULT_COLORS.danger,
        }
      };

    case 'cta-button':
      return {
        cta: {
          text: 'Learn More',
          url: '#',
          openInNewTab: false,
          icon: 'arrow-right',
          iconPosition: 'right',
        },
        style: {
          backgroundColor: DEFAULT_COLORS.primary,
          textColor: '#ffffff',
          hoverBackground: '#2563eb',
          fontSize: 14,
          fontWeight: 'semibold',
          padding: { x: 20, y: 12 },
          borderRadius: 8,
          fullWidth: false,
          size: 'medium',
          shadow: 'sm',
          animation: 'none',
        }
      };

    case 'cta-banner':
      return {
        banner: {
          title: 'Special Offer',
          subtitle: 'Get 20% off your first order',
          buttonText: 'Shop Now',
          buttonUrl: '#',
          image: '',
        },
        style: {
          backgroundColor: DEFAULT_COLORS.primary,
          textColor: '#ffffff',
          titleSize: 18,
          subtitleSize: 14,
          padding: 20,
          borderRadius: 12,
          layout: 'horizontal',
          buttonStyle: 'light',
        }
      };

    case 'newsletter':
      return {
        newsletter: {
          title: 'Subscribe to Newsletter',
          placeholder: 'Enter your email',
          buttonText: 'Subscribe',
          successMessage: 'Thanks for subscribing!',
        },
        style: {
          ...baseStyle,
          inputBackground: '#f9fafb',
          buttonBackground: DEFAULT_COLORS.primary,
          buttonTextColor: '#ffffff',
          borderRadius: 8,
          layout: 'stacked',
        }
      };

    case 'search':
      return {
        search: {
          placeholder: 'Search...',
          showButton: true,
          buttonText: 'Search',
        },
        style: {
          ...baseStyle,
          inputBackground: '#f9fafb',
          iconColor: DEFAULT_COLORS.textLight,
          borderRadius: 8,
          size: 'medium',
        }
      };

    case 'contact-info':
      return {
        contact: {
          phone: '+1 (555) 123-4567',
          email: 'hello@example.com',
          address: '123 Main St, City, Country',
          showIcons: true,
        },
        style: {
          ...baseStyle,
          iconColor: DEFAULT_COLORS.primary,
          iconSize: 18,
          fontSize: 14,
          spacing: 12,
          layout: 'vertical',
        }
      };

    case 'map':
      return {
        map: {
          address: '123 Main St, New York, NY',
          zoom: 14,
          height: 150,
          showMarker: true,
        },
        style: {
          borderRadius: 8,
          shadow: 'sm',
        }
      };

    case 'social-links':
      return {
        social: {
          links: [
            { platform: 'facebook', url: '#' },
            { platform: 'twitter', url: '#' },
            { platform: 'instagram', url: '#' },
            { platform: 'linkedin', url: '#' },
          ],
        },
        style: {
          iconSize: 20,
          iconColor: DEFAULT_COLORS.textLight,
          hoverColor: DEFAULT_COLORS.primary,
          spacing: 12,
          layout: 'horizontal',
          showLabels: false,
          backgroundColor: 'transparent',
          iconBackground: '#f3f4f6',
          borderRadius: 8,
        }
      };

    case 'stats':
      return {
        stats: [
          { id: generateId(), value: '10K+', label: 'Customers', icon: 'users' },
          { id: generateId(), value: '99%', label: 'Satisfaction', icon: 'star' },
          { id: generateId(), value: '24/7', label: 'Support', icon: 'headphones' },
        ],
        style: {
          ...baseStyle,
          valueColor: DEFAULT_COLORS.primary,
          valueSize: 28,
          valueFontWeight: 'bold',
          labelSize: 12,
          labelColor: DEFAULT_COLORS.textLight,
          spacing: 16,
          layout: 'horizontal',
          showIcons: true,
          iconColor: DEFAULT_COLORS.primary,
          animation: 'countUp',
        }
      };

    case 'progress-bar':
      return {
        progressBar: {
          label: 'Progress',
          value: 75,
          maxValue: 100,
          showValue: true,
          valueFormat: 'percent',
        },
        style: {
          barColor: DEFAULT_COLORS.primary,
          trackColor: '#e5e7eb',
          height: 8,
          borderRadius: 4,
          labelSize: 14,
          valueSize: 14,
          animation: 'slide',
          animationDuration: 1000,
          striped: false,
          animated: true,
        }
      };

    case 'countdown':
      return {
        countdown: {
          targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          title: 'Sale Ends In',
          expiredMessage: 'Sale has ended',
        },
        style: {
          ...baseStyle,
          boxBackground: '#f3f4f6',
          numberColor: DEFAULT_COLORS.text,
          labelColor: DEFAULT_COLORS.textLight,
          numberSize: 24,
          labelSize: 10,
          spacing: 8,
          showDays: true,
          showHours: true,
          showMinutes: true,
          showSeconds: true,
          separator: ':',
        }
      };

    case 'testimonial':
      return {
        testimonial: {
          quote: 'This is an amazing product! Highly recommended.',
          author: 'John Doe',
          role: 'CEO, Company',
          avatar: 'https://via.placeholder.com/48',
          rating: 5,
        },
        style: {
          ...baseStyle,
          quoteSize: 14,
          quoteStyle: 'italic',
          authorSize: 14,
          roleSize: 12,
          roleColor: DEFAULT_COLORS.textLight,
          showQuoteIcon: true,
          quoteIconColor: DEFAULT_COLORS.primary,
          showRating: true,
          ratingColor: '#fbbf24',
          avatarSize: 48,
          layout: 'vertical',
        }
      };

    case 'team-member':
      return {
        member: {
          name: 'John Doe',
          role: 'CEO & Founder',
          avatar: 'https://via.placeholder.com/80',
          bio: 'Short bio about the team member.',
          social: [
            { platform: 'twitter', url: '#' },
            { platform: 'linkedin', url: '#' },
          ],
        },
        style: {
          ...baseStyle,
          avatarSize: 80,
          avatarBorderRadius: 40,
          nameSize: 16,
          roleSize: 13,
          roleColor: DEFAULT_COLORS.textLight,
          bioSize: 13,
          showBio: true,
          showSocial: true,
          layout: 'vertical',
          textAlign: 'center',
        }
      };

    case 'icon-box':
      return {
        iconBox: {
          icon: 'star',
          title: 'Feature Title',
          description: 'Short description of this feature or service.',
          link: '',
        },
        style: {
          ...baseStyle,
          iconSize: 32,
          iconColor: DEFAULT_COLORS.primary,
          iconBackground: '#eff6ff',
          iconBorderRadius: 8,
          titleSize: 16,
          titleWeight: 'semibold',
          descriptionSize: 14,
          descriptionColor: DEFAULT_COLORS.textLight,
          spacing: 12,
          layout: 'vertical',
          textAlign: 'left',
          hoverEffect: 'lift',
        }
      };

    case 'video':
      return {
        video: {
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          autoplay: false,
          muted: true,
          loop: false,
          controls: true,
          thumbnail: '',
        },
        style: {
          aspectRatio: '16:9',
          borderRadius: 8,
          shadow: 'md',
          maxWidth: '100%',
        }
      };

    case 'image-gallery':
      return {
        gallery: {
          images: [
            { id: generateId(), src: 'https://via.placeholder.com/150', alt: 'Image 1' },
            { id: generateId(), src: 'https://via.placeholder.com/150', alt: 'Image 2' },
            { id: generateId(), src: 'https://via.placeholder.com/150', alt: 'Image 3' },
            { id: generateId(), src: 'https://via.placeholder.com/150', alt: 'Image 4' },
          ],
        },
        style: {
          columns: 2,
          gap: 8,
          borderRadius: 8,
          aspectRatio: '1:1',
          hoverEffect: 'zoom',
          lightbox: true,
        }
      };

    case 'carousel':
      return {
        carousel: {
          images: [
            { id: generateId(), src: 'https://via.placeholder.com/300x150', alt: 'Slide 1', link: '' },
            { id: generateId(), src: 'https://via.placeholder.com/300x150', alt: 'Slide 2', link: '' },
            { id: generateId(), src: 'https://via.placeholder.com/300x150', alt: 'Slide 3', link: '' },
          ],
          autoplay: true,
          interval: 3000,
        },
        style: {
          aspectRatio: '16:9',
          borderRadius: 8,
          showDots: true,
          showArrows: true,
          arrowColor: '#ffffff',
          dotColor: DEFAULT_COLORS.primary,
        }
      };

    case 'pricing-card':
      return {
        pricing: {
          name: 'Pro Plan',
          price: '$29',
          period: 'month',
          description: 'Perfect for growing businesses',
          features: [
            { text: 'Unlimited users', included: true },
            { text: '100GB storage', included: true },
            { text: 'Priority support', included: true },
            { text: 'Custom domain', included: false },
          ],
          buttonText: 'Get Started',
          buttonUrl: '#',
          featured: false,
        },
        style: {
          ...baseStyle,
          backgroundColor: '#ffffff',
          borderColor: DEFAULT_COLORS.border,
          priceColor: DEFAULT_COLORS.primary,
          priceSize: 36,
          featureSpacing: 8,
          buttonBackground: DEFAULT_COLORS.primary,
          buttonTextColor: '#ffffff',
          featuredBadge: 'Popular',
          featuredBackground: DEFAULT_COLORS.primary,
        }
      };

    case 'tabs':
      return {
        tabs: [
          { id: generateId(), label: 'Tab 1', content: 'Content for tab 1' },
          { id: generateId(), label: 'Tab 2', content: 'Content for tab 2' },
          { id: generateId(), label: 'Tab 3', content: 'Content for tab 3' },
        ],
        style: {
          ...baseStyle,
          tabBackground: '#f3f4f6',
          activeTabBackground: DEFAULT_COLORS.primary,
          activeTabColor: '#ffffff',
          tabColor: DEFAULT_COLORS.text,
          borderRadius: 8,
          fontSize: 14,
          contentPadding: 16,
        }
      };

    case 'accordion':
      return {
        accordion: [
          { id: generateId(), title: 'Question 1', content: 'Answer to question 1', open: true },
          { id: generateId(), title: 'Question 2', content: 'Answer to question 2', open: false },
          { id: generateId(), title: 'Question 3', content: 'Answer to question 3', open: false },
        ],
        style: {
          ...baseStyle,
          headerBackground: '#f9fafb',
          headerColor: DEFAULT_COLORS.text,
          contentBackground: '#ffffff',
          borderColor: DEFAULT_COLORS.border,
          iconColor: DEFAULT_COLORS.primary,
          fontSize: 14,
          spacing: 8,
          borderRadius: 8,
        }
      };

    case 'html':
      return {
        html: {
          content: '<div style="padding: 16px; background: #f3f4f6; border-radius: 8px;">Custom HTML content</div>',
        },
        style: {
          maxHeight: 200,
          overflow: 'auto',
        }
      };

    // Custom widget configurations based on label
    default:
      return {
        custom: {
          type: type,
          label: '',
          data: {},
        },
        style: {
          ...baseStyle,
        }
      };
  }
};

// Apply template config to widget based on widget type structure
const applyTemplateConfig = (widgetType: WidgetType, existingConfig: any, templateConfig: any): any => {
  // Get fresh default config as base
  const defaultConfig = getDefaultWidgetConfig(widgetType);

  // Extract style from template if present
  const templateStyle = templateConfig.style || {};
  const { style: _removedStyle, ...templateValues } = templateConfig;

  // Start with default config
  const newConfig = JSON.parse(JSON.stringify(defaultConfig));

  // Widget types that use nested config objects where preview does `cfg.X || cfg` pattern
  // For these, ALL template values should go into the nested object
  const nestedKeyMap: Record<string, string> = {
    'posts': 'posts',
    'products': 'products',
    'categories': 'categories',
    'tags': 'tags',
    'image': 'image',
    'video': 'video',
    'text': 'text',
    'cta-button': 'cta',
    'cta-banner': 'banner',
    'newsletter': 'newsletter',
    'search': 'search',
    'contact-info': 'contact',
    'testimonial': 'testimonial',
    'team-member': 'member',
    'social-icons': 'social',
    'icon-box': 'iconBox',
    'pricing-card': 'pricing',
    'map': 'map',
    'countdown': 'countdown',
    'divider': 'divider',
    'spacer': 'spacer',
    'shortcode': 'shortcode',
    'html': 'html',
    'alert': 'alert',
    'badge': 'badge',
    'logo': 'logo',
    'faq': 'faq',
    'business-hours': 'hours',
    'qr-code': 'qr',
    'banner': 'banner',
    'notice': 'notice',
    'featured-post': 'featuredPost',
    'author-box': 'authorBox',
  };

  const nestedKey = nestedKeyMap[widgetType];

  // Apply template values
  // For widgets like posts/products/categories/tags, the preview pattern is:
  //   const postsCfg = cfg.posts || cfg;
  //   postsCfg.count, postsCfg.showImage, postsCfg.layout, etc.
  // So ALL values need to go into the nested object for the preview to find them
  for (const [key, value] of Object.entries(templateValues)) {
    if (key === 'style') continue;

    // Put ALL template values into the nested config object
    // This ensures the preview pattern `cfg.X || cfg` can find all values
    if (nestedKey && newConfig[nestedKey]) {
      newConfig[nestedKey][key] = value;
    } else {
      // For widgets without nested structure, put at top level
      newConfig[key] = value;
    }
  }

  // Also update display object if it exists (for settings panel compatibility)
  // but the preview will read from the nested object
  if (newConfig.display) {
    const displayKeys = ['showImage', 'showExcerpt', 'showDate', 'showAuthor', 'showCategory', 'showPrice',
      'showRating', 'showBadge', 'showAddToCart', 'layout', 'imagePosition', 'columns'];
    for (const [key, value] of Object.entries(templateValues)) {
      if (displayKeys.includes(key)) {
        newConfig.display[key] = value;
      }
    }
  }

  // Apply template style to config style
  if (newConfig.style && Object.keys(templateStyle).length > 0) {
    newConfig.style = { ...newConfig.style, ...templateStyle };
  }

  return newConfig;
};

// ==================== REUSABLE SETTING COMPONENTS ====================

const ColorPicker: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
    <div className="flex gap-2">
      <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} className="w-10 h-8 rounded cursor-pointer border-0" />
      <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700" />
    </div>
  </div>
);

const NumberInput: React.FC<{ label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; unit?: string }> = ({ label, value, onChange, min = 0, max = 100, unit = '' }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
    <div className="flex items-center gap-2">
      <input type="number" min={min} max={max} value={value} onChange={(e) => onChange(parseInt(e.target.value) || 0)} className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700" />
      {unit && <span className="text-xs text-gray-500">{unit}</span>}
    </div>
  </div>
);

const SelectInput: React.FC<{ label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }> = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700">
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const ToggleInput: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="rounded border-gray-300" />
    <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
  </label>
);

const TextInput: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string }> = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
    <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700" />
  </div>
);

// Media Picker Input with library modal support - Enhanced with pagination, search, and metadata
const MediaPickerInput: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  acceptedTypes?: string[];
}> = ({ label, value, onChange, placeholder = 'Enter URL or select from library', acceptedTypes = ['image'] }) => {
  const [showLibrary, setShowLibrary] = useState(false);
  const [localUrl, setLocalUrl] = useState(value || '');
  const [activeTab, setActiveTab] = useState<'library' | 'url'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<typeof allMediaItems[0] | null>(null);
  const ITEMS_PER_PAGE = 12;

  // Extended sample media items for the library (30+ images with metadata)
  const allMediaItems = [
    { id: '1', name: 'hero-banner.jpg', url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400', type: 'image', dimensions: '1920x1080', size: '245 KB', date: '2024-12-15', category: 'business' },
    { id: '2', name: 'team-photo.jpg', url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400', type: 'image', dimensions: '1600x900', size: '189 KB', date: '2024-12-14', category: 'people' },
    { id: '3', name: 'product-headphones.jpg', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', type: 'image', dimensions: '1200x800', size: '156 KB', date: '2024-12-13', category: 'products' },
    { id: '4', name: 'modern-office.jpg', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400', type: 'image', dimensions: '1920x1280', size: '298 KB', date: '2024-12-12', category: 'business' },
    { id: '5', name: 'forest-nature.jpg', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400', type: 'image', dimensions: '1800x1200', size: '312 KB', date: '2024-12-11', category: 'nature' },
    { id: '6', name: 'technology-circuit.jpg', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400', type: 'image', dimensions: '1600x1067', size: '178 KB', date: '2024-12-10', category: 'technology' },
    { id: '7', name: 'city-skyline.jpg', url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=400', type: 'image', dimensions: '2000x1333', size: '267 KB', date: '2024-12-09', category: 'architecture' },
    { id: '8', name: 'abstract-gradient.jpg', url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400', type: 'image', dimensions: '1920x1080', size: '134 KB', date: '2024-12-08', category: 'abstract' },
    { id: '9', name: 'laptop-workspace.jpg', url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', type: 'image', dimensions: '1600x1067', size: '201 KB', date: '2024-12-07', category: 'technology' },
    { id: '10', name: 'coffee-shop.jpg', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400', type: 'image', dimensions: '1500x1000', size: '189 KB', date: '2024-12-06', category: 'lifestyle' },
    { id: '11', name: 'mountain-landscape.jpg', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', type: 'image', dimensions: '2400x1600', size: '445 KB', date: '2024-12-05', category: 'nature' },
    { id: '12', name: 'startup-meeting.jpg', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400', type: 'image', dimensions: '1920x1280', size: '234 KB', date: '2024-12-04', category: 'business' },
    { id: '13', name: 'ocean-waves.jpg', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400', type: 'image', dimensions: '1800x1200', size: '278 KB', date: '2024-12-03', category: 'nature' },
    { id: '14', name: 'retail-shopping.jpg', url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400', type: 'image', dimensions: '1600x1067', size: '198 KB', date: '2024-12-02', category: 'business' },
    { id: '15', name: 'coding-screen.jpg', url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400', type: 'image', dimensions: '1920x1080', size: '167 KB', date: '2024-12-01', category: 'technology' },
    { id: '16', name: 'fashion-portrait.jpg', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400', type: 'image', dimensions: '1200x1800', size: '223 KB', date: '2024-11-30', category: 'people' },
    { id: '17', name: 'food-platter.jpg', url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', type: 'image', dimensions: '1600x1067', size: '245 KB', date: '2024-11-29', category: 'food' },
    { id: '18', name: 'concert-crowd.jpg', url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400', type: 'image', dimensions: '2000x1333', size: '312 KB', date: '2024-11-28', category: 'events' },
    { id: '19', name: 'fitness-gym.jpg', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400', type: 'image', dimensions: '1920x1280', size: '189 KB', date: '2024-11-27', category: 'lifestyle' },
    { id: '20', name: 'car-luxury.jpg', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400', type: 'image', dimensions: '1800x1200', size: '267 KB', date: '2024-11-26', category: 'products' },
    { id: '21', name: 'sunset-beach.jpg', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400', type: 'image', dimensions: '2400x1600', size: '334 KB', date: '2024-11-25', category: 'nature' },
    { id: '22', name: 'wedding-couple.jpg', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400', type: 'image', dimensions: '1600x1067', size: '212 KB', date: '2024-11-24', category: 'events' },
    { id: '23', name: 'pet-dog.jpg', url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', type: 'image', dimensions: '1400x933', size: '178 KB', date: '2024-11-23', category: 'animals' },
    { id: '24', name: 'architecture-building.jpg', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400', type: 'image', dimensions: '1920x1280', size: '289 KB', date: '2024-11-22', category: 'architecture' },
    { id: '25', name: 'plant-succulent.jpg', url: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400', type: 'image', dimensions: '1200x800', size: '145 KB', date: '2024-11-21', category: 'nature' },
    { id: '26', name: 'dessert-cake.jpg', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', type: 'image', dimensions: '1600x1067', size: '234 KB', date: '2024-11-20', category: 'food' },
    { id: '27', name: 'travel-airport.jpg', url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400', type: 'image', dimensions: '2000x1333', size: '298 KB', date: '2024-11-19', category: 'travel' },
    { id: '28', name: 'music-guitar.jpg', url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400', type: 'image', dimensions: '1800x1200', size: '212 KB', date: '2024-11-18', category: 'lifestyle' },
    { id: '29', name: 'sports-basketball.jpg', url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400', type: 'image', dimensions: '1920x1280', size: '256 KB', date: '2024-11-17', category: 'sports' },
    { id: '30', name: 'education-books.jpg', url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400', type: 'image', dimensions: '1600x1067', size: '178 KB', date: '2024-11-16', category: 'education' },
    { id: '31', name: 'minimal-desk.jpg', url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400', type: 'image', dimensions: '1500x1000', size: '156 KB', date: '2024-11-15', category: 'lifestyle' },
    { id: '32', name: 'neon-lights.jpg', url: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=400', type: 'image', dimensions: '1920x1080', size: '189 KB', date: '2024-11-14', category: 'abstract' },
    { id: '33', name: 'vintage-camera.jpg', url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400', type: 'image', dimensions: '1200x800', size: '145 KB', date: '2024-11-13', category: 'products' },
    { id: '34', name: 'tropical-palm.jpg', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400', type: 'image', dimensions: '2000x1333', size: '312 KB', date: '2024-11-12', category: 'nature' },
    { id: '35', name: 'wine-glass.jpg', url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400', type: 'image', dimensions: '1400x933', size: '167 KB', date: '2024-11-11', category: 'food' },
    { id: '36', name: 'yoga-meditation.jpg', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400', type: 'image', dimensions: '1800x1200', size: '201 KB', date: '2024-11-10', category: 'lifestyle' },
  ];

  // Filter and paginate media items
  const filteredMedia = allMediaItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredMedia.length / ITEMS_PER_PAGE);
  const paginatedMedia = filteredMedia.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleSelect = (item: typeof allMediaItems[0]) => {
    setLocalUrl(item.url);
    onChange(item.url);
    setShowLibrary(false);
    setSelectedImage(null);
  };

  const handleUrlSubmit = () => {
    onChange(localUrl);
    setShowLibrary(false);
  };

  const isValidImageUrl = (url: string) => {
    if (!url) return false;
    return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url) || url.startsWith('data:image') || url.includes('unsplash.com') || url.includes('placeholder');
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-l bg-white dark:bg-gray-700 pr-8"
          />
          {isValidImageUrl(value) && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded overflow-hidden border border-gray-200 dark:border-gray-600">
              <img src={value} alt="" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowLibrary(true)}
          className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-r hover:bg-primary-700 flex items-center gap-1.5"
        >
          <Image size={14} />
          Browse
        </button>
      </div>

      {/* Media Library Modal */}
      <AnimatePresence>
        {showLibrary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowLibrary(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Image size={20} className="text-primary-600" />
                  Select Media
                  <span className="text-sm font-normal text-gray-500">({filteredMedia.length} items)</span>
                </h3>
                <button onClick={() => setShowLibrary(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('library')}
                  className={clsx(
                    "flex-1 py-2.5 px-4 text-sm font-medium transition-colors",
                    activeTab === 'library'
                      ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                >
                  Media Library
                </button>
                <button
                  onClick={() => setActiveTab('url')}
                  className={clsx(
                    "flex-1 py-2.5 px-4 text-sm font-medium transition-colors",
                    activeTab === 'url'
                      ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  )}
                >
                  External URL
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden flex">
                {activeTab === 'library' ? (
                  <>
                    {/* Main content area */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Search bar */}
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="relative">
                          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or category..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Grid */}
                      <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-4 gap-3">
                          {paginatedMedia.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => setSelectedImage(item)}
                              onDoubleClick={() => handleSelect(item)}
                              className={clsx(
                                "group relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                                selectedImage?.id === item.id
                                  ? "border-primary-500 ring-2 ring-primary-500/30"
                                  : "border-transparent hover:border-primary-300"
                              )}
                            >
                              <img
                                src={item.url}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                                <p className="text-xs text-white truncate font-medium">{item.name}</p>
                                <p className="text-[10px] text-white/70">{item.dimensions}</p>
                              </div>
                              {selectedImage?.id === item.id && (
                                <div className="absolute top-2 right-2 bg-primary-500 rounded-full p-1">
                                  <Check size={12} className="text-white" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                        {filteredMedia.length === 0 && (
                          <div className="text-center py-12 text-gray-500">
                            <Image size={48} className="mx-auto mb-3 opacity-30" />
                            <p>No images found matching "{searchQuery}"</p>
                          </div>
                        )}
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setCurrentPage(1)}
                              disabled={currentPage === 1}
                              className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              First
                            </button>
                            <button
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <ChevronRight size={16} className="rotate-180" />
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                  className={clsx(
                                    "px-3 py-1 text-sm rounded border",
                                    currentPage === pageNum
                                      ? "bg-primary-600 text-white border-primary-600"
                                      : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  )}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                            <button
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                              className="px-3 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <ChevronRight size={16} />
                            </button>
                            <button
                              onClick={() => setCurrentPage(totalPages)}
                              disabled={currentPage === totalPages}
                              className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              Last
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sidebar - Image metadata */}
                    <div className="w-64 border-l border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-900/50">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">Image Details</h4>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4">
                        {selectedImage ? (
                          <div className="space-y-4">
                            <div className="aspect-video rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                              <img src={selectedImage.url} alt={selectedImage.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Filename</label>
                                <p className="text-sm text-gray-900 dark:text-white font-medium truncate">{selectedImage.name}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Dimensions</label>
                                  <p className="text-sm text-gray-900 dark:text-white">{selectedImage.dimensions}</p>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Size</label>
                                  <p className="text-sm text-gray-900 dark:text-white">{selectedImage.size}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Category</label>
                                  <p className="text-sm text-gray-900 dark:text-white capitalize">{selectedImage.category}</p>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Date</label>
                                  <p className="text-sm text-gray-900 dark:text-white">{selectedImage.date}</p>
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">URL</label>
                                <p className="text-xs text-gray-600 dark:text-gray-400 break-all">{selectedImage.url}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleSelect(selectedImage)}
                              className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
                            >
                              Use This Image
                            </button>
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 py-8">
                            <Image size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Select an image to see details</p>
                            <p className="text-xs mt-1 text-gray-400">Double-click to select quickly</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-md mx-auto space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Enter image URL
                        </label>
                        <input
                          type="text"
                          value={localUrl}
                          onChange={(e) => setLocalUrl(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      {localUrl && isValidImageUrl(localUrl) && (
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview:</p>
                          <img
                            src={localUrl}
                            alt="Preview"
                            className="max-h-48 mx-auto rounded-lg object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <p className="hidden text-center text-sm text-red-500 py-4">Unable to load image preview</p>
                        </div>
                      )}
                      <button
                        onClick={handleUrlSubmit}
                        disabled={!localUrl}
                        className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Use This URL
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
                <button
                  onClick={() => setShowLibrary(false)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SettingSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
      <Settings size={12} />
      {title}
    </h4>
    <div className="space-y-3">{children}</div>
  </div>
);

// ==================== SIMPLE WIDGET EDITOR ====================

interface WidgetEditorProps {
  widget: MegaMenuWidget;
  onUpdate: (updates: Partial<MegaMenuWidget>) => void;
  onDelete: () => void;
}

const WidgetEditor: React.FC<WidgetEditorProps> = ({ widget, onUpdate, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'templates'>('content');

  const widgetDef = SIMPLE_WIDGETS.find(w => w.type === widget.type);
  const Icon = widgetDef?.icon || LayoutGrid;
  const config = widget.config as any;

  const updateConfig = (key: string, value: any) => {
    onUpdate({ config: { ...config, [key]: value } });
  };

  const updateStyle = (key: string, value: any) => {
    onUpdate({ style: { ...(widget.style || {}), [key]: value } });
  };

  const updateNestedConfig = (parent: string, key: string, value: any) => {
    updateConfig(parent, { ...(config[parent] || {}), [key]: value });
  };

  // Render content settings based on widget type
  const renderContentSettings = () => {
    switch (widget.type) {
      case 'links':
        return (
          <div className="space-y-3">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Links</label>
            {(config.links || []).map((link: any, idx: number) => (
              <div key={link.id} className="flex gap-2">
                <input type="text" value={link.label} onChange={(e) => {
                  const newLinks = [...(config.links || [])];
                  newLinks[idx] = { ...link, label: e.target.value };
                  updateConfig('links', newLinks);
                }} placeholder="Label" className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700" />
                <input type="text" value={link.url} onChange={(e) => {
                  const newLinks = [...(config.links || [])];
                  newLinks[idx] = { ...link, url: e.target.value };
                  updateConfig('links', newLinks);
                }} placeholder="URL" className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700" />
                <button onClick={() => updateConfig('links', (config.links || []).filter((_: any, i: number) => i !== idx))} className="p-1.5 text-gray-400 hover:text-red-500"><X size={14} /></button>
              </div>
            ))}
            <button onClick={() => updateConfig('links', [...(config.links || []), { id: generateId(), label: 'New Link', url: '#', target: '_self' }])} className="w-full py-1.5 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-dashed border-primary-300 dark:border-primary-700 rounded-lg flex items-center justify-center gap-1">
              <Plus size={14} /> Add Link
            </button>
          </div>
        );

      case 'progress-bar':
        return (
          <div className="space-y-3">
            <TextInput label="Label" value={config.progressBar?.label || ''} onChange={(v) => updateNestedConfig('progressBar', 'label', v)} />
            <NumberInput label="Value" value={config.progressBar?.value || 0} onChange={(v) => updateNestedConfig('progressBar', 'value', v)} min={0} max={config.progressBar?.maxValue || 100} />
            <NumberInput label="Max Value" value={config.progressBar?.maxValue || 100} onChange={(v) => updateNestedConfig('progressBar', 'maxValue', v)} min={1} max={1000} />
            <ToggleInput label="Show Value" checked={config.progressBar?.showValue ?? true} onChange={(v) => updateNestedConfig('progressBar', 'showValue', v)} />
            <SelectInput label="Value Format" value={config.progressBar?.valueFormat || 'percent'} onChange={(v) => updateNestedConfig('progressBar', 'valueFormat', v)} options={[
              { value: 'percent', label: 'Percentage (75%)' },
              { value: 'fraction', label: 'Fraction (75/100)' },
              { value: 'number', label: 'Number (75)' },
            ]} />
          </div>
        );

      case 'stats':
        return (
          <div className="space-y-3">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Statistics</label>
            {(config.stats || []).map((stat: any, idx: number) => (
              <div key={stat.id} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-2">
                <div className="flex gap-2">
                  <input type="text" value={stat.value} onChange={(e) => {
                    const newStats = [...(config.stats || [])];
                    newStats[idx] = { ...stat, value: e.target.value };
                    updateConfig('stats', newStats);
                  }} placeholder="Value (e.g. 10K+)" className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700" />
                  <button onClick={() => updateConfig('stats', (config.stats || []).filter((_: any, i: number) => i !== idx))} className="p-1.5 text-gray-400 hover:text-red-500"><X size={14} /></button>
                </div>
                <input type="text" value={stat.label} onChange={(e) => {
                  const newStats = [...(config.stats || [])];
                  newStats[idx] = { ...stat, label: e.target.value };
                  updateConfig('stats', newStats);
                }} placeholder="Label" className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700" />
              </div>
            ))}
            <button onClick={() => updateConfig('stats', [...(config.stats || []), { id: generateId(), value: '0', label: 'New Stat', icon: 'star' }])} className="w-full py-1.5 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-dashed border-primary-300 dark:border-primary-700 rounded-lg flex items-center justify-center gap-1">
              <Plus size={14} /> Add Stat
            </button>
          </div>
        );

      case 'countdown':
        return (
          <div className="space-y-3">
            <TextInput label="Title" value={config.countdown?.title || ''} onChange={(v) => updateNestedConfig('countdown', 'title', v)} />
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Target Date</label>
              <input type="datetime-local" value={config.countdown?.targetDate?.slice(0, 16) || ''} onChange={(e) => updateNestedConfig('countdown', 'targetDate', new Date(e.target.value).toISOString())} className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700" />
            </div>
            <TextInput label="Expired Message" value={config.countdown?.expiredMessage || ''} onChange={(v) => updateNestedConfig('countdown', 'expiredMessage', v)} />
          </div>
        );

      case 'testimonial':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Quote</label>
              <textarea value={config.testimonial?.quote || ''} onChange={(e) => updateNestedConfig('testimonial', 'quote', e.target.value)} rows={3} className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 resize-none" />
            </div>
            <TextInput label="Author Name" value={config.testimonial?.author || ''} onChange={(v) => updateNestedConfig('testimonial', 'author', v)} />
            <TextInput label="Role/Company" value={config.testimonial?.role || ''} onChange={(v) => updateNestedConfig('testimonial', 'role', v)} />
            <MediaPickerInput label="Avatar" value={config.testimonial?.avatar || ''} onChange={(v) => updateNestedConfig('testimonial', 'avatar', v)} placeholder="Select avatar image..." />
            <NumberInput label="Rating (1-5)" value={config.testimonial?.rating || 5} onChange={(v) => updateNestedConfig('testimonial', 'rating', v)} min={1} max={5} />
          </div>
        );

      case 'cta-button':
        return (
          <div className="space-y-3">
            <TextInput label="Button Text" value={config.cta?.text || ''} onChange={(v) => updateNestedConfig('cta', 'text', v)} />
            <TextInput label="Button URL" value={config.cta?.url || ''} onChange={(v) => updateNestedConfig('cta', 'url', v)} placeholder="https://..." />
            <ToggleInput label="Open in new tab" checked={config.cta?.openInNewTab ?? false} onChange={(v) => updateNestedConfig('cta', 'openInNewTab', v)} />
            <SelectInput label="Icon" value={config.cta?.icon || 'arrow-right'} onChange={(v) => updateNestedConfig('cta', 'icon', v)} options={[
              { value: 'none', label: 'No Icon' }, { value: 'arrow-right', label: 'Arrow Right' }, { value: 'external', label: 'External Link' }, { value: 'download', label: 'Download' },
            ]} />
          </div>
        );

      case 'newsletter':
        return (
          <div className="space-y-3">
            <TextInput label="Title" value={config.newsletter?.title || ''} onChange={(v) => updateNestedConfig('newsletter', 'title', v)} />
            <TextInput label="Placeholder" value={config.newsletter?.placeholder || ''} onChange={(v) => updateNestedConfig('newsletter', 'placeholder', v)} />
            <TextInput label="Button Text" value={config.newsletter?.buttonText || ''} onChange={(v) => updateNestedConfig('newsletter', 'buttonText', v)} />
          </div>
        );

      case 'contact-info':
        return (
          <div className="space-y-3">
            <TextInput label="Phone" value={config.contact?.phone || ''} onChange={(v) => updateNestedConfig('contact', 'phone', v)} />
            <TextInput label="Email" value={config.contact?.email || ''} onChange={(v) => updateNestedConfig('contact', 'email', v)} />
            <TextInput label="Address" value={config.contact?.address || ''} onChange={(v) => updateNestedConfig('contact', 'address', v)} />
            <ToggleInput label="Show Icons" checked={config.contact?.showIcons ?? true} onChange={(v) => updateNestedConfig('contact', 'showIcons', v)} />
          </div>
        );

      case 'social-links':
        return (
          <div className="space-y-3">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Social Links</label>
            {(config.social?.links || []).map((link: any, idx: number) => (
              <div key={idx} className="flex gap-2">
                <select value={link.platform} onChange={(e) => {
                  const newLinks = [...(config.social?.links || [])];
                  newLinks[idx] = { ...link, platform: e.target.value };
                  updateNestedConfig('social', 'links', newLinks);
                }} className="w-32 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700">
                  <option value="facebook">Facebook</option><option value="twitter">Twitter/X</option><option value="instagram">Instagram</option><option value="linkedin">LinkedIn</option><option value="youtube">YouTube</option><option value="github">GitHub</option>
                </select>
                <input type="text" value={link.url} onChange={(e) => {
                  const newLinks = [...(config.social?.links || [])];
                  newLinks[idx] = { ...link, url: e.target.value };
                  updateNestedConfig('social', 'links', newLinks);
                }} placeholder="URL" className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700" />
                <button onClick={() => updateNestedConfig('social', 'links', (config.social?.links || []).filter((_: any, i: number) => i !== idx))} className="p-1.5 text-gray-400 hover:text-red-500"><X size={14} /></button>
              </div>
            ))}
            <button onClick={() => updateNestedConfig('social', 'links', [...(config.social?.links || []), { platform: 'facebook', url: '#' }])} className="w-full py-1.5 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-dashed border-primary-300 dark:border-primary-700 rounded-lg flex items-center justify-center gap-1">
              <Plus size={14} /> Add Social Link
            </button>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-3">
            <MediaPickerInput label="Image" value={config.image?.src || ''} onChange={(v) => updateNestedConfig('image', 'src', v)} placeholder="Select or enter image URL..." />
            <TextInput label="Alt Text" value={config.image?.alt || ''} onChange={(v) => updateNestedConfig('image', 'alt', v)} />
            <TextInput label="Link (optional)" value={config.image?.link || ''} onChange={(v) => updateNestedConfig('image', 'link', v)} />
          </div>
        );

      case 'text':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Content</label>
              <textarea value={config.text?.content || ''} onChange={(e) => updateNestedConfig('text', 'content', e.target.value)} rows={4} className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 resize-none" />
            </div>
          </div>
        );

      case 'posts':
        return (
          <div className="space-y-4">
            <SettingSection title="Data Source">
              <SelectInput label="Source" value={config.posts?.source || 'recent'} onChange={(v) => updateNestedConfig('posts', 'source', v)} options={[
                { value: 'recent', label: 'Recent Posts' },
                { value: 'popular', label: 'Popular Posts' },
                { value: 'category', label: 'From Category' },
                { value: 'tag', label: 'From Tag' },
                { value: 'custom', label: 'Select Specific Posts' },
              ]} />
              {config.posts?.source === 'category' && (
                <TextInput label="Category ID/Slug" value={config.posts?.categoryId || ''} onChange={(v) => updateNestedConfig('posts', 'categoryId', v)} placeholder="Enter category ID or slug" />
              )}
              {config.posts?.source === 'tag' && (
                <TextInput label="Tag ID/Slug" value={config.posts?.tagId || ''} onChange={(v) => updateNestedConfig('posts', 'tagId', v)} placeholder="Enter tag ID or slug" />
              )}
              {config.posts?.source === 'custom' && (
                <TextInput label="Post IDs (comma separated)" value={config.posts?.postIds?.join(',') || ''} onChange={(v) => updateNestedConfig('posts', 'postIds', v.split(',').map(s => s.trim()).filter(Boolean))} placeholder="1, 2, 3..." />
              )}
              <NumberInput label="Number of Posts" value={config.posts?.count || 3} onChange={(v) => updateNestedConfig('posts', 'count', v)} min={1} max={20} />
            </SettingSection>
            <SettingSection title="Display Options">
              <SelectInput label="Layout" value={config.posts?.layout || 'list'} onChange={(v) => updateNestedConfig('posts', 'layout', v)} options={[
                { value: 'list', label: 'List' }, { value: 'grid', label: 'Grid' }, { value: 'carousel', label: 'Carousel' },
              ]} />
              <ToggleInput label="Show Image" checked={config.posts?.showImage ?? true} onChange={(v) => updateNestedConfig('posts', 'showImage', v)} />
              <ToggleInput label="Show Excerpt" checked={config.posts?.showExcerpt ?? false} onChange={(v) => updateNestedConfig('posts', 'showExcerpt', v)} />
              <ToggleInput label="Show Date" checked={config.posts?.showDate ?? true} onChange={(v) => updateNestedConfig('posts', 'showDate', v)} />
              <ToggleInput label="Show Author" checked={config.posts?.showAuthor ?? false} onChange={(v) => updateNestedConfig('posts', 'showAuthor', v)} />
            </SettingSection>
          </div>
        );

      case 'products':
        return (
          <div className="space-y-4">
            <SettingSection title="Data Source">
              <SelectInput label="Source" value={config.products?.source || 'featured'} onChange={(v) => updateNestedConfig('products', 'source', v)} options={[
                { value: 'featured', label: 'Featured Products' },
                { value: 'sale', label: 'On Sale' },
                { value: 'new', label: 'New Arrivals' },
                { value: 'bestseller', label: 'Bestsellers' },
                { value: 'category', label: 'From Category' },
                { value: 'custom', label: 'Select Specific Products' },
              ]} />
              {config.products?.source === 'category' && (
                <TextInput label="Category ID/Slug" value={config.products?.categoryId || ''} onChange={(v) => updateNestedConfig('products', 'categoryId', v)} placeholder="Enter category ID or slug" />
              )}
              {config.products?.source === 'custom' && (
                <TextInput label="Product IDs (comma separated)" value={config.products?.productIds?.join(',') || ''} onChange={(v) => updateNestedConfig('products', 'productIds', v.split(',').map(s => s.trim()).filter(Boolean))} placeholder="1, 2, 3..." />
              )}
              <NumberInput label="Number of Products" value={config.products?.count || 4} onChange={(v) => updateNestedConfig('products', 'count', v)} min={1} max={24} />
            </SettingSection>
            <SettingSection title="Display Options">
              <SelectInput label="Layout" value={config.products?.layout || 'grid'} onChange={(v) => updateNestedConfig('products', 'layout', v)} options={[
                { value: 'grid', label: 'Grid' }, { value: 'list', label: 'List' }, { value: 'carousel', label: 'Carousel' },
              ]} />
              <ToggleInput label="Show Image" checked={config.products?.showImage ?? true} onChange={(v) => updateNestedConfig('products', 'showImage', v)} />
              <ToggleInput label="Show Price" checked={config.products?.showPrice ?? true} onChange={(v) => updateNestedConfig('products', 'showPrice', v)} />
              <ToggleInput label="Show Rating" checked={config.products?.showRating ?? true} onChange={(v) => updateNestedConfig('products', 'showRating', v)} />
              <ToggleInput label="Show Add to Cart" checked={config.products?.showAddToCart ?? false} onChange={(v) => updateNestedConfig('products', 'showAddToCart', v)} />
            </SettingSection>
          </div>
        );

      case 'icon-box':
        return (
          <div className="space-y-3">
            <SelectInput label="Icon" value={config.iconBox?.icon || 'star'} onChange={(v) => updateNestedConfig('iconBox', 'icon', v)} options={[
              { value: 'star', label: 'Star' }, { value: 'heart', label: 'Heart' }, { value: 'check', label: 'Check' }, { value: 'zap', label: 'Lightning' }, { value: 'shield', label: 'Shield' }, { value: 'rocket', label: 'Rocket' },
            ]} />
            <TextInput label="Title" value={config.iconBox?.title || ''} onChange={(v) => updateNestedConfig('iconBox', 'title', v)} />
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
              <textarea value={config.iconBox?.description || ''} onChange={(e) => updateNestedConfig('iconBox', 'description', e.target.value)} rows={2} className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 resize-none" />
            </div>
          </div>
        );

      case 'categories':
        return (
          <div className="space-y-4">
            <SettingSection title="Data Source">
              <SelectInput label="Source" value={config.categories?.source || 'all'} onChange={(v) => updateNestedConfig('categories', 'source', v)} options={[
                { value: 'all', label: 'All Categories' },
                { value: 'parent', label: 'Only Parent Categories' },
                { value: 'specific', label: 'Select Specific Categories' },
              ]} />
              {config.categories?.source === 'specific' && (
                <TextInput label="Category IDs (comma separated)" value={config.categories?.ids?.join(',') || ''} onChange={(v) => updateNestedConfig('categories', 'ids', v.split(',').map(s => s.trim()).filter(Boolean))} placeholder="1, 2, 3..." />
              )}
              <NumberInput label="Limit" value={config.categories?.limit || 6} onChange={(v) => updateNestedConfig('categories', 'limit', v)} min={1} max={20} />
            </SettingSection>
            <SettingSection title="Display Options">
              <SelectInput label="Layout" value={config.categories?.layout || 'list'} onChange={(v) => updateNestedConfig('categories', 'layout', v)} options={[
                { value: 'list', label: 'List' }, { value: 'horizontal', label: 'Horizontal' }, { value: 'dropdown', label: 'Dropdown' },
              ]} />
              <ToggleInput label="Show Count" checked={config.categories?.showCount ?? true} onChange={(v) => updateNestedConfig('categories', 'showCount', v)} />
              <ToggleInput label="Show Icon" checked={config.categories?.showIcon ?? true} onChange={(v) => updateNestedConfig('categories', 'showIcon', v)} />
            </SettingSection>
          </div>
        );

      case 'tags':
        return (
          <div className="space-y-4">
            <SettingSection title="Data Source">
              <SelectInput label="Source" value={config.tags?.source || 'popular'} onChange={(v) => updateNestedConfig('tags', 'source', v)} options={[
                { value: 'all', label: 'All Tags' },
                { value: 'popular', label: 'Popular Tags' },
                { value: 'specific', label: 'Select Specific Tags' },
              ]} />
              {config.tags?.source === 'specific' && (
                <TextInput label="Tag IDs (comma separated)" value={config.tags?.ids?.join(',') || ''} onChange={(v) => updateNestedConfig('tags', 'ids', v.split(',').map(s => s.trim()).filter(Boolean))} placeholder="1, 2, 3..." />
              )}
              <NumberInput label="Limit" value={config.tags?.limit || 10} onChange={(v) => updateNestedConfig('tags', 'limit', v)} min={1} max={30} />
            </SettingSection>
          </div>
        );

      case 'divider':
        return (
          <div className="space-y-3">
            <SelectInput label="Style" value={config.divider?.style || 'solid'} onChange={(v) => updateNestedConfig('divider', 'style', v)} options={[
              { value: 'solid', label: 'Solid' }, { value: 'dashed', label: 'Dashed' }, { value: 'dotted', label: 'Dotted' }, { value: 'double', label: 'Double' },
            ]} />
            <ColorPicker label="Color" value={config.divider?.color || '#e5e7eb'} onChange={(v) => updateNestedConfig('divider', 'color', v)} />
            <NumberInput label="Thickness" value={config.divider?.thickness || 1} onChange={(v) => updateNestedConfig('divider', 'thickness', v)} min={1} max={5} unit="px" />
          </div>
        );

      case 'spacer':
        return (
          <div className="space-y-3">
            <NumberInput label="Height" value={config.spacer?.height || 24} onChange={(v) => updateNestedConfig('spacer', 'height', v)} min={8} max={200} unit="px" />
          </div>
        );

      case 'shortcode':
        return (
          <div className="space-y-3">
            <TextInput label="Shortcode" value={config.shortcode?.code || ''} onChange={(v) => updateNestedConfig('shortcode', 'code', v)} placeholder="[shortcode_name attr='value']" />
            <p className="text-xs text-gray-500">Enter the RustPress shortcode including brackets</p>
          </div>
        );

      case 'html':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Custom HTML</label>
              <textarea value={config.html?.content || ''} onChange={(e) => updateNestedConfig('html', 'content', e.target.value)} rows={6} className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 resize-none font-mono" placeholder="<div>Your HTML here</div>" />
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-3">
            <SelectInput label="Video Type" value={config.video?.type || 'youtube'} onChange={(v) => updateNestedConfig('video', 'type', v)} options={[
              { value: 'youtube', label: 'YouTube' }, { value: 'vimeo', label: 'Vimeo' }, { value: 'self', label: 'Self Hosted' },
            ]} />
            <TextInput label="Video URL" value={config.video?.url || ''} onChange={(v) => updateNestedConfig('video', 'url', v)} placeholder="https://..." />
            <MediaPickerInput label="Thumbnail (optional)" value={config.video?.thumbnail || ''} onChange={(v) => updateNestedConfig('video', 'thumbnail', v)} placeholder="Select thumbnail image..." />
            <ToggleInput label="Autoplay" checked={config.video?.autoplay ?? false} onChange={(v) => updateNestedConfig('video', 'autoplay', v)} />
          </div>
        );

      case 'map':
        return (
          <div className="space-y-3">
            <TextInput label="Address" value={config.map?.address || ''} onChange={(v) => updateNestedConfig('map', 'address', v)} placeholder="123 Main St, City" />
            <NumberInput label="Height" value={config.map?.height || 200} onChange={(v) => updateNestedConfig('map', 'height', v)} min={100} max={500} unit="px" />
            <NumberInput label="Zoom Level" value={config.map?.zoom || 14} onChange={(v) => updateNestedConfig('map', 'zoom', v)} min={1} max={20} />
          </div>
        );

      case 'team-member':
        return (
          <div className="space-y-3">
            <TextInput label="Name" value={config.member?.name || ''} onChange={(v) => updateNestedConfig('member', 'name', v)} />
            <TextInput label="Role" value={config.member?.role || ''} onChange={(v) => updateNestedConfig('member', 'role', v)} />
            <MediaPickerInput label="Avatar" value={config.member?.avatar || ''} onChange={(v) => updateNestedConfig('member', 'avatar', v)} placeholder="Select avatar image..." />
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Bio</label>
              <textarea value={config.member?.bio || ''} onChange={(e) => updateNestedConfig('member', 'bio', e.target.value)} rows={2} className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 resize-none" />
            </div>
            <ToggleInput label="Show Social Links" checked={config.member?.showSocial ?? true} onChange={(v) => updateNestedConfig('member', 'showSocial', v)} />
          </div>
        );

      case 'pricing-card':
        return (
          <div className="space-y-3">
            <TextInput label="Plan Name" value={config.pricing?.name || ''} onChange={(v) => updateNestedConfig('pricing', 'name', v)} />
            <TextInput label="Price" value={config.pricing?.price || ''} onChange={(v) => updateNestedConfig('pricing', 'price', v)} placeholder="29" />
            <TextInput label="Period" value={config.pricing?.period || 'mo'} onChange={(v) => updateNestedConfig('pricing', 'period', v)} placeholder="mo, year, etc." />
            <TextInput label="Button Text" value={config.pricing?.buttonText || ''} onChange={(v) => updateNestedConfig('pricing', 'buttonText', v)} />
            <TextInput label="Button URL" value={config.pricing?.buttonUrl || ''} onChange={(v) => updateNestedConfig('pricing', 'buttonUrl', v)} />
            <ToggleInput label="Featured (highlighted)" checked={config.pricing?.featured ?? false} onChange={(v) => updateNestedConfig('pricing', 'featured', v)} />
          </div>
        );

      case 'tabs':
        return (
          <div className="space-y-3">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Tabs</label>
            {(config.tabs?.items || []).map((tab: any, idx: number) => (
              <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-2">
                <div className="flex gap-2">
                  <input type="text" value={tab.label} onChange={(e) => {
                    const newTabs = [...(config.tabs?.items || [])];
                    newTabs[idx] = { ...tab, label: e.target.value };
                    updateNestedConfig('tabs', 'items', newTabs);
                  }} placeholder="Tab Label" className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700" />
                  <button onClick={() => updateNestedConfig('tabs', 'items', (config.tabs?.items || []).filter((_: any, i: number) => i !== idx))} className="p-1.5 text-gray-400 hover:text-red-500"><X size={14} /></button>
                </div>
                <textarea value={tab.content} onChange={(e) => {
                  const newTabs = [...(config.tabs?.items || [])];
                  newTabs[idx] = { ...tab, content: e.target.value };
                  updateNestedConfig('tabs', 'items', newTabs);
                }} placeholder="Tab Content" rows={2} className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 resize-none" />
              </div>
            ))}
            <button onClick={() => updateNestedConfig('tabs', 'items', [...(config.tabs?.items || []), { label: 'New Tab', content: 'Tab content' }])} className="w-full py-1.5 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-dashed border-primary-300 dark:border-primary-700 rounded-lg flex items-center justify-center gap-1">
              <Plus size={14} /> Add Tab
            </button>
          </div>
        );

      case 'accordion':
        return (
          <div className="space-y-3">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Accordion Items</label>
            {(config.accordion?.items || []).map((item: any, idx: number) => (
              <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-2">
                <div className="flex gap-2">
                  <input type="text" value={item.title} onChange={(e) => {
                    const newItems = [...(config.accordion?.items || [])];
                    newItems[idx] = { ...item, title: e.target.value };
                    updateNestedConfig('accordion', 'items', newItems);
                  }} placeholder="Title" className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700" />
                  <button onClick={() => updateNestedConfig('accordion', 'items', (config.accordion?.items || []).filter((_: any, i: number) => i !== idx))} className="p-1.5 text-gray-400 hover:text-red-500"><X size={14} /></button>
                </div>
                <textarea value={item.content} onChange={(e) => {
                  const newItems = [...(config.accordion?.items || [])];
                  newItems[idx] = { ...item, content: e.target.value };
                  updateNestedConfig('accordion', 'items', newItems);
                }} placeholder="Content" rows={2} className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 resize-none" />
              </div>
            ))}
            <button onClick={() => updateNestedConfig('accordion', 'items', [...(config.accordion?.items || []), { title: 'New Item', content: 'Content here' }])} className="w-full py-1.5 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-dashed border-primary-300 dark:border-primary-700 rounded-lg flex items-center justify-center gap-1">
              <Plus size={14} /> Add Item
            </button>
          </div>
        );

      default:
        return <div className="text-sm text-gray-500 italic">Configure this widget using the style settings.</div>;
    }
  };

  // Render style settings
  const renderStyleSettings = () => {
    const style = config.style || {};
    switch (widget.type) {
      case 'progress-bar':
        return (
          <div className="space-y-3">
            <ColorPicker label="Bar Color" value={style.barColor || '#3b82f6'} onChange={(v) => updateStyle('barColor', v)} />
            <ColorPicker label="Track Color" value={style.trackColor || '#e5e7eb'} onChange={(v) => updateStyle('trackColor', v)} />
            <NumberInput label="Height" value={style.height || 8} onChange={(v) => updateStyle('height', v)} min={4} max={32} unit="px" />
            <NumberInput label="Border Radius" value={style.borderRadius || 4} onChange={(v) => updateStyle('borderRadius', v)} min={0} max={16} unit="px" />
            <ToggleInput label="Striped" checked={style.striped ?? false} onChange={(v) => updateStyle('striped', v)} />
            <ToggleInput label="Animated" checked={style.animated ?? true} onChange={(v) => updateStyle('animated', v)} />
          </div>
        );
      case 'stats':
        return (
          <div className="space-y-3">
            <ColorPicker label="Value Color" value={style.valueColor || '#3b82f6'} onChange={(v) => updateStyle('valueColor', v)} />
            <ColorPicker label="Label Color" value={style.labelColor || '#6b7280'} onChange={(v) => updateStyle('labelColor', v)} />
            <NumberInput label="Value Size" value={style.valueSize || 28} onChange={(v) => updateStyle('valueSize', v)} min={16} max={48} unit="px" />
            <SelectInput label="Layout" value={style.layout || 'horizontal'} onChange={(v) => updateStyle('layout', v)} options={[{ value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }]} />
          </div>
        );
      case 'cta-button':
        return (
          <div className="space-y-3">
            <ColorPicker label="Background" value={style.backgroundColor || '#3b82f6'} onChange={(v) => updateStyle('backgroundColor', v)} />
            <ColorPicker label="Text Color" value={style.textColor || '#ffffff'} onChange={(v) => updateStyle('textColor', v)} />
            <NumberInput label="Border Radius" value={style.borderRadius || 8} onChange={(v) => updateStyle('borderRadius', v)} min={0} max={24} unit="px" />
            <SelectInput label="Size" value={style.size || 'medium'} onChange={(v) => updateStyle('size', v)} options={[{ value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' }, { value: 'large', label: 'Large' }]} />
            <ToggleInput label="Full Width" checked={style.fullWidth ?? false} onChange={(v) => updateStyle('fullWidth', v)} />
          </div>
        );
      case 'links':
        return (
          <div className="space-y-3">
            <ColorPicker label="Link Color" value={style.linkColor || '#3b82f6'} onChange={(v) => updateStyle('linkColor', v)} />
            <ColorPicker label="Hover Color" value={style.hoverColor || '#2563eb'} onChange={(v) => updateStyle('hoverColor', v)} />
            <NumberInput label="Font Size" value={style.fontSize || 14} onChange={(v) => updateStyle('fontSize', v)} min={12} max={18} unit="px" />
            <NumberInput label="Spacing" value={style.spacing || 8} onChange={(v) => updateStyle('spacing', v)} min={4} max={16} unit="px" />
            <ToggleInput label="Show Bullets" checked={style.showBullets ?? false} onChange={(v) => updateStyle('showBullets', v)} />
          </div>
        );
      case 'image':
        return (
          <div className="space-y-3">
            <SelectInput label="Object Fit" value={style.objectFit || 'cover'} onChange={(v) => updateStyle('objectFit', v)} options={[{ value: 'cover', label: 'Cover' }, { value: 'contain', label: 'Contain' }, { value: 'fill', label: 'Fill' }]} />
            <NumberInput label="Border Radius" value={style.borderRadius || 8} onChange={(v) => updateStyle('borderRadius', v)} min={0} max={24} unit="px" />
            <SelectInput label="Shadow" value={style.shadow || 'sm'} onChange={(v) => updateStyle('shadow', v)} options={[{ value: 'none', label: 'None' }, { value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }]} />
            <SelectInput label="Hover Effect" value={style.hoverEffect || 'zoom'} onChange={(v) => updateStyle('hoverEffect', v)} options={[{ value: 'none', label: 'None' }, { value: 'zoom', label: 'Zoom' }, { value: 'lift', label: 'Lift' }]} />
          </div>
        );
      case 'text':
        return (
          <div className="space-y-3">
            <ColorPicker label="Text Color" value={style.textColor || '#1f2937'} onChange={(v) => updateStyle('textColor', v)} />
            <NumberInput label="Font Size" value={style.fontSize || 14} onChange={(v) => updateStyle('fontSize', v)} min={12} max={24} unit="px" />
            <SelectInput label="Text Align" value={style.textAlign || 'left'} onChange={(v) => updateStyle('textAlign', v)} options={[{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }]} />
          </div>
        );
      case 'social-links':
        return (
          <div className="space-y-3">
            <NumberInput label="Icon Size" value={style.iconSize || 20} onChange={(v) => updateStyle('iconSize', v)} min={16} max={32} unit="px" />
            <ColorPicker label="Icon Color" value={style.iconColor || '#6b7280'} onChange={(v) => updateStyle('iconColor', v)} />
            <ColorPicker label="Hover Color" value={style.hoverColor || '#3b82f6'} onChange={(v) => updateStyle('hoverColor', v)} />
            <NumberInput label="Spacing" value={style.spacing || 12} onChange={(v) => updateStyle('spacing', v)} min={4} max={24} unit="px" />
          </div>
        );
      case 'countdown':
        return (
          <div className="space-y-3">
            <ColorPicker label="Box Background" value={style.boxBackground || '#f3f4f6'} onChange={(v) => updateStyle('boxBackground', v)} />
            <ColorPicker label="Number Color" value={style.numberColor || '#1f2937'} onChange={(v) => updateStyle('numberColor', v)} />
            <NumberInput label="Number Size" value={style.numberSize || 24} onChange={(v) => updateStyle('numberSize', v)} min={16} max={48} unit="px" />
          </div>
        );
      case 'testimonial':
        return (
          <div className="space-y-3">
            <ColorPicker label="Quote Icon Color" value={style.quoteIconColor || '#3b82f6'} onChange={(v) => updateStyle('quoteIconColor', v)} />
            <ColorPicker label="Rating Color" value={style.ratingColor || '#fbbf24'} onChange={(v) => updateStyle('ratingColor', v)} />
            <NumberInput label="Avatar Size" value={style.avatarSize || 48} onChange={(v) => updateStyle('avatarSize', v)} min={32} max={80} unit="px" />
            <ToggleInput label="Show Rating" checked={style.showRating ?? true} onChange={(v) => updateStyle('showRating', v)} />
          </div>
        );
      default:
        return (
          <div className="space-y-3">
            <ColorPicker label="Text Color" value={style.textColor || '#1f2937'} onChange={(v) => updateStyle('textColor', v)} />
            <ColorPicker label="Background" value={style.backgroundColor || 'transparent'} onChange={(v) => updateStyle('backgroundColor', v)} />
            <NumberInput label="Border Radius" value={style.borderRadius || 8} onChange={(v) => updateStyle('borderRadius', v)} min={0} max={24} unit="px" />
          </div>
        );
    }
  };

  // Render custom CSS section - available for all widgets
  const renderCustomCssSection = () => {
    const style = widget.style || {};
    const [showLibrary, setShowLibrary] = useState(false);
    const [libraryCategory, setLibraryCategory] = useState<string>('all');
    const [saveName, setSaveName] = useState('');
    const [showSaveForm, setShowSaveForm] = useState(false);
    const styleLibrary = useStyleLibrary();

    // Apply a style from the library
    const applyStyle = (cssTemplate: string) => {
      const css = cssTemplate.replace(/WIDGET_CLASS/g, `widget-${widget.id}`);
      const fullCss = `.widget-${widget.id} {\n  ${css}\n}`;
      updateStyle('customCss', fullCss);
    };

    // Save current style to library
    const saveToLibrary = () => {
      if (!saveName.trim() || !style.customCss) return;
      styleLibrary.addStyle({
        name: saveName.trim(),
        category: 'custom',
        css: style.customCss,
      });
      setSaveName('');
      setShowSaveForm(false);
    };

    const allStyles = styleLibrary.getAllStyles();
    const filteredStyles = libraryCategory === 'all'
      ? allStyles
      : allStyles.filter(s => s.category === libraryCategory);

    const categories = ['all', 'animation', 'shadow', 'border', 'effect', 'layout', 'custom'];

    return (
      <div className="space-y-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Custom CSS</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLibrary(!showLibrary)}
              className={clsx(
                "px-2 py-1 text-xs rounded transition-colors",
                showLibrary
                  ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
            >
              {showLibrary ? 'Hide Library' : 'Style Library'}
            </button>
            <span className="text-xs text-gray-400">.widget-{widget.id}</span>
          </div>
        </div>

        {/* Style Library Panel */}
        {showLibrary && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Style Library ({allStyles.length} styles)</span>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-1 mb-3">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setLibraryCategory(cat)}
                  className={clsx(
                    "px-2 py-0.5 text-xs rounded capitalize transition-colors",
                    libraryCategory === cat
                      ? "bg-primary-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Styles Grid */}
            <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
              {filteredStyles.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => applyStyle(preset.css)}
                  className="px-2 py-1.5 text-xs text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-gray-700 dark:text-gray-300"
                  title={preset.css}
                >
                  <span className="block truncate">{preset.name}</span>
                  <span className="text-[10px] text-gray-400 capitalize">{preset.category}</span>
                </button>
              ))}
            </div>

            {/* Save to Library */}
            {style.customCss && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                {showSaveForm ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={saveName}
                      onChange={(e) => setSaveName(e.target.value)}
                      placeholder="Style name..."
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={saveToLibrary}
                      disabled={!saveName.trim()}
                      className="px-2 py-1 text-xs bg-primary-500 text-white rounded hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowSaveForm(false)}
                      className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSaveForm(true)}
                    className="w-full px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                  >
                    + Save Current Style to Library
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <textarea
          value={style.customCss || ''}
          onChange={(e) => updateStyle('customCss', e.target.value)}
          placeholder={`/* Custom CSS for this widget */\n.widget-${widget.id} {\n  /* Your styles here */\n}`}
          rows={6}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono resize-y"
          spellCheck={false}
        />
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Add custom CSS. Use the Style Library above for quick presets or save your own styles for reuse.
        </p>
        <button
          onClick={() => updateStyle('customCss', '')}
          className="w-full px-2 py-1 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
        >
          Clear CSS
        </button>
      </div>
    );
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
        <GripVertical size={14} className="text-gray-400 cursor-grab" />
        <Icon size={16} className="text-primary-500" />
        <span className="flex-1 font-medium text-sm text-gray-700 dark:text-gray-300">{widget.title || widgetDef?.label}</span>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="border-t border-gray-200 dark:border-gray-700">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button onClick={() => setActiveTab('content')} className={clsx("flex-1 py-2 px-4 text-sm font-medium", activeTab === 'content' ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50 dark:bg-primary-900/20" : "text-gray-500 hover:text-gray-700")}>Content</button>
                <button onClick={() => setActiveTab('style')} className={clsx("flex-1 py-2 px-4 text-sm font-medium", activeTab === 'style' ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50 dark:bg-primary-900/20" : "text-gray-500 hover:text-gray-700")}>Style</button>
                <button onClick={() => setActiveTab('templates')} className={clsx("flex-1 py-2 px-4 text-sm font-medium", activeTab === 'templates' ? "text-primary-600 border-b-2 border-primary-600 bg-primary-50 dark:bg-primary-900/20" : "text-gray-500 hover:text-gray-700")}>Templates</button>
              </div>
              <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Widget Title</label>
                  <input type="text" value={widget.title} onChange={(e) => onUpdate({ title: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <ToggleInput label="Show title in menu" checked={widget.showTitle} onChange={(v) => onUpdate({ showTitle: v })} />
                {activeTab === 'content' && renderContentSettings()}
                {activeTab === 'style' && (
                  <>
                    <SettingSection title="Appearance">{renderStyleSettings()}</SettingSection>
                    {renderCustomCssSection()}
                  </>
                )}
                {activeTab === 'templates' && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Choose a template to quickly apply pre-designed content and styles.
                    </p>
                    {getWidgetTemplates(widget.type).length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto">
                        {getWidgetTemplates(widget.type).map((template) => (
                          <button
                            key={template.id}
                            onClick={() => {
                              // Apply template config intelligently based on widget type structure
                              const newConfig = applyTemplateConfig(widget.type, config, template.config);
                              const newStyle = { ...(widget.style || {}), ...(template.style || {}), ...(template.config.style || {}) };
                              onUpdate({ config: newConfig, style: newStyle });
                            }}
                            className="p-3 text-left bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors group"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {template.preview && <span className="text-lg">{template.preview}</span>}
                              <span className="font-medium text-sm text-gray-800 dark:text-gray-200 group-hover:text-primary-600">{template.name}</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{template.description}</p>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <LayoutGrid size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No templates available for this widget type.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==================== LIVE PREVIEW RENDERER ====================

// Context for widget data - provides real data with fallback to examples
interface WidgetDataContextType {
  posts: PostData[];
  categories: CategoryData[];
  tags: TagData[];
  products: ProductData[];
  team: TeamMemberData[];
  isLoading: boolean;
}

const WidgetDataContext = createContext<WidgetDataContextType>({
  posts: FALLBACK_DATA.posts,
  categories: FALLBACK_DATA.categories,
  tags: FALLBACK_DATA.tags,
  products: FALLBACK_DATA.products,
  team: FALLBACK_DATA.team,
  isLoading: false,
});

// Fallback example data for local preview when hooks aren't available
const EXAMPLE_DATA = {
  posts: FALLBACK_DATA.posts.map(p => ({
    id: p.id,
    title: p.title,
    date: p.date,
    image: p.featuredImage || '/api/placeholder/300/200',
    excerpt: p.excerpt,
  })),
  products: FALLBACK_DATA.products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    salePrice: p.salePrice || null,
    image: p.image || '/api/placeholder/200/200',
    rating: p.rating,
  })),
  categories: FALLBACK_DATA.categories.map(c => c.name),
  tags: FALLBACK_DATA.tags.map(t => t.name),
  testimonials: [
    { id: '1', name: 'Sarah Johnson', role: 'CEO, TechCorp', avatar: '/api/placeholder/60/60', content: 'RustPress transformed our web presence. The speed and reliability are unmatched!', rating: 5 },
    { id: '2', name: 'Mike Chen', role: 'Developer', avatar: '/api/placeholder/60/60', content: 'Best CMS I have ever used. The developer experience is phenomenal.', rating: 5 },
  ],
  team: FALLBACK_DATA.team.map(m => ({
    id: m.id,
    name: m.name,
    role: m.role,
    avatar: m.avatar || '/api/placeholder/100/100',
    social: m.social || {},
  })),
  gallery: [
    '/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300',
    '/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300',
  ],
};

// Hook to use widget data from context with fallback
const useWidgetData = () => {
  const context = useContext(WidgetDataContext);
  return context;
};

// Data type for renderWidgetPreview
interface WidgetPreviewData {
  posts: Array<{ id: string; title: string; date: string; image?: string; excerpt?: string; featuredImage?: string }>;
  products: Array<{ id: string; name: string; price: number; salePrice?: number | null; image?: string; rating: number }>;
  categories: Array<{ id: string; name: string; slug: string; count: number }>;
  tags: Array<{ id: string; name: string; slug: string; count: number }>;
  team: Array<{ id: string; name: string; role: string; avatar?: string; social?: Record<string, string> }>;
  testimonials: Array<{ id: string; name: string; role: string; avatar?: string; content: string; rating: number }>;
  gallery: string[];
}

// Comprehensive widget preview renderer
const renderWidgetPreview = (widget: MegaMenuWidget, isDark: boolean, data: WidgetPreviewData = EXAMPLE_DATA as any): React.ReactNode => {
  const cfg = widget.config as any;
  const style = widget.style || {};

  // Helper for text color
  const textColor = isDark ? 'text-gray-300' : 'text-gray-600';
  const headingColor = isDark ? 'text-white' : 'text-gray-900';
  const mutedColor = isDark ? 'text-gray-500' : 'text-gray-400';

  switch (widget.type) {
    // ===== NAVIGATION WIDGETS =====
    case 'links':
      if (!cfg.links?.length) return null;
      const linkStyle = cfg.style || {};
      return (
        <ul className={clsx("space-y-2", linkStyle.layout === 'horizontal' && "flex flex-wrap gap-4")}>
          {cfg.links.map((link: any) => (
            <li key={link.id}>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className={clsx("flex items-center gap-2 text-sm hover:underline transition-colors", textColor)}
                style={{ color: linkStyle.color }}
              >
                {linkStyle.showIcon !== false && <ArrowRight size={12} className="opacity-50" />}
                {link.label}
                {link.target === '_blank' && <ExternalLink size={10} className="opacity-50" />}
              </a>
            </li>
          ))}
        </ul>
      );

    case 'icon-list':
      const iconItems = cfg.items || [
        { icon: 'check', label: 'Feature One', description: 'Description here' },
        { icon: 'check', label: 'Feature Two', description: 'Another description' },
      ];
      return (
        <ul className="space-y-3">
          {iconItems.map((item: any, idx: number) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                <Check size={16} className="text-primary-600" />
              </div>
              <div>
                <div className={clsx("font-medium text-sm", headingColor)}>{item.label}</div>
                {item.description && <div className={clsx("text-xs", mutedColor)}>{item.description}</div>}
              </div>
            </li>
          ))}
        </ul>
      );

    // ===== MEDIA WIDGETS =====
    case 'image':
      const imgCfg = cfg.image || cfg;
      return (
        <div className="rounded-lg overflow-hidden" style={{ borderRadius: style.borderRadius }}>
          {imgCfg.src ? (
            <img
              src={imgCfg.src}
              alt={imgCfg.alt || ''}
              className="w-full h-auto object-cover"
              style={{ aspectRatio: imgCfg.aspectRatio || '16/9' }}
            />
          ) : (
            <div className="w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
              <Image size={40} className={mutedColor} />
            </div>
          )}
          {imgCfg.caption && <p className={clsx("text-xs mt-2 text-center", mutedColor)}>{imgCfg.caption}</p>}
        </div>
      );

    case 'video':
      const videoCfg = cfg.video || cfg;
      return (
        <div className="rounded-lg overflow-hidden" style={{ borderRadius: style.borderRadius }}>
          <div className="relative w-full bg-gray-900 flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
            {videoCfg.thumbnail ? (
              <img src={videoCfg.thumbnail} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <button className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-transparent border-l-gray-900 ml-1" />
              </button>
            </div>
            {videoCfg.duration && (
              <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                {videoCfg.duration}
              </span>
            )}
          </div>
          {videoCfg.title && <p className={clsx("text-sm mt-2 font-medium", headingColor)}>{videoCfg.title}</p>}
        </div>
      );

    case 'image-gallery':
      const galleryCfg = cfg.gallery || cfg;
      const images = galleryCfg.images?.length ? galleryCfg.images : data.gallery.slice(0, galleryCfg.columns || 3);
      const cols = galleryCfg.columns || 3;
      return (
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {images.slice(0, galleryCfg.limit || 6).map((img: string, idx: number) => (
            <div key={idx} className="aspect-square rounded overflow-hidden bg-gray-200 dark:bg-gray-700">
              {img ? (
                <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image size={24} className={mutedColor} />
                </div>
              )}
            </div>
          ))}
        </div>
      );

    case 'carousel':
      const carouselCfg = cfg.carousel || cfg;
      const slides = carouselCfg.slides?.length ? carouselCfg.slides : [
        { image: '/api/placeholder/600/300', title: 'Slide 1', description: 'First slide description' },
        { image: '/api/placeholder/600/300', title: 'Slide 2', description: 'Second slide description' },
      ];
      return (
        <div className="relative rounded-lg overflow-hidden">
          <div className="relative" style={{ aspectRatio: '2/1' }}>
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700">
              {slides[0]?.image && <img src={slides[0].image} alt="" className="w-full h-full object-cover" />}
            </div>
            {carouselCfg.showOverlay && slides[0]?.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h4 className="text-white font-semibold">{slides[0].title}</h4>
                {slides[0].description && <p className="text-white/80 text-sm">{slides[0].description}</p>}
              </div>
            )}
          </div>
          {carouselCfg.showArrows !== false && (
            <>
              <button className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow hover:bg-white">
                <ChevronRight size={16} className="rotate-180" />
              </button>
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow hover:bg-white">
                <ChevronRight size={16} />
              </button>
            </>
          )}
          {carouselCfg.showDots !== false && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {slides.slice(0, 5).map((_: any, idx: number) => (
                <div key={idx} className={clsx("w-2 h-2 rounded-full", idx === 0 ? "bg-white" : "bg-white/50")} />
              ))}
            </div>
          )}
        </div>
      );

    // ===== CONTENT WIDGETS =====
    case 'text':
      const txtCfg = cfg.text || cfg;
      return (
        <div className={clsx("text-sm leading-relaxed", textColor)} style={{ color: txtCfg.color }}>
          {txtCfg.content || 'Sample text content goes here. This is a placeholder for your custom text.'}
        </div>
      );

    case 'posts':
      const postsCfg = cfg.posts || cfg;
      const posts = data.posts.slice(0, postsCfg.count || 3);
      const postLayout = postsCfg.layout || 'list';

      if (postLayout === 'grid') {
        return (
          <div className="grid grid-cols-2 gap-3">
            {posts.map((post) => (
              <div key={post.id} className="group cursor-pointer">
                {postsCfg.showImage !== false && (
                  <div className="aspect-video rounded overflow-hidden bg-gray-200 dark:bg-gray-700 mb-2">
                    {post.image || post.featuredImage ? (
                      <img src={post.image || post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30" />
                    )}
                  </div>
                )}
                <h4 className={clsx("text-sm font-medium line-clamp-2 group-hover:text-primary-600", headingColor)}>{post.title}</h4>
                {postsCfg.showDate && <p className={clsx("text-xs mt-1", mutedColor)}>{post.date}</p>}
              </div>
            ))}
          </div>
        );
      }

      return (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="flex gap-3 group cursor-pointer">
              {postsCfg.showImage !== false && (
                <div className="w-16 h-12 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0 overflow-hidden">
                  {post.image || post.featuredImage ? (
                    <img src={post.image || post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30" />
                  )}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className={clsx("text-sm font-medium truncate group-hover:text-primary-600", headingColor)}>{post.title}</h4>
                {postsCfg.showDate && <p className={clsx("text-xs", mutedColor)}>{post.date}</p>}
                {postsCfg.showExcerpt && <p className={clsx("text-xs line-clamp-1", textColor)}>{post.excerpt}</p>}
              </div>
            </div>
          ))}
        </div>
      );

    case 'categories':
      const catsCfg = cfg.categories || cfg;
      const cats = data.categories.slice(0, catsCfg.limit || 5);
      return (
        <ul className={clsx("space-y-1.5", catsCfg.layout === 'horizontal' && "flex flex-wrap gap-2")}>
          {cats.map((cat) => {
            const catName = typeof cat === 'string' ? cat : cat.name;
            const catCount = typeof cat === 'string' ? 12 : cat.count;
            const catId = typeof cat === 'string' ? cat : cat.id;
            return (
              <li key={catId}>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className={clsx(
                    "flex items-center justify-between text-sm hover:text-primary-600 transition-colors",
                    catsCfg.layout === 'horizontal' && "px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800",
                    textColor
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Folder size={14} className="opacity-50" />
                    {catName}
                  </span>
                  {catsCfg.showCount && <span className={clsx("text-xs", mutedColor)}>({catCount})</span>}
                </a>
              </li>
            );
          })}
        </ul>
      );

    case 'tags':
      const tagsCfg = cfg.tags || cfg;
      const tags = data.tags.slice(0, tagsCfg.limit || 8);
      return (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const tagName = typeof tag === 'string' ? tag : tag.name;
            const tagId = typeof tag === 'string' ? tag : tag.id;
            return (
              <a
                key={tagId}
                href="#"
                onClick={(e) => e.preventDefault()}
                className={clsx(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors",
                  "bg-gray-100 dark:bg-gray-800 hover:bg-primary-100 dark:hover:bg-primary-900/30",
                  textColor, "hover:text-primary-600"
                )}
              >
                <Hash size={12} />
                {tagName}
              </a>
            );
          })}
        </div>
      );

    case 'products':
      const prodCfg = cfg.products || cfg;
      const products = data.products.slice(0, prodCfg.count || 4);
      const prodLayout = prodCfg.layout || 'grid';

      if (prodLayout === 'list') {
        return (
          <div className="space-y-3">
            {products.map((prod) => (
              <div key={prod.id} className="flex gap-3 group cursor-pointer">
                {prodCfg.showImage !== false && (
                  <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {prod.image ? (
                      <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag size={20} className={mutedColor} />
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className={clsx("text-sm font-medium truncate group-hover:text-primary-600", headingColor)}>{prod.name}</h4>
                  {prodCfg.showPrice !== false && (
                    <div className="flex items-center gap-2">
                      {prod.salePrice ? (
                        <>
                          <span className="text-sm font-bold text-primary-600">${prod.salePrice}</span>
                          <span className={clsx("text-xs line-through", mutedColor)}>${prod.price}</span>
                        </>
                      ) : (
                        <span className={clsx("text-sm font-bold", headingColor)}>${prod.price}</span>
                      )}
                    </div>
                  )}
                  {prodCfg.showRating && (
                    <div className="flex items-center gap-1 mt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={10} className={i < Math.floor(prod.rating) ? "fill-yellow-400 text-yellow-400" : mutedColor} />
                      ))}
                      <span className={clsx("text-xs ml-1", mutedColor)}>{prod.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      }

      return (
        <div className="grid grid-cols-2 gap-3">
          {products.map((prod) => (
            <div key={prod.id} className="group cursor-pointer">
              {prodCfg.showImage !== false && (
                <div className="aspect-square rounded overflow-hidden bg-gray-200 dark:bg-gray-700 mb-2 flex items-center justify-center">
                  {prod.image ? (
                    <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <ShoppingBag size={32} className={mutedColor} />
                  )}
                </div>
              )}
              <h4 className={clsx("text-sm font-medium line-clamp-1 group-hover:text-primary-600", headingColor)}>{prod.name}</h4>
              {prodCfg.showPrice !== false && (
                <div className="flex items-center gap-2 mt-0.5">
                  {prod.salePrice ? (
                    <>
                      <span className="text-sm font-bold text-primary-600">${prod.salePrice}</span>
                      <span className={clsx("text-xs line-through", mutedColor)}>${prod.price}</span>
                    </>
                  ) : (
                    <span className={clsx("text-sm font-bold", headingColor)}>${prod.price}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      );

    // ===== CTA WIDGETS =====
    case 'cta-button':
      const ctaCfg = cfg.cta || cfg;
      const btnStyles: Record<string, string> = {
        primary: "bg-primary-600 text-white hover:bg-primary-700",
        secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white",
        outline: "border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20",
        ghost: "text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20",
      };
      return (
        <button
          className={clsx(
            "px-4 py-2 rounded-lg font-medium text-sm transition-all inline-flex items-center gap-2",
            btnStyles[ctaCfg.style || 'primary'],
            ctaCfg.fullWidth && "w-full justify-center"
          )}
          style={{
            backgroundColor: ctaCfg.style === 'primary' ? ctaCfg.backgroundColor : undefined,
            color: ctaCfg.textColor,
            borderRadius: ctaCfg.borderRadius,
          }}
        >
          {ctaCfg.text || 'Click Here'}
          {ctaCfg.showIcon !== false && <ArrowRight size={14} />}
        </button>
      );

    case 'cta-banner':
      const bannerCfg = cfg.banner || cfg;
      return (
        <div
          className="relative rounded-lg overflow-hidden p-6"
          style={{
            backgroundColor: bannerCfg.backgroundColor || '#3b82f6',
            backgroundImage: bannerCfg.backgroundImage ? `url(${bannerCfg.backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {bannerCfg.overlay && <div className="absolute inset-0 bg-black/40" />}
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-white mb-2">{bannerCfg.title || 'Special Offer!'}</h3>
            <p className="text-white/90 text-sm mb-4">{bannerCfg.description || 'Get 20% off your first purchase'}</p>
            <button className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors">
              {bannerCfg.buttonText || 'Shop Now'}
            </button>
          </div>
        </div>
      );

    case 'newsletter':
      const nlCfg = cfg.newsletter || cfg;
      return (
        <div className={clsx("p-4 rounded-lg", isDark ? "bg-white/5" : "bg-gray-50")}>
          <h4 className={clsx("font-semibold text-sm mb-2", headingColor)}>{nlCfg.title || 'Subscribe to Newsletter'}</h4>
          <p className={clsx("text-xs mb-3", textColor)}>{nlCfg.description || 'Get the latest updates delivered to your inbox.'}</p>
          <div className={clsx("flex gap-2", nlCfg.layout === 'stacked' && "flex-col")}>
            <input
              type="email"
              placeholder={nlCfg.placeholder || 'Enter your email'}
              className={clsx(
                "flex-1 px-3 py-2 rounded border text-sm",
                isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
              )}
              readOnly
            />
            <button
              className="px-4 py-2 bg-primary-600 text-white rounded font-medium text-sm hover:bg-primary-700 transition-colors whitespace-nowrap"
              style={{ backgroundColor: nlCfg.buttonColor }}
            >
              {nlCfg.buttonText || 'Subscribe'}
            </button>
          </div>
        </div>
      );

    case 'search':
      const searchCfg = cfg.search || cfg;
      return (
        <div className="relative">
          <input
            type="text"
            placeholder={searchCfg.placeholder || 'Search...'}
            className={clsx(
              "w-full px-4 py-2 pl-10 rounded-lg border text-sm",
              isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
            )}
            readOnly
          />
          <Search size={16} className={clsx("absolute left-3 top-1/2 -translate-y-1/2", mutedColor)} />
          {searchCfg.showButton && (
            <button className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary-600 text-white rounded text-xs font-medium">
              Search
            </button>
          )}
        </div>
      );

    // ===== CONTACT WIDGETS =====
    case 'contact-info':
      const contactCfg = cfg.contact || cfg;
      const contactItems = [
        { icon: Phone, label: 'Phone', value: contactCfg.phone || '+1 (555) 123-4567' },
        { icon: Mail, label: 'Email', value: contactCfg.email || 'hello@rustpress.io' },
        { icon: MapPin, label: 'Address', value: contactCfg.address || '123 Tech Street, San Francisco, CA' },
      ].filter(item => item.value);

      return (
        <div className="space-y-3">
          {contactItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: (contactCfg.iconColor || '#3b82f6') + '20' }}
              >
                <item.icon size={16} style={{ color: contactCfg.iconColor || '#3b82f6' }} />
              </div>
              <div>
                <div className={clsx("text-xs font-medium", mutedColor)}>{item.label}</div>
                <div className={clsx("text-sm", headingColor)}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      );

    case 'map':
      const mapCfg = cfg.map || cfg;
      return (
        <div className="rounded-lg overflow-hidden" style={{ height: mapCfg.height || 150 }}>
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-900/30 dark:to-green-900/30 opacity-50" />
            <div className="relative text-center">
              <MapPin size={32} className="mx-auto text-primary-600 mb-2" />
              <p className={clsx("text-xs", mutedColor)}>Map Preview</p>
              <p className={clsx("text-xs", textColor)}>{mapCfg.address || 'Location'}</p>
            </div>
          </div>
        </div>
      );

    case 'social-links':
      const socialCfg = cfg.social || cfg;
      const socialPlatforms = [
        { id: 'facebook', icon: Globe, color: '#1877f2', label: 'Facebook' },
        { id: 'twitter', icon: AtSign, color: '#1da1f2', label: 'Twitter' },
        { id: 'instagram', icon: Camera, color: '#e4405f', label: 'Instagram' },
        { id: 'linkedin', icon: Briefcase, color: '#0077b5', label: 'LinkedIn' },
        { id: 'youtube', icon: Film, color: '#ff0000', label: 'YouTube' },
        { id: 'github', icon: Globe, color: '#333', label: 'GitHub' },
      ];
      const activeSocials = socialCfg.platforms || socialPlatforms.slice(0, 4);
      const socialSize = socialCfg.size || 'medium';
      const iconSize = socialSize === 'small' ? 14 : socialSize === 'large' ? 22 : 18;
      const btnSize = socialSize === 'small' ? 'w-7 h-7' : socialSize === 'large' ? 'w-11 h-11' : 'w-9 h-9';

      return (
        <div className={clsx("flex gap-2", socialCfg.layout === 'vertical' && "flex-col")}>
          {activeSocials.map((social: any, idx: number) => {
            const platform = socialPlatforms.find(p => p.id === social.id) || socialPlatforms[idx % socialPlatforms.length];
            const IconComp = platform.icon;
            return (
              <a
                key={social.id || idx}
                href="#"
                onClick={(e) => e.preventDefault()}
                className={clsx(
                  "rounded-lg flex items-center justify-center transition-transform hover:scale-110",
                  btnSize,
                  socialCfg.style === 'outline' && "border-2",
                  socialCfg.style === 'minimal' ? "" : "bg-gray-100 dark:bg-gray-800"
                )}
                style={{
                  backgroundColor: socialCfg.style === 'colored' ? platform.color : undefined,
                  borderColor: socialCfg.style === 'outline' ? platform.color : undefined,
                  color: socialCfg.style === 'colored' ? 'white' : socialCfg.style === 'outline' ? platform.color : undefined,
                }}
                title={platform.label}
              >
                <IconComp size={iconSize} />
              </a>
            );
          })}
        </div>
      );

    // ===== DATA DISPLAY WIDGETS =====
    case 'stats':
      const statsCfg = cfg.stats || cfg;
      const statsItems = statsCfg.items || [
        { value: '10K+', label: 'Users' },
        { value: '99%', label: 'Uptime' },
        { value: '24/7', label: 'Support' },
      ];
      const statsLayout = statsCfg.layout || 'horizontal';

      return (
        <div className={clsx("flex gap-4", statsLayout === 'vertical' && "flex-col", statsLayout === 'grid' && "grid grid-cols-2")}>
          {statsItems.map((stat: any, idx: number) => (
            <div key={idx} className={clsx("text-center", statsLayout === 'horizontal' && "flex-1")}>
              <div
                className="text-2xl font-bold"
                style={{ color: statsCfg.valueColor || '#3b82f6', fontSize: statsCfg.valueSize }}
              >
                {stat.value}
              </div>
              <div className={clsx("text-xs", mutedColor)} style={{ color: statsCfg.labelColor }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      );

    case 'progress-bar':
      const progressCfg = cfg.progress || cfg;
      const progressValue = progressCfg.value || 75;
      const progressMax = progressCfg.maxValue || 100;
      const progressPercent = Math.min((progressValue / progressMax) * 100, 100);

      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={clsx("text-sm font-medium", headingColor)}>{progressCfg.label || 'Progress'}</span>
            {progressCfg.showValue !== false && (
              <span className={clsx("text-sm", textColor)}>
                {progressCfg.valueFormat === 'fraction' ? `${progressValue}/${progressMax}` : `${Math.round(progressPercent)}%`}
              </span>
            )}
          </div>
          <div
            className="w-full rounded-full overflow-hidden"
            style={{
              height: progressCfg.height || 8,
              backgroundColor: progressCfg.trackColor || '#e5e7eb',
              borderRadius: progressCfg.borderRadius,
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={clsx("h-full rounded-full", progressCfg.striped && "bg-stripes")}
              style={{
                backgroundColor: progressCfg.barColor || '#3b82f6',
                backgroundImage: progressCfg.striped
                  ? 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)'
                  : undefined,
                backgroundSize: progressCfg.striped ? '1rem 1rem' : undefined,
                animation: progressCfg.animated && progressCfg.striped ? 'stripe-animation 1s linear infinite' : undefined,
              }}
            />
          </div>
        </div>
      );

    case 'countdown':
      const countdownCfg = cfg.countdown || cfg;
      // Example countdown display
      const timeUnits = [
        { value: 15, label: 'Days' },
        { value: 8, label: 'Hours' },
        { value: 42, label: 'Minutes' },
        { value: 17, label: 'Seconds' },
      ];

      return (
        <div className="text-center">
          {countdownCfg.title && <h4 className={clsx("font-semibold mb-3", headingColor)}>{countdownCfg.title}</h4>}
          <div className="flex justify-center gap-3">
            {timeUnits.map((unit, idx) => (
              <div key={idx} className="text-center">
                <div
                  className="w-14 h-14 rounded-lg flex items-center justify-center font-bold text-xl"
                  style={{
                    backgroundColor: countdownCfg.boxBackground || '#3b82f6',
                    color: countdownCfg.numberColor || 'white',
                    borderRadius: countdownCfg.borderRadius,
                  }}
                >
                  {String(unit.value).padStart(2, '0')}
                </div>
                <div className={clsx("text-xs mt-1", mutedColor)} style={{ color: countdownCfg.labelColor }}>
                  {unit.label}
                </div>
              </div>
            ))}
          </div>
          {countdownCfg.description && <p className={clsx("text-sm mt-3", textColor)}>{countdownCfg.description}</p>}
        </div>
      );

    case 'testimonial':
      const testCfg = cfg.testimonial || cfg;
      const testimonial = data.testimonials[0];

      return (
        <div className={clsx("p-4 rounded-lg", isDark ? "bg-white/5" : "bg-gray-50")}>
          <div className="flex items-center gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < (testCfg.rating || testimonial.rating) ? "fill-yellow-400 text-yellow-400" : mutedColor}
              />
            ))}
          </div>
          <blockquote className={clsx("text-sm italic mb-4", textColor)} style={{ color: testCfg.textColor }}>
            "{testCfg.content || testimonial.content}"
          </blockquote>
          <div className="flex items-center gap-3">
            {testCfg.showAvatar !== false && (
              <div
                className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden"
                style={{ borderRadius: testCfg.avatarStyle === 'square' ? 8 : '50%' }}
              >
                {testCfg.avatar ? (
                  <img src={testCfg.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className={mutedColor} />
                )}
              </div>
            )}
            <div>
              <div className={clsx("font-medium text-sm", headingColor)} style={{ color: testCfg.nameColor }}>
                {testCfg.name || testimonial.name}
              </div>
              <div className={clsx("text-xs", mutedColor)} style={{ color: testCfg.roleColor }}>
                {testCfg.role || testimonial.role}
              </div>
            </div>
          </div>
        </div>
      );

    case 'team-member':
      const memberCfg = cfg.member || cfg;
      const member = data.team[0];

      return (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden mb-3">
            {memberCfg.avatar ? (
              <img src={memberCfg.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={32} className={mutedColor} />
            )}
          </div>
          <h4 className={clsx("font-semibold", headingColor)}>{memberCfg.name || member.name}</h4>
          <p className={clsx("text-sm", textColor)}>{memberCfg.role || member.role}</p>
          {memberCfg.bio && <p className={clsx("text-xs mt-2", mutedColor)}>{memberCfg.bio}</p>}
          {memberCfg.showSocial !== false && (
            <div className="flex justify-center gap-2 mt-3">
              {[Globe, AtSign, Briefcase].map((Icon, idx) => (
                <a key={idx} href="#" onClick={(e) => e.preventDefault()} className={clsx("w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center", textColor)}>
                  <Icon size={14} />
                </a>
              ))}
            </div>
          )}
        </div>
      );

    case 'icon-box':
      const iconBoxCfg = cfg.iconBox || cfg;
      return (
        <div className={clsx("p-4 rounded-lg text-center", isDark ? "bg-white/5" : "bg-gray-50")}>
          <div
            className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-3"
            style={{
              backgroundColor: (iconBoxCfg.iconColor || '#3b82f6') + '20',
            }}
          >
            <Zap size={24} style={{ color: iconBoxCfg.iconColor || '#3b82f6' }} />
          </div>
          <h4 className={clsx("font-semibold mb-2", headingColor)} style={{ color: iconBoxCfg.titleColor }}>
            {iconBoxCfg.title || 'Feature Title'}
          </h4>
          <p className={clsx("text-sm", textColor)} style={{ color: iconBoxCfg.descriptionColor }}>
            {iconBoxCfg.description || 'Brief description of this amazing feature.'}
          </p>
          {iconBoxCfg.showLink && (
            <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-1 text-primary-600 text-sm mt-2 hover:underline">
              {iconBoxCfg.linkText || 'Learn More'} <ArrowRight size={12} />
            </a>
          )}
        </div>
      );

    // ===== PRICING & COMMERCE =====
    case 'pricing-card':
      const priceCfg = cfg.pricing || cfg;
      return (
        <div
          className={clsx("p-5 rounded-xl border", priceCfg.featured ? "border-primary-500 shadow-lg" : isDark ? "border-gray-700" : "border-gray-200")}
          style={{ backgroundColor: priceCfg.backgroundColor }}
        >
          {priceCfg.featured && (
            <div className="text-xs font-semibold text-primary-600 mb-2 uppercase tracking-wider">
              {priceCfg.badge || 'Most Popular'}
            </div>
          )}
          <h4 className={clsx("font-bold text-lg", headingColor)}>{priceCfg.name || 'Pro Plan'}</h4>
          <div className="mt-2 mb-4">
            <span className={clsx("text-3xl font-bold", headingColor)} style={{ color: priceCfg.priceColor }}>
              ${priceCfg.price || '29'}
            </span>
            <span className={mutedColor}>/{priceCfg.period || 'mo'}</span>
          </div>
          <ul className="space-y-2 mb-4">
            {(priceCfg.features || ['Feature 1', 'Feature 2', 'Feature 3']).map((feat: string, idx: number) => (
              <li key={idx} className={clsx("flex items-center gap-2 text-sm", textColor)}>
                <Check size={14} className="text-green-500" />
                {feat}
              </li>
            ))}
          </ul>
          <button
            className={clsx(
              "w-full py-2 rounded-lg font-medium text-sm transition-colors",
              priceCfg.featured ? "bg-primary-600 text-white hover:bg-primary-700" : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700",
              headingColor
            )}
            style={{ backgroundColor: priceCfg.buttonColor, color: priceCfg.buttonTextColor }}
          >
            {priceCfg.buttonText || 'Get Started'}
          </button>
        </div>
      );

    // ===== INTERACTIVE WIDGETS =====
    case 'tabs':
      const tabsCfg = cfg.tabs || cfg;
      const tabs = tabsCfg.items || [
        { label: 'Tab 1', content: 'Content for the first tab panel.' },
        { label: 'Tab 2', content: 'Content for the second tab panel.' },
      ];

      return (
        <div>
          <div className={clsx("flex gap-1 border-b", isDark ? "border-gray-700" : "border-gray-200")}>
            {tabs.map((tab: any, idx: number) => (
              <button
                key={idx}
                className={clsx(
                  "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                  idx === 0
                    ? "border-primary-600 text-primary-600"
                    : clsx("border-transparent", textColor, "hover:text-primary-600")
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className={clsx("p-4 text-sm", textColor)}>
            {tabs[0]?.content || 'Tab content goes here.'}
          </div>
        </div>
      );

    case 'accordion':
      const accordionCfg = cfg.accordion || cfg;
      const accordionItems = accordionCfg.items || [
        { title: 'Accordion Item 1', content: 'This is the content for the first accordion item.' },
        { title: 'Accordion Item 2', content: 'This is the content for the second accordion item.' },
      ];

      return (
        <div className="space-y-2">
          {accordionItems.map((item: any, idx: number) => (
            <div key={idx} className={clsx("border rounded-lg", isDark ? "border-gray-700" : "border-gray-200")}>
              <button
                className={clsx(
                  "w-full px-4 py-3 flex items-center justify-between text-sm font-medium",
                  headingColor
                )}
              >
                {item.title}
                <ChevronDown size={16} className={idx === 0 ? "rotate-180" : ""} />
              </button>
              {idx === 0 && (
                <div className={clsx("px-4 pb-3 text-sm", textColor)}>
                  {item.content}
                </div>
              )}
            </div>
          ))}
        </div>
      );

    // ===== UTILITY WIDGETS =====
    case 'html':
      const htmlCfg = cfg.html || cfg;
      return (
        <div
          className={clsx("prose prose-sm max-w-none", isDark && "prose-invert")}
          dangerouslySetInnerHTML={{ __html: htmlCfg.content || '<p>Custom HTML content</p>' }}
        />
      );

    case 'shortcode':
      const shortcodeCfg = cfg.shortcode || cfg;
      return (
        <div className={clsx("p-4 rounded border-2 border-dashed text-center", isDark ? "border-gray-700" : "border-gray-300")}>
          <code className={clsx("text-xs", textColor)}>{shortcodeCfg.code || '[shortcode]'}</code>
          <p className={clsx("text-xs mt-1", mutedColor)}>RustPress Shortcode</p>
        </div>
      );

    case 'divider':
      const dividerCfg = cfg.divider || cfg;
      return (
        <div className="py-2">
          <hr
            style={{
              borderColor: dividerCfg.color || (isDark ? '#374151' : '#e5e7eb'),
              borderStyle: dividerCfg.style || 'solid',
              borderWidth: `${dividerCfg.thickness || 1}px 0 0 0`,
            }}
          />
        </div>
      );

    case 'spacer':
      const spacerCfg = cfg.spacer || cfg;
      return <div style={{ height: spacerCfg.height || 24 }} />;

    // ===== NAVIGATION WIDGETS =====
    case 'breadcrumbs':
      const breadcrumbItems = cfg.items || ['Home', 'Products', 'Category', 'Current Page'];
      return (
        <nav className="flex items-center gap-2 text-sm">
          {breadcrumbItems.map((item: string, idx: number) => (
            <React.Fragment key={idx}>
              <a href="#" onClick={(e) => e.preventDefault()} className={clsx(
                idx === breadcrumbItems.length - 1 ? headingColor : "text-primary-600 hover:underline"
              )}>
                {item}
              </a>
              {idx < breadcrumbItems.length - 1 && <ChevronRight size={14} className={mutedColor} />}
            </React.Fragment>
          ))}
        </nav>
      );

    case 'sitemap':
      const sitemapSections = cfg.sections || [
        { title: 'Products', items: ['All Products', 'Featured', 'New Arrivals', 'On Sale'] },
        { title: 'Company', items: ['About Us', 'Careers', 'Contact', 'Blog'] },
        { title: 'Support', items: ['Help Center', 'FAQ', 'Shipping', 'Returns'] },
      ];
      return (
        <div className="grid grid-cols-3 gap-4">
          {sitemapSections.map((section: any, idx: number) => (
            <div key={idx}>
              <h5 className={clsx("font-semibold text-sm mb-2", headingColor)}>{section.title}</h5>
              <ul className="space-y-1">
                {section.items.map((item: string, i: number) => (
                  <li key={i}>
                    <a href="#" onClick={(e) => e.preventDefault()} className={clsx("text-xs hover:text-primary-600", textColor)}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );

    case 'page-tree':
      const pageTreeItems = cfg.pages || [
        { title: 'Home', children: [] },
        { title: 'About', children: [{ title: 'Team' }, { title: 'History' }] },
        { title: 'Services', children: [{ title: 'Consulting' }, { title: 'Development' }] },
        { title: 'Contact', children: [] },
      ];
      return (
        <ul className="space-y-1 text-sm">
          {pageTreeItems.map((page: any, idx: number) => (
            <li key={idx}>
              <a href="#" onClick={(e) => e.preventDefault()} className={clsx("flex items-center gap-2 hover:text-primary-600", textColor)}>
                <FileText size={14} />
                {page.title}
              </a>
              {page.children?.length > 0 && (
                <ul className="ml-5 mt-1 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-3">
                  {page.children.map((child: any, i: number) => (
                    <li key={i}>
                      <a href="#" onClick={(e) => e.preventDefault()} className={clsx("text-xs hover:text-primary-600", textColor)}>
                        {child.title}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      );

    // ===== CONTENT WIDGETS =====
    case 'featured-post':
      const featuredPostCfg = cfg.featured || cfg;
      const featuredPost = data.posts[0] || { title: 'Featured Article Title', excerpt: 'This is a featured article with a longer description...', date: 'Dec 20, 2024' };
      return (
        <div className="group cursor-pointer">
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 mb-3">
            {featuredPost.featuredImage ? (
              <img src={featuredPost.featuredImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700" />
            )}
          </div>
          {featuredPostCfg.showCategory !== false && (
            <span className="text-xs font-medium text-primary-600 uppercase tracking-wider">Featured</span>
          )}
          <h3 className={clsx("text-lg font-bold mt-1 group-hover:text-primary-600", headingColor)}>{featuredPost.title}</h3>
          {featuredPostCfg.showExcerpt !== false && <p className={clsx("text-sm mt-1 line-clamp-2", textColor)}>{featuredPost.excerpt}</p>}
          {featuredPostCfg.showDate !== false && <p className={clsx("text-xs mt-2", mutedColor)}>{featuredPost.date}</p>}
        </div>
      );

    case 'author-box':
      const authorCfg = cfg.author || cfg;
      const teamMemberData = data.team[0] as any || { name: 'Alex Rivera', role: 'Senior Writer', bio: 'Passionate about technology and innovation.', avatar: '' };
      return (
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden flex items-center justify-center">
            {teamMemberData.avatar ? (
              <img src={teamMemberData.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <User size={24} className={mutedColor} />
            )}
          </div>
          <div>
            <h4 className={clsx("font-bold", headingColor)}>{teamMemberData.name}</h4>
            <p className={clsx("text-sm", mutedColor)}>{teamMemberData.role}</p>
            {authorCfg.showBio !== false && <p className={clsx("text-sm mt-2", textColor)}>{teamMemberData.bio || ''}</p>}
          </div>
        </div>
      );

    case 'faq':
      const faqItems = cfg.items || [
        { question: 'How do I get started?', answer: 'Getting started is easy. Simply create an account and follow our quick setup guide.' },
        { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, PayPal, and bank transfers.' },
        { question: 'Is there a free trial?', answer: 'Yes! We offer a 14-day free trial with full access to all features.' },
      ];
      return (
        <div className="space-y-3">
          {faqItems.map((item: any, idx: number) => (
            <div key={idx} className={clsx("border rounded-lg p-3", isDark ? "border-gray-700" : "border-gray-200")}>
              <div className="flex items-center gap-2">
                <HelpCircle size={16} className="text-primary-600 flex-shrink-0" />
                <h5 className={clsx("font-medium text-sm", headingColor)}>{item.question}</h5>
              </div>
              <p className={clsx("text-sm mt-2 pl-6", textColor)}>{item.answer}</p>
            </div>
          ))}
        </div>
      );

    // ===== MEDIA WIDGETS =====
    case 'banner':
      const bannerCfgMedia = cfg.banner || cfg;
      return (
        <div
          className="relative rounded-lg overflow-hidden p-6 text-center"
          style={{
            backgroundColor: bannerCfgMedia.backgroundColor || '#3b82f6',
            backgroundImage: bannerCfgMedia.backgroundImage ? `url(${bannerCfgMedia.backgroundImage})` : undefined,
          }}
        >
          {bannerCfgMedia.overlay && <div className="absolute inset-0 bg-black/40" />}
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-white mb-2">{bannerCfgMedia.title || 'Promotional Banner'}</h3>
            <p className="text-white/90 text-sm">{bannerCfgMedia.subtitle || 'Special offer for a limited time!'}</p>
          </div>
        </div>
      );

    case 'audio-player':
      const audioCfg = cfg.audio || cfg;
      return (
        <div className={clsx("p-4 rounded-lg", isDark ? "bg-gray-800" : "bg-gray-100")}>
          <div className="flex items-center gap-4">
            <button className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white hover:bg-primary-700 transition-colors">
              <div className="w-0 h-0 border-t-6 border-b-6 border-l-8 border-transparent border-l-white ml-1" />
            </button>
            <div className="flex-1">
              <p className={clsx("font-medium text-sm", headingColor)}>{audioCfg.title || 'Audio Track Title'}</p>
              <p className={clsx("text-xs", mutedColor)}>{audioCfg.artist || 'Artist Name'}</p>
              <div className="mt-2 h-1 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-primary-600" />
              </div>
            </div>
            <span className={clsx("text-xs", mutedColor)}>2:34 / 5:12</span>
          </div>
        </div>
      );

    case 'podcast':
      const podcastCfg = cfg.podcast || cfg;
      return (
        <div className={clsx("p-4 rounded-lg border", isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50")}>
          <div className="flex gap-4">
            <div className="w-20 h-20 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0 overflow-hidden flex items-center justify-center">
              {podcastCfg.thumbnail ? (
                <img src={podcastCfg.thumbnail} alt="" className="w-full h-full object-cover" />
              ) : (
                <Podcast size={32} className={mutedColor} />
              )}
            </div>
            <div className="flex-1">
              <span className="text-xs font-medium text-primary-600 uppercase">Episode {podcastCfg.episode || '42'}</span>
              <h4 className={clsx("font-bold mt-1", headingColor)}>{podcastCfg.title || 'Podcast Episode Title'}</h4>
              <p className={clsx("text-sm mt-1 line-clamp-2", textColor)}>{podcastCfg.description || 'Episode description goes here...'}</p>
              <div className="flex items-center gap-4 mt-2">
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                  <Music size={14} /> Listen Now
                </button>
                <span className={clsx("text-xs", mutedColor)}>{podcastCfg.duration || '45 min'}</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'lightbox':
      const lightboxCfg = cfg.lightbox || cfg;
      const lightboxImages = lightboxCfg.images || [1, 2, 3, 4];
      return (
        <div className="grid grid-cols-2 gap-2">
          {lightboxImages.slice(0, 4).map((_: any, idx: number) => (
            <div key={idx} className="relative aspect-square rounded overflow-hidden bg-gray-200 dark:bg-gray-700 cursor-pointer group">
              <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <Maximize2 size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      );

    // ===== ECOMMERCE WIDGETS =====
    case 'sale-banner':
      const saleBannerCfg = cfg.sale || cfg;
      return (
        <div className="relative rounded-lg overflow-hidden bg-gradient-to-r from-red-500 to-orange-500 p-6 text-center">
          <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
            {saleBannerCfg.discount || '50% OFF'}
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{saleBannerCfg.title || 'Flash Sale!'}</h3>
          <p className="text-white/90 text-sm mb-4">{saleBannerCfg.subtitle || 'Limited time offer'}</p>
          <button className="px-6 py-2 bg-white text-red-600 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors">
            Shop Now
          </button>
        </div>
      );

    case 'featured-deal':
      const dealCfg = cfg.deal || cfg;
      const dealProduct = data.products[0] || { name: 'Premium Product', price: 99, salePrice: 49, rating: 4.8 };
      return (
        <div className={clsx("p-4 rounded-lg border-2 border-dashed", isDark ? "border-yellow-500/50 bg-yellow-500/10" : "border-yellow-400 bg-yellow-50")}>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={20} className="text-yellow-500" />
            <span className="font-bold text-yellow-600 dark:text-yellow-400">Deal of the Day</span>
          </div>
          <div className="flex gap-4">
            <div className="w-24 h-24 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
              <ShoppingBag size={32} className={mutedColor} />
            </div>
            <div>
              <h4 className={clsx("font-bold", headingColor)}>{dealProduct.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold text-primary-600">${dealProduct.salePrice}</span>
                <span className={clsx("text-sm line-through", mutedColor)}>${dealProduct.price}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} className={i < Math.floor(dealProduct.rating) ? "fill-yellow-400 text-yellow-400" : mutedColor} />
                ))}
              </div>
            </div>
          </div>
        </div>
      );

    case 'cart-preview':
      const cartItems = cfg.items || [
        { name: 'Product One', price: 29.99, qty: 1 },
        { name: 'Product Two', price: 49.99, qty: 2 },
      ];
      const cartTotal = cartItems.reduce((sum: number, item: any) => sum + item.price * item.qty, 0);
      return (
        <div className={clsx("p-4 rounded-lg border", isDark ? "border-gray-700" : "border-gray-200")}>
          <div className="flex items-center justify-between mb-3">
            <span className={clsx("font-semibold", headingColor)}>Shopping Cart</span>
            <span className={clsx("text-sm", mutedColor)}>{cartItems.length} items</span>
          </div>
          <div className="space-y-2 mb-3">
            {cartItems.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className={textColor}>{item.name} x{item.qty}</span>
                <span className={headingColor}>${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className={clsx("border-t pt-2 flex justify-between font-semibold", isDark ? "border-gray-700" : "border-gray-200")}>
            <span>Total:</span>
            <span className="text-primary-600">${cartTotal.toFixed(2)}</span>
          </div>
          <button className="w-full mt-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
            Checkout
          </button>
        </div>
      );

    case 'product-card':
      const productCardCfg = cfg.product || cfg;
      const singleProduct = data.products[0] || { name: 'Product Name', price: 99, salePrice: 79, rating: 4.5 };
      return (
        <div className="group cursor-pointer">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 mb-3 relative">
            {singleProduct.image ? (
              <img src={singleProduct.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag size={40} className={mutedColor} />
              </div>
            )}
            {singleProduct.salePrice && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                Sale
              </span>
            )}
            <button className="absolute bottom-2 right-2 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Heart size={16} className="text-gray-600" />
            </button>
          </div>
          <h4 className={clsx("font-medium group-hover:text-primary-600", headingColor)}>{singleProduct.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            {singleProduct.salePrice ? (
              <>
                <span className="font-bold text-primary-600">${singleProduct.salePrice}</span>
                <span className={clsx("text-sm line-through", mutedColor)}>${singleProduct.price}</span>
              </>
            ) : (
              <span className={clsx("font-bold", headingColor)}>${singleProduct.price}</span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={12} className={i < Math.floor(singleProduct.rating) ? "fill-yellow-400 text-yellow-400" : mutedColor} />
            ))}
            <span className={clsx("text-xs ml-1", mutedColor)}>({singleProduct.rating})</span>
          </div>
        </div>
      );

    case 'coupon-code':
      const couponCfg = cfg.coupon || cfg;
      return (
        <div className={clsx("p-4 rounded-lg border-2 border-dashed text-center", isDark ? "border-primary-500/50 bg-primary-500/10" : "border-primary-400 bg-primary-50")}>
          <Gift size={24} className="mx-auto text-primary-600 mb-2" />
          <p className={clsx("text-sm mb-2", textColor)}>{couponCfg.description || 'Use this code for 20% off!'}</p>
          <div className={clsx("inline-flex items-center gap-2 px-4 py-2 rounded font-mono text-lg font-bold", isDark ? "bg-gray-800" : "bg-white")}>
            <span className="text-primary-600">{couponCfg.code || 'SAVE20'}</span>
            <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <Copy size={14} className={mutedColor} />
            </button>
          </div>
        </div>
      );

    case 'compare':
      const compareProducts = data.products.slice(0, 2);
      return (
        <div className="grid grid-cols-2 gap-4">
          {compareProducts.map((product, idx) => (
            <div key={idx} className={clsx("p-3 rounded-lg border text-center", isDark ? "border-gray-700" : "border-gray-200")}>
              <div className="w-16 h-16 mx-auto rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center mb-2">
                <ShoppingBag size={24} className={mutedColor} />
              </div>
              <h5 className={clsx("font-medium text-sm", headingColor)}>{product.name}</h5>
              <p className="text-primary-600 font-bold mt-1">${product.price}</p>
            </div>
          ))}
        </div>
      );

    case 'wishlist':
      const wishlistItems = data.products.slice(0, 3);
      return (
        <div className={clsx("p-4 rounded-lg border", isDark ? "border-gray-700" : "border-gray-200")}>
          <div className="flex items-center gap-2 mb-3">
            <Heart size={18} className="text-red-500 fill-red-500" />
            <span className={clsx("font-semibold", headingColor)}>My Wishlist</span>
            <span className={clsx("text-xs px-2 py-0.5 rounded-full", isDark ? "bg-gray-700" : "bg-gray-200")}>{wishlistItems.length}</span>
          </div>
          <div className="space-y-2">
            {wishlistItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center">
                  <ShoppingBag size={16} className={mutedColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={clsx("text-sm truncate", headingColor)}>{item.name}</p>
                  <p className="text-xs text-primary-600 font-semibold">${item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    // ===== ACTION WIDGETS =====
    case 'download-button':
      const downloadCfg = cfg.download || cfg;
      return (
        <button className="w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition-colors">
          <Download size={18} />
          {downloadCfg.text || 'Download Now'}
          {downloadCfg.size && <span className="text-sm opacity-75">({downloadCfg.size})</span>}
        </button>
      );

    case 'app-store':
      const appStoreCfg = cfg.appStore || cfg;
      return (
        <div className="flex gap-3">
          <button className="flex-1 py-2 px-3 bg-black text-white rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
            <Apple size={20} />
            <div className="text-left">
              <p className="text-[10px] opacity-75">Download on the</p>
              <p className="text-sm font-semibold -mt-0.5">App Store</p>
            </div>
          </button>
          <button className="flex-1 py-2 px-3 bg-black text-white rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
            <Smartphone size={20} />
            <div className="text-left">
              <p className="text-[10px] opacity-75">Get it on</p>
              <p className="text-sm font-semibold -mt-0.5">Google Play</p>
            </div>
          </button>
        </div>
      );

    case 'book-demo':
      const demoCfg = cfg.demo || cfg;
      return (
        <div className={clsx("p-4 rounded-lg border", isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50")}>
          <div className="flex items-center gap-3 mb-3">
            <Calendar size={24} className="text-primary-600" />
            <div>
              <h4 className={clsx("font-bold", headingColor)}>{demoCfg.title || 'Book a Demo'}</h4>
              <p className={clsx("text-sm", mutedColor)}>Schedule a personalized walkthrough</p>
            </div>
          </div>
          <button className="w-full py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors">
            Schedule Now
          </button>
        </div>
      );

    case 'free-trial':
      const trialCfg = cfg.trial || cfg;
      return (
        <div className="relative rounded-lg overflow-hidden bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-center">
          <Rocket size={32} className="mx-auto text-white mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">{trialCfg.title || 'Start Your Free Trial'}</h3>
          <p className="text-white/80 text-sm mb-4">{trialCfg.subtitle || 'No credit card required. 14 days free.'}</p>
          <button className="px-6 py-2 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Get Started Free
          </button>
        </div>
      );

    // ===== CONTACT WIDGETS =====
    case 'business-hours':
      const hoursCfg = cfg.hours || cfg;
      const hours = hoursCfg.schedule || [
        { day: 'Monday - Friday', time: '9:00 AM - 6:00 PM' },
        { day: 'Saturday', time: '10:00 AM - 4:00 PM' },
        { day: 'Sunday', time: 'Closed' },
      ];
      return (
        <div className={clsx("p-4 rounded-lg border", isDark ? "border-gray-700" : "border-gray-200")}>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={18} className="text-primary-600" />
            <span className={clsx("font-semibold", headingColor)}>Business Hours</span>
          </div>
          <div className="space-y-2">
            {hours.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className={textColor}>{item.day}</span>
                <span className={item.time === 'Closed' ? 'text-red-500' : headingColor}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'quick-contact':
      return (
        <div className={clsx("p-4 rounded-lg border", isDark ? "border-gray-700" : "border-gray-200")}>
          <h4 className={clsx("font-semibold mb-3", headingColor)}>Quick Contact</h4>
          <div className="space-y-3">
            <input type="text" placeholder="Your Name" className={clsx("w-full px-3 py-2 rounded border text-sm", isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300")} />
            <input type="email" placeholder="Email Address" className={clsx("w-full px-3 py-2 rounded border text-sm", isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300")} />
            <textarea placeholder="Your Message" rows={3} className={clsx("w-full px-3 py-2 rounded border text-sm resize-none", isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300")} />
            <button className="w-full py-2 bg-primary-600 text-white rounded font-medium text-sm hover:bg-primary-700 transition-colors">
              Send Message
            </button>
          </div>
        </div>
      );

    case 'live-chat':
      return (
        <div className={clsx("p-4 rounded-lg border text-center", isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50")}>
          <div className="w-12 h-12 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
            <MessageCircle size={24} className="text-green-600" />
          </div>
          <h4 className={clsx("font-semibold", headingColor)}>Live Chat Support</h4>
          <p className={clsx("text-sm mt-1 mb-3", mutedColor)}>We're online and ready to help!</p>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium text-sm hover:bg-green-700 transition-colors">
            Start Chat
          </button>
        </div>
      );

    case 'whatsapp':
      const whatsappCfg = cfg.whatsapp || cfg;
      return (
        <a href="#" onClick={(e) => e.preventDefault()} className="flex items-center gap-3 p-4 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Phone size={20} />
          </div>
          <div>
            <p className="font-semibold">{whatsappCfg.title || 'Chat on WhatsApp'}</p>
            <p className="text-sm text-white/80">{whatsappCfg.number || '+1 234 567 8900'}</p>
          </div>
        </a>
      );

    case 'support':
      return (
        <div className={clsx("p-4 rounded-lg border", isDark ? "border-gray-700" : "border-gray-200")}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <HelpCircle size={24} className="text-primary-600" />
            </div>
            <div>
              <h4 className={clsx("font-semibold", headingColor)}>Need Help?</h4>
              <p className={clsx("text-sm", mutedColor)}>Visit our support center</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="flex-1 py-2 px-3 border border-primary-600 text-primary-600 rounded text-sm font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
              Help Center
            </button>
            <button className="flex-1 py-2 px-3 bg-primary-600 text-white rounded text-sm font-medium hover:bg-primary-700 transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      );

    // ===== DATA & STATS WIDGETS =====
    case 'chart':
      const chartCfg = cfg.chart || cfg;
      return (
        <div className={clsx("p-4 rounded-lg border", isDark ? "border-gray-700" : "border-gray-200")}>
          <h4 className={clsx("font-semibold mb-3", headingColor)}>{chartCfg.title || 'Analytics'}</h4>
          <div className="h-32 flex items-end justify-around gap-2">
            {[65, 40, 80, 55, 90, 45, 70].map((height, idx) => (
              <div key={idx} className="flex-1 bg-primary-500 rounded-t transition-all hover:bg-primary-600" style={{ height: `${height}%` }} />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs" style={{ color: mutedColor }}>
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>
      );

    case 'data-table':
      const tableData = cfg.data || [
        { name: 'Product A', sales: 1234, growth: '+12%' },
        { name: 'Product B', sales: 987, growth: '+8%' },
        { name: 'Product C', sales: 756, growth: '+5%' },
      ];
      return (
        <div className={clsx("rounded-lg border overflow-hidden", isDark ? "border-gray-700" : "border-gray-200")}>
          <table className="w-full text-sm">
            <thead className={isDark ? "bg-gray-800" : "bg-gray-100"}>
              <tr>
                <th className={clsx("px-3 py-2 text-left font-medium", headingColor)}>Name</th>
                <th className={clsx("px-3 py-2 text-right font-medium", headingColor)}>Sales</th>
                <th className={clsx("px-3 py-2 text-right font-medium", headingColor)}>Growth</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row: any, idx: number) => (
                <tr key={idx} className={clsx(idx % 2 === 1 && (isDark ? "bg-gray-800/50" : "bg-gray-50"))}>
                  <td className={clsx("px-3 py-2", textColor)}>{row.name}</td>
                  <td className={clsx("px-3 py-2 text-right", headingColor)}>{row.sales}</td>
                  <td className="px-3 py-2 text-right text-green-500">{row.growth}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'counter':
      const counterCfg = cfg.counter || cfg;
      return (
        <div className="text-center">
          <div className="text-5xl font-bold text-primary-600" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {counterCfg.value || '1,234'}
          </div>
          <p className={clsx("text-sm mt-2", textColor)}>{counterCfg.label || 'Total Users'}</p>
        </div>
      );

    case 'timeline':
      const timelineItems = cfg.items || [
        { date: '2024', title: 'Company Founded', description: 'Started our journey' },
        { date: '2025', title: 'Reached 1M Users', description: 'Major milestone' },
        { date: '2026', title: 'Global Expansion', description: 'Offices worldwide' },
      ];
      return (
        <div className="relative pl-6">
          <div className={clsx("absolute left-2 top-2 bottom-2 w-0.5", isDark ? "bg-gray-700" : "bg-gray-200")} />
          {timelineItems.map((item: any, idx: number) => (
            <div key={idx} className="relative mb-4 last:mb-0">
              <div className="absolute -left-4 w-3 h-3 rounded-full bg-primary-600" />
              <span className={clsx("text-xs font-medium", mutedColor)}>{item.date}</span>
              <h5 className={clsx("font-semibold text-sm", headingColor)}>{item.title}</h5>
              <p className={clsx("text-xs", textColor)}>{item.description}</p>
            </div>
          ))}
        </div>
      );

    case 'milestone':
      const milestoneCfg = cfg.milestone || cfg;
      return (
        <div className={clsx("p-4 rounded-lg border text-center", isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-gray-50")}>
          <Flag size={32} className="mx-auto text-primary-600 mb-2" />
          <h4 className={clsx("text-2xl font-bold", headingColor)}>{milestoneCfg.value || '10,000+'}</h4>
          <p className={clsx("text-sm", textColor)}>{milestoneCfg.label || 'Happy Customers'}</p>
          <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-primary-600 rounded-full" style={{ width: milestoneCfg.progress || '75%' }} />
          </div>
        </div>
      );

    // ===== SOCIAL WIDGETS =====
    case 'social-icons':
      const socialIconsList = cfg.platforms || ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'];
      const socialIcons: Record<string, React.ReactNode> = {
        facebook: <Users size={18} />,
        twitter: <AtSign size={18} />,
        instagram: <Camera size={18} />,
        linkedin: <Briefcase size={18} />,
        youtube: <Video size={18} />,
        github: <Globe size={18} />,
      };
      return (
        <div className="flex gap-2">
          {socialIconsList.map((platform: string) => (
            <a
              key={platform}
              href="#"
              onClick={(e) => e.preventDefault()}
              className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200",
                textColor
              )}
            >
              {socialIcons[platform] || <Share2 size={18} />}
            </a>
          ))}
        </div>
      );

    case 'twitter-feed':
      const tweets = cfg.tweets || [
        { author: '@rustpress', content: 'Just launched our new mega menu builder! Check it out...', time: '2h' },
        { author: '@rustpress', content: 'Thanks to everyone who attended our webinar today!', time: '5h' },
      ];
      return (
        <div className="space-y-3">
          {tweets.map((tweet: any, idx: number) => (
            <div key={idx} className={clsx("p-3 rounded-lg border", isDark ? "border-gray-700" : "border-gray-200")}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <AtSign size={14} className="text-blue-500" />
                </div>
                <span className={clsx("font-semibold text-sm", headingColor)}>{tweet.author}</span>
                <span className={clsx("text-xs", mutedColor)}>{tweet.time}</span>
              </div>
              <p className={clsx("text-sm", textColor)}>{tweet.content}</p>
            </div>
          ))}
        </div>
      );

    case 'instagram-feed':
      const instaPosts = cfg.posts || [1, 2, 3, 4, 5, 6];
      return (
        <div className="grid grid-cols-3 gap-1">
          {instaPosts.slice(0, 6).map((_: any, idx: number) => (
            <div key={idx} className="aspect-square rounded overflow-hidden bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-500 cursor-pointer hover:opacity-80 transition-opacity" />
          ))}
        </div>
      );

    case 'facebook-feed':
      return (
        <div className={clsx("p-4 rounded-lg border", isDark ? "border-gray-700" : "border-gray-200")}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <Users size={18} />
            </div>
            <div>
              <h5 className={clsx("font-semibold text-sm", headingColor)}>RustPress</h5>
              <p className={clsx("text-xs", mutedColor)}>12K followers</p>
            </div>
          </div>
          <p className={clsx("text-sm mb-3", textColor)}>Check out our latest updates and join our community!</p>
          <button className="w-full py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors">
            Follow on Facebook
          </button>
        </div>
      );

    case 'youtube-videos':
      const videos = cfg.videos || [1, 2];
      return (
        <div className="space-y-3">
          {videos.slice(0, 2).map((_: any, idx: number) => (
            <div key={idx} className="group cursor-pointer">
              <div className="relative aspect-video rounded overflow-hidden bg-gray-200 dark:bg-gray-700">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="w-0 h-0 border-t-6 border-b-6 border-l-8 border-transparent border-l-white ml-1" />
                  </div>
                </div>
              </div>
              <p className={clsx("text-sm mt-1 font-medium", headingColor)}>Video Title {idx + 1}</p>
              <p className={clsx("text-xs", mutedColor)}>1.2K views • 2 days ago</p>
            </div>
          ))}
        </div>
      );

    case 'linkedin-feed':
      return (
        <div className={clsx("p-4 rounded-lg border", isDark ? "border-gray-700" : "border-gray-200")}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded bg-blue-700 flex items-center justify-center text-white">
              <Briefcase size={18} />
            </div>
            <div>
              <h5 className={clsx("font-semibold text-sm", headingColor)}>RustPress</h5>
              <p className={clsx("text-xs", mutedColor)}>5K followers • Software Company</p>
            </div>
          </div>
          <p className={clsx("text-sm mb-3", textColor)}>We're hiring! Join our team and build the future of CMS.</p>
          <button className="w-full py-2 border-2 border-blue-600 text-blue-600 rounded text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            View on LinkedIn
          </button>
        </div>
      );

    case 'tiktok-videos':
      return (
        <div className="grid grid-cols-2 gap-2">
          {[1, 2].map((_, idx) => (
            <div key={idx} className="relative aspect-[9/16] rounded-lg overflow-hidden bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 cursor-pointer group">
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-white text-xs font-medium">@rustpress</p>
                <p className="text-white/80 text-xs">❤️ 1.2K</p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Music size={32} className="text-white" />
              </div>
            </div>
          ))}
        </div>
      );

    case 'discord-widget':
      return (
        <div className={clsx("p-4 rounded-lg", isDark ? "bg-indigo-900/30 border border-indigo-500/30" : "bg-indigo-50 border border-indigo-200")}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
              <MessageCircle size={18} />
            </div>
            <div>
              <h5 className={clsx("font-semibold text-sm", headingColor)}>RustPress Community</h5>
              <div className="flex items-center gap-1 text-xs">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className={mutedColor}>1,234 online</span>
              </div>
            </div>
          </div>
          <button className="w-full py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 transition-colors">
            Join Discord
          </button>
        </div>
      );

    // ===== UTILITY WIDGETS =====
    case 'icon':
      const iconCfg = cfg.icon || cfg;
      return (
        <div className="flex items-center justify-center">
          <Star size={iconCfg.size || 48} className="text-primary-600" style={{ color: iconCfg.color }} />
        </div>
      );

    case 'badge':
      const badgeCfg = cfg.badge || cfg;
      const badgeColors: Record<string, string> = {
        primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
        success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
        danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      };
      return (
        <span className={clsx(
          "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
          badgeColors[badgeCfg.variant || 'primary']
        )}>
          {badgeCfg.icon && <Award size={14} />}
          {badgeCfg.text || 'Badge Label'}
        </span>
      );

    case 'alert':
      const alertCfg = cfg.alert || cfg;
      const alertStyles: Record<string, { bg: string; icon: React.ReactNode }> = {
        info: { bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300', icon: <Info size={18} /> },
        success: { bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300', icon: <Check size={18} /> },
        warning: { bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300', icon: <AlertCircle size={18} /> },
        error: { bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300', icon: <AlertCircle size={18} /> },
      };
      const alertStyle = alertStyles[alertCfg.type || 'info'];
      return (
        <div className={clsx("p-4 rounded-lg border flex items-start gap-3", alertStyle.bg)}>
          {alertStyle.icon}
          <div>
            {alertCfg.title && <h5 className="font-semibold text-sm">{alertCfg.title}</h5>}
            <p className="text-sm">{alertCfg.message || 'This is an alert message.'}</p>
          </div>
        </div>
      );

    case 'tooltip':
      const tooltipCfg = cfg.tooltip || cfg;
      return (
        <div className="relative inline-block group">
          <button className={clsx("flex items-center gap-1 text-sm", textColor)}>
            {tooltipCfg.text || 'Hover for info'}
            <Info size={14} className={mutedColor} />
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {tooltipCfg.content || 'Tooltip content here'}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      );

    case 'notice':
      const noticeCfg = cfg.notice || cfg;
      return (
        <div className={clsx("p-3 rounded-lg flex items-center gap-3", isDark ? "bg-primary-900/30" : "bg-primary-50")}>
          <Bell size={18} className="text-primary-600 flex-shrink-0" />
          <p className={clsx("text-sm flex-1", textColor)}>{noticeCfg.message || 'Important notice for visitors!'}</p>
          <button className={clsx("text-sm font-medium hover:underline", "text-primary-600")}>
            {noticeCfg.action || 'Learn More'}
          </button>
        </div>
      );

    case 'qr-code':
      const qrCfg = cfg.qr || cfg;
      return (
        <div className="text-center">
          <div className={clsx("inline-block p-4 rounded-lg", isDark ? "bg-white" : "bg-gray-100")}>
            <div className="w-24 h-24 bg-gray-900 grid grid-cols-5 gap-0.5 p-1">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className={Math.random() > 0.4 ? "bg-white" : "bg-gray-900"} />
              ))}
            </div>
          </div>
          <p className={clsx("text-sm mt-2", textColor)}>{qrCfg.label || 'Scan to visit'}</p>
        </div>
      );

    // ===== ADVANCED WIDGETS =====
    case 'code-block':
      const codeCfg = cfg.code || cfg;
      return (
        <div className="rounded-lg overflow-hidden">
          <div className={clsx("px-4 py-2 flex items-center justify-between", isDark ? "bg-gray-800" : "bg-gray-200")}>
            <span className={clsx("text-xs font-medium", mutedColor)}>{codeCfg.language || 'rust'}</span>
            <button className={clsx("text-xs hover:underline", textColor)}>Copy</button>
          </div>
          <pre className={clsx("p-4 text-sm font-mono overflow-x-auto", isDark ? "bg-gray-900 text-gray-300" : "bg-gray-100 text-gray-800")}>
            {codeCfg.content || `fn main() {\n    println!("Hello, RustPress!");\n}`}
          </pre>
        </div>
      );

    case 'widget-area':
      const widgetAreaCfg = cfg.widgetArea || cfg;
      return (
        <div className={clsx("p-4 rounded-lg border-2 border-dashed text-center", isDark ? "border-gray-700" : "border-gray-300")}>
          <Layout size={24} className={clsx("mx-auto mb-2", mutedColor)} />
          <p className={clsx("text-sm font-medium", headingColor)}>{widgetAreaCfg.name || 'Widget Area'}</p>
          <p className={clsx("text-xs", mutedColor)}>Sidebar: {widgetAreaCfg.sidebar || 'primary-sidebar'}</p>
        </div>
      );

    case 'template':
      const templateCfg = cfg.template || cfg;
      return (
        <div className={clsx("p-4 rounded-lg border-2 border-dashed text-center", isDark ? "border-gray-700" : "border-gray-300")}>
          <LayoutTemplate size={24} className={clsx("mx-auto mb-2", mutedColor)} />
          <p className={clsx("text-sm font-medium", headingColor)}>{templateCfg.name || 'Saved Template'}</p>
          <p className={clsx("text-xs", mutedColor)}>Template: {templateCfg.id || 'mega-menu-template-1'}</p>
        </div>
      );

    case 'dynamic-content':
      return (
        <div className={clsx("p-4 rounded-lg border-2 border-dashed text-center", isDark ? "border-gray-700" : "border-gray-300")}>
          <Workflow size={24} className={clsx("mx-auto mb-2", mutedColor)} />
          <p className={clsx("text-sm font-medium", headingColor)}>Dynamic Content</p>
          <p className={clsx("text-xs", mutedColor)}>Content loaded dynamically based on context</p>
        </div>
      );

    case 'api-data':
      const apiCfg = cfg.api || cfg;
      return (
        <div className={clsx("p-4 rounded-lg border-2 border-dashed text-center", isDark ? "border-gray-700" : "border-gray-300")}>
          <Database size={24} className={clsx("mx-auto mb-2", mutedColor)} />
          <p className={clsx("text-sm font-medium", headingColor)}>API Data</p>
          <p className={clsx("text-xs font-mono", mutedColor)}>{apiCfg.endpoint || '/api/v1/data'}</p>
        </div>
      );

    case 'rust-component':
      const rustCfg = cfg.rust || cfg;
      return (
        <div className={clsx("p-4 rounded-lg border-2 border-dashed text-center", isDark ? "border-orange-500/30 bg-orange-500/10" : "border-orange-300 bg-orange-50")}>
          <Cpu size={24} className="mx-auto mb-2 text-orange-600" />
          <p className={clsx("text-sm font-medium", headingColor)}>Rust Component</p>
          <p className={clsx("text-xs font-mono", mutedColor)}>{rustCfg.component || 'custom_widget::MegaMenu'}</p>
        </div>
      );

    case 'webhook':
      const webhookCfg = cfg.webhook || cfg;
      return (
        <div className={clsx("p-4 rounded-lg border-2 border-dashed text-center", isDark ? "border-gray-700" : "border-gray-300")}>
          <Zap size={24} className={clsx("mx-auto mb-2 text-yellow-500")} />
          <p className={clsx("text-sm font-medium", headingColor)}>Webhook Data</p>
          <p className={clsx("text-xs font-mono", mutedColor)}>{webhookCfg.url || 'https://api.example.com/hook'}</p>
        </div>
      );

    // ===== FORM WIDGETS =====
    case 'contact-form':
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="First Name" className={clsx("px-3 py-2 rounded border text-sm", isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300")} />
            <input type="text" placeholder="Last Name" className={clsx("px-3 py-2 rounded border text-sm", isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300")} />
          </div>
          <input type="email" placeholder="Email Address" className={clsx("w-full px-3 py-2 rounded border text-sm", isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300")} />
          <textarea placeholder="Your Message" rows={3} className={clsx("w-full px-3 py-2 rounded border text-sm resize-none", isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300")} />
          <button className="w-full py-2 bg-primary-600 text-white rounded font-medium text-sm hover:bg-primary-700 transition-colors">
            Send Message
          </button>
        </div>
      );

    case 'subscribe-form':
      return (
        <div className={clsx("p-4 rounded-lg", isDark ? "bg-gray-800" : "bg-gray-100")}>
          <h4 className={clsx("font-semibold mb-2", headingColor)}>Subscribe to Updates</h4>
          <p className={clsx("text-sm mb-3", textColor)}>Get the latest news delivered to your inbox.</p>
          <div className="flex gap-2">
            <input type="email" placeholder="your@email.com" className={clsx("flex-1 px-3 py-2 rounded border text-sm", isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300")} />
            <button className="px-4 py-2 bg-primary-600 text-white rounded font-medium text-sm hover:bg-primary-700 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      );

    case 'login-form':
      return (
        <div className={clsx("p-4 rounded-lg border", isDark ? "border-gray-700" : "border-gray-200")}>
          <div className="flex items-center gap-2 mb-4">
            <Lock size={18} className="text-primary-600" />
            <h4 className={clsx("font-semibold", headingColor)}>Sign In</h4>
          </div>
          <div className="space-y-3">
            <input type="email" placeholder="Email" className={clsx("w-full px-3 py-2 rounded border text-sm", isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300")} />
            <input type="password" placeholder="Password" className={clsx("w-full px-3 py-2 rounded border text-sm", isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300")} />
            <button className="w-full py-2 bg-primary-600 text-white rounded font-medium text-sm hover:bg-primary-700 transition-colors">
              Sign In
            </button>
            <a href="#" onClick={(e) => e.preventDefault()} className="block text-center text-sm text-primary-600 hover:underline">
              Forgot password?
            </a>
          </div>
        </div>
      );

    case 'register-form':
      return (
        <div className={clsx("p-4 rounded-lg border", isDark ? "border-gray-700" : "border-gray-200")}>
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-primary-600" />
            <h4 className={clsx("font-semibold", headingColor)}>Create Account</h4>
          </div>
          <div className="space-y-3">
            <input type="text" placeholder="Full Name" className={clsx("w-full px-3 py-2 rounded border text-sm", isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300")} />
            <input type="email" placeholder="Email" className={clsx("w-full px-3 py-2 rounded border text-sm", isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300")} />
            <input type="password" placeholder="Password" className={clsx("w-full px-3 py-2 rounded border text-sm", isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300")} />
            <button className="w-full py-2 bg-primary-600 text-white rounded font-medium text-sm hover:bg-primary-700 transition-colors">
              Create Account
            </button>
          </div>
        </div>
      );

    case 'survey':
      return (
        <div className={clsx("p-4 rounded-lg border", isDark ? "border-gray-700" : "border-gray-200")}>
          <h4 className={clsx("font-semibold mb-3", headingColor)}>Quick Survey</h4>
          <p className={clsx("text-sm mb-3", textColor)}>How would you rate your experience?</p>
          <div className="flex gap-2 mb-3">
            {['😞', '😐', '🙂', '😄', '🤩'].map((emoji, idx) => (
              <button key={idx} className={clsx("flex-1 py-3 text-2xl rounded border hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors", isDark ? "border-gray-700" : "border-gray-200")}>
                {emoji}
              </button>
            ))}
          </div>
          <button className="w-full py-2 bg-primary-600 text-white rounded font-medium text-sm hover:bg-primary-700 transition-colors">
            Submit
          </button>
        </div>
      );

    case 'poll':
      const pollOptions = cfg.options || ['Option A', 'Option B', 'Option C'];
      return (
        <div className={clsx("p-4 rounded-lg border", isDark ? "border-gray-700" : "border-gray-200")}>
          <h4 className={clsx("font-semibold mb-3", headingColor)}>{cfg.question || 'What do you prefer?'}</h4>
          <div className="space-y-2">
            {pollOptions.map((option: string, idx: number) => (
              <label key={idx} className={clsx("flex items-center gap-3 p-2 rounded border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors", isDark ? "border-gray-700" : "border-gray-200")}>
                <input type="radio" name="poll" className="w-4 h-4 text-primary-600" />
                <span className={textColor}>{option}</span>
              </label>
            ))}
          </div>
          <button className="w-full mt-3 py-2 bg-primary-600 text-white rounded font-medium text-sm hover:bg-primary-700 transition-colors">
            Vote
          </button>
        </div>
      );

    case 'feedback-form':
      return (
        <div className={clsx("p-4 rounded-lg border", isDark ? "border-gray-700" : "border-gray-200")}>
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle size={18} className="text-primary-600" />
            <h4 className={clsx("font-semibold", headingColor)}>Send Feedback</h4>
          </div>
          <textarea placeholder="Tell us what you think..." rows={3} className={clsx("w-full px-3 py-2 rounded border text-sm resize-none mb-3", isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300")} />
          <div className="flex gap-2">
            <button className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              😊 Positive
            </button>
            <button className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              😕 Negative
            </button>
          </div>
        </div>
      );

    case 'quiz':
      return (
        <div className={clsx("p-4 rounded-lg border", isDark ? "border-gray-700" : "border-gray-200")}>
          <div className="flex items-center justify-between mb-3">
            <h4 className={clsx("font-semibold", headingColor)}>Quick Quiz</h4>
            <span className={clsx("text-xs px-2 py-1 rounded-full", isDark ? "bg-gray-700" : "bg-gray-200")}>1/5</span>
          </div>
          <p className={clsx("text-sm mb-4", textColor)}>What is the capital of France?</p>
          <div className="grid grid-cols-2 gap-2">
            {['Paris', 'London', 'Berlin', 'Madrid'].map((option, idx) => (
              <button key={idx} className={clsx("py-2 px-3 rounded border text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors", isDark ? "border-gray-700" : "border-gray-200", textColor)}>
                {option}
              </button>
            ))}
          </div>
        </div>
      );

    // ===== BRANDING WIDGETS =====
    case 'logo':
      const logoCfg = cfg.logo || cfg;
      return (
        <div className="text-center">
          <div className={clsx("inline-flex items-center justify-center w-20 h-20 rounded-lg", isDark ? "bg-gray-800" : "bg-gray-100")}>
            {logoCfg.src ? (
              <img src={logoCfg.src} alt="Logo" className="max-w-full max-h-full" />
            ) : (
              <Crown size={40} className="text-primary-600" />
            )}
          </div>
          {logoCfg.showText && <p className={clsx("font-bold mt-2", headingColor)}>{logoCfg.text || 'RustPress'}</p>}
        </div>
      );

    case 'tagline':
      const taglineCfg = cfg.tagline || cfg;
      return (
        <div className="text-center">
          <p className={clsx("text-xl font-semibold italic", headingColor)} style={{ color: taglineCfg.color }}>
            "{taglineCfg.text || 'Build something amazing'}"
          </p>
        </div>
      );

    case 'trust-badges':
      const badges = cfg.badges || ['secure', 'verified', 'ssl'];
      return (
        <div className="flex justify-center gap-4">
          {badges.map((badge: string, idx: number) => (
            <div key={idx} className={clsx("flex flex-col items-center gap-1 p-3 rounded-lg", isDark ? "bg-gray-800" : "bg-gray-100")}>
              <Shield size={24} className="text-green-500" />
              <span className={clsx("text-xs font-medium capitalize", textColor)}>{badge}</span>
            </div>
          ))}
        </div>
      );

    case 'certifications':
      const certs = cfg.certifications || ['ISO 27001', 'SOC 2', 'GDPR'];
      return (
        <div className="flex justify-center gap-3">
          {certs.map((cert: string, idx: number) => (
            <div key={idx} className={clsx("flex items-center gap-2 px-3 py-2 rounded-full border", isDark ? "border-gray-700" : "border-gray-200")}>
              <Award size={16} className="text-primary-600" />
              <span className={clsx("text-sm font-medium", textColor)}>{cert}</span>
            </div>
          ))}
        </div>
      );

    case 'partner-logos':
      const partners = cfg.partners || [1, 2, 3, 4];
      return (
        <div className="grid grid-cols-4 gap-4">
          {partners.map((_: any, idx: number) => (
            <div key={idx} className={clsx("aspect-video rounded-lg flex items-center justify-center", isDark ? "bg-gray-800" : "bg-gray-100")}>
              <Users size={24} className={mutedColor} />
            </div>
          ))}
        </div>
      );

    case 'press-mentions':
      const pressMentions = cfg.mentions || ['TechCrunch', 'Forbes', 'Wired'];
      return (
        <div className="text-center">
          <p className={clsx("text-xs uppercase tracking-wider mb-3", mutedColor)}>As featured in</p>
          <div className="flex justify-center items-center gap-6">
            {pressMentions.map((mention: string, idx: number) => (
              <span key={idx} className={clsx("text-lg font-bold", isDark ? "text-gray-400" : "text-gray-500")}>
                {mention}
              </span>
            ))}
          </div>
        </div>
      );

    case 'awards':
      const awardsList = cfg.awards || [
        { title: 'Best CMS 2024', org: 'Web Awards' },
        { title: 'Innovation Award', org: 'Tech Summit' },
      ];
      return (
        <div className="flex justify-center gap-6">
          {awardsList.map((award: any, idx: number) => (
            <div key={idx} className="text-center">
              <div className={clsx("w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2", isDark ? "bg-yellow-500/20" : "bg-yellow-100")}>
                <Trophy size={28} className="text-yellow-500" />
              </div>
              <p className={clsx("text-sm font-semibold", headingColor)}>{award.title}</p>
              <p className={clsx("text-xs", mutedColor)}>{award.org}</p>
            </div>
          ))}
        </div>
      );

    case 'ratings':
      const ratingsCfg = cfg.ratings || cfg;
      const sources = ratingsCfg.sources || [
        { name: 'G2', rating: 4.8, count: '500+' },
        { name: 'Capterra', rating: 4.7, count: '300+' },
      ];
      return (
        <div className="flex justify-center gap-6">
          {sources.map((source: any, idx: number) => (
            <div key={idx} className="text-center">
              <p className={clsx("font-bold text-lg", headingColor)}>{source.name}</p>
              <div className="flex items-center justify-center gap-1 my-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < Math.floor(source.rating) ? "fill-yellow-400 text-yellow-400" : mutedColor} />
                ))}
              </div>
              <p className={clsx("text-sm", headingColor)}>{source.rating}/5</p>
              <p className={clsx("text-xs", mutedColor)}>{source.count} reviews</p>
            </div>
          ))}
        </div>
      );

    // ===== DEFAULT FALLBACK =====
    default:
      // Generic widget placeholder
      const widgetDef = SIMPLE_WIDGETS.find(w => w.type === widget.type);
      return (
        <div className={clsx("p-4 rounded-lg border-2 border-dashed text-center", isDark ? "border-gray-700" : "border-gray-300")}>
          {widgetDef?.icon && <widgetDef.icon size={24} className={clsx("mx-auto mb-2", mutedColor)} />}
          <p className={clsx("text-sm font-medium", headingColor)}>{widgetDef?.label || widget.type}</p>
          <p className={clsx("text-xs", mutedColor)}>Widget Preview</p>
        </div>
      );
  }
};

interface LivePreviewProps {
  config: MegaMenuConfig;
  menuLabel: string;
  device: 'desktop' | 'tablet' | 'mobile';
}

// ==================== PARTICLE EFFECTS CANVAS ====================

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
  rotation?: number;
  rotationSpeed?: number;
  trail?: { x: number; y: number }[];
}

const ParticleCanvas: React.FC<{
  effectType: string;
  config: {
    speed?: number;
    particleCount?: number;
    color1?: string;
    color2?: string;
    opacity?: number;
    particleSize?: number;
  };
}> = ({ effectType, config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const initializedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationStarted = false;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const width = parent.clientWidth || 800;
        const height = parent.clientHeight || 400;
        if (width > 0 && height > 0) {
          canvas.width = width;
          canvas.height = height;
          // Re-initialize particles after resize if they were already initialized
          if (initializedRef.current && !animationStarted) {
            initParticles();
          }
        }
      }
    };

    // Delay initial setup to ensure parent has rendered
    const initTimeout = setTimeout(() => {
      resizeCanvas();
      if (canvas.width > 0 && canvas.height > 0) {
        initParticles();
        animationStarted = true;
        animate();
      }
    }, 50);

    window.addEventListener('resize', resizeCanvas);

    const speed = config.speed || 1;
    const count = config.particleCount || 50;
    const color1 = config.color1 || '#ffffff';
    const color2 = config.color2 || color1;
    const opacity = (config.opacity || 50) / 100;
    const baseSize = config.particleSize || 4;

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      initializedRef.current = true;
      for (let i = 0; i < count; i++) {
        // For falling effects, distribute particles across the visible area initially
        const initialY = effectType === 'particles-snow' || effectType === 'particles-rain' || effectType === 'particles-confetti' || effectType === 'particles-meteor'
          ? Math.random() * canvas.height // Start across the entire height for immediate visibility
          : undefined;
        particlesRef.current.push(createParticle(canvas.width, canvas.height, effectType, speed, color1, color2, baseSize, initialY));
      }
    };

    const createParticle = (w: number, h: number, type: string, spd: number, c1: string, c2: string, size: number, initialY?: number): Particle => {
      const colors = [c1, c2];
      const color = colors[Math.floor(Math.random() * colors.length)];

      switch (type) {
        case 'particles-snow':
          return {
            x: Math.random() * w,
            y: initialY !== undefined ? initialY : Math.random() * h - h,
            vx: (Math.random() - 0.5) * spd * 0.5,
            vy: spd * 0.8 + Math.random() * spd * 0.5,
            size: Math.random() * size + 1,
            opacity: Math.random() * 0.5 + 0.5,
            color,
            life: 0,
            maxLife: 10000,
          };
        case 'particles-rain':
          return {
            x: Math.random() * w,
            y: initialY !== undefined ? initialY : Math.random() * h - h,
            vx: spd * 0.3,
            vy: spd * 6 + Math.random() * spd * 2,
            size: Math.random() * (size * 0.5) + 1,
            opacity: Math.random() * 0.4 + 0.3,
            color,
            life: 0,
            maxLife: 10000,
          };
        case 'particles-float':
          return {
            x: Math.random() * w,
            y: initialY !== undefined ? initialY : h + Math.random() * 50,
            vx: (Math.random() - 0.5) * spd * 0.8,
            vy: -spd * (0.3 + Math.random() * 0.5),
            size: Math.random() * size * 1.5 + 2,
            opacity: Math.random() * 0.5 + 0.3,
            color,
            life: 0,
            maxLife: 10000,
          };
        case 'particles-bubbles':
          return {
            x: Math.random() * w,
            y: initialY !== undefined ? initialY : h + Math.random() * 50,
            vx: (Math.random() - 0.5) * spd * 0.5,
            vy: -spd * (0.4 + Math.random() * 0.4),
            size: Math.random() * size * 2 + 3,
            opacity: Math.random() * 0.4 + 0.2,
            color,
            life: 0,
            maxLife: 10000,
          };
        case 'particles-fireflies':
          return {
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * spd * 1.5,
            vy: (Math.random() - 0.5) * spd * 1.5,
            size: Math.random() * size + 2,
            opacity: Math.random() * 0.8 + 0.2,
            color: color || '#ffff88',
            life: Math.random() * 100,
            maxLife: 150 + Math.random() * 100,
          };
        case 'particles-sparkle':
          return {
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * spd * 1.2,
            vy: (Math.random() - 0.5) * spd * 1.2,
            size: Math.random() * size + 1,
            opacity: Math.random(),
            color: color || '#ffd700',
            life: Math.random() * 80,
            maxLife: 80 + Math.random() * 80,
          };
        case 'particles-confetti':
          return {
            x: Math.random() * w,
            y: initialY !== undefined ? initialY : -10,
            vx: (Math.random() - 0.5) * spd * 2,
            vy: spd * 1.5 + Math.random() * spd * 1.5,
            size: Math.random() * size + 4,
            opacity: 1,
            color: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da', '#6c5ce7', '#00cec9'][Math.floor(Math.random() * 8)],
            life: 0,
            maxLife: 10000,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.2,
          };
        case 'particles-stars':
          return {
            x: Math.random() * w,
            y: Math.random() * h,
            vx: 0,
            vy: 0,
            size: Math.random() * size + 1,
            opacity: Math.random() * 0.7 + 0.3,
            color,
            life: Math.random() * 200,
            maxLife: 250,
          };
        case 'particles-meteor':
          return {
            x: Math.random() * w * 1.5,
            y: initialY !== undefined ? initialY * 0.3 : -20,
            vx: -spd * 4,
            vy: spd * 4,
            size: Math.random() * size + 2,
            opacity: 1,
            color,
            life: 0,
            maxLife: 80 + Math.random() * 40,
            trail: [],
          };
        case 'particles-dust':
        default:
          return {
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * spd * 0.3,
            vy: (Math.random() - 0.5) * spd * 0.3,
            size: Math.random() * size + 1,
            opacity: Math.random() * 0.4 + 0.1,
            color,
            life: 0,
            maxLife: 600 + Math.random() * 200,
          };
      }
    };

    const animate = () => {
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p: Particle, i: number) => {
        // Update position
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        // Update rotation for confetti
        if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
          p.rotation += p.rotationSpeed;
        }

        // Handle effects-specific behavior
        if (effectType === 'particles-fireflies') {
          p.opacity = (Math.sin(p.life * 0.08) * 0.5 + 0.5) * 0.9;
          p.vx += (Math.random() - 0.5) * 0.15;
          p.vy += (Math.random() - 0.5) * 0.15;
          // Clamp velocity
          p.vx = Math.max(-2, Math.min(2, p.vx));
          p.vy = Math.max(-2, Math.min(2, p.vy));
        }

        if (effectType === 'particles-sparkle') {
          p.opacity = Math.sin(p.life * 0.15) * 0.6 + 0.4;
          p.vx += (Math.random() - 0.5) * 0.1;
          p.vy += (Math.random() - 0.5) * 0.1;
        }

        if (effectType === 'particles-stars') {
          p.opacity = (Math.sin(p.life * 0.04) * 0.4 + 0.6);
        }

        // Store trail for meteors
        if (effectType === 'particles-meteor' && p.trail) {
          p.trail.unshift({ x: p.x, y: p.y });
          if (p.trail.length > 15) p.trail.pop();
        }

        // Gravity for confetti
        if (effectType === 'particles-confetti') {
          p.vy += 0.05;
          p.vx *= 0.99;
        }

        // Draw particle
        ctx.save();
        ctx.globalAlpha = p.opacity * opacity;
        ctx.fillStyle = p.color;

        if (effectType === 'particles-confetti') {
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation || 0);
          ctx.fillRect(-p.size / 2, -p.size * 0.75, p.size, p.size * 1.5);
        } else if (effectType === 'particles-bubbles') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          // Add highlight
          ctx.beginPath();
          ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          ctx.fill();
        } else if (effectType === 'particles-stars') {
          // Draw star shape
          const spikes = 5;
          const outerRadius = p.size;
          const innerRadius = p.size * 0.4;
          ctx.beginPath();
          for (let j = 0; j < spikes * 2; j++) {
            const radius = j % 2 === 0 ? outerRadius : innerRadius;
            const angle = (j * Math.PI) / spikes - Math.PI / 2;
            const x = p.x + Math.cos(angle) * radius;
            const y = p.y + Math.sin(angle) * radius;
            if (j === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          // Add glow
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fill();
        } else if (effectType === 'particles-meteor') {
          // Draw trail first
          if (p.trail && p.trail.length > 0) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            p.trail.forEach((point, idx) => {
              ctx.lineTo(point.x, point.y);
            });
            const gradient = ctx.createLinearGradient(p.x, p.y, p.trail[p.trail.length - 1]?.x || p.x, p.trail[p.trail.length - 1]?.y || p.y);
            gradient.addColorStop(0, p.color);
            gradient.addColorStop(1, 'transparent');
            ctx.strokeStyle = gradient;
            ctx.lineWidth = p.size;
            ctx.lineCap = 'round';
            ctx.stroke();
          }
          // Draw meteor head
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.fill();
        } else if (effectType === 'particles-fireflies') {
          // Draw with glow
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (effectType === 'particles-rain') {
          // Draw as line
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size * 0.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 0.5);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        // Reset particles that go out of bounds
        const needsReset = p.y > canvas.height + 50 ||
                          p.y < -100 ||
                          p.x < -100 ||
                          p.x > canvas.width + 100 ||
                          p.life > p.maxLife;

        if (needsReset) {
          particlesRef.current[i] = createParticle(canvas.width, canvas.height, effectType, speed, color1, color2, baseSize);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    return () => {
      clearTimeout(initTimeout);
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      initializedRef.current = false;
    };
  }, [effectType, config]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};

const LivePreview: React.FC<LivePreviewProps> = ({ config, menuLabel, device }) => {
  const [isOpen, setIsOpen] = useState(true);

  // Determine what widget types we need data for
  const widgetTypes = useMemo(() => {
    const types = new Set<string>();
    config.columns.forEach(col => {
      col.widgets.forEach(w => types.add(w.type));
    });
    return types;
  }, [config.columns]);

  // Fetch real data from API with fallback to example data
  const { posts, isLoading: postsLoading } = usePosts({
    source: 'recent',
    count: 10,
    enabled: widgetTypes.has('posts'),
  });

  const { categories, isLoading: catsLoading } = useCategories({
    source: 'all',
    limit: 20,
    enabled: widgetTypes.has('categories'),
  });

  const { tags, isLoading: tagsLoading } = useTags({
    source: 'all',
    limit: 20,
    enabled: widgetTypes.has('tags'),
  });

  const { products, isLoading: prodsLoading } = useProducts({
    source: 'featured',
    count: 10,
    enabled: widgetTypes.has('products'),
  });

  const { members: team, isLoading: teamLoading } = useTeamMembers({
    count: 10,
    enabled: widgetTypes.has('team-member'),
  });

  // Build preview data object with real data or fallbacks
  const previewData: WidgetPreviewData = useMemo(() => ({
    posts: posts.length > 0 ? posts.map(p => ({
      id: p.id,
      title: p.title,
      date: p.date,
      image: p.featuredImage,
      excerpt: p.excerpt,
      featuredImage: p.featuredImage,
    })) : EXAMPLE_DATA.posts,
    products: products.length > 0 ? products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      salePrice: p.salePrice,
      image: p.image,
      rating: p.rating,
    })) : EXAMPLE_DATA.products,
    categories: categories.length > 0 ? categories : FALLBACK_DATA.categories,
    tags: tags.length > 0 ? tags : FALLBACK_DATA.tags,
    team: team.length > 0 ? team.map(m => ({
      id: m.id,
      name: m.name,
      role: m.role,
      avatar: m.avatar,
      social: m.social,
    })) : EXAMPLE_DATA.team,
    testimonials: EXAMPLE_DATA.testimonials,
    gallery: EXAMPLE_DATA.gallery,
  }), [posts, products, categories, tags, team]);

  const isLoadingData = postsLoading || catsLoading || tagsLoading || prodsLoading || teamLoading;

  // Collect all custom CSS from widgets
  const customCssStyles = useMemo(() => {
    const cssLines: string[] = [];
    config.columns.forEach(col => {
      col.widgets.forEach(w => {
        const customCss = w.style?.customCss;
        if (customCss && typeof customCss === 'string' && customCss.trim()) {
          cssLines.push(`/* Widget: ${w.title || w.type} (${w.id}) */`);
          cssLines.push(customCss);
          cssLines.push('');
        }
      });
    });
    return cssLines.join('\n');
  }, [config.columns]);

  const getBackgroundStyle = (): React.CSSProperties => {
    const { background } = config;
    if (background.type === 'solid') {
      return { backgroundColor: background.color };
    }
    if (background.type === 'gradient' && background.gradient) {
      const { type, angle, colors } = background.gradient;
      const colorStops = colors.map(c => `${c.color} ${c.position}%`).join(', ');
      if (type === 'linear') {
        return { background: `linear-gradient(${angle}deg, ${colorStops})` };
      }
      return { background: `radial-gradient(circle, ${colorStops})` };
    }
    if (background.type === 'effect') {
      // Use configured background colors for effect backgrounds
      const effectConfig = background.effect?.config;
      const bgType = effectConfig?.bgType || 'solid';
      const bgColor1 = effectConfig?.bgColor1 || '#1a1a2e';
      const bgColor2 = effectConfig?.bgColor2 || '#16213e';
      const bgColor3 = effectConfig?.bgColor3 || '#0f3460';
      const bgColor4 = effectConfig?.bgColor4 || '#533483';
      const bgAngle = effectConfig?.bgAngle || 135;

      if (bgType === 'solid') {
        return { backgroundColor: bgColor1 };
      }
      if (bgType === 'gradient2') {
        return { background: `linear-gradient(${bgAngle}deg, ${bgColor1}, ${bgColor2})` };
      }
      if (bgType === 'gradient4') {
        // 4-color gradient using conic or mesh-like gradient
        return {
          background: `
            linear-gradient(to right, ${bgColor1}, ${bgColor2}),
            linear-gradient(to right, ${bgColor3}, ${bgColor4})
          `,
          backgroundSize: '100% 50%',
          backgroundPosition: '0 0, 0 100%',
          backgroundRepeat: 'no-repeat',
        };
      }
      return { backgroundColor: bgColor1 };
    }
    if (background.type === 'image' && background.image?.url) {
      return {
        backgroundImage: `url(${background.image.url})`,
        backgroundSize: background.image.size || 'cover',
        backgroundPosition: background.image.position || 'center',
        backgroundRepeat: background.image.repeat || 'no-repeat',
      };
    }
    if (background.type === 'pattern' && background.pattern) {
      const { type, color, opacity, size } = background.pattern;
      const patternColor = color || '#000000';
      const patternOpacity = (opacity || 20) / 100;
      const patternSize = size || 20;

      // Generate SVG pattern based on type
      const patterns: Record<string, string> = {
        dots: `url("data:image/svg+xml,%3Csvg width='${patternSize}' height='${patternSize}' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='2' fill='${encodeURIComponent(patternColor)}' fill-opacity='${patternOpacity}'/%3E%3C/svg%3E")`,
        lines: `url("data:image/svg+xml,%3Csvg width='${patternSize}' height='${patternSize}' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10h20' stroke='${encodeURIComponent(patternColor)}' stroke-opacity='${patternOpacity}' stroke-width='1'/%3E%3C/svg%3E")`,
        grid: `url("data:image/svg+xml,%3Csvg width='${patternSize}' height='${patternSize}' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0H0v20' stroke='${encodeURIComponent(patternColor)}' stroke-opacity='${patternOpacity}' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`,
        zigzag: `url("data:image/svg+xml,%3Csvg width='${patternSize * 2}' height='${patternSize}' viewBox='0 0 40 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10L10 0L20 10L30 0L40 10' stroke='${encodeURIComponent(patternColor)}' stroke-opacity='${patternOpacity}' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
        waves: `url("data:image/svg+xml,%3Csvg width='${patternSize * 2}' height='${patternSize}' viewBox='0 0 40 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q10 0, 20 10 T40 10' stroke='${encodeURIComponent(patternColor)}' stroke-opacity='${patternOpacity}' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
        crosses: `url("data:image/svg+xml,%3Csvg width='${patternSize}' height='${patternSize}' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 5v10M5 10h10' stroke='${encodeURIComponent(patternColor)}' stroke-opacity='${patternOpacity}' stroke-width='1'/%3E%3C/svg%3E")`,
        diamonds: `url("data:image/svg+xml,%3Csvg width='${patternSize}' height='${patternSize}' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 2L18 10L10 18L2 10Z' stroke='${encodeURIComponent(patternColor)}' stroke-opacity='${patternOpacity}' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
        hexagons: `url("data:image/svg+xml,%3Csvg width='${patternSize * 1.5}' height='${patternSize}' viewBox='0 0 30 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M15 2L25 7V13L15 18L5 13V7Z' stroke='${encodeURIComponent(patternColor)}' stroke-opacity='${patternOpacity}' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
        triangles: `url("data:image/svg+xml,%3Csvg width='${patternSize}' height='${patternSize}' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 2L18 18H2Z' stroke='${encodeURIComponent(patternColor)}' stroke-opacity='${patternOpacity}' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
        circles: `url("data:image/svg+xml,%3Csvg width='${patternSize}' height='${patternSize}' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='6' stroke='${encodeURIComponent(patternColor)}' stroke-opacity='${patternOpacity}' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
      };

      return {
        backgroundColor: '#f8fafc',
        backgroundImage: patterns[type] || patterns.dots,
        backgroundRepeat: 'repeat',
      };
    }
    return { backgroundColor: '#ffffff' };
  };

  // Check if particles effect is active
  const hasParticleEffect = config.background.type === 'effect' &&
    config.background.effect?.type?.startsWith('particles-');

  // Determine if background is dark for text contrast
  const isDark = (() => {
    if (config.background.type === 'effect') {
      // Most effect backgrounds are dark
      return true;
    }
    if (config.background.type === 'solid') {
      const color = config.background.color || '#ffffff';
      return color.match(/^#[0-3]/) !== null;
    }
    return false;
  })();

  const getDeviceWidth = () => {
    switch (device) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  const columnCount = device === 'mobile' ? 1 : config.columns.length;

  return (
    <div className="h-full flex flex-col">
      {/* Inject custom CSS styles from widgets */}
      {customCssStyles && (
        <style dangerouslySetInnerHTML={{ __html: customCssStyles }} />
      )}

      {/* Simulated Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center gap-6">
          <div className="font-bold text-lg text-gray-900 dark:text-white">Logo</div>
          <nav className="flex gap-4">
            <span className="text-gray-500">Home</span>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={clsx(
                "font-medium flex items-center gap-1 transition-colors",
                isOpen ? "text-primary-600" : "text-gray-700 dark:text-gray-300"
              )}
            >
              {menuLabel}
              <ChevronDown size={14} className={clsx("transition-transform", isOpen && "rotate-180")} />
            </button>
            <span className="text-gray-500">About</span>
            <span className="text-gray-500">Contact</span>
          </nav>
        </div>
      </div>

      {/* Mega Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="border-b border-gray-200 dark:border-gray-700 shadow-lg overflow-auto relative"
            style={{
              ...getBackgroundStyle(),
              maxWidth: getDeviceWidth(),
              margin: device !== 'desktop' ? '0 auto' : undefined,
              minHeight: '400px',
              maxHeight: 'calc(100vh - 200px)',
            }}
          >
            {/* Particle Effects Canvas */}
            {hasParticleEffect && config.background.effect && (
              <ParticleCanvas
                effectType={config.background.effect.type}
                config={config.background.effect.config}
              />
            )}

            <div
              className="p-6 relative"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
                gap: '24px',
                zIndex: 2,
              }}
            >
              {config.columns.map((column, colIdx) => (
                <div key={column.id} className="space-y-4">
                  {column.widgets.map((widget) => (
                    <div key={widget.id} className={`widget-${widget.id}`}>
                      {/* Widget Title */}
                      {widget.showTitle && (
                        <h3 className={clsx(
                          "font-semibold text-sm mb-3 pb-2 border-b",
                          isDark ? "text-white border-white/20" : "text-gray-900 border-gray-200"
                        )}>
                          {widget.title}
                        </h3>
                      )}

                      {/* Widget Content - Comprehensive rendering for all types */}
                      {isLoadingData ? (
                        <div className="animate-pulse space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                      ) : (
                        renderWidgetPreview(widget, isDark, previewData)
                      )}
                    </div>
                  ))}

                  {column.widgets.length === 0 && (
                    <div className={clsx(
                      "text-sm italic text-center py-4",
                      isDark ? "text-gray-500" : "text-gray-400"
                    )}>
                      Column {colIdx + 1} - Empty
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rest of page placeholder */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-900 p-8">
        <div className="text-center text-gray-400">
          <p>Page Content Area</p>
          <p className="text-sm mt-2">Click the menu item above to toggle mega menu</p>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

export const SimpleMegaMenuBuilder: React.FC<SimpleMegaMenuBuilderProps> = ({
  menuItemId,
  menuItemLabel,
  config,
  onSave,
  onClose
}) => {
  const [megaConfig, setMegaConfig] = useState<MegaMenuConfig>(
    config || getDefaultMegaMenuConfig()
  );
  const [selectedColumn, setSelectedColumn] = useState<string | null>(
    megaConfig.columns[0]?.id || null
  );
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showPreview, setShowPreview] = useState(true);
  const [widgetCategory, setWidgetCategory] = useState('navigation');

  // Column management
  const applyColumnPreset = (preset: typeof COLUMN_PRESETS[0]) => {
    const newColumns: MegaMenuColumn[] = preset.widths.map((width, idx) => ({
      id: megaConfig.columns[idx]?.id || generateId(),
      width,
      widgets: megaConfig.columns[idx]?.widgets || [],
      alignment: 'start',
      verticalAlign: 'top',
    }));
    setMegaConfig({ ...megaConfig, columns: newColumns });
    if (!newColumns.find(c => c.id === selectedColumn)) {
      setSelectedColumn(newColumns[0]?.id || null);
    }
  };

  // Background management
  const applyBackgroundPreset = (preset: typeof BACKGROUND_PRESETS[0]) => {
    if ('gradient' in preset) {
      setMegaConfig({
        ...megaConfig,
        background: {
          ...megaConfig.background,
          type: 'gradient',
          gradient: preset.gradient,
        }
      });
    } else {
      setMegaConfig({
        ...megaConfig,
        background: {
          ...megaConfig.background,
          type: 'solid',
          color: preset.color,
        }
      });
    }
  };

  // Widget management
  const addWidget = (type: WidgetType) => {
    if (!selectedColumn) return;

    const widgetDef = SIMPLE_WIDGETS.find(w => w.type === type);
    const newWidget: MegaMenuWidget = {
      id: generateId(),
      type,
      title: widgetDef?.label || 'Widget',
      showTitle: true,
      config: getDefaultWidgetConfig(type) as any,
      style: {
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        margin: { top: 0, right: 0, bottom: 16, left: 0 },
        borderRadius: 0,
      },
    };

    setMegaConfig({
      ...megaConfig,
      columns: megaConfig.columns.map(col =>
        col.id === selectedColumn
          ? { ...col, widgets: [...col.widgets, newWidget] }
          : col
      )
    });
    setShowWidgetPicker(false);
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
  };

  const handleSave = () => {
    onSave(megaConfig);
  };

  // Export mega menu configuration to JSON file
  const exportMegaMenu = () => {
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      menuLabel: menuItemLabel,
      config: megaConfig,
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `megamenu-${menuItemLabel.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import mega menu configuration from JSON file
  const importMegaMenu = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importData = JSON.parse(event.target?.result as string);
          if (importData.config && importData.config.columns) {
            // Regenerate IDs to avoid conflicts
            const regenerateIds = (config: MegaMenuConfig): MegaMenuConfig => {
              return {
                ...config,
                columns: config.columns.map(col => ({
                  ...col,
                  id: generateId(),
                  widgets: col.widgets.map(w => ({
                    ...w,
                    id: generateId(),
                  })),
                })),
              };
            };
            const newConfig = regenerateIds(importData.config);
            setMegaConfig(newConfig);
            setSelectedColumn(newConfig.columns[0]?.id || null);
            alert('Mega menu imported successfully!');
          } else {
            alert('Invalid mega menu configuration file.');
          }
        } catch (err) {
          alert('Failed to parse the import file. Please ensure it is a valid JSON file.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const selectedColumnData = megaConfig.columns.find(c => c.id === selectedColumn);

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col lg:flex-row">
      {/* Backdrop overlay for click-to-close */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm -z-10"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Left Panel - Settings */}
      <div className="w-full lg:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col max-h-[50vh] lg:max-h-full shadow-xl lg:shadow-none">
        {/* Header */}
        <div className="p-3 lg:p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="p-1.5 lg:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <LayoutGrid size={18} className="text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">Mega Menu Builder</h2>
              <p className="text-xs text-gray-500 truncate max-w-[150px] lg:max-w-none">{menuItemLabel}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Close (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-4 lg:space-y-6">
          {/* Layout Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Columns size={16} />
              Layout
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {COLUMN_PRESETS.slice(0, 4).map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => applyColumnPreset(preset)}
                  className={clsx(
                    "p-3 border rounded-lg transition-all text-center",
                    megaConfig.columns.length === preset.columns &&
                    JSON.stringify(megaConfig.columns.map(c => c.width)) === JSON.stringify(preset.widths)
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-primary-300"
                  )}
                >
                  <div className="flex gap-0.5 justify-center mb-1">
                    {preset.widths.map((w, i) => (
                      <div
                        key={i}
                        className="h-6 bg-primary-200 dark:bg-primary-700 rounded-sm"
                        style={{ width: `${w * 0.5}px` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{preset.label}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {COLUMN_PRESETS.slice(4).map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => applyColumnPreset(preset)}
                  className={clsx(
                    "p-2 border rounded-lg transition-all text-center",
                    "border-gray-200 dark:border-gray-700 hover:border-primary-300"
                  )}
                >
                  <div className="flex gap-0.5 justify-center mb-1">
                    {preset.widths.map((w, i) => (
                      <div
                        key={i}
                        className="h-4 bg-gray-300 dark:bg-gray-600 rounded-sm"
                        style={{ width: `${w * 0.4}px` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">{preset.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Background Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Palette size={16} />
              Background
            </h3>

            {/* Background Type Selector */}
            <div className="flex flex-wrap gap-1 mb-3">
              {(['solid', 'gradient', 'pattern', 'effect', 'video'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setMegaConfig({
                    ...megaConfig,
                    background: { ...megaConfig.background, type }
                  })}
                  className={clsx(
                    "px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize",
                    megaConfig.background.type === type
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Solid Color */}
            {megaConfig.background.type === 'solid' && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {BACKGROUND_PRESETS.filter(p => !('gradient' in p)).map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => applyBackgroundPreset(preset)}
                      className={clsx(
                        "w-8 h-8 rounded-lg border-2 transition-all",
                        megaConfig.background.color === (preset as any).color
                          ? "border-primary-500 ring-2 ring-primary-200"
                          : "border-gray-200 dark:border-gray-600"
                      )}
                      style={{ background: (preset as any).color }}
                      title={preset.label}
                    />
                  ))}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Custom Color</label>
                  <input
                    type="color"
                    value={megaConfig.background.color || '#ffffff'}
                    onChange={(e) => setMegaConfig({
                      ...megaConfig,
                      background: { ...megaConfig.background, type: 'solid', color: e.target.value }
                    })}
                    className="w-full h-8 rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Gradient */}
            {megaConfig.background.type === 'gradient' && (
              <div className="space-y-3">
                <div className="flex gap-2 mb-2">
                  {(['linear', 'radial', 'conic'] as const).map((gType) => (
                    <button
                      key={gType}
                      onClick={() => setMegaConfig({
                        ...megaConfig,
                        background: {
                          ...megaConfig.background,
                          gradient: { ...megaConfig.background.gradient!, type: gType }
                        }
                      })}
                      className={clsx(
                        "flex-1 py-1.5 text-xs font-medium rounded capitalize",
                        megaConfig.background.gradient?.type === gType
                          ? "bg-primary-100 text-primary-700"
                          : "bg-gray-100 dark:bg-gray-700"
                      )}
                    >
                      {gType}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {BACKGROUND_PRESETS.filter(p => 'gradient' in p).map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => applyBackgroundPreset(preset)}
                      className="w-8 h-8 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-primary-500"
                      style={{
                        background: `linear-gradient(${(preset as any).gradient.angle}deg, ${(preset as any).gradient.colors.map((c: any) => c.color).join(', ')})`
                      }}
                      title={preset.label}
                    />
                  ))}
                </div>
                {megaConfig.background.gradient?.type === 'linear' && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Angle: {megaConfig.background.gradient?.angle || 135}°</label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={megaConfig.background.gradient?.angle || 135}
                      onChange={(e) => setMegaConfig({
                        ...megaConfig,
                        background: {
                          ...megaConfig.background,
                          gradient: { ...megaConfig.background.gradient!, angle: parseInt(e.target.value) }
                        }
                      })}
                      className="w-full"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Color 1</label>
                    <input
                      type="color"
                      value={megaConfig.background.gradient?.colors?.[0]?.color || '#3b82f6'}
                      onChange={(e) => {
                        const colors = [...(megaConfig.background.gradient?.colors || [])];
                        colors[0] = { color: e.target.value, position: 0 };
                        setMegaConfig({
                          ...megaConfig,
                          background: { ...megaConfig.background, gradient: { ...megaConfig.background.gradient!, colors } }
                        });
                      }}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Color 2</label>
                    <input
                      type="color"
                      value={megaConfig.background.gradient?.colors?.[1]?.color || '#8b5cf6'}
                      onChange={(e) => {
                        const colors = [...(megaConfig.background.gradient?.colors || [])];
                        colors[1] = { color: e.target.value, position: 100 };
                        setMegaConfig({
                          ...megaConfig,
                          background: { ...megaConfig.background, gradient: { ...megaConfig.background.gradient!, colors } }
                        });
                      }}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Pattern */}
            {megaConfig.background.type === 'pattern' && (
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-2">
                  {(['dots', 'lines', 'grid', 'diagonal', 'waves', 'triangles', 'hexagons', 'circles', 'squares', 'diamonds', 'zigzag', 'chevron', 'polka', 'stripes', 'crosshatch'] as const).map((pattern) => (
                    <button
                      key={pattern}
                      onClick={() => setMegaConfig({
                        ...megaConfig,
                        background: {
                          ...megaConfig.background,
                          pattern: { ...megaConfig.background.pattern!, type: pattern }
                        }
                      })}
                      className={clsx(
                        "p-2 text-xs rounded-lg border transition-all capitalize",
                        megaConfig.background.pattern?.type === pattern
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30"
                          : "border-gray-200 dark:border-gray-600"
                      )}
                      title={pattern}
                    >
                      {pattern.slice(0, 4)}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Pattern Color</label>
                    <input
                      type="color"
                      value={megaConfig.background.pattern?.color || '#000000'}
                      onChange={(e) => setMegaConfig({
                        ...megaConfig,
                        background: {
                          ...megaConfig.background,
                          pattern: { ...megaConfig.background.pattern!, color: e.target.value }
                        }
                      })}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Opacity: {megaConfig.background.pattern?.opacity || 20}%</label>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={megaConfig.background.pattern?.opacity || 20}
                      onChange={(e) => setMegaConfig({
                        ...megaConfig,
                        background: {
                          ...megaConfig.background,
                          pattern: { ...megaConfig.background.pattern!, opacity: parseInt(e.target.value) }
                        }
                      })}
                      className="w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Size: {megaConfig.background.pattern?.size || 20}px</label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={megaConfig.background.pattern?.size || 20}
                    onChange={(e) => setMegaConfig({
                      ...megaConfig,
                      background: {
                        ...megaConfig.background,
                        pattern: { ...megaConfig.background.pattern!, size: parseInt(e.target.value) }
                      }
                    })}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Effects (50+) */}
            {megaConfig.background.type === 'effect' && (
              <div className="space-y-3">
                <div className="text-xs text-gray-500 mb-2">Select an animated effect</div>
                {/* Effect Categories */}
                {['Particles', 'Geometric', 'Gradients', 'Textures', 'Motion', 'Light'].map((category) => (
                  <div key={category} className="mb-3">
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">{category}</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {Object.entries(BACKGROUND_EFFECT_PRESETS)
                        .filter(([_, preset]) => preset.category === category)
                        .map(([key, preset]) => (
                          <button
                            key={key}
                            onClick={() => setMegaConfig({
                              ...megaConfig,
                              background: {
                                ...megaConfig.background,
                                effect: { type: preset.effect, config: preset.config }
                              }
                            })}
                            className={clsx(
                              "px-2 py-1.5 text-xs rounded-lg border text-left transition-all",
                              megaConfig.background.effect?.type === preset.effect
                                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                                : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300"
                            )}
                          >
                            {preset.label}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}

                {/* Effect Customization */}
                {megaConfig.background.effect && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Customize Effect</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Speed: {megaConfig.background.effect.config.speed?.toFixed(1) || 1}</label>
                        <input
                          type="range"
                          min="0.1"
                          max="5"
                          step="0.1"
                          value={megaConfig.background.effect.config.speed || 1}
                          onChange={(e) => setMegaConfig({
                            ...megaConfig,
                            background: {
                              ...megaConfig.background,
                              effect: {
                                ...megaConfig.background.effect!,
                                config: { ...megaConfig.background.effect!.config, speed: parseFloat(e.target.value) }
                              }
                            }
                          })}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Opacity: {megaConfig.background.effect.config.opacity || 50}%</label>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={megaConfig.background.effect.config.opacity || 50}
                          onChange={(e) => setMegaConfig({
                            ...megaConfig,
                            background: {
                              ...megaConfig.background,
                              effect: {
                                ...megaConfig.background.effect!,
                                config: { ...megaConfig.background.effect!.config, opacity: parseInt(e.target.value) }
                              }
                            }
                          })}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Primary Color</label>
                        <input
                          type="color"
                          value={megaConfig.background.effect.config.color1 || '#3b82f6'}
                          onChange={(e) => setMegaConfig({
                            ...megaConfig,
                            background: {
                              ...megaConfig.background,
                              effect: {
                                ...megaConfig.background.effect!,
                                config: { ...megaConfig.background.effect!.config, color1: e.target.value }
                              }
                            }
                          })}
                          className="w-full h-8 rounded cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Secondary Color</label>
                        <input
                          type="color"
                          value={megaConfig.background.effect.config.color2 || '#8b5cf6'}
                          onChange={(e) => setMegaConfig({
                            ...megaConfig,
                            background: {
                              ...megaConfig.background,
                              effect: {
                                ...megaConfig.background.effect!,
                                config: { ...megaConfig.background.effect!.config, color2: e.target.value }
                              }
                            }
                          })}
                          className="w-full h-8 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Blend Mode</label>
                      <select
                        value={megaConfig.background.effect.config.blend || 'normal'}
                        onChange={(e) => setMegaConfig({
                          ...megaConfig,
                          background: {
                            ...megaConfig.background,
                            effect: {
                              ...megaConfig.background.effect!,
                              config: { ...megaConfig.background.effect!.config, blend: e.target.value as any }
                            }
                          }
                        })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      >
                        {['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light', 'color-dodge', 'color-burn'].map(mode => (
                          <option key={mode} value={mode}>{mode}</option>
                        ))}
                      </select>
                    </div>

                    {/* Background Color Options for Particle Effects */}
                    <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Background Color</div>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Background Type</label>
                          <select
                            value={megaConfig.background.effect.config.bgType || 'solid'}
                            onChange={(e) => setMegaConfig({
                              ...megaConfig,
                              background: {
                                ...megaConfig.background,
                                effect: {
                                  ...megaConfig.background.effect!,
                                  config: {
                                    ...megaConfig.background.effect!.config,
                                    bgType: e.target.value as 'solid' | 'gradient2' | 'gradient4',
                                    bgColor1: megaConfig.background.effect!.config.bgColor1 || '#1a1a2e',
                                    bgColor2: megaConfig.background.effect!.config.bgColor2 || '#16213e',
                                  }
                                }
                              }
                            })}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            <option value="solid">Solid Color</option>
                            <option value="gradient2">2-Color Gradient</option>
                            <option value="gradient4">4-Color Gradient</option>
                          </select>
                        </div>

                        {/* Solid Color */}
                        {(!megaConfig.background.effect.config.bgType || megaConfig.background.effect.config.bgType === 'solid') && (
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Background Color</label>
                            <input
                              type="color"
                              value={megaConfig.background.effect.config.bgColor1 || '#1a1a2e'}
                              onChange={(e) => setMegaConfig({
                                ...megaConfig,
                                background: {
                                  ...megaConfig.background,
                                  effect: {
                                    ...megaConfig.background.effect!,
                                    config: { ...megaConfig.background.effect!.config, bgColor1: e.target.value }
                                  }
                                }
                              })}
                              className="w-full h-8 rounded cursor-pointer"
                            />
                          </div>
                        )}

                        {/* 2-Color Gradient */}
                        {megaConfig.background.effect.config.bgType === 'gradient2' && (
                          <>
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Color 1</label>
                                <input
                                  type="color"
                                  value={megaConfig.background.effect.config.bgColor1 || '#1a1a2e'}
                                  onChange={(e) => setMegaConfig({
                                    ...megaConfig,
                                    background: {
                                      ...megaConfig.background,
                                      effect: {
                                        ...megaConfig.background.effect!,
                                        config: { ...megaConfig.background.effect!.config, bgColor1: e.target.value }
                                      }
                                    }
                                  })}
                                  className="w-full h-8 rounded cursor-pointer"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="block text-xs text-gray-500 mb-1">Color 2</label>
                                <input
                                  type="color"
                                  value={megaConfig.background.effect.config.bgColor2 || '#16213e'}
                                  onChange={(e) => setMegaConfig({
                                    ...megaConfig,
                                    background: {
                                      ...megaConfig.background,
                                      effect: {
                                        ...megaConfig.background.effect!,
                                        config: { ...megaConfig.background.effect!.config, bgColor2: e.target.value }
                                      }
                                    }
                                  })}
                                  className="w-full h-8 rounded cursor-pointer"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Gradient Angle: {megaConfig.background.effect.config.bgAngle || 135}°</label>
                              <input
                                type="range"
                                min="0"
                                max="360"
                                value={megaConfig.background.effect.config.bgAngle || 135}
                                onChange={(e) => setMegaConfig({
                                  ...megaConfig,
                                  background: {
                                    ...megaConfig.background,
                                    effect: {
                                      ...megaConfig.background.effect!,
                                      config: { ...megaConfig.background.effect!.config, bgAngle: parseInt(e.target.value) }
                                    }
                                  }
                                })}
                                className="w-full"
                              />
                            </div>
                          </>
                        )}

                        {/* 4-Color Gradient */}
                        {megaConfig.background.effect.config.bgType === 'gradient4' && (
                          <>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Top-Left</label>
                                <input
                                  type="color"
                                  value={megaConfig.background.effect.config.bgColor1 || '#1a1a2e'}
                                  onChange={(e) => setMegaConfig({
                                    ...megaConfig,
                                    background: {
                                      ...megaConfig.background,
                                      effect: {
                                        ...megaConfig.background.effect!,
                                        config: { ...megaConfig.background.effect!.config, bgColor1: e.target.value }
                                      }
                                    }
                                  })}
                                  className="w-full h-8 rounded cursor-pointer"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Top-Right</label>
                                <input
                                  type="color"
                                  value={megaConfig.background.effect.config.bgColor2 || '#16213e'}
                                  onChange={(e) => setMegaConfig({
                                    ...megaConfig,
                                    background: {
                                      ...megaConfig.background,
                                      effect: {
                                        ...megaConfig.background.effect!,
                                        config: { ...megaConfig.background.effect!.config, bgColor2: e.target.value }
                                      }
                                    }
                                  })}
                                  className="w-full h-8 rounded cursor-pointer"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Bottom-Left</label>
                                <input
                                  type="color"
                                  value={megaConfig.background.effect.config.bgColor3 || '#0f3460'}
                                  onChange={(e) => setMegaConfig({
                                    ...megaConfig,
                                    background: {
                                      ...megaConfig.background,
                                      effect: {
                                        ...megaConfig.background.effect!,
                                        config: { ...megaConfig.background.effect!.config, bgColor3: e.target.value }
                                      }
                                    }
                                  })}
                                  className="w-full h-8 rounded cursor-pointer"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Bottom-Right</label>
                                <input
                                  type="color"
                                  value={megaConfig.background.effect.config.bgColor4 || '#533483'}
                                  onChange={(e) => setMegaConfig({
                                    ...megaConfig,
                                    background: {
                                      ...megaConfig.background,
                                      effect: {
                                        ...megaConfig.background.effect!,
                                        config: { ...megaConfig.background.effect!.config, bgColor4: e.target.value }
                                      }
                                    }
                                  })}
                                  className="w-full h-8 rounded cursor-pointer"
                                />
                              </div>
                            </div>
                            <div className="mt-2 h-12 rounded-lg" style={{
                              background: `linear-gradient(135deg, ${megaConfig.background.effect.config.bgColor1 || '#1a1a2e'} 0%, ${megaConfig.background.effect.config.bgColor2 || '#16213e'} 50%, ${megaConfig.background.effect.config.bgColor3 || '#0f3460'} 50%, ${megaConfig.background.effect.config.bgColor4 || '#533483'} 100%)`
                            }}>
                              <div className="text-xs text-white/50 text-center pt-4">Preview</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Video Background */}
            {megaConfig.background.type === 'video' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Video URL (MP4, WebM)</label>
                  <input
                    type="url"
                    value={megaConfig.background.video?.url || ''}
                    onChange={(e) => setMegaConfig({
                      ...megaConfig,
                      background: {
                        ...megaConfig.background,
                        video: { ...megaConfig.background.video, url: e.target.value, loop: true, muted: true, autoplay: true }
                      }
                    })}
                    placeholder="https://example.com/video.mp4"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Poster Image (optional)</label>
                  <input
                    type="url"
                    value={megaConfig.background.video?.poster || ''}
                    onChange={(e) => setMegaConfig({
                      ...megaConfig,
                      background: {
                        ...megaConfig.background,
                        video: { ...megaConfig.background.video!, poster: e.target.value }
                      }
                    })}
                    placeholder="https://example.com/poster.jpg"
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={megaConfig.background.video?.loop ?? true}
                      onChange={(e) => setMegaConfig({
                        ...megaConfig,
                        background: {
                          ...megaConfig.background,
                          video: { ...megaConfig.background.video!, loop: e.target.checked }
                        }
                      })}
                      className="rounded"
                    />
                    Loop
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={megaConfig.background.video?.muted ?? true}
                      onChange={(e) => setMegaConfig({
                        ...megaConfig,
                        background: {
                          ...megaConfig.background,
                          video: { ...megaConfig.background.video!, muted: e.target.checked }
                        }
                      })}
                      className="rounded"
                    />
                    Muted
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={megaConfig.background.video?.autoplay ?? true}
                      onChange={(e) => setMegaConfig({
                        ...megaConfig,
                        background: {
                          ...megaConfig.background,
                          video: { ...megaConfig.background.video!, autoplay: e.target.checked }
                        }
                      })}
                      className="rounded"
                    />
                    Autoplay
                  </label>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-xs text-gray-500 mb-1">Video Overlay</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={megaConfig.background.video?.overlay?.color || '#000000'}
                      onChange={(e) => setMegaConfig({
                        ...megaConfig,
                        background: {
                          ...megaConfig.background,
                          video: {
                            ...megaConfig.background.video!,
                            overlay: { color: e.target.value, opacity: megaConfig.background.video?.overlay?.opacity || 30 }
                          }
                        }
                      })}
                      className="w-12 h-8 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <input
                        type="range"
                        min="0"
                        max="90"
                        value={megaConfig.background.video?.overlay?.opacity || 30}
                        onChange={(e) => setMegaConfig({
                          ...megaConfig,
                          background: {
                            ...megaConfig.background,
                            video: {
                              ...megaConfig.background.video!,
                              overlay: { color: megaConfig.background.video?.overlay?.color || '#000000', opacity: parseInt(e.target.value) }
                            }
                          }
                        })}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 text-center">{megaConfig.background.video?.overlay?.opacity || 30}% opacity</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Column Content Section */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Grid size={16} />
              Column Content
            </h3>

            {/* Column Selector */}
            <div className="flex gap-2 mb-4">
              {megaConfig.columns.map((col, idx) => (
                <button
                  key={col.id}
                  onClick={() => setSelectedColumn(col.id)}
                  className={clsx(
                    "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all",
                    selectedColumn === col.id
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  )}
                >
                  Col {idx + 1}
                  {col.widgets.length > 0 && (
                    <span className="ml-1 text-xs opacity-75">({col.widgets.length})</span>
                  )}
                </button>
              ))}
            </div>

            {/* Widgets in Selected Column */}
            {selectedColumnData && (
              <div className="space-y-2">
                {selectedColumnData.widgets.map((widget) => (
                  <WidgetEditor
                    key={widget.id}
                    widget={widget}
                    onUpdate={(updates) => updateWidget(widget.id, updates)}
                    onDelete={() => removeWidget(widget.id)}
                  />
                ))}

                {/* Add Widget Button */}
                <button
                  onClick={() => setShowWidgetPicker(true)}
                  className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add Widget
                </button>
              </div>
            )}
          </section>

          {/* Width Setting */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Maximize2 size={16} />
              Menu Width
            </h3>
            <div className="flex gap-2">
              {(['full', 'container', 'auto'] as const).map((width) => (
                <button
                  key={width}
                  onClick={() => setMegaConfig({ ...megaConfig, width })}
                  className={clsx(
                    "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all capitalize",
                    megaConfig.width === width
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  )}
                >
                  {width}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Footer - Always visible, doesn't shrink */}
        <div className="p-3 lg:p-4 border-t border-gray-200 dark:border-gray-700 space-y-2 shrink-0 bg-gray-50 dark:bg-gray-800/50">
          {/* Import/Export Row - Collapsible on mobile */}
          <div className="hidden lg:flex gap-2">
            <button
              onClick={importMegaMenu}
              className="flex-1 py-1.5 px-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-1.5 text-sm"
              title="Import mega menu from JSON file"
            >
              <Upload size={14} />
              Import
            </button>
            <button
              onClick={exportMegaMenu}
              className="flex-1 py-1.5 px-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-1.5 text-sm"
              title="Export mega menu to JSON file"
            >
              <Download size={14} />
              Export
            </button>
          </div>
          {/* Action Row */}
          <div className="flex gap-2 lg:gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-3 lg:px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm lg:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 px-3 lg:px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2 text-sm lg:text-base"
            >
              <Save size={16} />
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 bg-gray-100 dark:bg-gray-900 flex flex-col min-h-[50vh] lg:min-h-0 overflow-hidden">
        {/* Preview Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Eye size={18} className="text-gray-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">Live Preview</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Device Toggle - Hidden on mobile */}
            <div className="hidden sm:flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {[
                { id: 'desktop' as const, icon: Monitor },
                { id: 'tablet' as const, icon: Tablet },
                { id: 'mobile' as const, icon: Smartphone },
              ].map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setPreviewDevice(id)}
                  className={clsx(
                    "p-1.5 rounded transition-colors",
                    previewDevice === id
                      ? "bg-white dark:bg-gray-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              title={showPreview ? 'Hide preview' : 'Show preview'}
            >
              {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto">
          {showPreview ? (
            <LivePreview
              config={megaConfig}
              menuLabel={menuItemLabel}
              device={previewDevice}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <EyeOff size={48} className="mx-auto mb-2 opacity-50" />
                <p>Preview hidden</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Widget Picker Modal - 50+ Widgets */}
      <AnimatePresence>
        {showWidgetPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowWidgetPicker(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Widget</h3>
                  <p className="text-sm text-gray-500">Choose from 50+ widgets to add to your mega menu</p>
                </div>
                <button
                  onClick={() => setShowWidgetPicker(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex flex-1 overflow-hidden">
                {/* Category Sidebar */}
                <div className="w-48 border-r border-gray-200 dark:border-gray-700 p-2 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
                  {WIDGET_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setWidgetCategory(category.id)}
                      className={clsx(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-colors",
                        widgetCategory === category.id
                          ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                      )}
                    >
                      <category.icon size={16} />
                      {category.label}
                      <span className="ml-auto text-xs opacity-60">
                        {category.widgets.length}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Widgets Grid */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="grid grid-cols-3 gap-3">
                    {(WIDGET_CATEGORIES.find(c => c.id === widgetCategory)?.widgets || WIDGET_CATEGORIES[0].widgets).map((widget, idx) => (
                      <button
                        key={`${widget.type}-${idx}`}
                        onClick={() => addWidget(widget.type)}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:shadow-md transition-all text-left group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg group-hover:scale-110 transition-transform">
                            <widget.icon size={20} className="text-primary-600 dark:text-primary-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                              {widget.label}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5 truncate">
                              {widget.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{SIMPLE_WIDGETS.length}</span> widgets available
                </div>
                <button
                  onClick={() => setShowWidgetPicker(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SimpleMegaMenuBuilder;
