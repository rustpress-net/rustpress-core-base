import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Grid,
  List,
  Star,
  StarHalf,
  Download,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  SortAsc,
  SortDesc,
  Heart,
  Share2,
  ExternalLink,
  Settings,
  Trash2,
  RefreshCw,
  Palette,
  Layout,
  Smartphone,
  Tablet,
  Monitor,
  Clock,
  User,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Sparkles,
  Crown,
  Zap,
  Shield,
  Code,
  Image,
  Layers,
  ArrowUpDown,
  TrendingUp,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle,
  Info,
  Play,
  Pause,
  ChevronDown,
  ArrowRight,
  Upload,
  GitBranch,
  FolderGit2,
  GitCommit,
  GitPullRequest,
  Link,
  Unlink,
  Loader2,
  Package,
  History,
  CloudDownload,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import EnhancedThemePreview from '../components/themes/EnhancedThemePreview';
import ColorCustomizer from '../components/themes/ColorCustomizer';
import TypographyCustomizer from '../components/themes/TypographyCustomizer';
import LayoutBuilder from '../components/themes/LayoutBuilder';
import WorkflowTools from '../components/themes/WorkflowTools';

// ============================================
// TYPES & INTERFACES
// ============================================

interface ThemeScreenshot {
  url: string;
  label: string;
}

interface ThemeReview {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  content: string;
  helpful: number;
  notHelpful: number;
  verified: boolean;
}

interface Theme {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  author: string;
  authorUrl: string;
  thumbnail: string;
  screenshots: ThemeScreenshot[];
  rating: number;
  reviewCount: number;
  downloads: number;
  price: number | 'free';
  tags: string[];
  category: string;
  features: string[];
  lastUpdated: string;
  compatibility: string;
  isActive: boolean;
  isInstalled: boolean;
  isFeatured: boolean;
  isPremium: boolean;
  reviews: ThemeReview[];
  demoUrl: string;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'popular' | 'newest' | 'rating' | 'name' | 'downloads';
type DevicePreview = 'desktop' | 'tablet' | 'mobile';

// ============================================
// SAMPLE DATA
// ============================================

const sampleThemes: Theme[] = [
  {
    id: '1',
    name: 'RustPress Enterprise',
    slug: 'rustpress-enterprise',
    description: 'A powerful, feature-rich theme designed for enterprise websites. Includes advanced layouts, e-commerce integration, and premium support.',
    version: '2.4.0',
    author: 'RustPress Team',
    authorUrl: 'https://rustpress.io',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop',
    screenshots: [
      { url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=800&fit=crop', label: 'Homepage' },
      { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop', label: 'Blog' },
      { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop', label: 'Shop' },
    ],
    rating: 4.8,
    reviewCount: 342,
    downloads: 15420,
    price: 'free',
    tags: ['business', 'corporate', 'e-commerce', 'responsive', 'dark-mode'],
    category: 'Business',
    features: ['Page Builder', 'WooCommerce Ready', 'SEO Optimized', 'RTL Support', 'GDPR Compliant'],
    lastUpdated: '2025-12-15',
    compatibility: '1.0+',
    isActive: true,
    isInstalled: true,
    isFeatured: true,
    isPremium: false,
    demoUrl: 'https://demo.rustpress.io/enterprise',
    reviews: [
      { id: 'r1', author: 'John Doe', avatar: 'https://i.pravatar.cc/100?img=1', rating: 5, date: '2025-12-10', content: 'Excellent theme! Very professional looking and easy to customize.', helpful: 24, notHelpful: 2, verified: true },
      { id: 'r2', author: 'Sarah Smith', avatar: 'https://i.pravatar.cc/100?img=2', rating: 4, date: '2025-12-08', content: 'Great theme overall. Would love to see more color presets.', helpful: 18, notHelpful: 1, verified: true },
    ],
  },
  {
    id: '2',
    name: 'Starter Blog',
    slug: 'starter-blog',
    description: 'A clean, minimalist theme perfect for bloggers and content creators. Fast loading and highly readable.',
    version: '1.8.2',
    author: 'Theme Studio',
    authorUrl: 'https://themestudio.dev',
    thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop',
    screenshots: [
      { url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=800&fit=crop', label: 'Homepage' },
      { url: 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=1200&h=800&fit=crop', label: 'Article' },
    ],
    rating: 4.5,
    reviewCount: 189,
    downloads: 8932,
    price: 'free',
    tags: ['blog', 'minimal', 'clean', 'fast', 'typography'],
    category: 'Blog',
    features: ['Reading Progress', 'Social Sharing', 'Newsletter Integration', 'Code Highlighting'],
    lastUpdated: '2025-12-01',
    compatibility: '1.0+',
    isActive: false,
    isInstalled: true,
    isFeatured: false,
    isPremium: false,
    demoUrl: 'https://demo.rustpress.io/starter-blog',
    reviews: [],
  },
  {
    id: '3',
    name: 'Nova Commerce',
    slug: 'nova-commerce',
    description: 'The ultimate e-commerce theme with advanced product displays, cart features, and checkout optimization.',
    version: '3.1.0',
    author: 'Commerce Labs',
    authorUrl: 'https://commercelabs.io',
    thumbnail: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=600&fit=crop',
    screenshots: [
      { url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&h=800&fit=crop', label: 'Shop' },
      { url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=800&fit=crop', label: 'Product' },
      { url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=800&fit=crop', label: 'Cart' },
      { url: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=1200&h=800&fit=crop', label: 'Checkout' },
    ],
    rating: 4.9,
    reviewCount: 567,
    downloads: 23456,
    price: 49,
    tags: ['e-commerce', 'shop', 'woocommerce', 'products', 'payments'],
    category: 'E-Commerce',
    features: ['Product Quickview', 'Wishlist', 'Compare Products', 'Multi-currency', 'Inventory Management'],
    lastUpdated: '2025-12-20',
    compatibility: '1.0+',
    isActive: false,
    isInstalled: false,
    isFeatured: true,
    isPremium: true,
    demoUrl: 'https://demo.rustpress.io/nova-commerce',
    reviews: [],
  },
  {
    id: '4',
    name: 'Portfolio Pro',
    slug: 'portfolio-pro',
    description: 'Showcase your work beautifully with this stunning portfolio theme. Perfect for designers, photographers, and agencies.',
    version: '2.0.5',
    author: 'Creative Themes',
    authorUrl: 'https://creativethemes.co',
    thumbnail: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=600&fit=crop',
    screenshots: [
      { url: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200&h=800&fit=crop', label: 'Gallery' },
      { url: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?w=1200&h=800&fit=crop', label: 'Project' },
    ],
    rating: 4.7,
    reviewCount: 234,
    downloads: 12890,
    price: 'free',
    tags: ['portfolio', 'gallery', 'creative', 'photography', 'agency'],
    category: 'Portfolio',
    features: ['Masonry Grid', 'Lightbox Gallery', 'Project Pages', 'Client Testimonials', 'Video Support'],
    lastUpdated: '2025-11-28',
    compatibility: '1.0+',
    isActive: false,
    isInstalled: false,
    isFeatured: true,
    isPremium: false,
    demoUrl: 'https://demo.rustpress.io/portfolio-pro',
    reviews: [],
  },
  {
    id: '5',
    name: 'Developer Docs',
    slug: 'developer-docs',
    description: 'A documentation-focused theme with code syntax highlighting, search, and hierarchical navigation.',
    version: '1.5.0',
    author: 'DevTools Inc',
    authorUrl: 'https://devtools.io',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop',
    screenshots: [
      { url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=800&fit=crop', label: 'Docs Home' },
      { url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=800&fit=crop', label: 'API Reference' },
    ],
    rating: 4.6,
    reviewCount: 156,
    downloads: 7823,
    price: 'free',
    tags: ['documentation', 'technical', 'developer', 'api', 'code'],
    category: 'Documentation',
    features: ['Version Switcher', 'Code Tabs', 'API Playground', 'Search Index', 'Breadcrumbs'],
    lastUpdated: '2025-12-05',
    compatibility: '1.0+',
    isActive: false,
    isInstalled: false,
    isFeatured: false,
    isPremium: false,
    demoUrl: 'https://demo.rustpress.io/developer-docs',
    reviews: [],
  },
  {
    id: '6',
    name: 'Magazine Elite',
    slug: 'magazine-elite',
    description: 'A sophisticated magazine theme with multiple layout options, featured posts, and category highlights.',
    version: '2.2.1',
    author: 'News Themes',
    authorUrl: 'https://newsthemes.com',
    thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop',
    screenshots: [
      { url: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=800&fit=crop', label: 'Front Page' },
      { url: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&h=800&fit=crop', label: 'Category' },
    ],
    rating: 4.4,
    reviewCount: 298,
    downloads: 18234,
    price: 29,
    tags: ['magazine', 'news', 'editorial', 'publishing', 'media'],
    category: 'Magazine',
    features: ['Breaking News Ticker', 'Video Posts', 'Infinite Scroll', 'Ad Placements', 'Newsletter Popup'],
    lastUpdated: '2025-12-12',
    compatibility: '1.0+',
    isActive: false,
    isInstalled: false,
    isFeatured: false,
    isPremium: true,
    demoUrl: 'https://demo.rustpress.io/magazine-elite',
    reviews: [],
  },
  {
    id: '7',
    name: 'Landing Builder',
    slug: 'landing-builder',
    description: 'Create stunning landing pages with drag-and-drop ease. Includes 50+ pre-built sections.',
    version: '1.9.0',
    author: 'PageCraft',
    authorUrl: 'https://pagecraft.io',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    screenshots: [
      { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop', label: 'Landing' },
    ],
    rating: 4.8,
    reviewCount: 412,
    downloads: 21567,
    price: 'free',
    tags: ['landing', 'marketing', 'conversion', 'saas', 'startup'],
    category: 'Landing Page',
    features: ['A/B Testing', 'Conversion Tracking', 'Form Builder', 'Animation Effects', 'CRM Integration'],
    lastUpdated: '2025-12-18',
    compatibility: '1.0+',
    isActive: false,
    isInstalled: false,
    isFeatured: true,
    isPremium: false,
    demoUrl: 'https://demo.rustpress.io/landing-builder',
    reviews: [],
  },
  {
    id: '8',
    name: 'Dark Matter',
    slug: 'dark-matter',
    description: 'A sleek dark theme designed for modern SaaS products and tech startups.',
    version: '1.3.0',
    author: 'Neon Labs',
    authorUrl: 'https://neonlabs.dev',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
    screenshots: [
      { url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=800&fit=crop', label: 'Hero' },
      { url: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=1200&h=800&fit=crop', label: 'Features' },
    ],
    rating: 4.9,
    reviewCount: 178,
    downloads: 9876,
    price: 39,
    tags: ['dark', 'saas', 'tech', 'modern', 'gradient'],
    category: 'SaaS',
    features: ['Glassmorphism', 'Animated Gradients', 'Particle Effects', 'Pricing Tables', 'Feature Comparisons'],
    lastUpdated: '2025-12-19',
    compatibility: '1.0+',
    isActive: false,
    isInstalled: false,
    isFeatured: false,
    isPremium: true,
    demoUrl: 'https://demo.rustpress.io/dark-matter',
    reviews: [],
  },
];

const allTags = Array.from(new Set(sampleThemes.flatMap(t => t.tags))).sort();
const allCategories = Array.from(new Set(sampleThemes.map(t => t.category))).sort();

// ============================================
// UTILITY COMPONENTS
// ============================================

// Star Rating Display
const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' | 'lg'; showValue?: boolean }> = ({
  rating,
  size = 'md',
  showValue = true,
}) => {
  const sizeClasses = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' };
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className={clsx(sizeClasses[size], 'text-yellow-400 fill-yellow-400')} />
        ))}
        {hasHalfStar && <StarHalf className={clsx(sizeClasses[size], 'text-yellow-400 fill-yellow-400')} />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className={clsx(sizeClasses[size], 'text-gray-300')} />
        ))}
      </div>
      {showValue && <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">{rating.toFixed(1)}</span>}
    </div>
  );
};

// Badge Component
const Badge: React.FC<{ children: React.ReactNode; variant?: 'default' | 'primary' | 'success' | 'warning' | 'premium' }> = ({
  children,
  variant = 'default',
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    primary: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    premium: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
  };

  return (
    <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', variants[variant])}>
      {children}
    </span>
  );
};

// ============================================
// ENHANCEMENT 1: THEME CARD WITH HOVER PREVIEW
// ============================================

interface ThemeCardProps {
  theme: Theme;
  viewMode: ViewMode;
  onPreview: (theme: Theme) => void;
  onActivate: (theme: Theme) => void;
  onInstall: (theme: Theme) => void;
  onCompare: (theme: Theme) => void;
  isCompareSelected: boolean;
}

const ThemeCard: React.FC<ThemeCardProps> = ({
  theme,
  viewMode,
  onPreview,
  onActivate,
  onInstall,
  onCompare,
  isCompareSelected,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentScreenshot, setCurrentScreenshot] = useState(0);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-cycle screenshots on hover
  useEffect(() => {
    if (isHovered && theme.screenshots.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentScreenshot(prev => (prev + 1) % theme.screenshots.length);
      }, 1500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setCurrentScreenshot(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, theme.screenshots.length]);

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={clsx(
          'bg-white dark:bg-gray-900 rounded-xl border transition-all duration-300 overflow-hidden',
          isCompareSelected
            ? 'border-blue-500 ring-2 ring-blue-500/20'
            : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg'
        )}
      >
        <div className="flex">
          {/* Thumbnail */}
          <div
            className="w-64 h-48 flex-shrink-0 relative overflow-hidden cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onPreview(theme)}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={currentScreenshot}
                src={theme.screenshots[currentScreenshot]?.url || theme.thumbnail}
                alt={theme.name}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>

            {/* Screenshot indicator */}
            {theme.screenshots.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {theme.screenshots.map((_, idx) => (
                  <div
                    key={idx}
                    className={clsx(
                      'w-1.5 h-1.5 rounded-full transition-all',
                      idx === currentScreenshot ? 'bg-white w-4' : 'bg-white/50'
                    )}
                  />
                ))}
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {theme.isActive && <Badge variant="success">Active</Badge>}
              {theme.isPremium && (
                <Badge variant="premium">
                  <Crown className="w-3 h-3 inline mr-1" />
                  Premium
                </Badge>
              )}
              {theme.isFeatured && <Badge variant="warning">Featured</Badge>}
            </div>

            {/* Hover overlay */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 flex items-center justify-center"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview(theme);
                    }}
                    className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{theme.name}</h3>
                <p className="text-sm text-gray-500">
                  by <a href={theme.authorUrl} className="text-blue-600 hover:underline">{theme.author}</a>
                </p>
              </div>
              <div className="text-right">
                {theme.price === 'free' ? (
                  <span className="text-green-600 font-semibold">Free</span>
                ) : (
                  <span className="text-gray-900 dark:text-white font-semibold">${theme.price}</span>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{theme.description}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {theme.tags.slice(0, 4).map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                  {tag}
                </span>
              ))}
              {theme.tags.length > 4 && (
                <span className="text-xs text-gray-500">+{theme.tags.length - 4} more</span>
              )}
            </div>

            {/* Stats & Actions */}
            <div className="mt-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <StarRating rating={theme.rating} size="sm" />
                <span className="text-sm text-gray-500">({theme.reviewCount})</span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  {theme.downloads.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onCompare(theme)}
                  className={clsx(
                    'p-2 rounded-lg transition-colors',
                    isCompareSelected
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500'
                  )}
                  title="Add to comparison"
                >
                  <Layers className="w-4 h-4" />
                </button>
                {theme.isInstalled ? (
                  theme.isActive ? (
                    <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium flex items-center gap-2 cursor-default">
                      <Check className="w-4 h-4" />
                      Active
                    </button>
                  ) : (
                    <button
                      onClick={() => onActivate(theme)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Activate
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => onInstall(theme)}
                    className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Install
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className={clsx(
        'bg-white dark:bg-gray-900 rounded-xl border transition-all duration-300 overflow-hidden group',
        isCompareSelected
          ? 'border-blue-500 ring-2 ring-blue-500/20'
          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-xl'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail with hover preview */}
      <div className="relative aspect-[4/3] overflow-hidden cursor-pointer" onClick={() => onPreview(theme)}>
        <AnimatePresence mode="wait">
          <motion.img
            key={currentScreenshot}
            src={theme.screenshots[currentScreenshot]?.url || theme.thumbnail}
            alt={theme.name}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: isHovered ? 1.05 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        </AnimatePresence>

        {/* Screenshot label on hover */}
        <AnimatePresence>
          {isHovered && theme.screenshots.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/70 text-white text-sm rounded-full"
            >
              {theme.screenshots[currentScreenshot]?.label || 'Screenshot'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Screenshot dots */}
        {theme.screenshots.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {theme.screenshots.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentScreenshot(idx);
                }}
                className={clsx(
                  'w-2 h-2 rounded-full transition-all',
                  idx === currentScreenshot ? 'bg-white w-5' : 'bg-white/50 hover:bg-white/70'
                )}
              />
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {theme.isActive && (
            <Badge variant="success">
              <Check className="w-3 h-3 inline mr-1" />
              Active
            </Badge>
          )}
          {theme.isPremium && (
            <Badge variant="premium">
              <Crown className="w-3 h-3 inline mr-1" />
              Premium
            </Badge>
          )}
          {theme.isFeatured && (
            <Badge variant="warning">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Featured
            </Badge>
          )}
        </div>

        {/* Compare checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCompare(theme);
          }}
          className={clsx(
            'absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all',
            isCompareSelected
              ? 'bg-blue-600 text-white'
              : 'bg-white/90 text-gray-700 opacity-0 group-hover:opacity-100 hover:bg-white'
          )}
          title="Add to comparison"
        >
          {isCompareSelected ? <Check className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
        </button>

        {/* Hover overlay with actions */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4"
            >
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview(theme);
                  }}
                  className="flex-1 px-4 py-2.5 bg-white text-gray-900 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  Live Preview
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(theme.demoUrl, '_blank');
                  }}
                  className="p-2.5 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{theme.name}</h3>
            <p className="text-sm text-gray-500 truncate">by {theme.author}</p>
          </div>
          <div className="ml-2 text-right flex-shrink-0">
            {theme.price === 'free' ? (
              <span className="text-green-600 font-semibold text-sm">Free</span>
            ) : (
              <span className="text-gray-900 dark:text-white font-semibold">${theme.price}</span>
            )}
          </div>
        </div>

        {/* Rating & Downloads */}
        <div className="flex items-center gap-3 mb-3">
          <StarRating rating={theme.rating} size="sm" />
          <span className="text-xs text-gray-500">({theme.reviewCount})</span>
          <span className="text-xs text-gray-500 flex items-center gap-1 ml-auto">
            <Download className="w-3 h-3" />
            {theme.downloads.toLocaleString()}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {theme.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
              {tag}
            </span>
          ))}
          {theme.tags.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-gray-500">+{theme.tags.length - 3}</span>
          )}
        </div>

        {/* Action Button */}
        {theme.isInstalled ? (
          theme.isActive ? (
            <button className="w-full py-2.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg font-medium flex items-center justify-center gap-2 cursor-default">
              <Check className="w-4 h-4" />
              Active Theme
            </button>
          ) : (
            <button
              onClick={() => onActivate(theme)}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Activate
            </button>
          )
        ) : (
          <button
            onClick={() => onInstall(theme)}
            className="w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {theme.price === 'free' ? 'Install' : `Buy & Install - $${theme.price}`}
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ============================================
// ENHANCEMENT 2: THEME COMPARISON MODAL
// ============================================

interface ThemeComparisonModalProps {
  themes: Theme[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (themeId: string) => void;
}

const ThemeComparisonModal: React.FC<ThemeComparisonModalProps> = ({
  themes,
  isOpen,
  onClose,
  onRemove,
}) => {
  const [previewDevice, setPreviewDevice] = useState<DevicePreview>('desktop');

  if (!isOpen) return null;

  const comparisonFeatures = [
    { key: 'rating', label: 'Rating', render: (t: Theme) => <StarRating rating={t.rating} size="sm" /> },
    { key: 'downloads', label: 'Downloads', render: (t: Theme) => t.downloads.toLocaleString() },
    { key: 'price', label: 'Price', render: (t: Theme) => t.price === 'free' ? 'Free' : `$${t.price}` },
    { key: 'version', label: 'Version', render: (t: Theme) => t.version },
    { key: 'lastUpdated', label: 'Last Updated', render: (t: Theme) => t.lastUpdated },
    { key: 'compatibility', label: 'Compatibility', render: (t: Theme) => t.compatibility },
    { key: 'category', label: 'Category', render: (t: Theme) => t.category },
  ];

  const allFeatures = Array.from(new Set(themes.flatMap(t => t.features)));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-[90vw] w-full max-h-[95vh] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Compare Themes</h2>
              <p className="text-sm text-gray-500">Select up to 3 themes to compare features</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Device preview selector */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {[
                  { device: 'desktop' as const, icon: Monitor },
                  { device: 'tablet' as const, icon: Tablet },
                  { device: 'mobile' as const, icon: Smartphone },
                ].map(({ device, icon: Icon }) => (
                  <button
                    key={device}
                    onClick={() => setPreviewDevice(device)}
                    className={clsx(
                      'p-2 rounded-lg transition-colors',
                      previewDevice === device
                        ? 'bg-white dark:bg-gray-700 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-auto max-h-[calc(90vh-80px)]">
            {themes.length === 0 ? (
              <div className="p-12 text-center">
                <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No themes selected</h3>
                <p className="text-gray-500">Click the compare icon on theme cards to add them here</p>
              </div>
            ) : (
              <div className="p-6">
                {/* Theme previews */}
                <div className={clsx('grid gap-4 mb-8', `grid-cols-${Math.min(themes.length, 3)}`)}>
                  {themes.map(theme => (
                    <div key={theme.id} className="relative">
                      <button
                        onClick={() => onRemove(theme.id)}
                        className="absolute -top-2 -right-2 z-10 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className={clsx(
                        'rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mx-auto',
                        previewDevice === 'desktop' && 'w-full',
                        previewDevice === 'tablet' && 'w-[280px]',
                        previewDevice === 'mobile' && 'w-[160px]'
                      )}>
                        <img
                          src={theme.thumbnail}
                          alt={theme.name}
                          className="w-full aspect-[4/3] object-cover"
                        />
                      </div>
                      <h4 className="text-center font-medium mt-3 text-gray-900 dark:text-white">{theme.name}</h4>
                      <p className="text-center text-sm text-gray-500">by {theme.author}</p>
                    </div>
                  ))}
                </div>

                {/* Comparison table */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Feature</th>
                        {themes.map(theme => (
                          <th key={theme.id} className="px-4 py-3 text-center text-sm font-medium text-gray-900 dark:text-white">
                            {theme.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonFeatures.map(feature => (
                        <tr key={feature.key} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{feature.label}</td>
                          {themes.map(theme => (
                            <td key={theme.id} className="px-4 py-3 text-center text-sm text-gray-900 dark:text-white">
                              {feature.render(theme)}
                            </td>
                          ))}
                        </tr>
                      ))}

                      {/* Feature checklist */}
                      <tr className="bg-gray-100 dark:bg-gray-800">
                        <td colSpan={themes.length + 1} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Features
                        </td>
                      </tr>
                      {allFeatures.map(feature => (
                        <tr key={feature} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                          <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{feature}</td>
                          {themes.map(theme => (
                            <td key={theme.id} className="px-4 py-2 text-center">
                              {theme.features.includes(feature) ? (
                                <Check className="w-5 h-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="w-5 h-5 text-gray-300 mx-auto" />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// ENHANCEMENT 3: THEME REVIEWS PANEL
// ============================================

interface ThemeReviewsPanelProps {
  theme: Theme;
  isOpen: boolean;
  onClose: () => void;
}

const ThemeReviewsPanel: React.FC<ThemeReviewsPanelProps> = ({ theme, isOpen, onClose }) => {
  const [sortBy, setSortBy] = useState<'newest' | 'helpful' | 'rating'>('helpful');

  if (!isOpen) return null;

  const sortedReviews = [...theme.reviews].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'helpful') return b.helpful - a.helpful;
    return b.rating - a.rating;
  });

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: theme.reviews.filter(r => Math.floor(r.rating) === rating).length,
    percentage: (theme.reviews.filter(r => Math.floor(r.rating) === rating).length / theme.reviews.length) * 100 || 0,
  }));

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed right-0 top-0 h-full w-[480px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Reviews</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-500">{theme.name}</p>
      </div>

      {/* Rating Overview */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">{theme.rating.toFixed(1)}</div>
            <StarRating rating={theme.rating} size="md" showValue={false} />
            <p className="text-sm text-gray-500 mt-1">{theme.reviewCount} reviews</p>
          </div>
          <div className="flex-1 space-y-1">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-3">{rating}</span>
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
        <span className="text-sm text-gray-500">Sort by:</span>
        {[
          { value: 'helpful', label: 'Most Helpful' },
          { value: 'newest', label: 'Newest' },
          { value: 'rating', label: 'Highest Rated' },
        ].map(option => (
          <button
            key={option.value}
            onClick={() => setSortBy(option.value as any)}
            className={clsx(
              'px-3 py-1 text-sm rounded-full transition-colors',
              sortBy === option.value
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
        {sortedReviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No reviews yet</p>
          </div>
        ) : (
          sortedReviews.map(review => (
            <div key={review.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-start gap-3 mb-3">
                <img src={review.avatar} alt={review.author} className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">{review.author}</span>
                    {review.verified && (
                      <Badge variant="success">
                        <Check className="w-3 h-3 inline mr-0.5" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StarRating rating={review.rating} size="sm" showValue={false} />
                    <span className="text-xs text-gray-500">{review.date}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{review.content}</p>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  Helpful ({review.helpful})
                </button>
                <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  <ThumbsDown className="w-4 h-4" />
                  ({review.notHelpful})
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Write Review Button */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
        <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Write a Review
        </button>
      </div>
    </motion.div>
  );
};

// ============================================
// ENHANCEMENT 5: SEARCH WITH AUTOCOMPLETE
// ============================================

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  themes: Theme[];
  onSelectTheme: (theme: Theme) => void;
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  value,
  onChange,
  themes,
  onSelectTheme,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    if (!value.trim()) return [];
    const query = value.toLowerCase();
    return themes
      .filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.author.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query)) ||
        t.category.toLowerCase().includes(query)
      )
      .slice(0, 6);
  }, [value, themes]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      onSelectTheme(suggestions[selectedIndex]);
      setIsFocused(false);
    } else if (e.key === 'Escape') {
      setIsFocused(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => {
            onChange(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder="Search themes by name, author, or tag..."
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {value && (
          <button
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      <AnimatePresence>
        {isFocused && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50"
          >
            {suggestions.map((theme, idx) => (
              <button
                key={theme.id}
                onClick={() => {
                  onSelectTheme(theme);
                  setIsFocused(false);
                }}
                className={clsx(
                  'w-full flex items-center gap-3 p-3 text-left transition-colors',
                  idx === selectedIndex
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                <img src={theme.thumbnail} alt={theme.name} className="w-12 h-9 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{theme.name}</p>
                  <p className="text-sm text-gray-500 truncate">by {theme.author} • {theme.category}</p>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  {theme.rating.toFixed(1)}
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// ENHANCEMENT 6: FEATURED THEME CAROUSEL
// ============================================

interface FeaturedCarouselProps {
  themes: Theme[];
  onPreview: (theme: Theme) => void;
  onInstall: (theme: Theme) => void;
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ themes, onPreview, onInstall }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const featuredThemes = themes.filter(t => t.isFeatured);

  useEffect(() => {
    if (isAutoPlaying && featuredThemes.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % featuredThemes.length);
      }, 5000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoPlaying, featuredThemes.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const goNext = () => {
    setCurrentIndex(prev => (prev + 1) % featuredThemes.length);
    setIsAutoPlaying(false);
  };

  const goPrev = () => {
    setCurrentIndex(prev => (prev - 1 + featuredThemes.length) % featuredThemes.length);
    setIsAutoPlaying(false);
  };

  if (featuredThemes.length === 0) return null;

  const currentTheme = featuredThemes[currentIndex];

  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl overflow-hidden mb-8">
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative flex items-stretch min-h-[400px]">
        {/* Content */}
        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTheme.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="premium">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Featured Theme
                </Badge>
                {currentTheme.isPremium && (
                  <Badge variant="warning">
                    <Crown className="w-3 h-3 inline mr-1" />
                    Premium
                  </Badge>
                )}
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">{currentTheme.name}</h2>
              <p className="text-lg text-white/80 mb-4 max-w-lg">{currentTheme.description}</p>

              <div className="flex items-center gap-4 mb-6">
                <StarRating rating={currentTheme.rating} size="lg" />
                <span className="text-white/70">({currentTheme.reviewCount} reviews)</span>
                <span className="text-white/70 flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  {currentTheme.downloads.toLocaleString()} downloads
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {currentTheme.features.slice(0, 4).map(feature => (
                  <span key={feature} className="px-3 py-1 bg-white/20 text-white rounded-full text-sm flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    {feature}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onPreview(currentTheme)}
                  className="px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Live Preview
                </button>
                <button
                  onClick={() => onInstall(currentTheme)}
                  className="px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors flex items-center gap-2 backdrop-blur-sm"
                >
                  <Download className="w-5 h-5" />
                  {currentTheme.price === 'free' ? 'Install Free' : `Get for $${currentTheme.price}`}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Preview Image */}
        <div className="hidden lg:block w-[500px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTheme.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-4 rounded-xl overflow-hidden shadow-2xl"
            >
              <img
                src={currentTheme.thumbnail}
                alt={currentTheme.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-4 left-8 lg:left-12 flex items-center gap-3">
        {/* Dots */}
        <div className="flex gap-2">
          {featuredThemes.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={clsx(
                'w-2 h-2 rounded-full transition-all',
                idx === currentIndex ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'
              )}
            />
          ))}
        </div>

        {/* Play/Pause */}
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
        >
          {isAutoPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white" />}
        </button>
      </div>

      {/* Arrows */}
      <button
        onClick={goPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
      >
        <ChevronLeft className="w-6 h-6 text-white" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm"
      >
        <ChevronRight className="w-6 h-6 text-white" />
      </button>
    </div>
  );
};

// ============================================
// ENHANCEMENT 4: TAG FILTERING CHIPS
// ============================================

interface TagFilterProps {
  allTags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearAll: () => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ allTags, selectedTags, onToggleTag, onClearAll }) => {
  const [showAll, setShowAll] = useState(false);
  const displayedTags = showAll ? allTags : allTags.slice(0, 12);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
          <Tag className="w-4 h-4" />
          Filter by Tags
        </h3>
        {selectedTags.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {displayedTags.map(tag => (
          <button
            key={tag}
            onClick={() => onToggleTag(tag)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              selectedTags.includes(tag)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {tag}
            {selectedTags.includes(tag) && <X className="w-3 h-3 inline ml-1" />}
          </button>
        ))}
        {allTags.length > 12 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700"
          >
            {showAll ? 'Show less' : `+${allTags.length - 12} more`}
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================
// GIT THEMES PANEL - Clone & Manage Git Themes
// ============================================

interface GitTheme {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  repository: string;
  branch: string;
  lastCommit: string;
  lastCommitDate: string;
  thumbnail?: string;
  isInstalled: boolean;
  isActive: boolean;
  tags: string[];
}

interface GitRepository {
  url: string;
  name: string;
  branch: string;
  isConnected: boolean;
  lastFetched?: string;
  themes: GitTheme[];
}

interface GitThemesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onInstallTheme: (theme: GitTheme) => void;
  onActivateTheme: (theme: GitTheme) => void;
}

const GitThemesPanel: React.FC<GitThemesPanelProps> = ({
  isOpen,
  onClose,
  onInstallTheme,
  onActivateTheme,
}) => {
  const [repositories, setRepositories] = useState<GitRepository[]>([
    {
      url: 'https://github.com/rustpress-net/themes.git',
      name: 'RustPress Official Themes',
      branch: 'main',
      isConnected: true,
      lastFetched: '2025-01-10 14:30',
      themes: [
        {
          id: 'git-theme-1',
          name: 'RustPress Enterprise',
          description: 'The premium enterprise theme for RustPress CMS',
          version: '2.4.0',
          author: 'RustPress Team',
          repository: 'https://github.com/rustpress-net/themes.git',
          branch: 'main',
          lastCommit: 'a3f2e1b',
          lastCommitDate: '2025-01-08',
          thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop',
          isInstalled: true,
          isActive: true,
          tags: ['business', 'corporate', 'enterprise'],
        },
        {
          id: 'git-theme-2',
          name: 'Starter Clean',
          description: 'Minimal starter theme with clean design principles',
          version: '1.5.2',
          author: 'RustPress Team',
          repository: 'https://github.com/rustpress-net/themes.git',
          branch: 'main',
          lastCommit: 'b7c4d2e',
          lastCommitDate: '2025-01-05',
          thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop',
          isInstalled: true,
          isActive: false,
          tags: ['minimal', 'starter', 'clean'],
        },
        {
          id: 'git-theme-3',
          name: 'Business Corporate',
          description: 'Professional theme for corporate and business websites',
          version: '3.0.0',
          author: 'RustPress Team',
          repository: 'https://github.com/rustpress-net/themes.git',
          branch: 'main',
          lastCommit: 'c9d8e3f',
          lastCommitDate: '2025-01-09',
          thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop',
          isInstalled: false,
          isActive: false,
          tags: ['business', 'corporate', 'professional'],
        },
      ],
    },
  ]);

  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [newRepoBranch, setNewRepoBranch] = useState('main');
  const [isCloning, setIsCloning] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(
    repositories[0]?.url || null
  );
  const [activeTab, setActiveTab] = useState<'installed' | 'available' | 'add'>('installed');

  const currentRepo = repositories.find((r) => r.url === selectedRepo);

  const handleAddRepository = async () => {
    if (!newRepoUrl.trim()) {
      toast.error('Please enter a repository URL');
      return;
    }

    // Check if already added
    if (repositories.some((r) => r.url === newRepoUrl)) {
      toast.error('Repository already added');
      return;
    }

    setIsCloning(true);

    // Simulate cloning
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const repoName = newRepoUrl.split('/').pop()?.replace('.git', '') || 'Unknown';

    const newRepo: GitRepository = {
      url: newRepoUrl,
      name: repoName,
      branch: newRepoBranch,
      isConnected: true,
      lastFetched: new Date().toLocaleString(),
      themes: [],
    };

    setRepositories((prev) => [...prev, newRepo]);
    setNewRepoUrl('');
    setNewRepoBranch('main');
    setSelectedRepo(newRepoUrl);
    setIsCloning(false);
    setActiveTab('available');
    toast.success(`Repository "${repoName}" connected successfully!`);
  };

  const handleFetchUpdates = async () => {
    if (!currentRepo) return;

    setIsFetching(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setRepositories((prev) =>
      prev.map((r) =>
        r.url === currentRepo.url
          ? { ...r, lastFetched: new Date().toLocaleString() }
          : r
      )
    );

    setIsFetching(false);
    toast.success('Repository updated successfully!');
  };

  const handleRemoveRepository = (url: string) => {
    setRepositories((prev) => prev.filter((r) => r.url !== url));
    if (selectedRepo === url) {
      setSelectedRepo(repositories[0]?.url || null);
    }
    toast.success('Repository removed');
  };

  const installedThemes = currentRepo?.themes.filter((t) => t.isInstalled) || [];
  const availableThemes = currentRepo?.themes.filter((t) => !t.isInstalled) || [];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-600/10 to-blue-600/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
                <FolderGit2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Git Theme Repositories
                </h2>
                <p className="text-sm text-gray-500">
                  Clone and manage themes from Git repositories
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Repository Selector */}
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <select
                value={selectedRepo || ''}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {repositories.map((repo) => (
                  <option key={repo.url} value={repo.url}>
                    {repo.name} ({repo.branch})
                  </option>
                ))}
              </select>
              {currentRepo && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <GitBranch className="w-4 h-4" />
                  <span>{currentRepo.branch}</span>
                  {currentRepo.lastFetched && (
                    <>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <Clock className="w-4 h-4" />
                      <span>Last fetched: {currentRepo.lastFetched}</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleFetchUpdates}
                disabled={isFetching}
                className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isFetching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Fetch Updates
              </button>
              {currentRepo && repositories.length > 1 && (
                <button
                  onClick={() => handleRemoveRepository(currentRepo.url)}
                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="Remove repository"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
            {[
              { id: 'installed', label: 'Installed', icon: Package, count: installedThemes.length },
              { id: 'available', label: 'Available', icon: CloudDownload, count: availableThemes.length },
              { id: 'add', label: 'Add Repository', icon: Link },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  'px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all',
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={clsx(
                    'px-1.5 py-0.5 rounded text-xs',
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'add' ? (
            <div className="max-w-xl mx-auto">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-purple-600" />
                  Connect Git Repository
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Add a Git repository containing RustPress themes. The repository should have a
                  valid theme manifest in its root directory.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Repository URL
                    </label>
                    <input
                      type="text"
                      value={newRepoUrl}
                      onChange={(e) => setNewRepoUrl(e.target.value)}
                      placeholder="https://github.com/username/themes.git"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Branch
                    </label>
                    <input
                      type="text"
                      value={newRepoBranch}
                      onChange={(e) => setNewRepoBranch(e.target.value)}
                      placeholder="main"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={handleAddRepository}
                    disabled={isCloning || !newRepoUrl.trim()}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCloning ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Link className="w-5 h-5" />
                        Connect Repository
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Popular Theme Repositories
                  </h4>
                  <div className="space-y-2">
                    {[
                      { name: 'RustPress Official', url: 'https://github.com/rustpress-net/themes.git' },
                      { name: 'Community Themes', url: 'https://github.com/rustpress-community/themes.git' },
                    ].map((repo) => (
                      <button
                        key={repo.url}
                        onClick={() => setNewRepoUrl(repo.url)}
                        className="w-full px-3 py-2 text-left text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-400 dark:hover:border-purple-600 transition-colors flex items-center justify-between group"
                      >
                        <span className="text-gray-700 dark:text-gray-300">{repo.name}</span>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(activeTab === 'installed' ? installedThemes : availableThemes).length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {activeTab === 'installed' ? 'No installed themes' : 'No available themes'}
                  </h3>
                  <p className="text-gray-500">
                    {activeTab === 'installed'
                      ? 'Install themes from the Available tab'
                      : 'All themes from this repository are installed'}
                  </p>
                </div>
              ) : (
                (activeTab === 'installed' ? installedThemes : availableThemes).map((theme) => (
                  <motion.div
                    key={theme.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all group"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden">
                      {theme.thumbnail ? (
                        <img
                          src={theme.thumbnail}
                          alt={theme.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                          <Palette className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      {/* Status badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {theme.isActive && (
                          <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </div>
                      {/* Git info overlay */}
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                        <div className="flex items-center gap-2 text-xs text-white/80">
                          <GitCommit className="w-3 h-3" />
                          <span>{theme.lastCommit}</span>
                          <span>•</span>
                          <span>{theme.lastCommitDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {theme.name}
                          </h4>
                          <p className="text-sm text-gray-500">v{theme.version} by {theme.author}</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {theme.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {theme.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      {theme.isInstalled ? (
                        theme.isActive ? (
                          <button className="w-full py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg font-medium flex items-center justify-center gap-2 cursor-default">
                            <Check className="w-4 h-4" />
                            Currently Active
                          </button>
                        ) : (
                          <button
                            onClick={() => onActivateTheme(theme)}
                            className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <Zap className="w-4 h-4" />
                            Activate Theme
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => onInstallTheme(theme)}
                          className="w-full py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Install Theme
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {repositories.length} repositor{repositories.length === 1 ? 'y' : 'ies'} connected
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// ENHANCEMENT 7 & 8: VIEW TOGGLE & SORT OPTIONS
// ============================================

interface ToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  resultCount: number;
  selectedCategory: string | null;
  categories: string[];
  onCategoryChange: (category: string | null) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  viewMode,
  onViewModeChange,
  sortOption,
  onSortChange,
  resultCount,
  selectedCategory,
  categories,
  onCategoryChange,
}) => {
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const sortOptions: { value: SortOption; label: string; icon: any }[] = [
    { value: 'popular', label: 'Most Popular', icon: TrendingUp },
    { value: 'newest', label: 'Newest', icon: Calendar },
    { value: 'rating', label: 'Highest Rated', icon: Star },
    { value: 'name', label: 'Name (A-Z)', icon: ArrowUpDown },
    { value: 'downloads', label: 'Most Downloads', icon: Download },
  ];

  const currentSort = sortOptions.find(s => s.value === sortOption);

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-800 mb-6">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">
          {resultCount} theme{resultCount !== 1 ? 's' : ''} found
        </span>

        {/* Category Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedCategory || 'All Categories'}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          <AnimatePresence>
            {showCategoryDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-40 overflow-hidden"
              >
                <button
                  onClick={() => {
                    onCategoryChange(null);
                    setShowCategoryDropdown(false);
                  }}
                  className={clsx(
                    'w-full px-4 py-2 text-left text-sm transition-colors',
                    !selectedCategory
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  )}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      onCategoryChange(cat);
                      setShowCategoryDropdown(false);
                    }}
                    className={clsx(
                      'w-full px-4 py-2 text-left text-sm transition-colors',
                      selectedCategory === cat
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {currentSort && <currentSort.icon className="w-4 h-4 text-gray-500" />}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{currentSort?.label}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          <AnimatePresence>
            {showSortDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-40 overflow-hidden"
              >
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.value);
                      setShowSortDropdown(false);
                    }}
                    className={clsx(
                      'w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors',
                      sortOption === option.value
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    )}
                  >
                    <option.icon className="w-4 h-4" />
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              viewMode === 'grid'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
            title="Grid view"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            )}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// THEME PREVIEW MODAL
// ============================================

interface ThemePreviewModalProps {
  theme: Theme | null;
  isOpen: boolean;
  onClose: () => void;
  onActivate: (theme: Theme) => void;
  onInstall: (theme: Theme) => void;
  onShowReviews: (theme: Theme) => void;
}

const ThemePreviewModal: React.FC<ThemePreviewModalProps> = ({
  theme,
  isOpen,
  onClose,
  onActivate,
  onInstall,
  onShowReviews,
}) => {
  const [previewDevice, setPreviewDevice] = useState<DevicePreview>('desktop');
  const [currentScreenshot, setCurrentScreenshot] = useState(0);

  if (!isOpen || !theme) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-white">{theme.name}</h2>
            <p className="text-sm text-gray-400">by {theme.author}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Device selector */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            {[
              { device: 'desktop' as const, icon: Monitor, label: 'Desktop' },
              { device: 'tablet' as const, icon: Tablet, label: 'Tablet' },
              { device: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
            ].map(({ device, icon: Icon, label }) => (
              <button
                key={device}
                onClick={() => setPreviewDevice(device)}
                className={clsx(
                  'px-3 py-2 rounded-lg flex items-center gap-2 transition-colors',
                  previewDevice === device
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => onShowReviews(theme)}
            className="px-4 py-2 text-gray-300 hover:text-white flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Reviews ({theme.reviewCount})
          </button>

          <a
            href={theme.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-gray-300 hover:text-white flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open in New Tab
          </a>

          {theme.isInstalled ? (
            theme.isActive ? (
              <span className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium flex items-center gap-2">
                <Check className="w-4 h-4" />
                Active
              </span>
            ) : (
              <button
                onClick={() => onActivate(theme)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Activate Theme
              </button>
            )
          ) : (
            <button
              onClick={() => onInstall(theme)}
              className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {theme.price === 'free' ? 'Install' : `Buy - $${theme.price}`}
            </button>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div
          className={clsx(
            'bg-white rounded-lg overflow-hidden shadow-2xl transition-all duration-300',
            previewDevice === 'desktop' && 'w-full max-w-[1400px] h-[800px]',
            previewDevice === 'tablet' && 'w-[768px] h-[1024px]',
            previewDevice === 'mobile' && 'w-[375px] h-[667px]'
          )}
        >
          <img
            src={theme.screenshots[currentScreenshot]?.url || theme.thumbnail}
            alt={theme.name}
            className="w-full h-full object-cover object-top"
          />
        </div>
      </div>

      {/* Screenshot Navigation */}
      {theme.screenshots.length > 1 && (
        <div className="flex items-center justify-center gap-3 py-4 bg-gray-900 border-t border-gray-800">
          {theme.screenshots.map((screenshot, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentScreenshot(idx)}
              className={clsx(
                'relative rounded-lg overflow-hidden transition-all',
                idx === currentScreenshot
                  ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900'
                  : 'opacity-50 hover:opacity-75'
              )}
            >
              <img
                src={screenshot.url}
                alt={screenshot.label}
                className="w-24 h-16 object-cover"
              />
              <span className="absolute bottom-0 inset-x-0 py-0.5 bg-black/60 text-white text-xs text-center">
                {screenshot.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ============================================
// MAIN THEMES PAGE COMPONENT
// ============================================

export default function Themes() {
  // State
  const [themes] = useState<Theme[]>(sampleThemes);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('popular');
  const [compareThemes, setCompareThemes] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);
  const [reviewsTheme, setReviewsTheme] = useState<Theme | null>(null);
  const [showColorCustomizer, setShowColorCustomizer] = useState(false);
  const [showTypographyCustomizer, setShowTypographyCustomizer] = useState(false);
  const [showLayoutBuilder, setShowLayoutBuilder] = useState(false);
  const [showGitPanel, setShowGitPanel] = useState(false);
  const [themeColors, setThemeColors] = useState({
    primary: '#3B82F6',
    secondary: '#6366F1',
    accent: '#8B5CF6',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  });
  const [typographySettings, setTypographySettings] = useState({
    headingFont: 'Inter',
    headingWeight: 700,
    bodyFont: 'Inter',
    bodyWeight: 400,
    scale: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
    },
    spacing: {
      lineHeight: 1.6,
      letterSpacing: 0,
      wordSpacing: 0,
      paragraphSpacing: 1.5,
    },
    responsive: {
      mobile: { xs: 10, sm: 12, base: 14, lg: 16, xl: 18, '2xl': 20, '3xl': 24, '4xl': 28, '5xl': 36 },
      tablet: { xs: 11, sm: 13, base: 15, lg: 17, xl: 19, '2xl': 22, '3xl': 27, '4xl': 32, '5xl': 42 },
      desktop: { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48 },
    },
  });
  const [layoutSettings, setLayoutSettings] = useState({
    header: {
      layout: 'split' as const,
      sticky: true,
      transparent: false,
      showLogo: true,
      showSearch: true,
      showCart: true,
      showUser: true,
      menuPosition: 'center' as const,
      ctaButton: { show: true, text: 'Get Started', link: '#' },
    },
    footer: {
      layout: 'columns' as const,
      columns: 4,
      showLogo: true,
      showSocial: true,
      showNewsletter: true,
      showCopyright: true,
      copyrightText: '© 2025 RustPress. All rights reserved.',
      socialLinks: [],
    },
    blocks: [
      {
        id: 'hero-1',
        type: 'hero' as const,
        name: 'Hero Section',
        columns: 12,
        rows: 1,
        padding: { top: 64, right: 32, bottom: 64, left: 32 },
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        isLocked: false,
        isVisible: true,
        responsive: {
          mobile: { columns: 12, visible: true },
          tablet: { columns: 12, visible: true },
          desktop: { columns: 12, visible: true },
        },
      },
    ],
    grid: {
      mobile: { columns: 4, gap: 16, rowGap: 16, columnGap: 16 },
      tablet: { columns: 8, gap: 20, rowGap: 20, columnGap: 20 },
      desktop: { columns: 12, gap: 24, rowGap: 24, columnGap: 24 },
    },
    spacing: {
      id: 'comfortable',
      name: 'Comfortable',
      values: { xs: 8, sm: 16, md: 24, lg: 32, xl: 48, '2xl': 64 },
    },
    widgetAreas: [
      { id: 'sidebar-right', name: 'Right Sidebar', position: 'sidebar-right' as const, widgets: [] },
      { id: 'footer-widgets', name: 'Footer Widgets', position: 'footer' as const, widgets: [] },
    ],
  });

  // Filter and sort themes
  const filteredThemes = useMemo(() => {
    let result = [...themes];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.author.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Tag filter
    if (selectedTags.length > 0) {
      result = result.filter(t =>
        selectedTags.every(tag => t.tags.includes(tag))
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter(t => t.category === selectedCategory);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case 'popular':
          return b.downloads - a.downloads;
        case 'newest':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'downloads':
          return b.downloads - a.downloads;
        default:
          return 0;
      }
    });

    return result;
  }, [themes, searchQuery, selectedTags, selectedCategory, sortOption]);

  // Handlers
  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleToggleCompare = (theme: Theme) => {
    setCompareThemes(prev => {
      if (prev.includes(theme.id)) {
        return prev.filter(id => id !== theme.id);
      }
      if (prev.length >= 3) {
        toast.error('You can compare up to 3 themes at a time');
        return prev;
      }
      return [...prev, theme.id];
    });
  };

  const handlePreview = (theme: Theme) => {
    setPreviewTheme(theme);
  };

  const handleActivate = (theme: Theme) => {
    toast.success(`${theme.name} has been activated!`);
  };

  const handleInstall = (theme: Theme) => {
    if (theme.price === 'free') {
      toast.success(`Installing ${theme.name}...`);
    } else {
      toast(`Redirecting to purchase ${theme.name}...`);
    }
  };

  const handleSelectFromSearch = (theme: Theme) => {
    setSearchQuery(theme.name);
    handlePreview(theme);
  };

  const handleGitThemeInstall = (gitTheme: GitTheme) => {
    toast.success(`Installing ${gitTheme.name} from Git repository...`);
    // In production, this would trigger actual git clone/checkout
  };

  const handleGitThemeActivate = (gitTheme: GitTheme) => {
    toast.success(`${gitTheme.name} has been activated!`);
    // In production, this would update the active theme
  };

  const compareThemeObjects = themes.filter(t => compareThemes.includes(t.id));

  // Themes formatted for WorkflowTools comparison
  const themesForComparison = useMemo(() => {
    return themes.map(theme => ({
      id: theme.id,
      name: theme.name,
      thumbnail: theme.thumbnail,
      colors: {
        primary: '#3B82F6',
        secondary: '#6366F1',
        accent: '#8B5CF6',
        background: '#FFFFFF',
        text: '#111827',
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        baseSize: '16px',
      },
      features: theme.features,
    }));
  }, [themes]);

  // Combined state for workflow tools
  const workflowState = useMemo(() => ({
    themeColors,
    typographySettings,
    layoutSettings,
  }), [themeColors, typographySettings, layoutSettings]);

  const handleWorkflowStateChange = useCallback((newState: any) => {
    if (newState.themeColors) setThemeColors(newState.themeColors);
    if (newState.typographySettings) setTypographySettings(newState.typographySettings);
    if (newState.layoutSettings) setLayoutSettings(newState.layoutSettings);
  }, []);

  return (
    <WorkflowTools
      initialState={workflowState}
      onStateChange={handleWorkflowStateChange}
      themes={themesForComparison}
    >
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Palette className="w-8 h-8 text-blue-600" />
                Themes
              </h1>
              <p className="text-gray-500 mt-1">Browse, install, and customize themes for your site</p>
            </div>
            <div className="flex items-center gap-3">
              {compareThemes.length > 0 && (
                <button
                  onClick={() => setShowComparison(true)}
                  className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <Layers className="w-4 h-4" />
                  Compare ({compareThemes.length})
                </button>
              )}
              <button
                onClick={() => setShowColorCustomizer(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2"
              >
                <Palette className="w-4 h-4" />
                Colors
              </button>
              <button
                onClick={() => setShowTypographyCustomizer(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Typography
              </button>
              <button
                onClick={() => setShowLayoutBuilder(true)}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg font-medium hover:from-cyan-700 hover:to-teal-700 transition-all flex items-center gap-2"
              >
                <Layout className="w-4 h-4" />
                Layout
              </button>
              <button
                onClick={() => setShowGitPanel(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2"
              >
                <FolderGit2 className="w-4 h-4" />
                Git Repos
              </button>
              <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Theme
              </button>
            </div>
          </div>

          {/* Search */}
          <SearchAutocomplete
            value={searchQuery}
            onChange={setSearchQuery}
            themes={themes}
            onSelectTheme={handleSelectFromSearch}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Featured Carousel */}
        <FeaturedCarousel
          themes={themes}
          onPreview={handlePreview}
          onInstall={handleInstall}
        />

        {/* Tag Filter */}
        <div className="mb-6">
          <TagFilter
            allTags={allTags}
            selectedTags={selectedTags}
            onToggleTag={handleToggleTag}
            onClearAll={() => setSelectedTags([])}
          />
        </div>

        {/* Toolbar */}
        <Toolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortOption={sortOption}
          onSortChange={setSortOption}
          resultCount={filteredThemes.length}
          selectedCategory={selectedCategory}
          categories={allCategories}
          onCategoryChange={setSelectedCategory}
        />

        {/* Theme Grid/List */}
        <AnimatePresence mode="popLayout">
          {filteredThemes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No themes found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTags([]);
                  setSelectedCategory(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Clear all filters
              </button>
            </motion.div>
          ) : (
            <div className={clsx(
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            )}>
              {filteredThemes.map(theme => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  viewMode={viewMode}
                  onPreview={handlePreview}
                  onActivate={handleActivate}
                  onInstall={handleInstall}
                  onCompare={handleToggleCompare}
                  isCompareSelected={compareThemes.includes(theme.id)}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals & Panels */}
      <ThemeComparisonModal
        themes={compareThemeObjects}
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        onRemove={(id) => setCompareThemes(prev => prev.filter(t => t !== id))}
      />

      <AnimatePresence>
        {previewTheme && (
          <EnhancedThemePreview
            theme={previewTheme}
            currentTheme={themes.find(t => t.isActive)}
            isOpen={!!previewTheme}
            onClose={() => setPreviewTheme(null)}
            onActivate={handleActivate}
            onInstall={handleInstall}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reviewsTheme && (
          <ThemeReviewsPanel
            theme={reviewsTheme}
            isOpen={!!reviewsTheme}
            onClose={() => setReviewsTheme(null)}
          />
        )}
      </AnimatePresence>

      {/* Color Customizer Modal */}
      <AnimatePresence>
        {showColorCustomizer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2"
            onClick={() => setShowColorCustomizer(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ColorCustomizer
                colors={themeColors}
                onColorsChange={setThemeColors}
                onClose={() => setShowColorCustomizer(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Typography Customizer Modal */}
      <AnimatePresence>
        {showTypographyCustomizer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2"
            onClick={() => setShowTypographyCustomizer(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <TypographyCustomizer
                settings={typographySettings}
                onSettingsChange={setTypographySettings}
                onClose={() => setShowTypographyCustomizer(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layout Builder Modal */}
      <AnimatePresence>
        {showLayoutBuilder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2"
            onClick={() => setShowLayoutBuilder(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <LayoutBuilder
                settings={layoutSettings}
                onSettingsChange={setLayoutSettings}
                onClose={() => setShowLayoutBuilder(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Git Themes Panel */}
      <AnimatePresence>
        <GitThemesPanel
          isOpen={showGitPanel}
          onClose={() => setShowGitPanel(false)}
          onInstallTheme={handleGitThemeInstall}
          onActivateTheme={handleGitThemeActivate}
        />
      </AnimatePresence>
    </div>
    </WorkflowTools>
  );
}
