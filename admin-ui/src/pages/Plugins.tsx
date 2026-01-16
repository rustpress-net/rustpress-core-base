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
  Power,
  PowerOff,
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
  Package,
  History,
  CloudDownload,
  Puzzle,
  Globe,
  Lock,
  FileText,
  BarChart3,
  Mail,
  ShoppingCart,
  Database,
  Cpu,
  Palette,
  Bell,
  Link,
  Plus,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

// ============================================
// TYPES & INTERFACES
// ============================================

interface PluginScreenshot {
  url: string;
  label: string;
}

interface PluginReview {
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

interface Plugin {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  version: string;
  author: string;
  authorUrl: string;
  icon: string;
  iconBg: string;
  screenshots: PluginScreenshot[];
  rating: number;
  reviewCount: number;
  downloads: number;
  activeInstalls: number;
  price: number | 'free';
  tags: string[];
  category: string;
  features: string[];
  requirements: string[];
  lastUpdated: string;
  compatibility: string;
  isActive: boolean;
  isInstalled: boolean;
  isFeatured: boolean;
  isPremium: boolean;
  reviews: PluginReview[];
  docsUrl: string;
  supportUrl: string;
  changelog: { version: string; date: string; changes: string[] }[];
}

type ViewMode = 'grid' | 'list';
type SortOption = 'popular' | 'newest' | 'rating' | 'name' | 'downloads';
type TabView = 'browse' | 'installed' | 'updates';

// ============================================
// SAMPLE DATA
// ============================================

const samplePlugins: Plugin[] = [
  {
    id: '1',
    name: 'SEO Optimizer Pro',
    slug: 'seo-optimizer-pro',
    description: 'Complete SEO toolkit with meta tags, sitemaps, schema markup, and analytics integration.',
    longDescription: 'SEO Optimizer Pro is the most comprehensive SEO plugin for RustPress. It includes everything you need to optimize your site for search engines including automatic meta tags, XML sitemaps, JSON-LD schema markup, social media integration, and real-time SEO analysis.',
    version: '3.2.1',
    author: 'RustPress Team',
    authorUrl: 'https://rustpress.io',
    icon: 'TrendingUp',
    iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
    screenshots: [
      { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop', label: 'Dashboard' },
      { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop', label: 'Analytics' },
      { url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=500&fit=crop', label: 'Settings' },
    ],
    rating: 4.9,
    reviewCount: 1247,
    downloads: 89432,
    activeInstalls: 45000,
    price: 'free',
    tags: ['seo', 'analytics', 'meta-tags', 'sitemap', 'schema'],
    category: 'SEO',
    features: ['Auto Meta Tags', 'XML Sitemaps', 'Schema Markup', 'Google Analytics', 'Social Previews', 'Keyword Analysis'],
    requirements: ['RustPress 1.0+', 'PHP 8.0+'],
    lastUpdated: '2025-12-20',
    compatibility: '1.0+',
    isActive: true,
    isInstalled: true,
    isFeatured: true,
    isPremium: false,
    docsUrl: 'https://docs.rustpress.io/seo-optimizer',
    supportUrl: 'https://support.rustpress.io',
    reviews: [
      { id: 'r1', author: 'Mike Chen', avatar: 'https://i.pravatar.cc/100?img=11', rating: 5, date: '2025-12-18', content: 'Best SEO plugin I have ever used. Easy setup and great results!', helpful: 56, notHelpful: 2, verified: true },
      { id: 'r2', author: 'Lisa Park', avatar: 'https://i.pravatar.cc/100?img=12', rating: 5, date: '2025-12-15', content: 'Improved my rankings significantly within 2 weeks.', helpful: 34, notHelpful: 1, verified: true },
    ],
    changelog: [
      { version: '3.2.1', date: '2025-12-20', changes: ['Fixed sitemap generation bug', 'Improved performance'] },
      { version: '3.2.0', date: '2025-12-10', changes: ['Added Google Analytics 4 support', 'New keyword density checker'] },
    ],
  },
  {
    id: '2',
    name: 'Cache Manager',
    slug: 'cache-manager',
    description: 'High-performance caching for pages, database queries, and object caching.',
    longDescription: 'Cache Manager provides enterprise-grade caching capabilities for RustPress. It supports page caching, database query caching, object caching with Redis/Memcached, and CDN integration.',
    version: '2.1.0',
    author: 'Performance Labs',
    authorUrl: 'https://performancelabs.io',
    icon: 'Zap',
    iconBg: 'bg-gradient-to-br from-yellow-500 to-orange-600',
    screenshots: [
      { url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=500&fit=crop', label: 'Cache Stats' },
      { url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&h=500&fit=crop', label: 'Settings' },
    ],
    rating: 4.8,
    reviewCount: 856,
    downloads: 67234,
    activeInstalls: 32000,
    price: 'free',
    tags: ['cache', 'performance', 'speed', 'optimization', 'redis'],
    category: 'Performance',
    features: ['Page Caching', 'Database Caching', 'Object Caching', 'CDN Integration', 'Cache Preloading', 'Minification'],
    requirements: ['RustPress 1.0+'],
    lastUpdated: '2025-12-18',
    compatibility: '1.0+',
    isActive: true,
    isInstalled: true,
    isFeatured: true,
    isPremium: false,
    docsUrl: 'https://docs.rustpress.io/cache-manager',
    supportUrl: 'https://support.rustpress.io',
    reviews: [],
    changelog: [],
  },
  {
    id: '3',
    name: 'WooCommerce Integration',
    slug: 'woocommerce-integration',
    description: 'Full e-commerce capabilities with product management, cart, and checkout.',
    longDescription: 'Transform your RustPress site into a full-featured online store with WooCommerce Integration. Includes product management, shopping cart, secure checkout, payment gateways, and inventory management.',
    version: '4.0.2',
    author: 'Commerce Labs',
    authorUrl: 'https://commercelabs.io',
    icon: 'ShoppingCart',
    iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600',
    screenshots: [
      { url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&h=500&fit=crop', label: 'Shop' },
      { url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=500&fit=crop', label: 'Product' },
      { url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=500&fit=crop', label: 'Cart' },
    ],
    rating: 4.7,
    reviewCount: 2341,
    downloads: 156789,
    activeInstalls: 78000,
    price: 79,
    tags: ['ecommerce', 'shop', 'payments', 'products', 'cart'],
    category: 'E-Commerce',
    features: ['Product Management', 'Shopping Cart', 'Multiple Payment Gateways', 'Inventory', 'Shipping Zones', 'Tax Calculation'],
    requirements: ['RustPress 1.0+', 'SSL Certificate'],
    lastUpdated: '2025-12-19',
    compatibility: '1.0+',
    isActive: false,
    isInstalled: true,
    isFeatured: true,
    isPremium: true,
    docsUrl: 'https://docs.rustpress.io/woocommerce',
    supportUrl: 'https://support.rustpress.io',
    reviews: [],
    changelog: [],
  },
  {
    id: '4',
    name: 'Contact Forms',
    slug: 'contact-forms',
    description: 'Drag-and-drop form builder with submissions, notifications, and integrations.',
    longDescription: 'Create beautiful, responsive forms with our intuitive drag-and-drop builder. Includes field validation, spam protection, email notifications, CRM integrations, and submission management.',
    version: '2.5.3',
    author: 'FormCraft',
    authorUrl: 'https://formcraft.io',
    icon: 'Mail',
    iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
    screenshots: [
      { url: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=500&fit=crop', label: 'Form Builder' },
    ],
    rating: 4.6,
    reviewCount: 567,
    downloads: 45678,
    activeInstalls: 23000,
    price: 'free',
    tags: ['forms', 'contact', 'email', 'submissions', 'builder'],
    category: 'Forms',
    features: ['Drag & Drop Builder', 'Field Validation', 'reCAPTCHA', 'Email Notifications', 'File Uploads', 'Conditional Logic'],
    requirements: ['RustPress 1.0+'],
    lastUpdated: '2025-12-15',
    compatibility: '1.0+',
    isActive: true,
    isInstalled: true,
    isFeatured: false,
    isPremium: false,
    docsUrl: 'https://docs.rustpress.io/contact-forms',
    supportUrl: 'https://support.rustpress.io',
    reviews: [],
    changelog: [],
  },
  {
    id: '5',
    name: 'Analytics Dashboard',
    slug: 'analytics-dashboard',
    description: 'Beautiful analytics dashboard with traffic insights, user behavior, and custom reports.',
    longDescription: 'Get deep insights into your website traffic with our comprehensive analytics dashboard. Track page views, user behavior, referrers, and create custom reports.',
    version: '1.8.0',
    author: 'DataViz Inc',
    authorUrl: 'https://dataviz.io',
    icon: 'BarChart3',
    iconBg: 'bg-gradient-to-br from-indigo-500 to-violet-600',
    screenshots: [
      { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop', label: 'Dashboard' },
      { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop', label: 'Reports' },
    ],
    rating: 4.5,
    reviewCount: 432,
    downloads: 34567,
    activeInstalls: 18000,
    price: 'free',
    tags: ['analytics', 'dashboard', 'reports', 'traffic', 'insights'],
    category: 'Analytics',
    features: ['Real-time Stats', 'Traffic Sources', 'User Behavior', 'Custom Reports', 'Export Data', 'Privacy Compliant'],
    requirements: ['RustPress 1.0+'],
    lastUpdated: '2025-12-12',
    compatibility: '1.0+',
    isActive: false,
    isInstalled: false,
    isFeatured: false,
    isPremium: false,
    docsUrl: 'https://docs.rustpress.io/analytics',
    supportUrl: 'https://support.rustpress.io',
    reviews: [],
    changelog: [],
  },
  {
    id: '6',
    name: 'Backup & Restore',
    slug: 'backup-restore',
    description: 'Automated backups to cloud storage with one-click restore functionality.',
    longDescription: 'Never lose your data again. Schedule automatic backups to cloud storage (S3, Google Cloud, Dropbox) and restore your site with a single click.',
    version: '3.0.0',
    author: 'SecurePress',
    authorUrl: 'https://securepress.io',
    icon: 'Database',
    iconBg: 'bg-gradient-to-br from-teal-500 to-green-600',
    screenshots: [
      { url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=500&fit=crop', label: 'Backup List' },
    ],
    rating: 4.9,
    reviewCount: 789,
    downloads: 56234,
    activeInstalls: 28000,
    price: 49,
    tags: ['backup', 'restore', 'cloud', 'security', 'migration'],
    category: 'Security',
    features: ['Scheduled Backups', 'Cloud Storage', 'One-Click Restore', 'Incremental Backups', 'Migration Tool', 'Encryption'],
    requirements: ['RustPress 1.0+'],
    lastUpdated: '2025-12-17',
    compatibility: '1.0+',
    isActive: false,
    isInstalled: false,
    isFeatured: true,
    isPremium: true,
    docsUrl: 'https://docs.rustpress.io/backup',
    supportUrl: 'https://support.rustpress.io',
    reviews: [],
    changelog: [],
  },
  {
    id: '7',
    name: 'Security Shield',
    slug: 'security-shield',
    description: 'Comprehensive security with firewall, malware scanning, and brute force protection.',
    longDescription: 'Protect your RustPress site with enterprise-grade security. Includes web application firewall, malware scanning, brute force protection, and security hardening.',
    version: '2.4.1',
    author: 'SecurePress',
    authorUrl: 'https://securepress.io',
    icon: 'Shield',
    iconBg: 'bg-gradient-to-br from-red-500 to-rose-600',
    screenshots: [
      { url: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=500&fit=crop', label: 'Security Status' },
    ],
    rating: 4.8,
    reviewCount: 1023,
    downloads: 78234,
    activeInstalls: 42000,
    price: 'free',
    tags: ['security', 'firewall', 'malware', 'protection', 'ssl'],
    category: 'Security',
    features: ['Web Firewall', 'Malware Scan', 'Brute Force Protection', 'Two-Factor Auth', 'Security Logs', 'IP Blocking'],
    requirements: ['RustPress 1.0+'],
    lastUpdated: '2025-12-19',
    compatibility: '1.0+',
    isActive: false,
    isInstalled: false,
    isFeatured: true,
    isPremium: false,
    docsUrl: 'https://docs.rustpress.io/security',
    supportUrl: 'https://support.rustpress.io',
    reviews: [],
    changelog: [],
  },
  {
    id: '8',
    name: 'Social Sharing',
    slug: 'social-sharing',
    description: 'Beautiful social sharing buttons with share counts and custom styling.',
    longDescription: 'Increase your social reach with beautiful, fast-loading social sharing buttons. Supports all major social networks with real share counts.',
    version: '1.5.2',
    author: 'SocialKit',
    authorUrl: 'https://socialkit.io',
    icon: 'Globe',
    iconBg: 'bg-gradient-to-br from-sky-500 to-blue-600',
    screenshots: [
      { url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=500&fit=crop', label: 'Share Buttons' },
    ],
    rating: 4.3,
    reviewCount: 234,
    downloads: 23456,
    activeInstalls: 12000,
    price: 'free',
    tags: ['social', 'sharing', 'facebook', 'twitter', 'pinterest'],
    category: 'Social',
    features: ['All Major Networks', 'Share Counts', 'Custom Styling', 'Floating Bar', 'Click-to-Tweet', 'Image Sharing'],
    requirements: ['RustPress 1.0+'],
    lastUpdated: '2025-12-10',
    compatibility: '1.0+',
    isActive: false,
    isInstalled: false,
    isFeatured: false,
    isPremium: false,
    docsUrl: 'https://docs.rustpress.io/social-sharing',
    supportUrl: 'https://support.rustpress.io',
    reviews: [],
    changelog: [],
  },
  {
    id: '9',
    name: 'Email Marketing',
    slug: 'email-marketing',
    description: 'Collect subscribers, send newsletters, and integrate with email services.',
    longDescription: 'Build your email list with beautiful opt-in forms and send newsletters directly from RustPress. Integrates with Mailchimp, ConvertKit, and more.',
    version: '2.2.0',
    author: 'MailCraft',
    authorUrl: 'https://mailcraft.io',
    icon: 'Bell',
    iconBg: 'bg-gradient-to-br from-amber-500 to-yellow-600',
    screenshots: [
      { url: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&h=500&fit=crop', label: 'Subscribers' },
    ],
    rating: 4.6,
    reviewCount: 345,
    downloads: 28765,
    activeInstalls: 15000,
    price: 29,
    tags: ['email', 'newsletter', 'subscribers', 'marketing', 'mailchimp'],
    category: 'Marketing',
    features: ['Opt-in Forms', 'Newsletter Editor', 'Subscriber Management', 'ESP Integration', 'Analytics', 'Automation'],
    requirements: ['RustPress 1.0+'],
    lastUpdated: '2025-12-14',
    compatibility: '1.0+',
    isActive: false,
    isInstalled: false,
    isFeatured: false,
    isPremium: true,
    docsUrl: 'https://docs.rustpress.io/email-marketing',
    supportUrl: 'https://support.rustpress.io',
    reviews: [],
    changelog: [],
  },
  {
    id: '10',
    name: 'Custom Code',
    slug: 'custom-code',
    description: 'Add custom CSS, JavaScript, and PHP snippets without editing theme files.',
    longDescription: 'Safely add custom code to your site without modifying theme files. Includes a code editor with syntax highlighting and version history.',
    version: '1.3.0',
    author: 'DevTools',
    authorUrl: 'https://devtools.io',
    icon: 'Code',
    iconBg: 'bg-gradient-to-br from-gray-600 to-gray-800',
    screenshots: [
      { url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=500&fit=crop', label: 'Code Editor' },
    ],
    rating: 4.7,
    reviewCount: 189,
    downloads: 19876,
    activeInstalls: 9500,
    price: 'free',
    tags: ['code', 'css', 'javascript', 'snippets', 'developer'],
    category: 'Developer',
    features: ['CSS Editor', 'JS Editor', 'PHP Snippets', 'Syntax Highlighting', 'Version History', 'Code Validation'],
    requirements: ['RustPress 1.0+'],
    lastUpdated: '2025-12-08',
    compatibility: '1.0+',
    isActive: false,
    isInstalled: false,
    isFeatured: false,
    isPremium: false,
    docsUrl: 'https://docs.rustpress.io/custom-code',
    supportUrl: 'https://support.rustpress.io',
    reviews: [],
    changelog: [],
  },
];

const allTags = Array.from(new Set(samplePlugins.flatMap(p => p.tags))).sort();
const allCategories = Array.from(new Set(samplePlugins.map(p => p.category))).sort();

// Icon mapping
const iconComponents: Record<string, React.ElementType> = {
  TrendingUp,
  Zap,
  ShoppingCart,
  Mail,
  BarChart3,
  Database,
  Shield,
  Globe,
  Bell,
  Code,
  Puzzle,
  Package,
};

// ============================================
// UTILITY COMPONENTS
// ============================================

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
// PLUGIN CARD COMPONENT
// ============================================

interface PluginCardProps {
  plugin: Plugin;
  viewMode: ViewMode;
  onDetails: (plugin: Plugin) => void;
  onActivate: (plugin: Plugin) => void;
  onDeactivate: (plugin: Plugin) => void;
  onInstall: (plugin: Plugin) => void;
  onUninstall: (plugin: Plugin) => void;
}

const PluginCard: React.FC<PluginCardProps> = ({
  plugin,
  viewMode,
  onDetails,
  onActivate,
  onDeactivate,
  onInstall,
  onUninstall,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentScreenshot, setCurrentScreenshot] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const IconComponent = iconComponents[plugin.icon] || Puzzle;

  useEffect(() => {
    if (isHovered && plugin.screenshots.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentScreenshot(prev => (prev + 1) % plugin.screenshots.length);
      }, 2000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setCurrentScreenshot(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, plugin.screenshots.length]);

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg transition-all duration-300 overflow-hidden"
      >
        <div className="flex">
          {/* Icon/Screenshot */}
          <div
            className="w-48 h-36 flex-shrink-0 relative overflow-hidden cursor-pointer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onDetails(plugin)}
          >
            {plugin.screenshots.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentScreenshot}
                  src={plugin.screenshots[currentScreenshot]?.url}
                  alt={plugin.name}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              </AnimatePresence>
            ) : (
              <div className={clsx('w-full h-full flex items-center justify-center', plugin.iconBg)}>
                <IconComponent className="w-16 h-16 text-white" />
              </div>
            )}

            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {plugin.isActive && <Badge variant="success">Active</Badge>}
              {plugin.isPremium && <Badge variant="premium"><Crown className="w-3 h-3 inline mr-1" />Pro</Badge>}
              {plugin.isFeatured && <Badge variant="warning">Featured</Badge>}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plugin.name}</h3>
                <p className="text-sm text-gray-500">
                  by <a href={plugin.authorUrl} className="text-blue-600 hover:underline">{plugin.author}</a>
                  <span className="mx-2">•</span>
                  v{plugin.version}
                </p>
              </div>
              <div className="text-right">
                {plugin.price === 'free' ? (
                  <span className="text-green-600 font-semibold">Free</span>
                ) : (
                  <span className="text-gray-900 dark:text-white font-semibold">${plugin.price}</span>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{plugin.description}</p>

            <div className="flex flex-wrap gap-1 mb-3">
              {plugin.tags.slice(0, 4).map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <StarRating rating={plugin.rating} size="sm" />
                <span className="text-sm text-gray-500">({plugin.reviewCount})</span>
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  {plugin.activeInstalls.toLocaleString()} active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDetails(plugin)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {plugin.isInstalled ? (
                  plugin.isActive ? (
                    <button
                      onClick={() => onDeactivate(plugin)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                      <PowerOff className="w-4 h-4" />
                      Deactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => onActivate(plugin)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Power className="w-4 h-4" />
                      Activate
                    </button>
                  )
                ) : (
                  <button
                    onClick={() => onInstall(plugin)}
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
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon/Screenshot */}
      <div className="relative aspect-[16/10] overflow-hidden cursor-pointer" onClick={() => onDetails(plugin)}>
        {plugin.screenshots.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.img
              key={currentScreenshot}
              src={plugin.screenshots[currentScreenshot]?.url}
              alt={plugin.name}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: isHovered ? 1.05 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          </AnimatePresence>
        ) : (
          <div className={clsx('w-full h-full flex items-center justify-center', plugin.iconBg)}>
            <IconComponent className="w-20 h-20 text-white" />
          </div>
        )}

        {/* Screenshot dots */}
        {plugin.screenshots.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {plugin.screenshots.map((_, idx) => (
              <div
                key={idx}
                className={clsx(
                  'w-2 h-2 rounded-full transition-all',
                  idx === currentScreenshot ? 'bg-white w-5' : 'bg-white/50'
                )}
              />
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {plugin.isActive && (
            <Badge variant="success">
              <Check className="w-3 h-3 inline mr-1" />
              Active
            </Badge>
          )}
          {plugin.isPremium && (
            <Badge variant="premium">
              <Crown className="w-3 h-3 inline mr-1" />
              Pro
            </Badge>
          )}
          {plugin.isFeatured && (
            <Badge variant="warning">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Featured
            </Badge>
          )}
        </div>

        {/* Hover overlay */}
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
                    onDetails(plugin);
                  }}
                  className="flex-1 px-4 py-2.5 bg-white text-gray-900 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                {plugin.docsUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(plugin.docsUrl, '_blank');
                    }}
                    className="p-2.5 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                    title="Documentation"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', plugin.iconBg)}>
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{plugin.name}</h3>
            <p className="text-sm text-gray-500 truncate">by {plugin.author}</p>
          </div>
          <div className="text-right flex-shrink-0">
            {plugin.price === 'free' ? (
              <span className="text-green-600 font-semibold text-sm">Free</span>
            ) : (
              <span className="text-gray-900 dark:text-white font-semibold">${plugin.price}</span>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{plugin.description}</p>

        {/* Rating & Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <StarRating rating={plugin.rating} size="sm" />
            <span className="text-xs text-gray-500">({plugin.reviewCount})</span>
          </div>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Download className="w-3 h-3" />
            {plugin.activeInstalls.toLocaleString()}
          </span>
        </div>

        {/* Action Button */}
        {plugin.isInstalled ? (
          plugin.isActive ? (
            <button
              onClick={() => onDeactivate(plugin)}
              className="w-full py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 text-green-500" />
              Active
            </button>
          ) : (
            <button
              onClick={() => onActivate(plugin)}
              className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Power className="w-4 h-4" />
              Activate
            </button>
          )
        ) : (
          <button
            onClick={() => onInstall(plugin)}
            className="w-full py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Install
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ============================================
// FEATURED CAROUSEL
// ============================================

const FeaturedCarousel: React.FC<{ plugins: Plugin[]; onDetails: (plugin: Plugin) => void }> = ({ plugins, onDetails }) => {
  const [current, setCurrent] = useState(0);
  const featuredPlugins = plugins.filter(p => p.isFeatured);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % featuredPlugins.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredPlugins.length]);

  if (featuredPlugins.length === 0) return null;

  const plugin = featuredPlugins[current];
  const IconComponent = iconComponents[plugin.icon] || Puzzle;

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 mb-8">
      <div className="absolute inset-0 opacity-20">
        {plugin.screenshots.length > 0 && (
          <img src={plugin.screenshots[0].url} alt="" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="relative z-10 p-8 flex items-center gap-8">
        <div className={clsx('w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0', plugin.iconBg)}>
          <IconComponent className="w-12 h-12 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="warning">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Featured
            </Badge>
            {plugin.isPremium && <Badge variant="premium"><Crown className="w-3 h-3 inline mr-1" />Pro</Badge>}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{plugin.name}</h2>
          <p className="text-gray-300 mb-4 max-w-2xl">{plugin.description}</p>
          <div className="flex items-center gap-6">
            <StarRating rating={plugin.rating} />
            <span className="text-gray-400">{plugin.reviewCount} reviews</span>
            <span className="text-gray-400">{plugin.activeInstalls.toLocaleString()} active installs</span>
          </div>
        </div>
        <button
          onClick={() => onDetails(plugin)}
          className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          View Plugin
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {featuredPlugins.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={clsx(
              'w-2 h-2 rounded-full transition-all',
              idx === current ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'
            )}
          />
        ))}
      </div>

      <button
        onClick={() => setCurrent(prev => (prev - 1 + featuredPlugins.length) % featuredPlugins.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => setCurrent(prev => (prev + 1) % featuredPlugins.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

// ============================================
// PLUGIN DETAILS MODAL
// ============================================

const PluginDetailsModal: React.FC<{
  plugin: Plugin | null;
  onClose: () => void;
  onActivate: (plugin: Plugin) => void;
  onDeactivate: (plugin: Plugin) => void;
  onInstall: (plugin: Plugin) => void;
  onUninstall: (plugin: Plugin) => void;
}> = ({ plugin, onClose, onActivate, onDeactivate, onInstall, onUninstall }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'changelog'>('overview');
  const [currentScreenshot, setCurrentScreenshot] = useState(0);

  if (!plugin) return null;

  const IconComponent = iconComponents[plugin.icon] || Puzzle;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-start gap-4">
            <div className={clsx('w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0', plugin.iconBg)}>
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{plugin.name}</h2>
                {plugin.isPremium && <Badge variant="premium"><Crown className="w-3 h-3 inline mr-1" />Pro</Badge>}
              </div>
              <p className="text-gray-500 mb-2">by {plugin.author} • v{plugin.version}</p>
              <div className="flex items-center gap-4">
                <StarRating rating={plugin.rating} />
                <span className="text-sm text-gray-500">{plugin.reviewCount} reviews</span>
                <span className="text-sm text-gray-500">{plugin.activeInstalls.toLocaleString()} active installs</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 px-6">
          {(['overview', 'reviews', 'changelog'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'px-4 py-3 font-medium text-sm border-b-2 transition-colors capitalize',
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-6">
                {/* Screenshots */}
                {plugin.screenshots.length > 0 && (
                  <div>
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 mb-2">
                      <img
                        src={plugin.screenshots[currentScreenshot].url}
                        alt={plugin.screenshots[currentScreenshot].label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {plugin.screenshots.map((ss, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentScreenshot(idx)}
                          className={clsx(
                            'w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors',
                            idx === currentScreenshot ? 'border-blue-600' : 'border-transparent hover:border-gray-300'
                          )}
                        >
                          <img src={ss.url} alt={ss.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400">{plugin.longDescription}</p>
                </div>

                {/* Features */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Features</h3>
                  <ul className="grid grid-cols-2 gap-2">
                    {plugin.features.map(feature => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Check className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Action Button */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <div className="text-center mb-4">
                    {plugin.price === 'free' ? (
                      <span className="text-2xl font-bold text-green-600">Free</span>
                    ) : (
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">${plugin.price}</span>
                    )}
                  </div>
                  {plugin.isInstalled ? (
                    plugin.isActive ? (
                      <button
                        onClick={() => onDeactivate(plugin)}
                        className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <PowerOff className="w-4 h-4" />
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => onActivate(plugin)}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Power className="w-4 h-4" />
                        Activate
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => onInstall(plugin)}
                      className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Install
                    </button>
                  )}
                </div>

                {/* Info */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Version</span>
                    <span className="text-gray-900 dark:text-white">{plugin.version}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last Updated</span>
                    <span className="text-gray-900 dark:text-white">{plugin.lastUpdated}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Compatibility</span>
                    <span className="text-gray-900 dark:text-white">RustPress {plugin.compatibility}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Category</span>
                    <span className="text-gray-900 dark:text-white">{plugin.category}</span>
                  </div>
                </div>

                {/* Links */}
                <div className="flex gap-2">
                  <a
                    href={plugin.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-center text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Documentation
                  </a>
                  <a
                    href={plugin.supportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-center text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Support
                  </a>
                </div>

                {/* Tags */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {plugin.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {plugin.reviews.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No reviews yet</p>
                </div>
              ) : (
                plugin.reviews.map(review => (
                  <div key={review.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-start gap-3">
                      <img src={review.avatar} alt={review.author} className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 dark:text-white">{review.author}</span>
                          {review.verified && (
                            <Badge variant="success">Verified</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <StarRating rating={review.rating} size="sm" showValue={false} />
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{review.content}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                            <ThumbsUp className="w-4 h-4" />
                            {review.helpful}
                          </button>
                          <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                            <ThumbsDown className="w-4 h-4" />
                            {review.notHelpful}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'changelog' && (
            <div className="space-y-4">
              {plugin.changelog.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No changelog available</p>
                </div>
              ) : (
                plugin.changelog.map((entry, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900 dark:text-white">v{entry.version}</span>
                      <span className="text-sm text-gray-500">{entry.date}</span>
                    </div>
                    <ul className="space-y-1">
                      {entry.changes.map((change, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-blue-500 mt-1">•</span>
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// MAIN PLUGINS PAGE
// ============================================

const Plugins: React.FC = () => {
  const [plugins, setPlugins] = useState<Plugin[]>(samplePlugins);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [tabView, setTabView] = useState<TabView>('browse');
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);

  // Filter and sort plugins
  const filteredPlugins = useMemo(() => {
    let result = [...plugins];

    // Tab filter
    if (tabView === 'installed') {
      result = result.filter(p => p.isInstalled);
    } else if (tabView === 'updates') {
      result = result.filter(p => p.isInstalled); // In real app, check for updates
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    // Category
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Tags
    if (selectedTags.length > 0) {
      result = result.filter(p => selectedTags.some(tag => p.tags.includes(tag)));
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'popular':
          comparison = b.activeInstalls - a.activeInstalls;
          break;
        case 'newest':
          comparison = new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
          break;
        case 'rating':
          comparison = b.rating - a.rating;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'downloads':
          comparison = b.downloads - a.downloads;
          break;
      }
      return sortOrder === 'desc' ? comparison : -comparison;
    });

    return result;
  }, [plugins, searchQuery, sortBy, sortOrder, selectedCategory, selectedTags, tabView]);

  const handleActivate = useCallback((plugin: Plugin) => {
    setPlugins(prev => prev.map(p => p.id === plugin.id ? { ...p, isActive: true } : p));
    toast.success(`${plugin.name} activated`);
  }, []);

  const handleDeactivate = useCallback((plugin: Plugin) => {
    setPlugins(prev => prev.map(p => p.id === plugin.id ? { ...p, isActive: false } : p));
    toast.success(`${plugin.name} deactivated`);
  }, []);

  const handleInstall = useCallback((plugin: Plugin) => {
    setPlugins(prev => prev.map(p => p.id === plugin.id ? { ...p, isInstalled: true, isActive: true } : p));
    toast.success(`${plugin.name} installed and activated`);
  }, []);

  const handleUninstall = useCallback((plugin: Plugin) => {
    setPlugins(prev => prev.map(p => p.id === plugin.id ? { ...p, isInstalled: false, isActive: false } : p));
    toast.success(`${plugin.name} uninstalled`);
  }, []);

  const installedCount = plugins.filter(p => p.isInstalled).length;
  const activeCount = plugins.filter(p => p.isActive).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Plugins</h1>
            <p className="text-gray-500 mt-1">
              {installedCount} installed • {activeCount} active
            </p>
          </div>
          <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Plugin
          </button>
        </div>

        {/* Featured Carousel */}
        {tabView === 'browse' && (
          <FeaturedCarousel plugins={plugins} onDetails={setSelectedPlugin} />
        )}

        {/* Tabs */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['browse', 'installed', 'updates'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setTabView(tab)}
                className={clsx(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize',
                  tabView === tab
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {tab}
                {tab === 'installed' && ` (${installedCount})`}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search plugins..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'px-4 py-3 rounded-xl border flex items-center gap-2 transition-colors',
              showFilters
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600'
                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300'
            )}
          >
            <Filter className="w-4 h-4" />
            Filters
            {(selectedCategory || selectedTags.length > 0) && (
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {(selectedCategory ? 1 : 0) + selectedTags.length}
              </span>
            )}
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="rating">Highest Rated</option>
            <option value="name">Name</option>
            <option value="downloads">Most Downloads</option>
          </select>

          <div className="flex bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={clsx(
                'p-3 transition-colors',
                viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={clsx(
                'p-3 transition-colors',
                viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-6">
                  {/* Categories */}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Category</h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={clsx(
                          'px-3 py-1.5 rounded-lg text-sm transition-colors',
                          selectedCategory === null
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        )}
                      >
                        All
                      </button>
                      {allCategories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                          className={clsx(
                            'px-3 py-1.5 rounded-lg text-sm transition-colors',
                            selectedCategory === cat
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {allTags.slice(0, 12).map(tag => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTags(prev =>
                            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                          )}
                          className={clsx(
                            'px-3 py-1.5 rounded-lg text-sm transition-colors',
                            selectedTags.includes(tag)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                          )}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {(selectedCategory || selectedTags.length > 0) && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        setSelectedTags([]);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">
          Showing {filteredPlugins.length} plugin{filteredPlugins.length !== 1 ? 's' : ''}
        </p>

        {/* Plugin Grid/List */}
        <motion.div
          layout
          className={clsx(
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          )}
        >
          <AnimatePresence mode="popLayout">
            {filteredPlugins.map(plugin => (
              <PluginCard
                key={plugin.id}
                plugin={plugin}
                viewMode={viewMode}
                onDetails={setSelectedPlugin}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
                onInstall={handleInstall}
                onUninstall={handleUninstall}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {filteredPlugins.length === 0 && (
          <div className="text-center py-16">
            <Puzzle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No plugins found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
                setSelectedTags([]);
              }}
              className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Plugin Details Modal */}
      <AnimatePresence>
        {selectedPlugin && (
          <PluginDetailsModal
            plugin={selectedPlugin}
            onClose={() => setSelectedPlugin(null)}
            onActivate={handleActivate}
            onDeactivate={handleDeactivate}
            onInstall={handleInstall}
            onUninstall={handleUninstall}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Plugins;
