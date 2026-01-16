import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Puzzle,
  Package,
  ShoppingCart,
  FileText,
  Image,
  Search,
  BarChart3,
  Mail,
  Calendar,
  Users,
  MessageSquare,
  Star,
  Settings,
  ChevronRight,
  ChevronDown,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  Zap,
  Shield,
  Globe,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
  Link,
  Unlink,
} from 'lucide-react'
import clsx from 'clsx'

interface PluginIntegrationProps {
  postId?: string
  postType?: string
  onInsertBlock?: (blockType: string, data: Record<string, unknown>) => void
  className?: string
}

interface Plugin {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: 'ecommerce' | 'forms' | 'media' | 'seo' | 'analytics' | 'social' | 'email' | 'other'
  status: 'active' | 'inactive' | 'error'
  version: string
  author: string
  hasBlocks?: boolean
  blocks?: PluginBlock[]
  settings?: PluginSetting[]
  actions?: PluginAction[]
}

interface PluginBlock {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  preview?: string
}

interface PluginSetting {
  id: string
  name: string
  type: 'toggle' | 'select' | 'text' | 'number'
  value: unknown
  options?: { label: string; value: string }[]
}

interface PluginAction {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  handler: () => void
}

const mockPlugins: Plugin[] = [
  {
    id: 'rustcommerce',
    name: 'RustCommerce',
    description: 'E-commerce integration for products, carts, and checkout',
    icon: <ShoppingCart className="w-5 h-5" />,
    category: 'ecommerce',
    status: 'active',
    version: '2.1.0',
    author: 'RustPress Team',
    hasBlocks: true,
    blocks: [
      { id: 'product', name: 'Product Card', description: 'Display a single product', icon: <Package className="w-4 h-4" /> },
      { id: 'product-grid', name: 'Product Grid', description: 'Display multiple products in a grid', icon: <Package className="w-4 h-4" /> },
      { id: 'add-to-cart', name: 'Add to Cart Button', description: 'Button to add product to cart', icon: <ShoppingCart className="w-4 h-4" /> },
      { id: 'price', name: 'Price Display', description: 'Show product price with formatting', icon: <ShoppingCart className="w-4 h-4" /> },
      { id: 'buy-now', name: 'Buy Now Button', description: 'Direct checkout button', icon: <Zap className="w-4 h-4" /> },
    ],
    settings: [
      { id: 'show-price', name: 'Show prices in blocks', type: 'toggle', value: true },
      { id: 'currency', name: 'Currency display', type: 'select', value: 'USD', options: [
        { label: 'USD ($)', value: 'USD' },
        { label: 'EUR (€)', value: 'EUR' },
        { label: 'GBP (£)', value: 'GBP' },
      ]},
    ],
    actions: [
      { id: 'link-product', name: 'Link Product', description: 'Associate this post with a product', icon: <Link className="w-4 h-4" />, handler: () => {} },
    ],
  },
  {
    id: 'rustforms',
    name: 'RustForms',
    description: 'Form builder with submissions and integrations',
    icon: <FileText className="w-5 h-5" />,
    category: 'forms',
    status: 'active',
    version: '1.5.0',
    author: 'RustPress Team',
    hasBlocks: true,
    blocks: [
      { id: 'contact-form', name: 'Contact Form', description: 'Simple contact form', icon: <Mail className="w-4 h-4" /> },
      { id: 'newsletter', name: 'Newsletter Signup', description: 'Email subscription form', icon: <Mail className="w-4 h-4" /> },
      { id: 'custom-form', name: 'Custom Form', description: 'Build your own form', icon: <FileText className="w-4 h-4" /> },
      { id: 'survey', name: 'Survey', description: 'Multi-step survey form', icon: <FileText className="w-4 h-4" /> },
    ],
  },
  {
    id: 'rustmedia',
    name: 'RustMedia Pro',
    description: 'Advanced media library with optimization',
    icon: <Image className="w-5 h-5" />,
    category: 'media',
    status: 'active',
    version: '3.0.0',
    author: 'RustPress Team',
    hasBlocks: true,
    blocks: [
      { id: 'gallery-pro', name: 'Pro Gallery', description: 'Advanced image gallery with lightbox', icon: <Image className="w-4 h-4" /> },
      { id: 'slider', name: 'Image Slider', description: 'Carousel image slider', icon: <Image className="w-4 h-4" /> },
      { id: 'before-after', name: 'Before/After', description: 'Image comparison slider', icon: <Image className="w-4 h-4" /> },
      { id: 'video-player', name: 'Video Player', description: 'Custom video player', icon: <Image className="w-4 h-4" /> },
    ],
    actions: [
      { id: 'optimize', name: 'Optimize Images', description: 'Compress all images in this post', icon: <Zap className="w-4 h-4" />, handler: () => {} },
    ],
  },
  {
    id: 'rustseo',
    name: 'RustSEO',
    description: 'SEO optimization and analysis tools',
    icon: <Search className="w-5 h-5" />,
    category: 'seo',
    status: 'active',
    version: '2.3.0',
    author: 'RustPress Team',
    settings: [
      { id: 'auto-analyze', name: 'Auto-analyze on save', type: 'toggle', value: true },
      { id: 'schema-type', name: 'Schema type', type: 'select', value: 'Article', options: [
        { label: 'Article', value: 'Article' },
        { label: 'BlogPosting', value: 'BlogPosting' },
        { label: 'NewsArticle', value: 'NewsArticle' },
        { label: 'Product', value: 'Product' },
      ]},
    ],
    actions: [
      { id: 'analyze', name: 'Run SEO Analysis', description: 'Analyze this post for SEO issues', icon: <Search className="w-4 h-4" />, handler: () => {} },
      { id: 'preview', name: 'SERP Preview', description: 'Preview search engine result', icon: <Globe className="w-4 h-4" />, handler: () => {} },
    ],
  },
  {
    id: 'rustanalytics',
    name: 'RustAnalytics',
    description: 'Traffic and engagement analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    category: 'analytics',
    status: 'active',
    version: '1.8.0',
    author: 'RustPress Team',
    blocks: [
      { id: 'stats-card', name: 'Stats Card', description: 'Display post statistics', icon: <BarChart3 className="w-4 h-4" /> },
    ],
    actions: [
      { id: 'view-stats', name: 'View Statistics', description: 'Open analytics for this post', icon: <BarChart3 className="w-4 h-4" />, handler: () => {} },
    ],
  },
  {
    id: 'rustsocial',
    name: 'RustSocial',
    description: 'Social media sharing and embeds',
    icon: <Users className="w-5 h-5" />,
    category: 'social',
    status: 'active',
    version: '1.2.0',
    author: 'RustPress Team',
    hasBlocks: true,
    blocks: [
      { id: 'share-buttons', name: 'Share Buttons', description: 'Social sharing buttons', icon: <Users className="w-4 h-4" /> },
      { id: 'follow-buttons', name: 'Follow Buttons', description: 'Social follow buttons', icon: <Users className="w-4 h-4" /> },
      { id: 'social-feed', name: 'Social Feed', description: 'Embed social media feed', icon: <MessageSquare className="w-4 h-4" /> },
    ],
    actions: [
      { id: 'schedule', name: 'Schedule Social Posts', description: 'Schedule sharing to social networks', icon: <Calendar className="w-4 h-4" />, handler: () => {} },
    ],
  },
  {
    id: 'rustmail',
    name: 'RustMail',
    description: 'Email marketing integration',
    icon: <Mail className="w-5 h-5" />,
    category: 'email',
    status: 'inactive',
    version: '1.0.0',
    author: 'RustPress Team',
    blocks: [
      { id: 'subscribe-form', name: 'Subscribe Form', description: 'Email subscription form', icon: <Mail className="w-4 h-4" /> },
    ],
  },
  {
    id: 'rustreviews',
    name: 'RustReviews',
    description: 'Review and rating system',
    icon: <Star className="w-5 h-5" />,
    category: 'other',
    status: 'error',
    version: '0.9.0',
    author: 'Community',
    hasBlocks: true,
    blocks: [
      { id: 'rating-widget', name: 'Rating Widget', description: 'Star rating input', icon: <Star className="w-4 h-4" /> },
      { id: 'reviews-list', name: 'Reviews List', description: 'Display post reviews', icon: <MessageSquare className="w-4 h-4" /> },
    ],
  },
]

const categoryIcons = {
  ecommerce: <ShoppingCart className="w-4 h-4" />,
  forms: <FileText className="w-4 h-4" />,
  media: <Image className="w-4 h-4" />,
  seo: <Search className="w-4 h-4" />,
  analytics: <BarChart3 className="w-4 h-4" />,
  social: <Users className="w-4 h-4" />,
  email: <Mail className="w-4 h-4" />,
  other: <Puzzle className="w-4 h-4" />,
}

const categoryNames = {
  ecommerce: 'E-commerce',
  forms: 'Forms',
  media: 'Media',
  seo: 'SEO',
  analytics: 'Analytics',
  social: 'Social',
  email: 'Email',
  other: 'Other',
}

const statusColors = {
  active: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  inactive: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  error: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
}

const statusIcons = {
  active: <CheckCircle className="w-3 h-3" />,
  inactive: <Info className="w-3 h-3" />,
  error: <AlertCircle className="w-3 h-3" />,
}

export default function PluginIntegration({
  postId,
  postType,
  onInsertBlock,
  className,
}: PluginIntegrationProps) {
  const [plugins, setPlugins] = useState<Plugin[]>(mockPlugins)
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null)
  const [expandedPlugins, setExpandedPlugins] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'blocks' | 'settings' | 'actions'>('blocks')

  // Filter plugins
  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = searchQuery === '' ||
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = filterCategory === 'all' || plugin.category === filterCategory
    const matchesStatus = filterStatus === 'all' || plugin.status === filterStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  // Group by category
  const groupedPlugins = filteredPlugins.reduce((acc, plugin) => {
    const category = plugin.category
    if (!acc[category]) acc[category] = []
    acc[category].push(plugin)
    return acc
  }, {} as Record<string, Plugin[]>)

  const togglePlugin = (pluginId: string) => {
    setExpandedPlugins(prev =>
      prev.includes(pluginId)
        ? prev.filter(id => id !== pluginId)
        : [...prev, pluginId]
    )
  }

  // Generate shortcode for plugin block
  const generatePluginShortcode = (plugin: Plugin, block: PluginBlock): string => {
    const tag = `${plugin.id}_${block.id}`.replace(/-/g, '_');

    // Default shortcode templates for each block type
    const shortcodeTemplates: Record<string, string> = {
      // RustCommerce
      'rustcommerce_product': '[product id="" show_price="true" show_button="true"]',
      'rustcommerce_product-grid': '[product_grid category="" limit="4" columns="4"]',
      'rustcommerce_add-to-cart': '[add_to_cart id="" quantity="1"]',
      'rustcommerce_price': '[price id="" show_sale="true"]',
      'rustcommerce_buy-now': '[buy_now id="" text="Buy Now"]',
      // RustForms
      'rustforms_contact-form': '[contact_form title="Contact Us"]',
      'rustforms_newsletter': '[newsletter title="Subscribe" placeholder="Enter your email"]',
      'rustforms_custom-form': '[form id=""]',
      'rustforms_survey': '[survey id="" title="Survey"]',
      // RustMedia
      'rustmedia_gallery-pro': '[gallery ids="" columns="3" lightbox="true"]',
      'rustmedia_slider': '[slider ids="" autoplay="true" interval="5000"]',
      'rustmedia_before-after': '[before_after before="" after="" orientation="horizontal"]',
      'rustmedia_video-player': '[video url="" autoplay="false" controls="true"]',
      // RustAnalytics
      'rustanalytics_stats-card': '[stats show="views,likes,comments"]',
      // RustSocial
      'rustsocial_share-buttons': '[social_share networks="facebook,twitter,linkedin" style="icons"]',
      'rustsocial_follow-buttons': '[social_follow networks="facebook,twitter,instagram"]',
      'rustsocial_social-feed': '[social_feed network="twitter" username="" limit="5"]',
      // RustMail
      'rustmail_subscribe-form': '[subscribe title="Join our newsletter"]',
      // RustReviews
      'rustreviews_rating-widget': '[rating_widget post_id="" max="5"]',
      'rustreviews_reviews-list': '[reviews post_id="" limit="10"]',
    };

    const key = `${plugin.id}_${block.id}`;
    return shortcodeTemplates[key] || `[${tag}]`;
  };

  const handleInsertBlock = (plugin: Plugin, block: PluginBlock) => {
    const shortcode = generatePluginShortcode(plugin, block);
    onInsertBlock?.(block.id, {
      plugin: plugin.id,
      block: block.id,
      shortcode,
    });
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  return (
    <div className={clsx('flex flex-col h-full bg-white dark:bg-gray-800', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Puzzle className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold">Plugin Integration</h2>
          <span className="text-sm text-gray-500">
            {plugins.filter(p => p.status === 'active').length} active
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh plugins"
          >
            <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search plugins..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Category & Status Filters */}
        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Categories</option>
            {Object.entries(categoryNames).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {/* Plugin List */}
      <div className="flex-1 overflow-auto">
        {Object.entries(groupedPlugins).map(([category, categoryPlugins]) => (
          <div key={category} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
            {/* Category Header */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50">
              {categoryIcons[category as keyof typeof categoryIcons]}
              <span className="text-sm font-medium">{categoryNames[category as keyof typeof categoryNames]}</span>
              <span className="text-xs text-gray-500">({categoryPlugins.length})</span>
            </div>

            {/* Plugins */}
            {categoryPlugins.map(plugin => {
              const isExpanded = expandedPlugins.includes(plugin.id)

              return (
                <div key={plugin.id} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                  {/* Plugin Header */}
                  <button
                    onClick={() => togglePlugin(plugin.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        'p-2 rounded-lg',
                        plugin.status === 'active'
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                      )}>
                        {plugin.icon}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{plugin.name}</span>
                          <span className={clsx(
                            'flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-full',
                            statusColors[plugin.status]
                          )}>
                            {statusIcons[plugin.status]}
                            {plugin.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{plugin.description}</p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {/* Plugin Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4">
                          {/* Plugin Info */}
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                            <span>v{plugin.version}</span>
                            <span>by {plugin.author}</span>
                          </div>

                          {/* Tabs */}
                          <div className="flex gap-1 mb-3">
                            {plugin.blocks && plugin.blocks.length > 0 && (
                              <button
                                onClick={() => setActiveTab('blocks')}
                                className={clsx(
                                  'px-3 py-1.5 text-sm rounded-lg transition-colors',
                                  activeTab === 'blocks'
                                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                                )}
                              >
                                Blocks ({plugin.blocks.length})
                              </button>
                            )}
                            {plugin.settings && plugin.settings.length > 0 && (
                              <button
                                onClick={() => setActiveTab('settings')}
                                className={clsx(
                                  'px-3 py-1.5 text-sm rounded-lg transition-colors',
                                  activeTab === 'settings'
                                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                                )}
                              >
                                Settings
                              </button>
                            )}
                            {plugin.actions && plugin.actions.length > 0 && (
                              <button
                                onClick={() => setActiveTab('actions')}
                                className={clsx(
                                  'px-3 py-1.5 text-sm rounded-lg transition-colors',
                                  activeTab === 'actions'
                                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                                )}
                              >
                                Actions
                              </button>
                            )}
                          </div>

                          {/* Blocks */}
                          {activeTab === 'blocks' && plugin.blocks && (
                            <div className="grid grid-cols-2 gap-2">
                              {plugin.blocks.map(block => (
                                <button
                                  key={block.id}
                                  onClick={() => handleInsertBlock(plugin, block)}
                                  disabled={plugin.status !== 'active'}
                                  className={clsx(
                                    'flex items-center gap-2 p-2 rounded-lg text-left transition-colors',
                                    plugin.status === 'active'
                                      ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                      : 'bg-gray-50 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                                  )}
                                >
                                  <div className="p-1.5 bg-white dark:bg-gray-600 rounded">
                                    {block.icon}
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium block">{block.name}</span>
                                    <span className="text-xs text-gray-500">{block.description}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Settings */}
                          {activeTab === 'settings' && plugin.settings && (
                            <div className="space-y-3">
                              {plugin.settings.map(setting => (
                                <div key={setting.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                  <span className="text-sm">{setting.name}</span>
                                  {setting.type === 'toggle' && (
                                    <button
                                      className={clsx(
                                        'relative w-10 h-6 rounded-full transition-colors',
                                        setting.value ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                                          setting.value ? 'left-5' : 'left-1'
                                        )}
                                      />
                                    </button>
                                  )}
                                  {setting.type === 'select' && setting.options && (
                                    <select
                                      value={setting.value as string}
                                      className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    >
                                      {setting.options.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                          {opt.label}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          {activeTab === 'actions' && plugin.actions && (
                            <div className="space-y-2">
                              {plugin.actions.map(action => (
                                <button
                                  key={action.id}
                                  onClick={action.handler}
                                  disabled={plugin.status !== 'active'}
                                  className={clsx(
                                    'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors',
                                    plugin.status === 'active'
                                      ? 'bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                      : 'bg-gray-50 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                                  )}
                                >
                                  {action.icon}
                                  <div>
                                    <span className="text-sm font-medium block">{action.name}</span>
                                    <span className="text-xs opacity-75">{action.description}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        ))}

        {filteredPlugins.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Puzzle className="w-12 h-12 mb-3 opacity-50" />
            <p>No plugins found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {plugins.filter(p => p.status === 'active').length} plugins active
          </span>
          <button className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700">
            <ExternalLink className="w-3 h-3" />
            Browse more plugins
          </button>
        </div>
      </div>
    </div>
  )
}
