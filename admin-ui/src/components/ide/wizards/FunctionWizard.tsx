/**
 * FunctionWizard - Step-by-step wizard for creating serverless functions
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, ChevronLeft, Check, Zap, Code,
  Globe, Clock, Database, Shield, FileCode, FolderPlus,
  Terminal, Eye, Sparkles, Lock, Webhook, Server,
  Cloud, Timer, Key, RefreshCw, Package, Puzzle, Box,
  Search, ChevronDown, ChevronUp, AlertCircle, GitBranch,
  Loader2
} from 'lucide-react';
import { createFunction, generateFunctionFiles, type FunctionConfig as ServiceFunctionConfig } from '../../../services/functionService';

interface FunctionConfig {
  name: string;
  slug: string;
  description: string;
  runtime: 'rust' | 'typescript' | 'python';
  trigger: 'http' | 'cron' | 'webhook' | 'event';
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'ANY';
  httpPath?: string;
  cronSchedule?: string;
  eventType?: string;
  eventSource?: 'rustpress' | 'application' | 'plugin';
  timeout: number;
  memory: number;
  environment: { key: string; value: string }[];
  authentication: 'none' | 'api-key' | 'jwt' | 'oauth';
  cors: boolean;
  logging: boolean;
  retries: number;
  targetRepository?: string;
}

// Event definition from various sources
interface EventDefinition {
  id: string;
  name: string;
  description: string;
  payload?: string;
  source: 'rustpress' | 'application' | 'plugin';
  sourceId?: string; // plugin id or app id
  sourceName?: string; // plugin name or app name
}

// Event category for grouping
interface EventCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  events: EventDefinition[];
}

interface FunctionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (config: FunctionConfig) => void;
}

const runtimes = [
  { id: 'rust', name: 'Rust', description: 'High performance, low latency', icon: '🦀', color: 'orange' },
  { id: 'typescript', name: 'TypeScript', description: 'Modern JavaScript with types', icon: '📘', color: 'blue' },
  { id: 'python', name: 'Python', description: 'Easy scripting & AI/ML', icon: '🐍', color: 'green' },
];

const triggers = [
  { id: 'http', name: 'HTTP Endpoint', description: 'REST API endpoint', icon: Globe },
  { id: 'cron', name: 'Scheduled', description: 'Run on a schedule', icon: Clock },
  { id: 'webhook', name: 'Webhook', description: 'External webhook trigger', icon: Webhook },
  { id: 'event', name: 'Event', description: 'Internal event trigger', icon: Zap },
];

const cronPresets = [
  { value: '0 * * * *', label: 'Every hour' },
  { value: '0 0 * * *', label: 'Daily at midnight' },
  { value: '0 0 * * 0', label: 'Weekly on Sunday' },
  { value: '0 0 1 * *', label: 'Monthly on the 1st' },
  { value: '*/5 * * * *', label: 'Every 5 minutes' },
  { value: '*/15 * * * *', label: 'Every 15 minutes' },
];

// RustPress Core Events - built-in system events
const rustpressCoreEvents: EventDefinition[] = [
  // Content Events
  { id: 'content.post.created', name: 'Post Created', description: 'Triggered when a new post is created', source: 'rustpress', payload: '{ postId, title, author, status }' },
  { id: 'content.post.updated', name: 'Post Updated', description: 'Triggered when a post is modified', source: 'rustpress', payload: '{ postId, title, changes, author }' },
  { id: 'content.post.deleted', name: 'Post Deleted', description: 'Triggered when a post is deleted', source: 'rustpress', payload: '{ postId, title }' },
  { id: 'content.post.published', name: 'Post Published', description: 'Triggered when a post is published', source: 'rustpress', payload: '{ postId, title, url }' },
  { id: 'content.post.unpublished', name: 'Post Unpublished', description: 'Triggered when a post is unpublished', source: 'rustpress', payload: '{ postId, title }' },
  { id: 'content.page.created', name: 'Page Created', description: 'Triggered when a new page is created', source: 'rustpress', payload: '{ pageId, title, author }' },
  { id: 'content.page.updated', name: 'Page Updated', description: 'Triggered when a page is modified', source: 'rustpress', payload: '{ pageId, title, changes }' },
  { id: 'content.page.deleted', name: 'Page Deleted', description: 'Triggered when a page is deleted', source: 'rustpress', payload: '{ pageId, title }' },

  // Media Events
  { id: 'media.uploaded', name: 'Media Uploaded', description: 'Triggered when a file is uploaded', source: 'rustpress', payload: '{ mediaId, filename, type, size }' },
  { id: 'media.deleted', name: 'Media Deleted', description: 'Triggered when a media file is deleted', source: 'rustpress', payload: '{ mediaId, filename }' },
  { id: 'media.processed', name: 'Media Processed', description: 'Triggered after media processing (resize, optimize)', source: 'rustpress', payload: '{ mediaId, variants }' },

  // User Events
  { id: 'user.registered', name: 'User Registered', description: 'Triggered when a new user registers', source: 'rustpress', payload: '{ userId, email, username }' },
  { id: 'user.login', name: 'User Login', description: 'Triggered when a user logs in', source: 'rustpress', payload: '{ userId, email, ip, userAgent }' },
  { id: 'user.logout', name: 'User Logout', description: 'Triggered when a user logs out', source: 'rustpress', payload: '{ userId, sessionId }' },
  { id: 'user.updated', name: 'User Updated', description: 'Triggered when user profile is updated', source: 'rustpress', payload: '{ userId, changes }' },
  { id: 'user.deleted', name: 'User Deleted', description: 'Triggered when a user is deleted', source: 'rustpress', payload: '{ userId, email }' },
  { id: 'user.password_reset', name: 'Password Reset Requested', description: 'Triggered when password reset is requested', source: 'rustpress', payload: '{ userId, email }' },
  { id: 'user.email_verified', name: 'Email Verified', description: 'Triggered when user email is verified', source: 'rustpress', payload: '{ userId, email }' },
  { id: 'user.role_changed', name: 'User Role Changed', description: 'Triggered when user role is modified', source: 'rustpress', payload: '{ userId, oldRole, newRole }' },

  // Comment Events
  { id: 'comment.created', name: 'Comment Created', description: 'Triggered when a comment is posted', source: 'rustpress', payload: '{ commentId, postId, author, content }' },
  { id: 'comment.approved', name: 'Comment Approved', description: 'Triggered when a comment is approved', source: 'rustpress', payload: '{ commentId, postId }' },
  { id: 'comment.rejected', name: 'Comment Rejected', description: 'Triggered when a comment is rejected', source: 'rustpress', payload: '{ commentId, reason }' },
  { id: 'comment.deleted', name: 'Comment Deleted', description: 'Triggered when a comment is deleted', source: 'rustpress', payload: '{ commentId, postId }' },

  // Theme Events
  { id: 'theme.activated', name: 'Theme Activated', description: 'Triggered when a theme is activated', source: 'rustpress', payload: '{ themeId, themeName }' },
  { id: 'theme.deactivated', name: 'Theme Deactivated', description: 'Triggered when a theme is deactivated', source: 'rustpress', payload: '{ themeId, themeName }' },
  { id: 'theme.updated', name: 'Theme Updated', description: 'Triggered when a theme is updated', source: 'rustpress', payload: '{ themeId, version }' },

  // Plugin Events
  { id: 'plugin.activated', name: 'Plugin Activated', description: 'Triggered when a plugin is activated', source: 'rustpress', payload: '{ pluginId, pluginName }' },
  { id: 'plugin.deactivated', name: 'Plugin Deactivated', description: 'Triggered when a plugin is deactivated', source: 'rustpress', payload: '{ pluginId, pluginName }' },
  { id: 'plugin.updated', name: 'Plugin Updated', description: 'Triggered when a plugin is updated', source: 'rustpress', payload: '{ pluginId, oldVersion, newVersion }' },

  // Site Events
  { id: 'site.settings_updated', name: 'Settings Updated', description: 'Triggered when site settings are changed', source: 'rustpress', payload: '{ settings, changedKeys }' },
  { id: 'site.cache_cleared', name: 'Cache Cleared', description: 'Triggered when site cache is cleared', source: 'rustpress', payload: '{ cacheType }' },
  { id: 'site.backup_created', name: 'Backup Created', description: 'Triggered when a site backup is created', source: 'rustpress', payload: '{ backupId, size }' },

  // Storage Events
  { id: 'storage.migration_started', name: 'Storage Migration Started', description: 'Triggered when storage migration begins', source: 'rustpress', payload: '{ migrationId, source, target }' },
  { id: 'storage.migration_completed', name: 'Storage Migration Completed', description: 'Triggered when storage migration finishes', source: 'rustpress', payload: '{ migrationId, filesTransferred }' },
  { id: 'storage.migration_failed', name: 'Storage Migration Failed', description: 'Triggered when storage migration fails', source: 'rustpress', payload: '{ migrationId, error }' },

  // API Events
  { id: 'api.request', name: 'API Request', description: 'Triggered on API request (use with caution)', source: 'rustpress', payload: '{ method, path, userId }' },
  { id: 'api.rate_limited', name: 'Rate Limit Exceeded', description: 'Triggered when rate limit is exceeded', source: 'rustpress', payload: '{ ip, endpoint, limit }' },
];

// Default Application Events (built-in apps can define these)
const applicationEvents: EventDefinition[] = [
  // E-commerce events
  { id: 'ecommerce.order.placed', name: 'Order Placed', description: 'Triggered when an order is placed', source: 'application', sourceId: 'ecommerce', sourceName: 'E-Commerce', payload: '{ orderId, total, items }' },
  { id: 'ecommerce.order.paid', name: 'Order Paid', description: 'Triggered when payment is received', source: 'application', sourceId: 'ecommerce', sourceName: 'E-Commerce', payload: '{ orderId, paymentMethod }' },
  { id: 'ecommerce.order.shipped', name: 'Order Shipped', description: 'Triggered when order is shipped', source: 'application', sourceId: 'ecommerce', sourceName: 'E-Commerce', payload: '{ orderId, trackingNumber }' },
  { id: 'ecommerce.order.delivered', name: 'Order Delivered', description: 'Triggered when order is delivered', source: 'application', sourceId: 'ecommerce', sourceName: 'E-Commerce', payload: '{ orderId }' },
  { id: 'ecommerce.order.cancelled', name: 'Order Cancelled', description: 'Triggered when order is cancelled', source: 'application', sourceId: 'ecommerce', sourceName: 'E-Commerce', payload: '{ orderId, reason }' },
  { id: 'ecommerce.order.refunded', name: 'Order Refunded', description: 'Triggered when order is refunded', source: 'application', sourceId: 'ecommerce', sourceName: 'E-Commerce', payload: '{ orderId, amount }' },
  { id: 'ecommerce.cart.updated', name: 'Cart Updated', description: 'Triggered when cart is modified', source: 'application', sourceId: 'ecommerce', sourceName: 'E-Commerce', payload: '{ cartId, items }' },
  { id: 'ecommerce.cart.abandoned', name: 'Cart Abandoned', description: 'Triggered when cart is abandoned', source: 'application', sourceId: 'ecommerce', sourceName: 'E-Commerce', payload: '{ cartId, items, userId }' },
  { id: 'ecommerce.product.low_stock', name: 'Low Stock Alert', description: 'Triggered when product stock is low', source: 'application', sourceId: 'ecommerce', sourceName: 'E-Commerce', payload: '{ productId, currentStock }' },
  { id: 'ecommerce.product.out_of_stock', name: 'Out of Stock', description: 'Triggered when product is out of stock', source: 'application', sourceId: 'ecommerce', sourceName: 'E-Commerce', payload: '{ productId }' },

  // Membership events
  { id: 'membership.subscription.created', name: 'Subscription Created', description: 'Triggered when subscription starts', source: 'application', sourceId: 'membership', sourceName: 'Membership', payload: '{ subscriptionId, planId, userId }' },
  { id: 'membership.subscription.renewed', name: 'Subscription Renewed', description: 'Triggered when subscription renews', source: 'application', sourceId: 'membership', sourceName: 'Membership', payload: '{ subscriptionId, nextBillingDate }' },
  { id: 'membership.subscription.cancelled', name: 'Subscription Cancelled', description: 'Triggered when subscription is cancelled', source: 'application', sourceId: 'membership', sourceName: 'Membership', payload: '{ subscriptionId, reason }' },
  { id: 'membership.subscription.expired', name: 'Subscription Expired', description: 'Triggered when subscription expires', source: 'application', sourceId: 'membership', sourceName: 'Membership', payload: '{ subscriptionId, userId }' },
  { id: 'membership.payment.failed', name: 'Payment Failed', description: 'Triggered when recurring payment fails', source: 'application', sourceId: 'membership', sourceName: 'Membership', payload: '{ subscriptionId, error }' },

  // Forms events
  { id: 'forms.submission.created', name: 'Form Submitted', description: 'Triggered when a form is submitted', source: 'application', sourceId: 'forms', sourceName: 'Forms', payload: '{ formId, submissionId, data }' },
  { id: 'forms.submission.spam', name: 'Spam Detected', description: 'Triggered when spam is detected', source: 'application', sourceId: 'forms', sourceName: 'Forms', payload: '{ formId, reason }' },

  // Newsletter events
  { id: 'newsletter.subscribed', name: 'Newsletter Subscribed', description: 'Triggered when user subscribes', source: 'application', sourceId: 'newsletter', sourceName: 'Newsletter', payload: '{ email, listId }' },
  { id: 'newsletter.unsubscribed', name: 'Newsletter Unsubscribed', description: 'Triggered when user unsubscribes', source: 'application', sourceId: 'newsletter', sourceName: 'Newsletter', payload: '{ email, listId }' },
  { id: 'newsletter.campaign_sent', name: 'Campaign Sent', description: 'Triggered when campaign is sent', source: 'application', sourceId: 'newsletter', sourceName: 'Newsletter', payload: '{ campaignId, recipients }' },

  // CRM events
  { id: 'crm.contact.created', name: 'Contact Created', description: 'Triggered when contact is created', source: 'application', sourceId: 'crm', sourceName: 'CRM', payload: '{ contactId, email }' },
  { id: 'crm.contact.updated', name: 'Contact Updated', description: 'Triggered when contact is updated', source: 'application', sourceId: 'crm', sourceName: 'CRM', payload: '{ contactId, changes }' },
  { id: 'crm.deal.created', name: 'Deal Created', description: 'Triggered when deal is created', source: 'application', sourceId: 'crm', sourceName: 'CRM', payload: '{ dealId, value }' },
  { id: 'crm.deal.won', name: 'Deal Won', description: 'Triggered when deal is won', source: 'application', sourceId: 'crm', sourceName: 'CRM', payload: '{ dealId, value }' },
  { id: 'crm.deal.lost', name: 'Deal Lost', description: 'Triggered when deal is lost', source: 'application', sourceId: 'crm', sourceName: 'CRM', payload: '{ dealId, reason }' },
];

// Mock plugin events - in production these would be loaded from installed plugins
const getPluginEvents = (): EventDefinition[] => {
  // These would be fetched from the API based on installed plugins
  return [
    // SEO Plugin events
    { id: 'seo.analysis.completed', name: 'SEO Analysis Completed', description: 'Triggered after SEO analysis', source: 'plugin', sourceId: 'seo-optimizer', sourceName: 'SEO Optimizer', payload: '{ postId, score, suggestions }' },
    { id: 'seo.sitemap.generated', name: 'Sitemap Generated', description: 'Triggered when sitemap is regenerated', source: 'plugin', sourceId: 'seo-optimizer', sourceName: 'SEO Optimizer', payload: '{ urls, lastModified }' },

    // Social Share Plugin events
    { id: 'social.shared', name: 'Content Shared', description: 'Triggered when content is shared', source: 'plugin', sourceId: 'social-share', sourceName: 'Social Share', payload: '{ postId, platform, userId }' },

    // Analytics Plugin events
    { id: 'analytics.goal.reached', name: 'Goal Reached', description: 'Triggered when analytics goal is reached', source: 'plugin', sourceId: 'analytics-dashboard', sourceName: 'Analytics Dashboard', payload: '{ goalId, value }' },
    { id: 'analytics.report.generated', name: 'Report Generated', description: 'Triggered when scheduled report is generated', source: 'plugin', sourceId: 'analytics-dashboard', sourceName: 'Analytics Dashboard', payload: '{ reportId, period }' },

    // Security Plugin events
    { id: 'security.login.suspicious', name: 'Suspicious Login', description: 'Triggered on suspicious login attempt', source: 'plugin', sourceId: 'security-shield', sourceName: 'Security Shield', payload: '{ userId, ip, reason }' },
    { id: 'security.attack.blocked', name: 'Attack Blocked', description: 'Triggered when attack is blocked', source: 'plugin', sourceId: 'security-shield', sourceName: 'Security Shield', payload: '{ type, ip, details }' },

    // Backup Plugin events
    { id: 'backup.scheduled.completed', name: 'Scheduled Backup Completed', description: 'Triggered when scheduled backup completes', source: 'plugin', sourceId: 'auto-backup', sourceName: 'Auto Backup', payload: '{ backupId, size, location }' },
    { id: 'backup.restore.completed', name: 'Restore Completed', description: 'Triggered when restore completes', source: 'plugin', sourceId: 'auto-backup', sourceName: 'Auto Backup', payload: '{ backupId }' },

    // Image Optimizer Plugin events
    { id: 'imageopt.optimized', name: 'Image Optimized', description: 'Triggered after image optimization', source: 'plugin', sourceId: 'image-optimizer', sourceName: 'Image Optimizer', payload: '{ mediaId, savedBytes, format }' },
    { id: 'imageopt.batch.completed', name: 'Batch Optimization Done', description: 'Triggered when batch optimization completes', source: 'plugin', sourceId: 'image-optimizer', sourceName: 'Image Optimizer', payload: '{ totalImages, totalSaved }' },
  ];
};

const authMethods = [
  { id: 'none', name: 'None', description: 'Public access', icon: Globe },
  { id: 'api-key', name: 'API Key', description: 'Simple key authentication', icon: Key },
  { id: 'jwt', name: 'JWT Token', description: 'Bearer token authentication', icon: Lock },
  { id: 'oauth', name: 'OAuth 2.0', description: 'Full OAuth flow', icon: Shield },
];

export const FunctionWizard: React.FC<FunctionWizardProps> = ({ isOpen, onClose, onCreate }) => {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<FunctionConfig>({
    name: '',
    slug: '',
    description: '',
    runtime: 'rust',
    trigger: 'http',
    httpMethod: 'GET',
    httpPath: '/api/my-function',
    cronSchedule: '0 * * * *',
    eventType: 'content.post.created',
    eventSource: 'rustpress',
    timeout: 30,
    memory: 128,
    environment: [],
    authentication: 'none',
    cors: true,
    logging: true,
    retries: 3,
    targetRepository: '',
  });

  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvValue, setNewEnvValue] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Event selection state
  const [eventSearch, setEventSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['rustpress']));
  const [pluginEvents, setPluginEvents] = useState<EventDefinition[]>([]);

  // Load plugin events on mount (in production, fetch from API)
  useEffect(() => {
    setPluginEvents(getPluginEvents());
  }, []);

  // Build event categories
  const eventCategories: EventCategory[] = [
    {
      id: 'rustpress',
      name: 'RustPress Core',
      icon: Package,
      color: 'text-orange-400',
      events: rustpressCoreEvents,
    },
    {
      id: 'application',
      name: 'Applications',
      icon: Box,
      color: 'text-cyan-400',
      events: applicationEvents,
    },
    {
      id: 'plugin',
      name: 'Plugins',
      icon: Puzzle,
      color: 'text-green-400',
      events: pluginEvents,
    },
  ];

  // Filter events based on search
  const getFilteredEvents = (events: EventDefinition[]) => {
    if (!eventSearch.trim()) return events;
    const search = eventSearch.toLowerCase();
    return events.filter(
      e => e.name.toLowerCase().includes(search) ||
           e.id.toLowerCase().includes(search) ||
           e.description.toLowerCase().includes(search) ||
           (e.sourceName && e.sourceName.toLowerCase().includes(search))
    );
  };

  // Get selected event details
  const getSelectedEvent = (): EventDefinition | undefined => {
    const allEvents = [...rustpressCoreEvents, ...applicationEvents, ...pluginEvents];
    return allEvents.find(e => e.id === config.eventType);
  };

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Select event
  const selectEvent = (event: EventDefinition) => {
    setConfig(prev => ({
      ...prev,
      eventType: event.id,
      eventSource: event.source,
    }));
  };

  const steps = [
    { id: 'info', title: 'Function Info', icon: Zap },
    { id: 'runtime', title: 'Runtime & Trigger', icon: Code },
    { id: 'config', title: 'Configuration', icon: Server },
    { id: 'security', title: 'Security', icon: Shield },
    { id: 'review', title: 'Review', icon: Eye },
  ];

  const currentStep = steps[step];
  const isFirstStep = step === 0;
  const isLastStep = step === steps.length - 1;

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleNext = async () => {
    if (isLastStep) {
      setIsCreating(true);
      setCreateError(null);

      try {
        // Create function files in the target repository
        const result = await createFunction(config as ServiceFunctionConfig);

        if (result.success) {
          onCreate(config);
          onClose();
        } else {
          setCreateError(result.error || 'Failed to create function');
        }
      } catch (error) {
        setCreateError(String(error));
      } finally {
        setIsCreating(false);
      }
    } else {
      setStep(s => s + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setStep(s => s - 1);
    }
  };

  const addEnvVar = () => {
    if (newEnvKey.trim()) {
      setConfig(prev => ({
        ...prev,
        environment: [...prev.environment, { key: newEnvKey.trim(), value: newEnvValue }]
      }));
      setNewEnvKey('');
      setNewEnvValue('');
    }
  };

  const removeEnvVar = (index: number) => {
    setConfig(prev => ({
      ...prev,
      environment: prev.environment.filter((_, i) => i !== index)
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 0: return config.name.trim().length >= 2 && config.targetRepository.trim().length > 0;
      case 1: return config.runtime && config.trigger;
      case 2: return config.timeout > 0 && config.memory > 0;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  // Get the full function path
  const getFunctionPath = () => {
    const repoName = config.targetRepository.replace(/\.git$/, '').split('/').pop() || 'repository';
    return `${repoName}/functions/${config.slug}`;
  };

  const renderStepContent = () => {
    switch (step) {
      case 0: // Function Info
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Function Name *</label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  name: e.target.value,
                  slug: generateSlug(e.target.value)
                }))}
                placeholder="processOrder"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
              />
              <p className="text-xs text-gray-500 mt-1">Use camelCase for function names</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Slug / Endpoint</label>
              <input
                type="text"
                value={config.slug}
                onChange={(e) => setConfig(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="process-order"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={config.description}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What does this function do?"
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 resize-none"
              />
            </div>

            {/* Target Repository */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Repository
                <span className="text-yellow-500 ml-1">*</span>
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <GitBranch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={config.targetRepository}
                    onChange={(e) => setConfig(prev => ({ ...prev, targetRepository: e.target.value }))}
                    placeholder="https://github.com/username/repo.git"
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 font-mono text-sm"
                  />
                </div>
                <div className="flex items-start gap-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-400">
                    <p className="font-medium text-gray-300 mb-1">Function files will be created in:</p>
                    <code className="text-yellow-400 bg-gray-900 px-2 py-1 rounded">
                      {config.targetRepository ? `${config.targetRepository.replace(/\.git$/, '')}` : '[repository]'}/functions/{config.slug || '[function-slug]'}/
                    </code>
                    <p className="mt-2 text-gray-500">
                      The <code className="text-yellow-500">/functions/</code> directory is mandatory and will be created automatically.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 1: // Runtime & Trigger
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Runtime</label>
              <div className="grid grid-cols-3 gap-4">
                {runtimes.map(rt => {
                  const isSelected = config.runtime === rt.id;
                  return (
                    <button
                      key={rt.id}
                      onClick={() => setConfig(prev => ({ ...prev, runtime: rt.id as FunctionConfig['runtime'] }))}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        isSelected
                          ? 'border-yellow-500 bg-yellow-500/10'
                          : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{rt.icon}</div>
                      <h3 className="text-white font-medium">{rt.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">{rt.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Trigger Type</label>
              <div className="grid grid-cols-2 gap-4">
                {triggers.map(trigger => {
                  const Icon = trigger.icon;
                  const isSelected = config.trigger === trigger.id;
                  return (
                    <button
                      key={trigger.id}
                      onClick={() => setConfig(prev => ({ ...prev, trigger: trigger.id as FunctionConfig['trigger'] }))}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-yellow-500 bg-yellow-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-yellow-400' : 'text-gray-400'}`} />
                      <h3 className="text-white font-medium">{trigger.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">{trigger.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trigger-specific config */}
            {config.trigger === 'http' && (
              <div className="space-y-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">HTTP Method</label>
                  <div className="flex gap-2">
                    {(['GET', 'POST', 'PUT', 'DELETE', 'ANY'] as const).map(method => (
                      <button
                        key={method}
                        onClick={() => setConfig(prev => ({ ...prev, httpMethod: method }))}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          config.httpMethod === method
                            ? 'bg-yellow-500 text-black'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Path</label>
                  <input
                    type="text"
                    value={config.httpPath}
                    onChange={(e) => setConfig(prev => ({ ...prev, httpPath: e.target.value }))}
                    placeholder="/api/my-function"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white font-mono text-sm"
                  />
                </div>
              </div>
            )}

            {config.trigger === 'cron' && (
              <div className="space-y-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Schedule (Cron Expression)</label>
                  <input
                    type="text"
                    value={config.cronSchedule}
                    onChange={(e) => setConfig(prev => ({ ...prev, cronSchedule: e.target.value }))}
                    placeholder="0 * * * *"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2">Presets</label>
                  <div className="flex flex-wrap gap-2">
                    {cronPresets.map(preset => (
                      <button
                        key={preset.value}
                        onClick={() => setConfig(prev => ({ ...prev, cronSchedule: preset.value }))}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                          config.cronSchedule === preset.value
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {config.trigger === 'event' && (
              <div className="space-y-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Select Event Trigger</label>

                  {/* Search input */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                      placeholder="Search events..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  {/* Event categories */}
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {eventCategories.map(category => {
                      const Icon = category.icon;
                      const filteredEvents = getFilteredEvents(category.events);
                      const isExpanded = expandedCategories.has(category.id);

                      if (filteredEvents.length === 0 && eventSearch.trim()) return null;

                      return (
                        <div key={category.id} className="border border-gray-700 rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => toggleCategory(category.id)}
                            className="w-full flex items-center justify-between p-3 bg-gray-800/70 hover:bg-gray-800 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Icon className={`w-4 h-4 ${category.color}`} />
                              <span className="text-sm font-medium text-white">{category.name}</span>
                              <span className="text-xs text-gray-500">({filteredEvents.length})</span>
                            </div>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="bg-gray-900/50 max-h-48 overflow-y-auto">
                              {filteredEvents.length === 0 ? (
                                <p className="p-3 text-xs text-gray-500 text-center">No events available</p>
                              ) : (
                                filteredEvents.map(event => {
                                  const isSelected = config.eventType === event.id;
                                  return (
                                    <button
                                      key={event.id}
                                      type="button"
                                      onClick={() => selectEvent(event)}
                                      className={`w-full text-left p-3 border-t border-gray-800 transition-colors ${
                                        isSelected
                                          ? 'bg-yellow-500/10 border-l-2 border-l-yellow-500'
                                          : 'hover:bg-gray-800/50'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className={`text-sm font-medium ${isSelected ? 'text-yellow-300' : 'text-white'}`}>
                                              {event.name}
                                            </span>
                                            {event.sourceName && (
                                              <span className="text-xs px-1.5 py-0.5 bg-gray-700 rounded text-gray-400">
                                                {event.sourceName}
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-xs text-gray-500 mt-0.5 truncate">{event.description}</p>
                                          <code className="text-xs text-gray-600 font-mono">{event.id}</code>
                                        </div>
                                        {isSelected && (
                                          <Check className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                                        )}
                                      </div>
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Selected event preview */}
                {config.eventType && (
                  <div className="p-3 rounded-lg bg-gray-900 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium text-white">Selected Event</span>
                    </div>
                    {(() => {
                      const selectedEvent = getSelectedEvent();
                      if (!selectedEvent) return null;
                      return (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-300 font-medium">{selectedEvent.name}</span>
                            {selectedEvent.sourceName && (
                              <span className="text-xs px-1.5 py-0.5 bg-gray-700 rounded text-gray-400">
                                {selectedEvent.sourceName}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">{selectedEvent.description}</p>
                          <code className="block text-xs text-gray-500 font-mono bg-gray-800 p-2 rounded mt-2">
                            Event: {selectedEvent.id}
                          </code>
                          {selectedEvent.payload && (
                            <code className="block text-xs text-gray-500 font-mono bg-gray-800 p-2 rounded">
                              Payload: {selectedEvent.payload}
                            </code>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 2: // Configuration
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Timeout (seconds)</label>
                <input
                  type="number"
                  value={config.timeout}
                  onChange={(e) => setConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) || 30 }))}
                  min={1}
                  max={900}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
                <p className="text-xs text-gray-500 mt-1">Max: 900 seconds (15 min)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Memory (MB)</label>
                <select
                  value={config.memory}
                  onChange={(e) => setConfig(prev => ({ ...prev, memory: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  {[128, 256, 512, 1024, 2048].map(mem => (
                    <option key={mem} value={mem}>{mem} MB</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Retry Attempts</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  value={config.retries}
                  onChange={(e) => setConfig(prev => ({ ...prev, retries: parseInt(e.target.value) }))}
                  min={0}
                  max={5}
                  className="flex-1 accent-yellow-500"
                />
                <span className="text-white font-mono w-12 text-center">{config.retries}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Environment Variables</label>
              <div className="space-y-2 mb-3">
                {config.environment.map((env, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg">
                    <span className="text-yellow-400 font-mono text-sm">{env.key}</span>
                    <span className="text-gray-500">=</span>
                    <span className="text-gray-300 font-mono text-sm flex-1 truncate">{env.value || '***'}</span>
                    <button
                      onClick={() => removeEnvVar(idx)}
                      className="p-1 text-gray-500 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newEnvKey}
                  onChange={(e) => setNewEnvKey(e.target.value.toUpperCase())}
                  placeholder="KEY"
                  className="w-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm"
                />
                <input
                  type="text"
                  value={newEnvValue}
                  onChange={(e) => setNewEnvValue(e.target.value)}
                  placeholder="value"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm"
                />
                <button
                  onClick={addEnvVar}
                  disabled={!newEnvKey.trim()}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 rounded-lg text-sm text-white"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.logging}
                  onChange={(e) => setConfig(prev => ({ ...prev, logging: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-yellow-500"
                />
                <div>
                  <span className="text-white font-medium">Enable Logging</span>
                  <p className="text-xs text-gray-400">Log function invocations</p>
                </div>
              </label>
            </div>
          </div>
        );

      case 3: // Security
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Authentication</label>
              <div className="space-y-3">
                {authMethods.map(auth => {
                  const Icon = auth.icon;
                  const isSelected = config.authentication === auth.id;
                  return (
                    <button
                      key={auth.id}
                      onClick={() => setConfig(prev => ({ ...prev, authentication: auth.id as FunctionConfig['authentication'] }))}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                        isSelected
                          ? 'border-yellow-500 bg-yellow-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-yellow-500/20' : 'bg-gray-700'
                      }`}>
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-yellow-400' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{auth.name}</h3>
                        <p className="text-sm text-gray-400">{auth.description}</p>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-yellow-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {config.trigger === 'http' && (
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.cors}
                    onChange={(e) => setConfig(prev => ({ ...prev, cors: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-yellow-500"
                  />
                  <div>
                    <span className="text-white font-medium">Enable CORS</span>
                    <p className="text-xs text-gray-400">Allow cross-origin requests</p>
                  </div>
                </label>
              </div>
            )}
          </div>
        );

      case 4: // Review
        const selectedRuntime = runtimes.find(r => r.id === config.runtime);
        const selectedTrigger = triggers.find(t => t.id === config.trigger);
        const TriggerIcon = selectedTrigger?.icon || Zap;

        return (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br from-yellow-500 to-orange-500 text-3xl">
                  {selectedRuntime?.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{config.name || 'Untitled Function'}</h3>
                  <p className="text-gray-400">{selectedRuntime?.name} function</p>
                  {config.description && (
                    <p className="text-sm text-gray-500 mt-1">{config.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Target Repository */}
            <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Target Repository</h4>
              <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-cyan-400" />
                <span className="text-white font-mono text-sm truncate">
                  {config.targetRepository || 'Not specified'}
                </span>
              </div>
              <p className="text-xs text-yellow-500 mt-1 font-mono">
                /functions/{config.slug}/
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Trigger</h4>
                <div className="flex items-center gap-2">
                  <TriggerIcon className="w-4 h-4 text-yellow-400" />
                  <span className="text-white">{selectedTrigger?.name}</span>
                </div>
                {config.trigger === 'http' && (
                  <p className="text-xs text-gray-500 mt-1">{config.httpMethod} {config.httpPath}</p>
                )}
                {config.trigger === 'cron' && (
                  <p className="text-xs text-gray-500 mt-1">{config.cronSchedule}</p>
                )}
                {config.trigger === 'event' && (
                  <div className="mt-1">
                    {(() => {
                      const selectedEvent = getSelectedEvent();
                      return selectedEvent ? (
                        <div className="space-y-1">
                          <p className="text-xs text-yellow-300">{selectedEvent.name}</p>
                          <code className="text-xs text-gray-500">{selectedEvent.id}</code>
                          {selectedEvent.sourceName && (
                            <span className="ml-2 text-xs px-1.5 py-0.5 bg-gray-700 rounded text-gray-400">
                              {selectedEvent.sourceName}
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">{config.eventType}</p>
                      );
                    })()}
                  </div>
                )}
              </div>
              <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Resources</h4>
                <p className="text-white">{config.memory} MB / {config.timeout}s timeout</p>
                <p className="text-xs text-gray-500 mt-1">{config.retries} retries</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Security</h4>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">
                  {authMethods.find(a => a.id === config.authentication)?.name}
                </span>
                {config.cors && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                    CORS Enabled
                  </span>
                )}
                {config.logging && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                    Logging
                  </span>
                )}
              </div>
            </div>

            {config.environment.length > 0 && (
              <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Environment Variables ({config.environment.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {config.environment.map((env, idx) => (
                    <span key={idx} className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm font-mono">
                      {env.key}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Files to be created</h4>
              <div className="space-y-1.5 text-sm font-mono">
                {/* Show the full repository path */}
                <div className="text-xs text-gray-500 mb-2 pb-2 border-b border-gray-700">
                  <span className="text-cyan-400">{config.targetRepository.replace(/\.git$/, '').split('/').slice(-2).join('/') || 'repository'}</span>
                  <span className="text-yellow-500">/functions/</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <FolderPlus className="w-4 h-4 text-yellow-500" />
                  <span><span className="text-yellow-500">/functions/</span>{config.slug}/</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 pl-6">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  function.json
                </div>
                {config.runtime === 'rust' && (
                  <>
                    <div className="flex items-center gap-2 text-gray-400 pl-6">
                      <FileCode className="w-4 h-4 text-orange-400" />
                      src/main.rs
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 pl-6">
                      <FileCode className="w-4 h-4 text-orange-400" />
                      Cargo.toml
                    </div>
                  </>
                )}
                {config.runtime === 'typescript' && (
                  <>
                    <div className="flex items-center gap-2 text-gray-400 pl-6">
                      <FileCode className="w-4 h-4 text-blue-400" />
                      src/index.ts
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 pl-6">
                      <FileCode className="w-4 h-4 text-blue-400" />
                      package.json
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 pl-6">
                      <FileCode className="w-4 h-4 text-blue-400" />
                      tsconfig.json
                    </div>
                  </>
                )}
                {config.runtime === 'python' && (
                  <>
                    <div className="flex items-center gap-2 text-gray-400 pl-6">
                      <FileCode className="w-4 h-4 text-green-400" />
                      main.py
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 pl-6">
                      <FileCode className="w-4 h-4 text-green-400" />
                      requirements.txt
                    </div>
                  </>
                )}
                {/* Show event trigger config if applicable */}
                {config.trigger === 'event' && (
                  <div className="flex items-center gap-2 text-gray-400 pl-6">
                    <FileCode className="w-4 h-4 text-purple-400" />
                    event-trigger.json
                  </div>
                )}
              </div>
              <div className="mt-3 p-2 bg-gray-900 rounded text-xs text-gray-500">
                <span className="text-yellow-500">Note:</span> All files will be created inside the mandatory{' '}
                <code className="text-yellow-400">/functions/</code> directory in your repository.
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-2xl mx-4"
      >
        <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Create New Function</h2>
                <p className="text-sm text-gray-400">{currentStep.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress */}
          <div className="px-6 py-3 bg-gray-800/50 border-b border-gray-800">
            <div className="flex items-center gap-2">
              {steps.map((s, idx) => (
                <React.Fragment key={s.id}>
                  <div
                    className={`flex items-center gap-2 ${
                      idx === step ? 'text-yellow-400' : idx < step ? 'text-yellow-400' : 'text-gray-500'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      idx === step
                        ? 'border-yellow-500 bg-yellow-500/20'
                        : idx < step
                        ? 'border-yellow-500 bg-yellow-500/20'
                        : 'border-gray-600'
                    }`}>
                      {idx < step ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <s.icon className="w-4 h-4" />
                      )}
                    </div>
                    <span className={`text-sm hidden md:block ${idx === step ? 'text-white' : ''}`}>
                      {s.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 ${idx < step ? 'bg-yellow-500' : 'bg-gray-700'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex flex-col border-t border-gray-800 bg-gray-800/30">
            {/* Error display */}
            {createError && (
              <div className="px-6 py-3 bg-red-500/10 border-b border-red-500/20">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{createError}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between px-6 py-4">
              <button
                onClick={onClose}
                disabled={isCreating}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <div className="flex items-center gap-3">
                {!isFirstStep && (
                  <button
                    onClick={handlePrev}
                    disabled={isCreating}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={!canProceed() || isCreating}
                  className="flex items-center gap-2 px-6 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm text-white transition-colors"
                >
                  {isLastStep ? (
                    isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Create Function
                      </>
                    )
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FunctionWizard;
