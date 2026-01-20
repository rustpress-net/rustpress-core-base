/**
 * App Types - RustPress Apps System
 * Apps are applications that use RustPress as middleware between React/Rust apps
 */

/**
 * Site Mode - Determines how RustPress handles frontend vs apps
 * - website: Shows the frontend website, apps are not accessible
 * - app: Shows selected app(s), if multiple apps assigned shows app selector
 * - hybrid: Website is main, but apps accessible via direct URL
 */
export type SiteMode = 'website' | 'app' | 'hybrid';

/**
 * App Deployment Type - Determines how the app is deployed
 * - fullstack: Full application with UI (React frontend + Rust backend)
 * - backend: Backend only, no UI - just API/backend interfacing with RustPress
 */
export type AppDeploymentType = 'fullstack' | 'backend';

export interface SiteModeSettings {
  mode: SiteMode;
  deploymentType?: AppDeploymentType; // For app mode - fullstack or backend only
  defaultAppId?: string; // For app mode - which app to launch by default
  allowedAppsInHybrid?: string[]; // For hybrid mode - which apps are URL-accessible
  appSelectorStyle?: 'grid' | 'list'; // Style for app selector page
  showAppSelectorLogo?: boolean;
  appSelectorTitle?: string;
  appSelectorDescription?: string;
  // Backend mode specific settings
  backendApiPrefix?: string; // Custom API prefix for backend mode (default: /api)
  backendCorsOrigins?: string[]; // Allowed CORS origins for backend mode
  backendRateLimitPerMinute?: number; // Rate limiting for backend API
  backendAuthRequired?: boolean; // Require authentication for all endpoints
}

export type AppCategory =
  | 'productivity'
  | 'analytics'
  | 'ecommerce'
  | 'communication'
  | 'automation'
  | 'security'
  | 'utilities';

export type AppPermission =
  | 'read:users'
  | 'write:users'
  | 'read:content'
  | 'write:content'
  | 'api:external'
  | 'storage:files';

export interface AppPricing {
  type: 'free' | 'membership' | 'one-time';
  price?: number;
  currency?: string;
  billingPeriod?: 'monthly' | 'yearly';
}

export interface AppScreenshot {
  url: string;
  caption?: string;
}

export interface AppReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface App {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  version: string;
  author: string;
  authorUrl?: string;
  icon: string;
  banner?: string;
  category: AppCategory;
  tags?: string[];
  pricing: AppPricing;
  status: 'active' | 'inactive' | 'suspended';
  installDate?: string;
  lastUpdated?: string;
  config?: Record<string, unknown>;
  permissions: AppPermission[];
  entryPoint: string; // Main React component path
  rustBackend?: string; // Rust API endpoint
  screenshots?: AppScreenshot[];
  reviews?: AppReview[];
  rating?: number;
  downloadCount?: number;
  featured?: boolean;
  verified?: boolean;
  changelog?: string;
  documentation?: string;
  supportUrl?: string;
  requirements?: {
    minRustPressVersion?: string;
    dependencies?: string[];
  };
}

export interface InstalledApp extends App {
  installDate: string;
  installedVersion: string;
  updateAvailable?: boolean;
  newVersion?: string;
  license?: {
    key: string;
    type: 'free' | 'membership' | 'one-time';
    expiresAt?: string;
    isValid: boolean;
  };
}

export interface AppConfig {
  appId: string;
  settings: Record<string, unknown>;
  apiKeys?: Record<string, string>;
  webhooks?: Array<{
    id: string;
    url: string;
    events: string[];
    enabled: boolean;
  }>;
}

export interface UserAppAccess {
  userId: string;
  appIds: string[];
  defaultAppId?: string;
  accessRules?: Array<{
    appId: string;
    allowedFrom?: string; // Time-based access
    allowedUntil?: string;
    roles?: string[];
  }>;
}

export interface AppUsageStats {
  appId: string;
  totalLaunches: number;
  uniqueUsers: number;
  lastLaunch?: string;
  dailyStats?: Array<{
    date: string;
    launches: number;
    users: number;
  }>;
}

// Store state types
export interface AppStoreFilters {
  category?: AppCategory;
  priceType?: 'free' | 'paid' | 'all';
  sortBy?: 'popular' | 'recent' | 'rating' | 'name';
  search?: string;
}

export interface AppNotification {
  id: string;
  appId: string;
  type: 'update' | 'license' | 'security' | 'info';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

// Category metadata for UI
export const APP_CATEGORIES: Record<AppCategory, { label: string; icon: string; description: string }> = {
  productivity: {
    label: 'Productivity',
    icon: 'Briefcase',
    description: 'Tools to boost your workflow'
  },
  analytics: {
    label: 'Analytics',
    icon: 'BarChart3',
    description: 'Data insights and reporting'
  },
  ecommerce: {
    label: 'E-Commerce',
    icon: 'ShoppingCart',
    description: 'Online store and payments'
  },
  communication: {
    label: 'Communication',
    icon: 'MessageSquare',
    description: 'Chat, email, and notifications'
  },
  automation: {
    label: 'Automation',
    icon: 'Workflow',
    description: 'Automate repetitive tasks'
  },
  security: {
    label: 'Security',
    icon: 'Shield',
    description: 'Protection and authentication'
  },
  utilities: {
    label: 'Utilities',
    icon: 'Wrench',
    description: 'Helpful tools and utilities'
  }
};

// Permission metadata for UI
export const APP_PERMISSIONS: Record<AppPermission, { label: string; description: string; risk: 'low' | 'medium' | 'high' }> = {
  'read:users': {
    label: 'Read Users',
    description: 'Access user profile information',
    risk: 'low'
  },
  'write:users': {
    label: 'Modify Users',
    description: 'Create, update, or delete users',
    risk: 'high'
  },
  'read:content': {
    label: 'Read Content',
    description: 'Access posts, pages, and media',
    risk: 'low'
  },
  'write:content': {
    label: 'Modify Content',
    description: 'Create, update, or delete content',
    risk: 'medium'
  },
  'api:external': {
    label: 'External API',
    description: 'Make requests to external services',
    risk: 'medium'
  },
  'storage:files': {
    label: 'File Storage',
    description: 'Read and write files',
    risk: 'medium'
  }
};
