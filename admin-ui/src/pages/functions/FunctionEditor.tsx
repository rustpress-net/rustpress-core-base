import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  Play,
  Code,
  Settings,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  FileCode,
  Database,
  Globe,
  Mail,
  MessageSquare,
  Terminal,
  Search,
} from 'lucide-react';
import clsx from 'clsx';

interface EventCategory {
  name: string;
  events: string[];
}

interface FunctionData {
  id?: string;
  name: string;
  slug: string;
  description: string;
  runtime: string;
  code: string;
  status: string;
  trigger_events: string[];
  hook_timing: 'before' | 'after' | 'both';
  priority: number;
  config: Record<string, unknown>;
  timeout_ms: number;
  retry_count: number;
  retry_delay_ms: number;
}

const hookTimingOptions = [
  {
    value: 'after',
    label: 'After Event',
    description: 'Execute after the action completes (notifications, logging)',
  },
  {
    value: 'before',
    label: 'Before Event',
    description: 'Execute before the action (can modify data or cancel)',
  },
  {
    value: 'both',
    label: 'Both',
    description: 'Execute both before and after the action',
  },
];

const runtimeOptions = [
  { value: 'javascript', label: 'JavaScript', icon: FileCode, color: 'text-yellow-500' },
  { value: 'typescript', label: 'TypeScript', icon: FileCode, color: 'text-blue-500' },
  { value: 'rust', label: 'Rust', icon: FileCode, color: 'text-orange-500' },
  { value: 'sql', label: 'SQL', icon: Database, color: 'text-green-500' },
  { value: 'http_webhook', label: 'HTTP Webhook', icon: Globe, color: 'text-purple-500' },
  { value: 'email', label: 'Email', icon: Mail, color: 'text-red-500' },
  { value: 'slack', label: 'Slack', icon: MessageSquare, color: 'text-pink-500' },
  { value: 'discord', label: 'Discord', icon: MessageSquare, color: 'text-indigo-500' },
  { value: 'lua', label: 'Lua', icon: Terminal, color: 'text-cyan-500' },
];

// 100+ Event Triggers organized by category
const defaultEventCategories: EventCategory[] = [
  {
    name: 'Posts',
    events: [
      'post_created', 'post_updated', 'post_deleted', 'post_published', 'post_unpublished',
      'post_trashed', 'post_restored', 'post_scheduled', 'post_draft_saved', 'post_status_changed',
      'post_slug_changed', 'post_title_changed', 'post_content_changed', 'post_excerpt_changed',
      'post_featured_image_set', 'post_featured_image_removed', 'post_password_protected',
      'post_visibility_changed', 'post_author_changed', 'post_format_changed',
    ],
  },
  {
    name: 'Pages',
    events: [
      'page_created', 'page_updated', 'page_deleted', 'page_published', 'page_unpublished',
      'page_trashed', 'page_restored', 'page_template_changed', 'page_parent_changed',
      'page_order_changed', 'page_status_changed', 'page_slug_changed',
    ],
  },
  {
    name: 'Comments',
    events: [
      'comment_created', 'comment_updated', 'comment_deleted', 'comment_approved',
      'comment_unapproved', 'comment_marked_spam', 'comment_replied', 'comment_edited',
      'comment_status_changed', 'comment_flagged', 'comment_reported',
    ],
  },
  {
    name: 'Users',
    events: [
      'user_registered', 'user_created', 'user_updated', 'user_deleted', 'user_login',
      'user_logout', 'user_login_failed', 'user_password_changed', 'user_password_reset_requested',
      'user_password_reset_completed', 'user_email_changed', 'user_role_changed',
      'user_profile_updated', 'user_avatar_changed', 'user_activated', 'user_deactivated',
      'user_locked', 'user_unlocked', 'user_session_started', 'user_session_ended',
      'user_2fa_enabled', 'user_2fa_disabled', 'user_api_key_created', 'user_api_key_revoked',
    ],
  },
  {
    name: 'Media',
    events: [
      'media_uploaded', 'media_updated', 'media_deleted', 'media_attached', 'media_detached',
      'media_cropped', 'media_resized', 'media_optimized', 'media_renamed',
      'image_uploaded', 'image_edited', 'image_deleted', 'video_uploaded', 'video_processed',
      'audio_uploaded', 'document_uploaded', 'media_folder_created', 'media_folder_deleted',
      'media_moved', 'media_duplicated',
    ],
  },
  {
    name: 'Categories',
    events: [
      'category_created', 'category_updated', 'category_deleted', 'category_merged',
      'category_parent_changed', 'category_slug_changed', 'category_description_changed',
      'post_category_added', 'post_category_removed',
    ],
  },
  {
    name: 'Tags',
    events: [
      'tag_created', 'tag_updated', 'tag_deleted', 'tag_merged', 'tag_slug_changed',
      'post_tag_added', 'post_tag_removed', 'tag_description_changed',
    ],
  },
  {
    name: 'Taxonomies',
    events: [
      'taxonomy_created', 'taxonomy_updated', 'taxonomy_deleted', 'taxonomy_term_created',
      'taxonomy_term_updated', 'taxonomy_term_deleted', 'taxonomy_term_assigned',
      'taxonomy_term_unassigned',
    ],
  },
  {
    name: 'Themes',
    events: [
      'theme_installed', 'theme_activated', 'theme_deactivated', 'theme_deleted',
      'theme_updated', 'theme_customized', 'theme_settings_saved', 'theme_preview_started',
      'theme_preview_ended', 'theme_exported', 'theme_imported',
    ],
  },
  {
    name: 'Plugins',
    events: [
      'plugin_installed', 'plugin_activated', 'plugin_deactivated', 'plugin_deleted',
      'plugin_updated', 'plugin_settings_saved', 'plugin_error', 'plugin_hook_registered',
      'plugin_api_called',
    ],
  },
  {
    name: 'Menus',
    events: [
      'menu_created', 'menu_updated', 'menu_deleted', 'menu_item_added', 'menu_item_updated',
      'menu_item_deleted', 'menu_item_reordered', 'menu_location_assigned',
      'menu_location_unassigned',
    ],
  },
  {
    name: 'Widgets',
    events: [
      'widget_added', 'widget_updated', 'widget_removed', 'widget_reordered',
      'sidebar_created', 'sidebar_updated', 'sidebar_deleted', 'widget_area_changed',
    ],
  },
  {
    name: 'Settings',
    events: [
      'settings_updated', 'site_title_changed', 'site_description_changed', 'site_url_changed',
      'admin_email_changed', 'timezone_changed', 'date_format_changed', 'time_format_changed',
      'permalink_structure_changed', 'reading_settings_changed', 'writing_settings_changed',
      'discussion_settings_changed', 'media_settings_changed', 'privacy_settings_changed',
    ],
  },
  {
    name: 'SEO',
    events: [
      'seo_settings_updated', 'meta_title_changed', 'meta_description_changed',
      'sitemap_generated', 'sitemap_updated', 'robots_txt_changed', 'canonical_url_changed',
      'og_tags_updated', 'schema_markup_updated', 'redirect_created', 'redirect_deleted',
    ],
  },
  {
    name: 'Security',
    events: [
      'security_scan_started', 'security_scan_completed', 'security_threat_detected',
      'security_threat_resolved', 'firewall_rule_added', 'firewall_rule_removed',
      'ip_blocked', 'ip_unblocked', 'brute_force_detected', 'suspicious_activity_detected',
      'malware_detected', 'file_integrity_check', 'ssl_certificate_expiring',
      'ssl_certificate_renewed',
    ],
  },
  {
    name: 'Backup',
    events: [
      'backup_started', 'backup_completed', 'backup_failed', 'backup_restored',
      'backup_deleted', 'backup_scheduled', 'backup_downloaded', 'backup_uploaded',
      'auto_backup_triggered',
    ],
  },
  {
    name: 'Cache',
    events: [
      'cache_cleared', 'cache_purged', 'page_cache_cleared', 'object_cache_cleared',
      'cdn_cache_purged', 'cache_preload_started', 'cache_preload_completed',
    ],
  },
  {
    name: 'Database',
    events: [
      'database_optimized', 'database_repaired', 'database_backup_created',
      'database_restored', 'table_created', 'table_altered', 'table_dropped',
      'query_slow_detected', 'database_connection_error', 'migration_started',
      'migration_completed', 'migration_failed',
    ],
  },
  {
    name: 'Email',
    events: [
      'email_sent', 'email_failed', 'email_queued', 'email_opened', 'email_clicked',
      'email_bounced', 'email_unsubscribed', 'newsletter_sent', 'newsletter_scheduled',
      'email_template_created', 'email_template_updated',
    ],
  },
  {
    name: 'Forms',
    events: [
      'form_submitted', 'form_created', 'form_updated', 'form_deleted',
      'form_entry_created', 'form_entry_updated', 'form_entry_deleted',
      'form_entry_spam_detected', 'form_field_added', 'form_field_removed',
    ],
  },
  {
    name: 'E-commerce',
    events: [
      'order_created', 'order_updated', 'order_completed', 'order_cancelled',
      'order_refunded', 'order_shipped', 'order_delivered', 'payment_received',
      'payment_failed', 'payment_refunded', 'cart_created', 'cart_updated',
      'cart_abandoned', 'checkout_started', 'checkout_completed', 'product_created',
      'product_updated', 'product_deleted', 'product_out_of_stock', 'product_back_in_stock',
      'coupon_created', 'coupon_used', 'coupon_expired', 'subscription_created',
      'subscription_renewed', 'subscription_cancelled', 'subscription_expired',
    ],
  },
  {
    name: 'API',
    events: [
      'api_request_received', 'api_request_completed', 'api_request_failed',
      'api_rate_limit_exceeded', 'api_key_created', 'api_key_deleted', 'api_key_rotated',
      'webhook_sent', 'webhook_received', 'webhook_failed', 'oauth_token_issued',
      'oauth_token_revoked', 'rest_endpoint_called', 'graphql_query_executed',
    ],
  },
  {
    name: 'System',
    events: [
      'system_startup', 'system_shutdown', 'system_error', 'system_warning',
      'cron_job_started', 'cron_job_completed', 'cron_job_failed', 'queue_job_started',
      'queue_job_completed', 'queue_job_failed', 'maintenance_mode_enabled',
      'maintenance_mode_disabled', 'update_available', 'update_installed',
      'health_check_passed', 'health_check_failed', 'disk_space_low', 'memory_usage_high',
      'cpu_usage_high',
    ],
  },
  {
    name: 'Scheduler',
    events: [
      'schedule_minutely', 'schedule_every_5_minutes', 'schedule_every_10_minutes',
      'schedule_every_15_minutes', 'schedule_every_30_minutes', 'schedule_hourly',
      'schedule_every_2_hours', 'schedule_every_4_hours', 'schedule_every_6_hours',
      'schedule_every_12_hours', 'schedule_daily', 'schedule_daily_midnight',
      'schedule_daily_noon', 'schedule_weekly', 'schedule_weekly_monday',
      'schedule_weekly_friday', 'schedule_monthly', 'schedule_monthly_first',
      'schedule_monthly_last', 'schedule_quarterly', 'schedule_yearly',
    ],
  },
  {
    name: 'Analytics',
    events: [
      'pageview', 'unique_visitor', 'session_started', 'session_ended', 'goal_completed',
      'conversion_tracked', 'event_tracked', 'referrer_detected', 'search_performed',
      'download_tracked', 'outbound_link_clicked', 'video_played', 'scroll_depth_reached',
    ],
  },
  {
    name: 'Content',
    events: [
      'content_imported', 'content_exported', 'revision_created', 'revision_restored',
      'revision_deleted', 'autosave_created', 'content_copied', 'content_moved',
      'content_archived', 'content_unarchived', 'content_locked', 'content_unlocked',
    ],
  },
  {
    name: 'Multilingual',
    events: [
      'translation_created', 'translation_updated', 'translation_deleted',
      'language_added', 'language_removed', 'default_language_changed',
      'content_synced', 'translation_missing',
    ],
  },
  {
    name: 'Membership',
    events: [
      'membership_created', 'membership_upgraded', 'membership_downgraded',
      'membership_cancelled', 'membership_expired', 'membership_renewed',
      'access_granted', 'access_revoked', 'content_restricted', 'content_unlocked',
    ],
  },
  {
    name: 'Notifications',
    events: [
      'notification_sent', 'notification_read', 'notification_dismissed',
      'push_notification_sent', 'push_notification_clicked', 'alert_triggered',
      'alert_resolved', 'announcement_created', 'announcement_published',
    ],
  },
  {
    name: 'Search',
    events: [
      'search_query', 'search_no_results', 'search_index_updated', 'search_index_rebuilt',
      'search_suggestion_clicked', 'search_filter_applied',
    ],
  },
];

const defaultCode: Record<string, string> = {
  javascript: `// Function handler
// Available: event, context, fetch
async function handler(event, context) {
  console.log('Event received:', event.type);
  console.log('Event data:', event.data);

  // Your logic here

  return {
    success: true,
    message: 'Function executed successfully'
  };
}`,
  typescript: `// Function handler
// Available: event, context, fetch
interface Event {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

interface Context {
  functionId: string;
  executionId: string;
}

async function handler(event: Event, context: Context): Promise<{ success: boolean; message: string }> {
  console.log('Event received:', event.type);
  console.log('Event data:', event.data);

  // Your logic here

  return {
    success: true,
    message: 'Function executed successfully'
  };
}`,
  sql: `-- SQL function
-- Available variables: :event_type, :event_data, :user_id

-- Example: Log event to custom table
INSERT INTO custom_logs (event_type, event_data, created_at)
VALUES (:event_type, :event_data::jsonb, NOW());

-- Return result
SELECT 'Function executed successfully' as message;`,
  http_webhook: `{
  "url": "https://api.example.com/webhook",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_TOKEN"
  },
  "body": {
    "event": "{{event.type}}",
    "data": "{{event.data}}",
    "timestamp": "{{event.timestamp}}"
  }
}`,
  email: `{
  "to": ["admin@example.com"],
  "subject": "Event Notification: {{event.type}}",
  "body": "An event occurred:\\n\\nType: {{event.type}}\\nData: {{event.data}}\\nTime: {{event.timestamp}}",
  "from": "noreply@rustpress.io"
}`,
  slack: `{
  "webhook_url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
  "channel": "#notifications",
  "username": "RustPress Bot",
  "icon_emoji": ":zap:",
  "text": "Event: {{event.type}}",
  "attachments": [
    {
      "color": "#36a64f",
      "fields": [
        { "title": "Event Type", "value": "{{event.type}}", "short": true },
        { "title": "Timestamp", "value": "{{event.timestamp}}", "short": true }
      ]
    }
  ]
}`,
  discord: `{
  "webhook_url": "https://discord.com/api/webhooks/YOUR/WEBHOOK",
  "content": "**Event:** {{event.type}}",
  "embeds": [
    {
      "title": "Event Notification",
      "color": 5793266,
      "fields": [
        { "name": "Type", "value": "{{event.type}}", "inline": true },
        { "name": "Time", "value": "{{event.timestamp}}", "inline": true }
      ]
    }
  ]
}`,
  lua: `-- Lua function handler
-- Available: event, context

function handler(event, context)
  print("Event received: " .. event.type)

  -- Your logic here

  return {
    success = true,
    message = "Function executed successfully"
  }
end`,
};

export default function FunctionEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; output?: string; error?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'triggers' | 'settings'>('code');
  const [eventCategories, setEventCategories] = useState<EventCategory[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [eventSearch, setEventSearch] = useState('');

  const [formData, setFormData] = useState<FunctionData>({
    name: '',
    slug: '',
    description: '',
    runtime: 'javascript',
    code: defaultCode.javascript,
    status: 'draft',
    trigger_events: [],
    hook_timing: 'after',
    priority: 10,
    config: {},
    timeout_ms: 30000,
    retry_count: 0,
    retry_delay_ms: 1000,
  });

  useEffect(() => {
    fetchEventCategories();
    if (!isNew) {
      fetchFunction();
    }
  }, [id]);

  const fetchEventCategories = async () => {
    try {
      const response = await fetch('/api/admin/functions/events/categories');
      const data = await response.json();
      if (data.success && data.data && data.data.length > 0) {
        setEventCategories(data.data);
      } else {
        // Use default categories as fallback
        setEventCategories(defaultEventCategories);
      }
    } catch (error) {
      console.error('Failed to fetch event categories:', error);
      // Use default categories as fallback
      setEventCategories(defaultEventCategories);
    }
  };

  const fetchFunction = async () => {
    try {
      const response = await fetch(`/api/admin/functions/${id}`);
      const data = await response.json();
      if (data.success) {
        setFormData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch function:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: isNew ? generateSlug(name) : formData.slug,
    });
  };

  const handleRuntimeChange = (runtime: string) => {
    setFormData({
      ...formData,
      runtime,
      code: defaultCode[runtime] || '',
    });
  };

  const toggleEvent = (event: string) => {
    const events = new Set(formData.trigger_events);
    if (events.has(event)) {
      events.delete(event);
    } else {
      events.add(event);
    }
    setFormData({ ...formData, trigger_events: Array.from(events) });
  };

  const toggleCategory = (category: string) => {
    const expanded = new Set(expandedCategories);
    if (expanded.has(category)) {
      expanded.delete(category);
    } else {
      expanded.add(category);
    }
    setExpandedCategories(expanded);
  };

  const selectAllInCategory = (category: EventCategory) => {
    const events = new Set(formData.trigger_events);
    category.events.forEach(e => events.add(e));
    setFormData({ ...formData, trigger_events: Array.from(events) });
  };

  const deselectAllInCategory = (category: EventCategory) => {
    const events = new Set(formData.trigger_events);
    category.events.forEach(e => events.delete(e));
    setFormData({ ...formData, trigger_events: Array.from(events) });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = isNew ? '/api/admin/functions' : `/api/admin/functions/${id}`;
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        if (isNew) {
          navigate(`/functions/${data.data.id}/edit`);
        }
      } else {
        alert(data.error || 'Failed to save function');
      }
    } catch (error) {
      console.error('Failed to save function:', error);
      alert('Failed to save function');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const response = await fetch(`/api/admin/functions/${id}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: formData.trigger_events[0] || 'manual_trigger',
          event_data: { test: true },
        }),
      });

      const data = await response.json();
      setTestResult({
        success: data.success && data.data?.status === 'success',
        output: data.data?.output ? JSON.stringify(data.data.output, null, 2) : undefined,
        error: data.data?.error || data.error,
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: 'Failed to execute test',
      });
    } finally {
      setTesting(false);
    }
  };

  const filteredCategories = eventCategories.map(cat => ({
    ...cat,
    events: cat.events.filter(e =>
      e.toLowerCase().includes(eventSearch.toLowerCase())
    ),
  })).filter(cat => cat.events.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/functions"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isNew ? 'Create Function' : 'Edit Function'}
            </h1>
            {!isNew && (
              <p className="text-gray-500 dark:text-gray-400">
                {formData.slug}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isNew && (
            <button
              onClick={handleTest}
              disabled={testing}
              className="btn btn-secondary flex items-center gap-2"
            >
              {testing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Test
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary flex items-center gap-2"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </button>
        </div>
      </div>

      {/* Test Result */}
      {testResult && (
        <div
          className={clsx(
            'p-4 rounded-lg border',
            testResult.success
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
              : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
          )}
        >
          <div className="flex items-start gap-3">
            {testResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={clsx('font-medium', testResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200')}>
                {testResult.success ? 'Test passed!' : 'Test failed'}
              </p>
              {testResult.output && (
                <pre className="mt-2 p-2 bg-white dark:bg-gray-800 rounded text-sm overflow-x-auto">
                  {testResult.output}
                </pre>
              )}
              {testResult.error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{testResult.error}</p>
              )}
            </div>
            <button onClick={() => setTestResult(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="My Function"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="my-function"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does this function do?"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('code')}
                  className={clsx(
                    'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
                    activeTab === 'code'
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  )}
                >
                  <Code className="w-4 h-4 inline-block mr-2" />
                  Code
                </button>
                <button
                  onClick={() => setActiveTab('triggers')}
                  className={clsx(
                    'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
                    activeTab === 'triggers'
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  )}
                >
                  <Zap className="w-4 h-4 inline-block mr-2" />
                  Triggers
                  {formData.trigger_events.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full">
                      {formData.trigger_events.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={clsx(
                    'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
                    activeTab === 'settings'
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  )}
                >
                  <Settings className="w-4 h-4 inline-block mr-2" />
                  Settings
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'code' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Runtime
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {runtimeOptions.map((runtime) => (
                        <button
                          key={runtime.value}
                          onClick={() => handleRuntimeChange(runtime.value)}
                          className={clsx(
                            'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors',
                            formData.runtime === runtime.value
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          )}
                        >
                          <runtime.icon className={clsx('w-4 h-4', runtime.color)} />
                          <span className="text-sm">{runtime.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Code
                    </label>
                    <textarea
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      rows={20}
                      className="w-full px-4 py-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-900 text-gray-100"
                      spellCheck={false}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'triggers' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  {formData.trigger_events.length > 0 && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-sm text-gray-500 mb-2">Selected triggers:</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.trigger_events.map((event) => (
                          <span
                            key={event}
                            className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded"
                          >
                            {event}
                            <button
                              onClick={() => toggleEvent(event)}
                              className="hover:text-primary-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredCategories.map((category) => (
                      <div key={category.name} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                        <button
                          onClick={() => toggleCategory(category.name)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <span className="font-medium text-gray-900 dark:text-white">
                            {category.name}
                            <span className="ml-2 text-sm text-gray-500">
                              ({category.events.length})
                            </span>
                          </span>
                          {expandedCategories.has(category.name) ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        {expandedCategories.has(category.name) && (
                          <div className="px-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex gap-2 py-2">
                              <button
                                onClick={() => selectAllInCategory(category)}
                                className="text-xs text-primary-600 hover:text-primary-700"
                              >
                                Select all
                              </button>
                              <span className="text-gray-300">|</span>
                              <button
                                onClick={() => deselectAllInCategory(category)}
                                className="text-xs text-gray-500 hover:text-gray-700"
                              >
                                Deselect all
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                              {category.events.map((event) => (
                                <label
                                  key={event}
                                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.trigger_events.includes(event)}
                                    onChange={() => toggleEvent(event)}
                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                  />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {event}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {/* Hook Timing */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Execution Timing
                    </label>
                    <div className="space-y-2">
                      {hookTimingOptions.map((option) => (
                        <label
                          key={option.value}
                          className={clsx(
                            'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                            formData.hook_timing === option.value
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          )}
                        >
                          <input
                            type="radio"
                            name="hook_timing"
                            value={option.value}
                            checked={formData.hook_timing === option.value}
                            onChange={(e) => setFormData({ ...formData, hook_timing: e.target.value as 'before' | 'after' | 'both' })}
                            className="mt-1 text-primary-600 focus:ring-primary-500"
                          />
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{option.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Priority
                    </label>
                    <input
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 10 })}
                      min={1}
                      max={100}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="mt-1 text-sm text-gray-500">Lower numbers run first (1-100, default: 10)</p>
                  </div>

                  <hr className="border-gray-200 dark:border-gray-700" />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Timeout (ms)
                    </label>
                    <input
                      type="number"
                      value={formData.timeout_ms}
                      onChange={(e) => setFormData({ ...formData, timeout_ms: parseInt(e.target.value) || 30000 })}
                      min={1000}
                      max={300000}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="mt-1 text-sm text-gray-500">Maximum execution time (1-300 seconds)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Retry Count
                    </label>
                    <input
                      type="number"
                      value={formData.retry_count}
                      onChange={(e) => setFormData({ ...formData, retry_count: parseInt(e.target.value) || 0 })}
                      min={0}
                      max={10}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="mt-1 text-sm text-gray-500">Number of retry attempts on failure (0-10)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Retry Delay (ms)
                    </label>
                    <input
                      type="number"
                      value={formData.retry_delay_ms}
                      onChange={(e) => setFormData({ ...formData, retry_delay_ms: parseInt(e.target.value) || 1000 })}
                      min={100}
                      max={60000}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="mt-1 text-sm text-gray-500">Delay between retries (100ms - 60s)</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Status</h3>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <p className="mt-2 text-sm text-gray-500">
              {formData.status === 'active'
                ? 'Function will be executed when triggered'
                : formData.status === 'inactive'
                ? 'Function is paused and will not execute'
                : 'Function is in draft mode'}
            </p>
          </div>

          {/* Quick Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4">Quick Info</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Runtime</dt>
                <dd className="text-gray-900 dark:text-white capitalize">
                  {formData.runtime.replace('_', ' ')}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Timing</dt>
                <dd className="text-gray-900 dark:text-white capitalize">
                  {formData.hook_timing === 'both' ? 'Before & After' : formData.hook_timing}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Priority</dt>
                <dd className="text-gray-900 dark:text-white">
                  {formData.priority}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Triggers</dt>
                <dd className="text-gray-900 dark:text-white">
                  {formData.trigger_events.length} events
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Timeout</dt>
                <dd className="text-gray-900 dark:text-white">
                  {(formData.timeout_ms / 1000).toFixed(0)}s
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Retries</dt>
                <dd className="text-gray-900 dark:text-white">
                  {formData.retry_count}
                </dd>
              </div>
            </dl>
          </div>

          {/* Help */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
            <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Need Help?</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Check out our documentation for examples and best practices.
            </p>
            <div className="space-y-2 text-sm">
              <a href="#" className="block text-blue-600 hover:text-blue-700">
                Function Examples
              </a>
              <a href="#" className="block text-blue-600 hover:text-blue-700">
                Event Reference
              </a>
              <a href="#" className="block text-blue-600 hover:text-blue-700">
                Runtime Documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
