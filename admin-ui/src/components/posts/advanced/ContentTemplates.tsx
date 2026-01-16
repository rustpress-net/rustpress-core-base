import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutTemplate,
  FileText,
  Plus,
  Search,
  Star,
  StarOff,
  Edit3,
  Trash2,
  Copy,
  Download,
  Upload,
  Eye,
  Check,
  X,
  ChevronRight,
  Clock,
  User,
  Tag,
  MoreVertical,
  FolderOpen,
  Lock,
  Globe,
  Sparkles,
  Zap,
} from 'lucide-react'
import clsx from 'clsx'

interface ContentTemplatesProps {
  onApplyTemplate?: (template: Template) => void
  onSaveAsTemplate?: (name: string, content: string, settings: TemplateSettings) => void
  currentContent?: string
  className?: string
}

interface Template {
  id: string
  name: string
  description: string
  category: string
  content: string
  thumbnail?: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: Date
  updatedAt: Date
  usageCount: number
  isFavorite: boolean
  isPublic: boolean
  isPremium: boolean
  tags: string[]
  settings: TemplateSettings
}

interface TemplateSettings {
  layout?: 'default' | 'full-width' | 'sidebar-left' | 'sidebar-right'
  featuredImage?: boolean
  showAuthor?: boolean
  showDate?: boolean
  showCategories?: boolean
  showTags?: boolean
  enableComments?: boolean
  seoTitle?: string
  seoDescription?: string
}

interface TemplateCategory {
  id: string
  name: string
  description: string
  count: number
  icon: React.ReactNode
}

const mockCategories: TemplateCategory[] = [
  { id: 'all', name: 'All Templates', description: 'Browse all templates', count: 24, icon: <LayoutTemplate className="w-4 h-4" /> },
  { id: 'blog', name: 'Blog Posts', description: 'Standard blog templates', count: 8, icon: <FileText className="w-4 h-4" /> },
  { id: 'landing', name: 'Landing Pages', description: 'Marketing pages', count: 5, icon: <Zap className="w-4 h-4" /> },
  { id: 'product', name: 'Product Pages', description: 'E-commerce templates', count: 4, icon: <Tag className="w-4 h-4" /> },
  { id: 'portfolio', name: 'Portfolio', description: 'Showcase templates', count: 3, icon: <Star className="w-4 h-4" /> },
  { id: 'custom', name: 'My Templates', description: 'Your saved templates', count: 4, icon: <FolderOpen className="w-4 h-4" /> },
]

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Standard Blog Post',
    description: 'A clean, professional blog post layout with featured image and author bio',
    category: 'blog',
    content: '<h1>Post Title</h1><p>Introduction paragraph...</p><h2>Section 1</h2><p>Content...</p>',
    author: { id: '1', name: 'RustPress Team' },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-02-15'),
    usageCount: 1250,
    isFavorite: true,
    isPublic: true,
    isPremium: false,
    tags: ['blog', 'article', 'standard'],
    settings: { layout: 'default', featuredImage: true, showAuthor: true, showDate: true },
  },
  {
    id: '2',
    name: 'Long-Form Article',
    description: 'Perfect for in-depth articles with table of contents and sections',
    category: 'blog',
    content: '<h1>Title</h1><nav class="toc">Table of Contents</nav><h2>Introduction</h2>...',
    author: { id: '1', name: 'RustPress Team' },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-10'),
    usageCount: 845,
    isFavorite: false,
    isPublic: true,
    isPremium: false,
    tags: ['long-form', 'article', 'guide'],
    settings: { layout: 'sidebar-right', featuredImage: true, showAuthor: true },
  },
  {
    id: '3',
    name: 'Product Review',
    description: 'Structured review template with pros/cons and rating',
    category: 'blog',
    content: '<h1>Product Name Review</h1><div class="rating">★★★★☆</div>...',
    author: { id: '1', name: 'RustPress Team' },
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-01'),
    usageCount: 523,
    isFavorite: true,
    isPublic: true,
    isPremium: true,
    tags: ['review', 'product', 'comparison'],
    settings: { layout: 'default', featuredImage: true, showAuthor: true },
  },
  {
    id: '4',
    name: 'Landing Page Hero',
    description: 'High-converting landing page with hero section and CTA',
    category: 'landing',
    content: '<section class="hero">...</section><section class="features">...</section>',
    author: { id: '1', name: 'RustPress Team' },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-15'),
    usageCount: 678,
    isFavorite: false,
    isPublic: true,
    isPremium: true,
    tags: ['landing', 'marketing', 'conversion'],
    settings: { layout: 'full-width', featuredImage: false },
  },
  {
    id: '5',
    name: 'Product Showcase',
    description: 'Beautiful product page with gallery and specifications',
    category: 'product',
    content: '<div class="product-gallery">...</div><div class="product-info">...</div>',
    author: { id: '1', name: 'RustPress Team' },
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-15'),
    usageCount: 412,
    isFavorite: false,
    isPublic: true,
    isPremium: true,
    tags: ['product', 'ecommerce', 'showcase'],
    settings: { layout: 'full-width', featuredImage: true },
  },
  {
    id: '6',
    name: 'My Custom Template',
    description: 'Personal template for weekly updates',
    category: 'custom',
    content: '<h1>Weekly Update</h1><h2>This Week</h2>...',
    author: { id: 'current', name: 'You' },
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-15'),
    usageCount: 12,
    isFavorite: true,
    isPublic: false,
    isPremium: false,
    tags: ['personal', 'update'],
    settings: { layout: 'default', showAuthor: true, showDate: true },
  },
]

export default function ContentTemplates({
  onApplyTemplate,
  onSaveAsTemplate,
  currentContent,
  className,
}: ContentTemplatesProps) {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'name'>('popular')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Save as template form
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateDescription, setNewTemplateDescription] = useState('')
  const [newTemplateTags, setNewTemplateTags] = useState('')
  const [newTemplatePublic, setNewTemplatePublic] = useState(false)

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let filtered = templates

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        filtered = [...filtered].sort((a, b) => b.usageCount - a.usageCount)
        break
      case 'recent':
        filtered = [...filtered].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        break
      case 'name':
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return filtered
  }, [templates, selectedCategory, searchQuery, sortBy])

  const handleToggleFavorite = (templateId: string) => {
    setTemplates(prev =>
      prev.map(t =>
        t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t
      )
    )
  }

  const handleApplyTemplate = (template: Template) => {
    onApplyTemplate?.(template)
    setSelectedTemplate(null)
    setShowPreview(false)
  }

  const handleSaveAsTemplate = () => {
    if (!newTemplateName.trim() || !currentContent) return

    const settings: TemplateSettings = {
      layout: 'default',
      featuredImage: true,
      showAuthor: true,
      showDate: true,
    }

    onSaveAsTemplate?.(newTemplateName, currentContent, settings)
    setShowSaveModal(false)
    setNewTemplateName('')
    setNewTemplateDescription('')
    setNewTemplateTags('')
  }

  const handleDuplicate = (template: Template) => {
    const newTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      author: { id: 'current', name: 'You' },
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      isPublic: false,
      category: 'custom',
    }
    setTemplates(prev => [newTemplate, ...prev])
  }

  const handleDelete = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId))
  }

  return (
    <div className={clsx('flex flex-col h-full bg-white dark:bg-gray-800', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <LayoutTemplate className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold">Content Templates</h2>
        </div>

        <div className="flex items-center gap-2">
          {currentContent && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Save as Template
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="popular">Most Popular</option>
              <option value="recent">Recently Updated</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={clsx(
                'p-1.5 rounded transition-colors',
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={clsx(
                'p-1.5 rounded transition-colors',
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Categories Sidebar */}
        <div className="w-56 border-r border-gray-200 dark:border-gray-700 overflow-auto">
          <div className="p-2">
            {mockCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={clsx(
                  'w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors',
                  selectedCategory === category.id
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                <div className="flex items-center gap-2">
                  {category.icon}
                  <span className="text-sm">{category.name}</span>
                </div>
                <span className="text-xs text-gray-500">{category.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid/List */}
        <div className="flex-1 overflow-auto p-4">
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <LayoutTemplate className="w-12 h-12 mb-3 opacity-50" />
              <p>No templates found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 gap-4">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className="group relative bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="aspect-[16/10] bg-gray-200 dark:bg-gray-600 relative">
                    {template.thumbnail ? (
                      <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-400" />
                      </div>
                    )}

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedTemplate(template)
                          setShowPreview(true)
                        }}
                        className="p-2 bg-white rounded-lg hover:bg-gray-100"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleApplyTemplate(template)}
                        className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                        title="Use Template"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Badges */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {template.isPremium && (
                        <span className="px-2 py-0.5 text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full">
                          PRO
                        </span>
                      )}
                      {!template.isPublic && (
                        <span className="p-1 bg-gray-800/50 rounded-full">
                          <Lock className="w-3 h-3 text-white" />
                        </span>
                      )}
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => handleToggleFavorite(template.id)}
                      className="absolute top-2 left-2 p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
                    >
                      {template.isFavorite ? (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <StarOff className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="font-medium text-sm truncate">{template.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span>{template.usageCount} uses</span>
                      <span>{template.author.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-14 bg-gray-200 dark:bg-gray-600 rounded flex-shrink-0">
                    {template.thumbnail ? (
                      <img src={template.thumbnail} alt={template.name} className="w-full h-full object-cover rounded" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm truncate">{template.name}</h3>
                      {template.isPremium && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded">
                          PRO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{template.description}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span>{template.usageCount} uses</span>
                      <span>{template.author.name}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleFavorite(template.id)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                    >
                      {template.isFavorite ? (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <StarOff className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTemplate(template)
                        setShowPreview(true)
                      }}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleApplyTemplate(template)}
                      className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
                    >
                      Use
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && selectedTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl max-h-full bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-lg font-semibold">{selectedTemplate.name}</h3>
                  <p className="text-sm text-gray-500">{selectedTemplate.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDuplicate(selectedTemplate)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => handleApplyTemplate(selectedTemplate)}
                    className="flex items-center gap-2 px-4 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    <Check className="w-4 h-4" />
                    Use Template
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Preview Content */}
              <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
                  <div
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedTemplate.content }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {selectedTemplate.author.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Updated {selectedTemplate.updatedAt.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedTemplate.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save as Template Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Save as Template</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Template Name</label>
                  <input
                    type="text"
                    value={newTemplateName}
                    onChange={e => setNewTemplateName(e.target.value)}
                    placeholder="My Template"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={newTemplateDescription}
                    onChange={e => setNewTemplateDescription(e.target.value)}
                    placeholder="Describe your template..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newTemplateTags}
                    onChange={e => setNewTemplateTags(e.target.value)}
                    placeholder="blog, article, personal"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newTemplatePublic}
                    onChange={e => setNewTemplatePublic(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Make this template public</span>
                </label>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAsTemplate}
                  disabled={!newTemplateName.trim()}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  Save Template
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
