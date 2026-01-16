import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Image,
  Video,
  Link,
  FileText,
  Table,
  Code,
  Quote,
  List,
  ListOrdered,
  CheckSquare,
  Columns,
  SeparatorHorizontal,
  Calendar,
  MapPin,
  Music,
  Star,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Box,
  LayoutGrid,
  Maximize2,
  Sparkles,
  Zap,
  Search,
  Clock,
  Heart,
  ChevronRight,
  X,
  Settings,
  Bookmark,
} from 'lucide-react'
import clsx from 'clsx'

interface QuickInsertToolbarProps {
  position: { x: number; y: number } | null
  onInsert: (blockType: string, data?: Record<string, unknown>) => void
  onClose: () => void
  recentBlocks?: string[]
  favoriteBlocks?: string[]
  className?: string
}

interface BlockCategory {
  id: string
  name: string
  icon: React.ReactNode
  blocks: Block[]
}

interface Block {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  keywords: string[]
  premium?: boolean
  new?: boolean
}

const blockCategories: BlockCategory[] = [
  {
    id: 'text',
    name: 'Text',
    icon: <FileText className="w-4 h-4" />,
    blocks: [
      { id: 'paragraph', name: 'Paragraph', description: 'Start with plain text', icon: <FileText className="w-5 h-5" />, keywords: ['text', 'paragraph', 'p'] },
      { id: 'heading', name: 'Heading', description: 'Add a heading (H1-H6)', icon: <FileText className="w-5 h-5" />, keywords: ['heading', 'title', 'h1', 'h2', 'h3'] },
      { id: 'quote', name: 'Quote', description: 'Add a blockquote', icon: <Quote className="w-5 h-5" />, keywords: ['quote', 'blockquote', 'citation'] },
      { id: 'code', name: 'Code', description: 'Add a code block', icon: <Code className="w-5 h-5" />, keywords: ['code', 'pre', 'programming'] },
      { id: 'list', name: 'Bullet List', description: 'Create a bulleted list', icon: <List className="w-5 h-5" />, keywords: ['list', 'bullet', 'ul'] },
      { id: 'numbered-list', name: 'Numbered List', description: 'Create a numbered list', icon: <ListOrdered className="w-5 h-5" />, keywords: ['list', 'numbered', 'ol'] },
      { id: 'checklist', name: 'Checklist', description: 'Interactive checklist', icon: <CheckSquare className="w-5 h-5" />, keywords: ['checklist', 'todo', 'task'] },
    ],
  },
  {
    id: 'media',
    name: 'Media',
    icon: <Image className="w-4 h-4" />,
    blocks: [
      { id: 'image', name: 'Image', description: 'Upload or embed an image', icon: <Image className="w-5 h-5" />, keywords: ['image', 'picture', 'photo', 'img'] },
      { id: 'gallery', name: 'Gallery', description: 'Create an image gallery', icon: <LayoutGrid className="w-5 h-5" />, keywords: ['gallery', 'images', 'photos'] },
      { id: 'video', name: 'Video', description: 'Embed a video', icon: <Video className="w-5 h-5" />, keywords: ['video', 'youtube', 'vimeo', 'mp4'] },
      { id: 'audio', name: 'Audio', description: 'Add an audio player', icon: <Music className="w-5 h-5" />, keywords: ['audio', 'music', 'sound', 'mp3'] },
      { id: 'file', name: 'File', description: 'Attach a downloadable file', icon: <FileText className="w-5 h-5" />, keywords: ['file', 'download', 'attachment'] },
    ],
  },
  {
    id: 'layout',
    name: 'Layout',
    icon: <Columns className="w-4 h-4" />,
    blocks: [
      { id: 'columns', name: 'Columns', description: 'Create multi-column layout', icon: <Columns className="w-5 h-5" />, keywords: ['columns', 'layout', 'grid'] },
      { id: 'row', name: 'Row', description: 'Horizontal content row', icon: <SeparatorHorizontal className="w-5 h-5" />, keywords: ['row', 'horizontal', 'inline'] },
      { id: 'section', name: 'Section', description: 'Full-width section', icon: <Box className="w-5 h-5" />, keywords: ['section', 'container', 'wrapper'] },
      { id: 'spacer', name: 'Spacer', description: 'Add vertical space', icon: <Maximize2 className="w-5 h-5" />, keywords: ['spacer', 'space', 'margin'] },
      { id: 'divider', name: 'Divider', description: 'Horizontal line separator', icon: <SeparatorHorizontal className="w-5 h-5" />, keywords: ['divider', 'line', 'hr', 'separator'] },
    ],
  },
  {
    id: 'embeds',
    name: 'Embeds',
    icon: <Link className="w-4 h-4" />,
    blocks: [
      { id: 'embed', name: 'Embed', description: 'Embed external content', icon: <Link className="w-5 h-5" />, keywords: ['embed', 'iframe', 'external'] },
      { id: 'twitter', name: 'Twitter/X', description: 'Embed a tweet', icon: <Link className="w-5 h-5" />, keywords: ['twitter', 'tweet', 'x'] },
      { id: 'youtube', name: 'YouTube', description: 'Embed a YouTube video', icon: <Video className="w-5 h-5" />, keywords: ['youtube', 'video'] },
      { id: 'map', name: 'Map', description: 'Embed a Google Map', icon: <MapPin className="w-5 h-5" />, keywords: ['map', 'google', 'location'] },
      { id: 'calendar', name: 'Calendar', description: 'Embed a calendar', icon: <Calendar className="w-5 h-5" />, keywords: ['calendar', 'event', 'schedule'] },
    ],
  },
  {
    id: 'data',
    name: 'Data',
    icon: <Table className="w-4 h-4" />,
    blocks: [
      { id: 'table', name: 'Table', description: 'Create a data table', icon: <Table className="w-5 h-5" />, keywords: ['table', 'data', 'grid'] },
      { id: 'chart', name: 'Chart', description: 'Create a chart or graph', icon: <Sparkles className="w-5 h-5" />, keywords: ['chart', 'graph', 'data'], premium: true },
      { id: 'form', name: 'Form', description: 'Add an interactive form', icon: <FileText className="w-5 h-5" />, keywords: ['form', 'input', 'contact'], premium: true },
    ],
  },
  {
    id: 'notices',
    name: 'Notices',
    icon: <AlertCircle className="w-4 h-4" />,
    blocks: [
      { id: 'info', name: 'Info Box', description: 'Informational notice', icon: <Info className="w-5 h-5 text-blue-500" />, keywords: ['info', 'information', 'note'] },
      { id: 'warning', name: 'Warning', description: 'Warning notice', icon: <AlertCircle className="w-5 h-5 text-yellow-500" />, keywords: ['warning', 'caution', 'alert'] },
      { id: 'success', name: 'Success', description: 'Success notice', icon: <CheckCircle className="w-5 h-5 text-green-500" />, keywords: ['success', 'done', 'complete'] },
      { id: 'error', name: 'Error', description: 'Error notice', icon: <XCircle className="w-5 h-5 text-red-500" />, keywords: ['error', 'danger', 'critical'] },
    ],
  },
  {
    id: 'interactive',
    name: 'Interactive',
    icon: <Zap className="w-4 h-4" />,
    blocks: [
      { id: 'accordion', name: 'Accordion', description: 'Collapsible content sections', icon: <ChevronRight className="w-5 h-5" />, keywords: ['accordion', 'collapse', 'faq'] },
      { id: 'tabs', name: 'Tabs', description: 'Tabbed content panels', icon: <Bookmark className="w-5 h-5" />, keywords: ['tabs', 'panel', 'tabbed'] },
      { id: 'rating', name: 'Rating', description: 'Star rating widget', icon: <Star className="w-5 h-5" />, keywords: ['rating', 'stars', 'review'], new: true },
      { id: 'counter', name: 'Counter', description: 'Animated number counter', icon: <Hash className="w-5 h-5" />, keywords: ['counter', 'number', 'statistic'], new: true },
    ],
  },
]

// Flatten all blocks for search
const allBlocks = blockCategories.flatMap(cat =>
  cat.blocks.map(block => ({ ...block, category: cat.name }))
)

export default function QuickInsertToolbar({
  position,
  onInsert,
  onClose,
  recentBlocks = [],
  favoriteBlocks = [],
  className,
}: QuickInsertToolbarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (position && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [position])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  if (!position) return null

  // Filter blocks by search
  const filteredBlocks = searchQuery
    ? allBlocks.filter(block =>
        block.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        block.keywords.some(kw => kw.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : []

  // Get blocks for selected category
  const categoryBlocks = selectedCategory
    ? blockCategories.find(c => c.id === selectedCategory)?.blocks || []
    : []

  // Get recent blocks
  const recentBlockItems = recentBlocks
    .map(id => allBlocks.find(b => b.id === id))
    .filter(Boolean)
    .slice(0, 5)

  // Get favorite blocks
  const favoriteBlockItems = favoriteBlocks
    .map(id => allBlocks.find(b => b.id === id))
    .filter(Boolean)

  const handleInsert = (blockId: string) => {
    onInsert(blockId)
    onClose()
  }

  const renderBlock = (block: Block & { category?: string }) => (
    <button
      key={block.id}
      onClick={() => handleInsert(block.id)}
      onMouseEnter={() => setHoveredBlock(block.id)}
      onMouseLeave={() => setHoveredBlock(null)}
      className={clsx(
        'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors',
        hoveredBlock === block.id
          ? 'bg-primary-50 dark:bg-primary-900/30'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
      )}
    >
      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
        {block.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{block.name}</span>
          {block.premium && (
            <span className="px-1.5 py-0.5 text-[10px] bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded">
              PRO
            </span>
          )}
          {block.new && (
            <span className="px-1.5 py-0.5 text-[10px] bg-green-500 text-white rounded">
              NEW
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">{block.description}</p>
      </div>
      {block.category && (
        <span className="text-xs text-gray-400">{block.category}</span>
      )}
    </button>
  )

  return (
    <AnimatePresence>
      <motion.div
        ref={toolbarRef}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className={clsx(
          'fixed z-50 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden',
          className
        )}
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setSelectedCategory(null)
              }}
              placeholder="Search blocks..."
              className="w-full pl-9 pr-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-auto">
          {/* Search Results */}
          {searchQuery && (
            <div className="p-2">
              {filteredBlocks.length > 0 ? (
                <div className="space-y-1">
                  {filteredBlocks.map(block => renderBlock(block))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No blocks found</p>
                </div>
              )}
            </div>
          )}

          {/* Category View */}
          {!searchQuery && selectedCategory && (
            <div className="p-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2 px-2 py-1 text-sm text-primary-600 hover:text-primary-700 mb-2"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back
              </button>
              <div className="space-y-1">
                {categoryBlocks.map(block => renderBlock(block))}
              </div>
            </div>
          )}

          {/* Main View */}
          {!searchQuery && !selectedCategory && (
            <>
              {/* Recent Blocks */}
              {recentBlockItems.length > 0 && (
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs text-gray-500 uppercase">
                    <Clock className="w-3 h-3" />
                    Recent
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {recentBlockItems.map(block => block && (
                      <button
                        key={block.id}
                        onClick={() => handleInsert(block.id)}
                        className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        {block.icon}
                        {block.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorite Blocks */}
              {favoriteBlockItems.length > 0 && (
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs text-gray-500 uppercase">
                    <Heart className="w-3 h-3" />
                    Favorites
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {favoriteBlockItems.map(block => block && (
                      <button
                        key={block.id}
                        onClick={() => handleInsert(block.id)}
                        className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        {block.icon}
                        {block.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              <div className="p-2">
                <div className="flex items-center gap-2 px-2 py-1 text-xs text-gray-500 uppercase">
                  <LayoutGrid className="w-3 h-3" />
                  Categories
                </div>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {blockCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className="flex items-center gap-2 p-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="p-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded">
                        {category.icon}
                      </div>
                      <div>
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="block text-xs text-gray-500">
                          {category.blocks.length} blocks
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 px-2 py-1 text-xs text-gray-500 uppercase">
                  <Zap className="w-3 h-3" />
                  Quick Actions
                </div>
                <div className="grid grid-cols-4 gap-1 mt-1">
                  {['image', 'heading', 'list', 'quote', 'code', 'table', 'video', 'divider'].map(blockId => {
                    const block = allBlocks.find(b => b.id === blockId)
                    if (!block) return null
                    return (
                      <button
                        key={blockId}
                        onClick={() => handleInsert(blockId)}
                        className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title={block.name}
                      >
                        {block.icon}
                        <span className="text-[10px] text-gray-500 truncate w-full text-center">
                          {block.name}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
          <span>Type / to search</span>
          <span>Press Esc to close</span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Hash icon helper component
function Hash({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
    </svg>
  )
}
