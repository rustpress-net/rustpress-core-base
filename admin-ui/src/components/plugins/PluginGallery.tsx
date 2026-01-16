import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Grid,
  List,
  Filter,
  SortAsc,
  SortDesc,
  Star,
  Download,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Heart,
  Share2,
  ExternalLink,
  Settings,
  Trash2,
  RefreshCw,
  Puzzle,
  Shield,
  Zap,
  Crown,
  Code,
  Clock,
  User,
  TrendingUp,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle,
  Info,
  Play,
  Plus,
  ArrowRight,
  Sparkles,
  BarChart3,
  Globe,
  ShoppingCart,
  Mail,
  MessageSquare,
  CreditCard,
  Image,
  FileText,
  Database,
  Lock,
  Layers,
  Cpu,
  Package,
  Rocket,
  Award,
  Verified,
  FlameIcon,
  Flame,
  History,
  Users,
  MoreVertical,
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
  verified: boolean;
}

interface Plugin {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  version: string;
  author: string;
  authorUrl: string;
  icon: string;
  banner: string;
  screenshots: PluginScreenshot[];
  rating: number;
  reviewCount: number;
  downloads: number;
  activeInstalls: number;
  price: number | 'free';
  tags: string[];
  category: string;
  features: string[];
  lastUpdated: string;
  releaseDate: string;
  compatibility: string;
  requiresRust: boolean;
  isInstalled: boolean;
  isActive: boolean;
  isFeatured: boolean;
  isPremium: boolean;
  isVerified: boolean;
  isOfficial: boolean;
  isTrending: boolean;
  isNew: boolean;
  reviews: PluginReview[];
  demoUrl: string;
  documentationUrl: string;
  supportUrl: string;
  githubUrl: string;
  weeklyDownloads: number;
  monthlyDownloads: number;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'popular' | 'newest' | 'rating' | 'name' | 'downloads' | 'updated';

// ============================================
// SAMPLE DATA
// ============================================

const samplePlugins: Plugin[] = [
  {
    id: '1',
    name: 'RustPress SEO Pro',
    slug: 'rustpress-seo-pro',
    description: 'The most comprehensive SEO plugin for RustPress. Includes XML sitemaps, meta tag optimization, social media integration, schema markup, and advanced analytics. Built with Rust for maximum performance.',
    shortDescription: 'Complete SEO solution with sitemaps, meta tags, and analytics',
    version: '3.2.0',
    author: 'RustPress Team',
    authorUrl: 'https://rustpress.io',
    icon: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=128&h=128&fit=crop',
    banner: 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=1200&h=400&fit=crop',
    screenshots: [
      { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop', label: 'Dashboard' },
      { url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop', label: 'Analytics' },
    ],
    rating: 4.9,
    reviewCount: 1284,
    downloads: 524000,
    activeInstalls: 312000,
    price: 'free',
    tags: ['seo', 'sitemap', 'meta-tags', 'analytics', 'schema'],
    category: 'SEO',
    features: ['XML Sitemaps', 'Meta Tags', 'Open Graph', 'Schema Markup', 'Analytics Dashboard'],
    lastUpdated: '2025-12-28',
    releaseDate: '2024-03-15',
    compatibility: '1.0+',
    requiresRust: true,
    isInstalled: true,
    isActive: true,
    isFeatured: true,
    isPremium: false,
    isVerified: true,
    isOfficial: true,
    isTrending: true,
    isNew: false,
    reviews: [],
    demoUrl: 'https://demo.rustpress.io/seo-pro',
    documentationUrl: 'https://docs.rustpress.io/seo-pro',
    supportUrl: 'https://support.rustpress.io',
    githubUrl: 'https://github.com/rustpress/seo-pro',
    weeklyDownloads: 12500,
    monthlyDownloads: 48000,
  },
  {
    id: '2',
    name: 'Form Builder Pro',
    slug: 'form-builder-pro',
    description: 'Drag-and-drop form builder with 50+ field types, conditional logic, multi-step forms, and integrations with popular email marketing services.',
    shortDescription: 'Powerful drag-and-drop form builder with advanced features',
    version: '2.8.1',
    author: 'FormCraft Studios',
    authorUrl: 'https://formcraft.io',
    icon: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=128&h=128&fit=crop',
    banner: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=400&fit=crop',
    screenshots: [],
    rating: 4.7,
    reviewCount: 856,
    downloads: 289000,
    activeInstalls: 178000,
    price: 49,
    tags: ['forms', 'contact', 'drag-drop', 'email', 'survey'],
    category: 'Forms',
    features: ['Drag & Drop Builder', 'Conditional Logic', 'Email Integration', 'File Uploads', 'Payment Forms'],
    lastUpdated: '2025-12-20',
    releaseDate: '2024-06-01',
    compatibility: '1.0+',
    requiresRust: false,
    isInstalled: false,
    isActive: false,
    isFeatured: true,
    isPremium: true,
    isVerified: true,
    isOfficial: false,
    isTrending: true,
    isNew: false,
    reviews: [],
    demoUrl: 'https://demo.formcraft.io',
    documentationUrl: 'https://docs.formcraft.io',
    supportUrl: 'https://support.formcraft.io',
    githubUrl: '',
    weeklyDownloads: 8200,
    monthlyDownloads: 31000,
  },
  {
    id: '3',
    name: 'WooCommerce Bridge',
    slug: 'woocommerce-bridge',
    description: 'Seamlessly integrate WooCommerce with RustPress. Sync products, orders, customers, and inventory in real-time with blazing fast performance.',
    shortDescription: 'Connect WooCommerce with RustPress for e-commerce',
    version: '1.5.0',
    author: 'Commerce Labs',
    authorUrl: 'https://commercelabs.io',
    icon: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=128&h=128&fit=crop',
    banner: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&h=400&fit=crop',
    screenshots: [],
    rating: 4.6,
    reviewCount: 423,
    downloads: 156000,
    activeInstalls: 89000,
    price: 79,
    tags: ['ecommerce', 'woocommerce', 'shop', 'products', 'payments'],
    category: 'E-Commerce',
    features: ['Product Sync', 'Order Management', 'Inventory Tracking', 'Payment Gateway', 'Customer Portal'],
    lastUpdated: '2025-12-25',
    releaseDate: '2024-09-10',
    compatibility: '1.0+',
    requiresRust: true,
    isInstalled: false,
    isActive: false,
    isFeatured: true,
    isPremium: true,
    isVerified: true,
    isOfficial: false,
    isTrending: false,
    isNew: false,
    reviews: [],
    demoUrl: 'https://demo.commercelabs.io',
    documentationUrl: 'https://docs.commercelabs.io',
    supportUrl: 'https://support.commercelabs.io',
    githubUrl: '',
    weeklyDownloads: 4100,
    monthlyDownloads: 15600,
  },
  {
    id: '4',
    name: 'Security Shield',
    slug: 'security-shield',
    description: 'Enterprise-grade security plugin with firewall, malware scanning, two-factor authentication, and real-time threat detection powered by machine learning.',
    shortDescription: 'Complete security solution with firewall and 2FA',
    version: '4.1.2',
    author: 'SecurePress',
    authorUrl: 'https://securepress.io',
    icon: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=128&h=128&fit=crop',
    banner: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&h=400&fit=crop',
    screenshots: [],
    rating: 4.8,
    reviewCount: 2156,
    downloads: 892000,
    activeInstalls: 567000,
    price: 'free',
    tags: ['security', 'firewall', '2fa', 'malware', 'protection'],
    category: 'Security',
    features: ['Web Firewall', 'Malware Scanner', '2FA Authentication', 'Login Protection', 'Security Audit'],
    lastUpdated: '2025-12-30',
    releaseDate: '2023-11-20',
    compatibility: '1.0+',
    requiresRust: true,
    isInstalled: true,
    isActive: true,
    isFeatured: true,
    isPremium: false,
    isVerified: true,
    isOfficial: true,
    isTrending: true,
    isNew: false,
    reviews: [],
    demoUrl: 'https://demo.securepress.io',
    documentationUrl: 'https://docs.securepress.io',
    supportUrl: 'https://support.securepress.io',
    githubUrl: 'https://github.com/securepress/shield',
    weeklyDownloads: 28500,
    monthlyDownloads: 112000,
  },
  {
    id: '5',
    name: 'Analytics Dashboard',
    slug: 'analytics-dashboard',
    description: 'Beautiful analytics dashboard with real-time visitor tracking, heatmaps, conversion funnels, and A/B testing. Privacy-focused alternative to Google Analytics.',
    shortDescription: 'Privacy-focused analytics with heatmaps and A/B testing',
    version: '2.3.0',
    author: 'DataViz Labs',
    authorUrl: 'https://datavizlabs.io',
    icon: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=128&h=128&fit=crop',
    banner: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=400&fit=crop',
    screenshots: [],
    rating: 4.5,
    reviewCount: 634,
    downloads: 234000,
    activeInstalls: 145000,
    price: 29,
    tags: ['analytics', 'tracking', 'heatmaps', 'privacy', 'dashboard'],
    category: 'Analytics',
    features: ['Real-time Analytics', 'Heatmaps', 'Conversion Funnels', 'A/B Testing', 'GDPR Compliant'],
    lastUpdated: '2025-12-22',
    releaseDate: '2024-04-05',
    compatibility: '1.0+',
    requiresRust: false,
    isInstalled: false,
    isActive: false,
    isFeatured: false,
    isPremium: true,
    isVerified: true,
    isOfficial: false,
    isTrending: false,
    isNew: false,
    reviews: [],
    demoUrl: 'https://demo.datavizlabs.io',
    documentationUrl: 'https://docs.datavizlabs.io',
    supportUrl: 'https://support.datavizlabs.io',
    githubUrl: '',
    weeklyDownloads: 5800,
    monthlyDownloads: 22000,
  },
  {
    id: '6',
    name: 'Image Optimizer',
    slug: 'image-optimizer',
    description: 'Automatically optimize and compress images on upload. Supports WebP conversion, lazy loading, CDN integration, and bulk optimization.',
    shortDescription: 'Automatic image optimization with WebP support',
    version: '1.9.5',
    author: 'MediaOptim',
    authorUrl: 'https://mediaoptim.io',
    icon: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=128&h=128&fit=crop',
    banner: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&h=400&fit=crop',
    screenshots: [],
    rating: 4.4,
    reviewCount: 478,
    downloads: 189000,
    activeInstalls: 112000,
    price: 'free',
    tags: ['images', 'optimization', 'webp', 'performance', 'cdn'],
    category: 'Media',
    features: ['Auto Compression', 'WebP Conversion', 'Lazy Loading', 'CDN Support', 'Bulk Optimize'],
    lastUpdated: '2025-12-18',
    releaseDate: '2024-02-28',
    compatibility: '1.0+',
    requiresRust: true,
    isInstalled: false,
    isActive: false,
    isFeatured: false,
    isPremium: false,
    isVerified: true,
    isOfficial: false,
    isTrending: false,
    isNew: false,
    reviews: [],
    demoUrl: 'https://demo.mediaoptim.io',
    documentationUrl: 'https://docs.mediaoptim.io',
    supportUrl: 'https://support.mediaoptim.io',
    githubUrl: 'https://github.com/mediaoptim/image-optimizer',
    weeklyDownloads: 4500,
    monthlyDownloads: 17000,
  },
  {
    id: '7',
    name: 'Backup Master',
    slug: 'backup-master',
    description: 'Automated backup solution with cloud storage integration (AWS S3, Google Cloud, Dropbox). Schedule backups, one-click restore, and migration tools.',
    shortDescription: 'Automated backups with cloud storage integration',
    version: '3.0.1',
    author: 'BackupHQ',
    authorUrl: 'https://backuphq.io',
    icon: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=128&h=128&fit=crop',
    banner: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&h=400&fit=crop',
    screenshots: [],
    rating: 4.7,
    reviewCount: 912,
    downloads: 345000,
    activeInstalls: 234000,
    price: 39,
    tags: ['backup', 'restore', 'cloud', 'migration', 'security'],
    category: 'Utility',
    features: ['Scheduled Backups', 'Cloud Storage', 'One-Click Restore', 'Site Migration', 'Incremental Backups'],
    lastUpdated: '2025-12-27',
    releaseDate: '2024-01-15',
    compatibility: '1.0+',
    requiresRust: false,
    isInstalled: true,
    isActive: true,
    isFeatured: false,
    isPremium: true,
    isVerified: true,
    isOfficial: false,
    isTrending: false,
    isNew: false,
    reviews: [],
    demoUrl: 'https://demo.backuphq.io',
    documentationUrl: 'https://docs.backuphq.io',
    supportUrl: 'https://support.backuphq.io',
    githubUrl: '',
    weeklyDownloads: 8900,
    monthlyDownloads: 34000,
  },
  {
    id: '8',
    name: 'Social Share Pro',
    slug: 'social-share-pro',
    description: 'Add beautiful social sharing buttons to your content. Supports 30+ networks, share counts, floating bars, and click-to-tweet boxes.',
    shortDescription: 'Social sharing buttons with 30+ network support',
    version: '2.1.0',
    author: 'SocialBoost',
    authorUrl: 'https://socialboost.io',
    icon: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=128&h=128&fit=crop',
    banner: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=1200&h=400&fit=crop',
    screenshots: [],
    rating: 4.3,
    reviewCount: 356,
    downloads: 178000,
    activeInstalls: 98000,
    price: 'free',
    tags: ['social', 'sharing', 'twitter', 'facebook', 'linkedin'],
    category: 'Social',
    features: ['30+ Networks', 'Share Counts', 'Floating Bar', 'Click to Tweet', 'Custom Icons'],
    lastUpdated: '2025-12-15',
    releaseDate: '2024-05-20',
    compatibility: '1.0+',
    requiresRust: false,
    isInstalled: false,
    isActive: false,
    isFeatured: false,
    isPremium: false,
    isVerified: false,
    isOfficial: false,
    isTrending: false,
    isNew: false,
    reviews: [],
    demoUrl: 'https://demo.socialboost.io',
    documentationUrl: 'https://docs.socialboost.io',
    supportUrl: 'https://support.socialboost.io',
    githubUrl: 'https://github.com/socialboost/share-pro',
    weeklyDownloads: 3200,
    monthlyDownloads: 12000,
  },
  {
    id: '9',
    name: 'Cache Turbo',
    slug: 'cache-turbo',
    description: 'High-performance caching plugin with page cache, browser cache, database optimization, and CDN integration. Built in Rust for blazing speed.',
    shortDescription: 'Blazing fast caching with Rust-powered performance',
    version: '2.5.0',
    author: 'RustPress Team',
    authorUrl: 'https://rustpress.io',
    icon: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=128&h=128&fit=crop',
    banner: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=400&fit=crop',
    screenshots: [],
    rating: 4.9,
    reviewCount: 1567,
    downloads: 678000,
    activeInstalls: 456000,
    price: 'free',
    tags: ['cache', 'performance', 'speed', 'cdn', 'optimization'],
    category: 'Performance',
    features: ['Page Cache', 'Browser Cache', 'Database Optimization', 'CDN Integration', 'Minification'],
    lastUpdated: '2025-12-29',
    releaseDate: '2024-02-01',
    compatibility: '1.0+',
    requiresRust: true,
    isInstalled: true,
    isActive: true,
    isFeatured: true,
    isPremium: false,
    isVerified: true,
    isOfficial: true,
    isTrending: true,
    isNew: false,
    reviews: [],
    demoUrl: 'https://demo.rustpress.io/cache-turbo',
    documentationUrl: 'https://docs.rustpress.io/cache-turbo',
    supportUrl: 'https://support.rustpress.io',
    githubUrl: 'https://github.com/rustpress/cache-turbo',
    weeklyDownloads: 18500,
    monthlyDownloads: 72000,
  },
  {
    id: '10',
    name: 'Newsletter Connect',
    slug: 'newsletter-connect',
    description: 'Build and manage email newsletters directly in RustPress. Beautiful templates, subscriber management, and integrations with Mailchimp, ConvertKit, and more.',
    shortDescription: 'Email newsletter management with beautiful templates',
    version: '1.8.0',
    author: 'MailFlow',
    authorUrl: 'https://mailflow.io',
    icon: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=128&h=128&fit=crop',
    banner: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=1200&h=400&fit=crop',
    screenshots: [],
    rating: 4.6,
    reviewCount: 489,
    downloads: 212000,
    activeInstalls: 134000,
    price: 29,
    tags: ['email', 'newsletter', 'subscribers', 'marketing', 'mailchimp'],
    category: 'Marketing',
    features: ['Email Templates', 'Subscriber Management', 'Automation', 'A/B Testing', 'Analytics'],
    lastUpdated: '2025-12-24',
    releaseDate: '2024-07-12',
    compatibility: '1.0+',
    requiresRust: false,
    isInstalled: false,
    isActive: false,
    isFeatured: false,
    isPremium: true,
    isVerified: true,
    isOfficial: false,
    isTrending: false,
    isNew: true,
    reviews: [],
    demoUrl: 'https://demo.mailflow.io',
    documentationUrl: 'https://docs.mailflow.io',
    supportUrl: 'https://support.mailflow.io',
    githubUrl: '',
    weeklyDownloads: 5200,
    monthlyDownloads: 19800,
  },
  {
    id: '11',
    name: 'Code Snippets',
    slug: 'code-snippets',
    description: 'Add custom PHP, CSS, and JavaScript snippets to your site without editing theme files. Includes syntax highlighting and error handling.',
    shortDescription: 'Add custom code snippets safely to your site',
    version: '1.4.2',
    author: 'DevTools',
    authorUrl: 'https://devtools.io',
    icon: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=128&h=128&fit=crop',
    banner: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=400&fit=crop',
    screenshots: [],
    rating: 4.5,
    reviewCount: 267,
    downloads: 145000,
    activeInstalls: 89000,
    price: 'free',
    tags: ['code', 'snippets', 'php', 'css', 'javascript'],
    category: 'Development',
    features: ['Code Editor', 'Syntax Highlighting', 'Error Handling', 'Conditional Loading', 'Import/Export'],
    lastUpdated: '2025-12-19',
    releaseDate: '2024-08-30',
    compatibility: '1.0+',
    requiresRust: false,
    isInstalled: false,
    isActive: false,
    isFeatured: false,
    isPremium: false,
    isVerified: false,
    isOfficial: false,
    isTrending: false,
    isNew: true,
    reviews: [],
    demoUrl: '',
    documentationUrl: 'https://docs.devtools.io/snippets',
    supportUrl: 'https://support.devtools.io',
    githubUrl: 'https://github.com/devtools/code-snippets',
    weeklyDownloads: 2800,
    monthlyDownloads: 10500,
  },
  {
    id: '12',
    name: 'Multilingual Pro',
    slug: 'multilingual-pro',
    description: 'Full multilingual support with automatic translation, language switcher, RTL support, and SEO-friendly URL structures.',
    shortDescription: 'Complete multilingual solution with auto-translation',
    version: '3.2.1',
    author: 'LangPress',
    authorUrl: 'https://langpress.io',
    icon: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=128&h=128&fit=crop',
    banner: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=400&fit=crop',
    screenshots: [],
    rating: 4.7,
    reviewCount: 723,
    downloads: 298000,
    activeInstalls: 189000,
    price: 59,
    tags: ['translation', 'multilingual', 'language', 'rtl', 'localization'],
    category: 'Content',
    features: ['Auto Translation', 'Language Switcher', 'RTL Support', 'SEO URLs', 'String Translation'],
    lastUpdated: '2025-12-26',
    releaseDate: '2024-03-01',
    compatibility: '1.0+',
    requiresRust: true,
    isInstalled: false,
    isActive: false,
    isFeatured: true,
    isPremium: true,
    isVerified: true,
    isOfficial: false,
    isTrending: true,
    isNew: false,
    reviews: [],
    demoUrl: 'https://demo.langpress.io',
    documentationUrl: 'https://docs.langpress.io',
    supportUrl: 'https://support.langpress.io',
    githubUrl: '',
    weeklyDownloads: 7600,
    monthlyDownloads: 29000,
  },
];

// Category configuration with icons and colors
const categoryConfig: Record<string, { icon: React.FC<any>; color: string; bgColor: string }> = {
  'SEO': { icon: Search, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  'Forms': { icon: MessageSquare, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  'E-Commerce': { icon: ShoppingCart, color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  'Security': { icon: Shield, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' },
  'Analytics': { icon: BarChart3, color: 'text-cyan-600', bgColor: 'bg-cyan-100 dark:bg-cyan-900/30' },
  'Media': { icon: Image, color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-900/30' },
  'Utility': { icon: Zap, color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' },
  'Social': { icon: Users, color: 'text-indigo-600', bgColor: 'bg-indigo-100 dark:bg-indigo-900/30' },
  'Performance': { icon: Rocket, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' },
  'Marketing': { icon: Mail, color: 'text-rose-600', bgColor: 'bg-rose-100 dark:bg-rose-900/30' },
  'Development': { icon: Code, color: 'text-slate-600', bgColor: 'bg-slate-100 dark:bg-slate-900/30' },
  'Content': { icon: FileText, color: 'text-teal-600', bgColor: 'bg-teal-100 dark:bg-teal-900/30' },
};

// ============================================
// ENHANCEMENT 1: PLUGIN GRID/LIST VIEW TOGGLE
// ============================================

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <button
        onClick={() => onViewModeChange('grid')}
        className={clsx(
          'p-2 rounded-md transition-all',
          viewMode === 'grid'
            ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
        )}
        title="Grid view"
      >
        <Grid className="w-4 h-4" />
      </button>
      <button
        onClick={() => onViewModeChange('list')}
        className={clsx(
          'p-2 rounded-md transition-all',
          viewMode === 'list'
            ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
        )}
        title="List view"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
};

// ============================================
// ENHANCEMENT 2: ADVANCED SEARCH WITH AUTOCOMPLETE
// ============================================

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  plugins: Plugin[];
  onSelectPlugin: (plugin: Plugin) => void;
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  value,
  onChange,
  plugins,
  onSelectPlugin,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(['seo', 'security', 'cache']);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    if (!value.trim()) return [];
    const query = value.toLowerCase();
    return plugins
      .filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query))
      )
      .slice(0, 6);
  }, [value, plugins]);

  const handleSelect = (plugin: Plugin) => {
    onChange(plugin.name);
    onSelectPlugin(plugin);
    setIsFocused(false);
    // Add to recent searches
    if (!recentSearches.includes(plugin.name.toLowerCase())) {
      setRecentSearches(prev => [plugin.name.toLowerCase(), ...prev.slice(0, 4)]);
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
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Search plugins by name, category, or feature..."
          className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isFocused && (suggestions.length > 0 || (!value && recentSearches.length > 0)) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            {!value && recentSearches.length > 0 && (
              <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Recent Searches</p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map(search => (
                    <button
                      key={search}
                      onClick={() => onChange(search)}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="max-h-80 overflow-y-auto">
                {suggestions.map(plugin => {
                  const CategoryIcon = categoryConfig[plugin.category]?.icon || Puzzle;
                  return (
                    <button
                      key={plugin.id}
                      onClick={() => handleSelect(plugin)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <img
                        src={plugin.icon}
                        alt={plugin.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {plugin.name}
                          </span>
                          {plugin.isOfficial && (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <CategoryIcon className="w-3 h-3" />
                          <span>{plugin.category}</span>
                          <span>•</span>
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span>{plugin.rating}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// ENHANCEMENT 3: CATEGORY FILTER CHIPS
// ============================================

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onCategoryChange(null)}
        className={clsx(
          'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
          !selectedCategory
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        )}
      >
        <Layers className="w-4 h-4" />
        All Plugins
      </button>
      {categories.map(category => {
        const config = categoryConfig[category];
        const Icon = config?.icon || Puzzle;
        const isSelected = selectedCategory === category;

        return (
          <motion.button
            key={category}
            onClick={() => onCategoryChange(isSelected ? null : category)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
              isSelected
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : `${config?.bgColor || 'bg-gray-100 dark:bg-gray-800'} ${config?.color || 'text-gray-600'} hover:opacity-80`
            )}
          >
            <Icon className="w-4 h-4" />
            {category}
          </motion.button>
        );
      })}
    </div>
  );
};

// ============================================
// ENHANCEMENT 4: SMART SORT OPTIONS
// ============================================

interface SortDropdownProps {
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ sortOption, onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions: { value: SortOption; label: string; icon: React.FC<any> }[] = [
    { value: 'popular', label: 'Most Popular', icon: TrendingUp },
    { value: 'downloads', label: 'Most Downloads', icon: Download },
    { value: 'rating', label: 'Highest Rated', icon: Star },
    { value: 'newest', label: 'Newest First', icon: Sparkles },
    { value: 'updated', label: 'Recently Updated', icon: RefreshCw },
    { value: 'name', label: 'Alphabetical', icon: SortAsc },
  ];

  const currentSort = sortOptions.find(s => s.value === sortOption);
  const CurrentIcon = currentSort?.icon || TrendingUp;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <CurrentIcon className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentSort?.label}
        </span>
        <ChevronDown className={clsx('w-4 h-4 text-gray-400 transition-transform', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-20"
          >
            {sortOptions.map(option => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                    sortOption === option.value
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{option.label}</span>
                  {sortOption === option.value && (
                    <Check className="w-4 h-4 ml-auto" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// ENHANCEMENT 5: FEATURED PLUGINS CAROUSEL
// ============================================

interface FeaturedCarouselProps {
  plugins: Plugin[];
  onSelectPlugin: (plugin: Plugin) => void;
  onInstall: (plugin: Plugin) => void;
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  plugins,
  onSelectPlugin,
  onInstall,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featuredPlugins = plugins.filter(p => p.isFeatured);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || featuredPlugins.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % featuredPlugins.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, featuredPlugins.length]);

  if (featuredPlugins.length === 0) return null;

  const currentPlugin = featuredPlugins[currentIndex];
  const CategoryIcon = categoryConfig[currentPlugin.category]?.icon || Puzzle;

  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-8"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPlugin.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="relative h-80"
        >
          {/* Background */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${currentPlugin.banner})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center px-8 md:px-12">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                  Featured
                </span>
                <span className={clsx(
                  'flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium',
                  categoryConfig[currentPlugin.category]?.bgColor,
                  categoryConfig[currentPlugin.category]?.color
                )}>
                  <CategoryIcon className="w-3 h-3" />
                  {currentPlugin.category}
                </span>
                {currentPlugin.isOfficial && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    Official
                  </span>
                )}
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {currentPlugin.name}
              </h2>

              <p className="text-gray-300 text-lg mb-6 line-clamp-2">
                {currentPlugin.shortDescription}
              </p>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-semibold">{currentPlugin.rating}</span>
                  <span className="text-gray-400">({currentPlugin.reviewCount})</span>
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <Download className="w-4 h-4" />
                  <span>{(currentPlugin.downloads / 1000).toFixed(0)}K+</span>
                </div>
                <div className="text-gray-400">
                  v{currentPlugin.version}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onInstall(currentPlugin)}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  {currentPlugin.isInstalled ? (
                    <>
                      <Check className="w-5 h-5" />
                      Installed
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      {currentPlugin.price === 'free' ? 'Install Free' : `Get for $${currentPlugin.price}`}
                    </>
                  )}
                </button>
                <button
                  onClick={() => onSelectPlugin(currentPlugin)}
                  className="px-6 py-3 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 backdrop-blur-sm transition-colors flex items-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  View Details
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={() => setCurrentIndex(prev => (prev - 1 + featuredPlugins.length) % featuredPlugins.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => setCurrentIndex(prev => (prev + 1) % featuredPlugins.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {featuredPlugins.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={clsx(
              'w-2 h-2 rounded-full transition-all',
              idx === currentIndex ? 'w-8 bg-white' : 'bg-white/50 hover:bg-white/75'
            )}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================
// ENHANCEMENT 6: PLUGIN CARDS WITH RICH PREVIEW
// ============================================

interface PluginCardProps {
  plugin: Plugin;
  viewMode: ViewMode;
  onSelect: (plugin: Plugin) => void;
  onInstall: (plugin: Plugin) => void;
  onToggleActive: (plugin: Plugin) => void;
}

const PluginCard: React.FC<PluginCardProps> = ({
  plugin,
  viewMode,
  onSelect,
  onInstall,
  onToggleActive,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const CategoryIcon = categoryConfig[plugin.category]?.icon || Puzzle;

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-lg transition-all"
      >
        <div className="flex items-center gap-4">
          <img
            src={plugin.icon}
            alt={plugin.name}
            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {plugin.name}
              </h3>
              <PluginBadges plugin={plugin} size="sm" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
              {plugin.shortDescription}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium text-gray-700 dark:text-gray-300">{plugin.rating}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Download className="w-4 h-4" />
                <span>{(plugin.downloads / 1000).toFixed(0)}K</span>
              </div>
              <span className={clsx(
                'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                categoryConfig[plugin.category]?.bgColor,
                categoryConfig[plugin.category]?.color
              )}>
                <CategoryIcon className="w-3 h-3" />
                {plugin.category}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {plugin.isInstalled ? (
              <button
                onClick={() => onToggleActive(plugin)}
                className={clsx(
                  'px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                  plugin.isActive
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {plugin.isActive ? 'Active' : 'Inactive'}
              </button>
            ) : (
              <button
                onClick={() => onInstall(plugin)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
              >
                {plugin.price === 'free' ? 'Install' : `$${plugin.price}`}
              </button>
            )}
            <button
              onClick={() => onSelect(plugin)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all group"
    >
      {/* Header with icon and badges */}
      <div className="relative p-5 pb-0">
        <div className="flex items-start gap-4">
          <img
            src={plugin.icon}
            alt={plugin.name}
            className="w-14 h-14 rounded-xl object-cover shadow-lg"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1">
              {plugin.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              by {plugin.author}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <PluginBadges plugin={plugin} size="sm" />
        </div>
      </div>

      {/* Description */}
      <div className="px-5 py-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {plugin.shortDescription}
        </p>
      </div>

      {/* Stats */}
      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {plugin.rating}
              </span>
              <span className="text-xs text-gray-400">({plugin.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Download className="w-4 h-4" />
              <span className="text-sm">{(plugin.downloads / 1000).toFixed(0)}K</span>
            </div>
          </div>
          <span className={clsx(
            'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
            categoryConfig[plugin.category]?.bgColor,
            categoryConfig[plugin.category]?.color
          )}>
            <CategoryIcon className="w-3 h-3" />
            {plugin.category}
          </span>
        </div>
      </div>

      {/* Hover overlay with actions */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent flex items-end justify-center p-5"
          >
            <div className="flex items-center gap-2 w-full">
              {plugin.isInstalled ? (
                <button
                  onClick={() => onToggleActive(plugin)}
                  className={clsx(
                    'flex-1 py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2',
                    plugin.isActive
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-white text-gray-900 hover:bg-gray-100'
                  )}
                >
                  {plugin.isActive ? (
                    <>
                      <Check className="w-4 h-4" />
                      Active
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Activate
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => onInstall(plugin)}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {plugin.price === 'free' ? 'Install Free' : `Get $${plugin.price}`}
                </button>
              )}
              <button
                onClick={() => onSelect(plugin)}
                className="p-2.5 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ============================================
// ENHANCEMENT 7: VERIFIED/OFFICIAL BADGE SYSTEM
// ============================================

interface PluginBadgesProps {
  plugin: Plugin;
  size?: 'sm' | 'md';
}

const PluginBadges: React.FC<PluginBadgesProps> = ({ plugin, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <div className="flex flex-wrap gap-1">
      {plugin.isOfficial && (
        <span className={clsx(
          'inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full font-medium',
          sizeClasses
        )}>
          <CheckCircle className={iconSize} />
          Official
        </span>
      )}
      {plugin.isVerified && !plugin.isOfficial && (
        <span className={clsx(
          'inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium',
          sizeClasses
        )}>
          <Shield className={iconSize} />
          Verified
        </span>
      )}
      {plugin.isPremium && (
        <span className={clsx(
          'inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full font-medium',
          sizeClasses
        )}>
          <Crown className={iconSize} />
          Premium
        </span>
      )}
      {plugin.requiresRust && (
        <span className={clsx(
          'inline-flex items-center gap-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full font-medium',
          sizeClasses
        )}>
          <Cpu className={iconSize} />
          Rust
        </span>
      )}
      {plugin.isTrending && (
        <span className={clsx(
          'inline-flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full font-medium',
          sizeClasses
        )}>
          <Flame className={iconSize} />
          Trending
        </span>
      )}
      {plugin.isNew && (
        <span className={clsx(
          'inline-flex items-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full font-medium',
          sizeClasses
        )}>
          <Sparkles className={iconSize} />
          New
        </span>
      )}
    </div>
  );
};

// ============================================
// ENHANCEMENT 8: PLUGIN RECOMMENDATIONS
// ============================================

interface RecommendationsProps {
  plugins: Plugin[];
  installedPlugins: Plugin[];
  onSelectPlugin: (plugin: Plugin) => void;
}

const PluginRecommendations: React.FC<RecommendationsProps> = ({
  plugins,
  installedPlugins,
  onSelectPlugin,
}) => {
  // Get categories of installed plugins
  const installedCategories = useMemo(() => {
    return new Set(installedPlugins.map(p => p.category));
  }, [installedPlugins]);

  // Recommend plugins from same categories that aren't installed
  const recommendations = useMemo(() => {
    return plugins
      .filter(p => !p.isInstalled && installedCategories.has(p.category))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
  }, [plugins, installedCategories]);

  if (recommendations.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recommended for You
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map(plugin => {
          const CategoryIcon = categoryConfig[plugin.category]?.icon || Puzzle;
          return (
            <motion.div
              key={plugin.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => onSelectPlugin(plugin)}
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30 cursor-pointer hover:shadow-md transition-all"
            >
              <img
                src={plugin.icon}
                alt={plugin.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {plugin.name}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CategoryIcon className="w-3 h-3" />
                  <span>{plugin.category}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium">{plugin.rating}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// ENHANCEMENT 9: TRENDING PLUGINS SECTION
// ============================================

interface TrendingPluginsProps {
  plugins: Plugin[];
  onSelectPlugin: (plugin: Plugin) => void;
}

const TrendingPlugins: React.FC<TrendingPluginsProps> = ({ plugins, onSelectPlugin }) => {
  const trendingPlugins = useMemo(() => {
    return plugins
      .filter(p => p.isTrending)
      .sort((a, b) => b.weeklyDownloads - a.weeklyDownloads)
      .slice(0, 5);
  }, [plugins]);

  if (trendingPlugins.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Trending This Week
          </h3>
        </div>
        <span className="text-sm text-gray-500">Based on weekly downloads</span>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 rounded-2xl p-1">
        <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
          {trendingPlugins.map((plugin, index) => {
            const CategoryIcon = categoryConfig[plugin.category]?.icon || Puzzle;
            return (
              <motion.div
                key={plugin.id}
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                onClick={() => onSelectPlugin(plugin)}
                className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800 last:border-0 cursor-pointer"
              >
                <div className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                  index === 0 && 'bg-yellow-100 text-yellow-700',
                  index === 1 && 'bg-gray-100 text-gray-600',
                  index === 2 && 'bg-orange-100 text-orange-700',
                  index > 2 && 'bg-gray-50 text-gray-500'
                )}>
                  {index + 1}
                </div>

                <img
                  src={plugin.icon}
                  alt={plugin.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {plugin.name}
                    </span>
                    <PluginBadges plugin={plugin} size="sm" />
                  </div>
                  <p className="text-sm text-gray-500 truncate">{plugin.shortDescription}</p>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">{(plugin.weeklyDownloads / 1000).toFixed(1)}K</span>
                  </div>
                  <span className="text-xs text-gray-400">this week</span>
                </div>

                <ArrowRight className="w-5 h-5 text-gray-300" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================
// ENHANCEMENT 10: NEW RELEASES TIMELINE
// ============================================

interface NewReleasesProps {
  plugins: Plugin[];
  onSelectPlugin: (plugin: Plugin) => void;
}

const NewReleasesTimeline: React.FC<NewReleasesProps> = ({ plugins, onSelectPlugin }) => {
  const newReleases = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return plugins
      .filter(p => new Date(p.lastUpdated) > thirtyDaysAgo || p.isNew)
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      .slice(0, 6);
  }, [plugins]);

  if (newReleases.length === 0) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recently Updated
        </h3>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500" />

        <div className="space-y-4">
          {newReleases.map((plugin, index) => {
            const CategoryIcon = categoryConfig[plugin.category]?.icon || Puzzle;
            return (
              <motion.div
                key={plugin.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onSelectPlugin(plugin)}
                className="relative flex items-center gap-4 pl-14 cursor-pointer group"
              >
                {/* Timeline dot */}
                <div className="absolute left-4 w-4 h-4 rounded-full bg-white dark:bg-gray-900 border-4 border-blue-500 group-hover:scale-125 transition-transform" />

                <div className="flex-1 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3">
                    <img
                      src={plugin.icon}
                      alt={plugin.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {plugin.name}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                          v{plugin.version}
                        </span>
                        {plugin.isNew && (
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{plugin.shortDescription}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {formatDate(plugin.lastUpdated)}
                      </p>
                      <div className="flex items-center gap-1 text-gray-400">
                        <CategoryIcon className="w-3 h-3" />
                        <span className="text-xs">{plugin.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN PLUGIN GALLERY COMPONENT
// ============================================

interface PluginGalleryProps {
  onSelectPlugin?: (plugin: Plugin) => void;
}

const PluginGallery: React.FC<PluginGalleryProps> = ({ onSelectPlugin }) => {
  // State
  const [plugins] = useState<Plugin[]>(samplePlugins);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('popular');

  // Computed values
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    plugins.forEach(p => cats.add(p.category));
    return Array.from(cats).sort();
  }, [plugins]);

  const installedPlugins = useMemo(() => {
    return plugins.filter(p => p.isInstalled);
  }, [plugins]);

  const filteredPlugins = useMemo(() => {
    let result = [...plugins];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query)) ||
        p.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case 'popular':
          return b.activeInstalls - a.activeInstalls;
        case 'downloads':
          return b.downloads - a.downloads;
        case 'rating':
          return b.rating - a.rating;
        case 'newest':
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        case 'updated':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return result;
  }, [plugins, searchQuery, selectedCategory, sortOption]);

  // Handlers
  const handleSelectPlugin = (plugin: Plugin) => {
    onSelectPlugin?.(plugin);
    toast.success(`Selected: ${plugin.name}`);
  };

  const handleInstall = (plugin: Plugin) => {
    if (plugin.price === 'free') {
      toast.success(`Installing ${plugin.name}...`);
    } else {
      toast(`Redirecting to purchase ${plugin.name}...`);
    }
  };

  const handleToggleActive = (plugin: Plugin) => {
    toast.success(`${plugin.name} ${plugin.isActive ? 'deactivated' : 'activated'}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <Puzzle className="w-8 h-8 text-blue-600" />
                Plugins
              </h1>
              <p className="text-gray-500 mt-1">
                Discover, install, and manage plugins for your site
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Check Updates
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Upload Plugin
              </button>
            </div>
          </div>

          {/* Search */}
          <SearchAutocomplete
            value={searchQuery}
            onChange={setSearchQuery}
            plugins={plugins}
            onSelectPlugin={handleSelectPlugin}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Featured Carousel */}
        <FeaturedCarousel
          plugins={plugins}
          onSelectPlugin={handleSelectPlugin}
          onInstall={handleInstall}
        />

        {/* Trending Section */}
        <TrendingPlugins
          plugins={plugins}
          onSelectPlugin={handleSelectPlugin}
        />

        {/* Recommendations */}
        <PluginRecommendations
          plugins={plugins}
          installedPlugins={installedPlugins}
          onSelectPlugin={handleSelectPlugin}
        />

        {/* New Releases */}
        <NewReleasesTimeline
          plugins={plugins}
          onSelectPlugin={handleSelectPlugin}
        />

        {/* Category Filter */}
        <div className="mb-6">
          <CategoryFilter
            categories={allCategories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {filteredPlugins.length} plugins found
            </span>
          </div>
          <div className="flex items-center gap-3">
            <SortDropdown
              sortOption={sortOption}
              onSortChange={setSortOption}
            />
            <ViewToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        </div>

        {/* Plugin Grid/List */}
        <AnimatePresence mode="popLayout">
          {filteredPlugins.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Puzzle className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No plugins found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filters
              </p>
            </motion.div>
          ) : (
            <motion.div
              layout
              className={clsx(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              )}
            >
              {filteredPlugins.map(plugin => (
                <PluginCard
                  key={plugin.id}
                  plugin={plugin}
                  viewMode={viewMode}
                  onSelect={handleSelectPlugin}
                  onInstall={handleInstall}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PluginGallery;
export {
  ViewToggle,
  SearchAutocomplete,
  CategoryFilter,
  SortDropdown,
  FeaturedCarousel,
  PluginCard,
  PluginBadges,
  PluginRecommendations,
  TrendingPlugins,
  NewReleasesTimeline,
};
export type { Plugin, ViewMode, SortOption };
