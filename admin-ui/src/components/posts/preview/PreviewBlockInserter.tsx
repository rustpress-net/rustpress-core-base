import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  X,
  Type,
  Image,
  Video,
  List,
  Quote,
  Code,
  Table,
  Columns,
  LayoutGrid,
  Box,
  Heading1,
  Minus,
  Play,
  Music,
  Map,
  FormInput,
  Zap,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Star,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react'
import clsx from 'clsx'

interface PreviewBlockInserterProps {
  onInsertBlock: (html: string) => void
  isOpen: boolean
  onToggle: () => void
}

interface BlockItem {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: string
  keywords: string[]
  getHTML: () => string
}

const blockItems: BlockItem[] = [
  // Text blocks
  {
    id: 'paragraph',
    name: 'Paragraph',
    description: 'Start with plain text',
    icon: <Type className="w-5 h-5" />,
    category: 'text',
    keywords: ['text', 'paragraph', 'p'],
    getHTML: () => '<p data-block="paragraph">Enter your text here...</p>'
  },
  {
    id: 'heading-1',
    name: 'Heading 1',
    description: 'Large section heading',
    icon: <Heading1 className="w-5 h-5" />,
    category: 'text',
    keywords: ['heading', 'h1', 'title'],
    getHTML: () => '<h1 data-block="heading-1">Heading 1</h1>'
  },
  {
    id: 'heading-2',
    name: 'Heading 2',
    description: 'Medium section heading',
    icon: <Heading1 className="w-5 h-5" />,
    category: 'text',
    keywords: ['heading', 'h2'],
    getHTML: () => '<h2 data-block="heading-2">Heading 2</h2>'
  },
  {
    id: 'heading-3',
    name: 'Heading 3',
    description: 'Small section heading',
    icon: <Heading1 className="w-5 h-5" />,
    category: 'text',
    keywords: ['heading', 'h3'],
    getHTML: () => '<h3 data-block="heading-3">Heading 3</h3>'
  },
  {
    id: 'list',
    name: 'Bullet List',
    description: 'Create a bulleted list',
    icon: <List className="w-5 h-5" />,
    category: 'text',
    keywords: ['list', 'bullet', 'ul'],
    getHTML: () => '<ul data-block="list"><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>'
  },
  {
    id: 'ordered-list',
    name: 'Numbered List',
    description: 'Create a numbered list',
    icon: <List className="w-5 h-5" />,
    category: 'text',
    keywords: ['list', 'numbered', 'ol'],
    getHTML: () => '<ol data-block="ordered-list"><li>Item 1</li><li>Item 2</li><li>Item 3</li></ol>'
  },
  {
    id: 'quote',
    name: 'Quote',
    description: 'Add a blockquote',
    icon: <Quote className="w-5 h-5" />,
    category: 'text',
    keywords: ['quote', 'blockquote'],
    getHTML: () => '<blockquote data-block="quote"><p>"Your quote here..."</p><cite>— Author</cite></blockquote>'
  },
  {
    id: 'code',
    name: 'Code Block',
    description: 'Display code with highlighting',
    icon: <Code className="w-5 h-5" />,
    category: 'text',
    keywords: ['code', 'pre', 'syntax'],
    getHTML: () => '<pre data-block="code" style="background:#1e1e1e;color:#d4d4d4;padding:16px;border-radius:8px;overflow-x:auto;"><code>// Your code here\nconsole.log("Hello World");</code></pre>'
  },

  // Media blocks
  {
    id: 'image',
    name: 'Image',
    description: 'Insert an image',
    icon: <Image className="w-5 h-5" />,
    category: 'media',
    keywords: ['image', 'photo', 'picture'],
    getHTML: () => '<figure data-block="image" style="margin:24px 0;"><img src="https://via.placeholder.com/800x400" alt="Image description" style="width:100%;border-radius:8px;"/><figcaption style="text-align:center;color:#6b7280;font-size:14px;margin-top:8px;">Image caption</figcaption></figure>'
  },
  {
    id: 'gallery',
    name: 'Gallery',
    description: 'Display multiple images',
    icon: <LayoutGrid className="w-5 h-5" />,
    category: 'media',
    keywords: ['gallery', 'images', 'photos'],
    getHTML: () => '<div data-block="gallery" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:24px 0;"><img src="https://via.placeholder.com/300" alt="Gallery 1" style="width:100%;border-radius:4px;"/><img src="https://via.placeholder.com/300" alt="Gallery 2" style="width:100%;border-radius:4px;"/><img src="https://via.placeholder.com/300" alt="Gallery 3" style="width:100%;border-radius:4px;"/></div>'
  },
  {
    id: 'video',
    name: 'Video',
    description: 'Embed a video file',
    icon: <Video className="w-5 h-5" />,
    category: 'media',
    keywords: ['video', 'movie', 'mp4'],
    getHTML: () => '<video data-block="video" controls style="width:100%;border-radius:8px;margin:24px 0;"><source src="" type="video/mp4">Your browser does not support video.</video>'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Embed a YouTube video',
    icon: <Play className="w-5 h-5" />,
    category: 'media',
    keywords: ['youtube', 'video', 'embed'],
    getHTML: () => '<div data-block="youtube" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:8px;margin:24px 0;"><iframe style="position:absolute;top:0;left:0;width:100%;height:100%;" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe></div>'
  },
  {
    id: 'audio',
    name: 'Audio',
    description: 'Embed an audio file',
    icon: <Music className="w-5 h-5" />,
    category: 'media',
    keywords: ['audio', 'music', 'mp3'],
    getHTML: () => '<audio data-block="audio" controls style="width:100%;margin:24px 0;"><source src="" type="audio/mpeg">Your browser does not support audio.</audio>'
  },
  {
    id: 'cover',
    name: 'Cover Image',
    description: 'Image with text overlay',
    icon: <Image className="w-5 h-5" />,
    category: 'media',
    keywords: ['cover', 'hero', 'banner'],
    getHTML: () => '<div data-block="cover" style="position:relative;min-height:300px;background:linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url(https://via.placeholder.com/1200x600);background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;border-radius:8px;color:white;text-align:center;padding:48px;margin:24px 0;"><h2 style="font-size:2rem;margin:0;">Cover Title</h2></div>'
  },

  // Layout blocks
  {
    id: 'columns-2',
    name: '2 Columns',
    description: 'Two column layout',
    icon: <Columns className="w-5 h-5" />,
    category: 'layout',
    keywords: ['columns', '2', 'layout'],
    getHTML: () => '<div data-block="columns-2" style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin:24px 0;"><div style="padding:16px;background:#f9fafb;border-radius:8px;"><p>Column 1 content...</p></div><div style="padding:16px;background:#f9fafb;border-radius:8px;"><p>Column 2 content...</p></div></div>'
  },
  {
    id: 'columns-3',
    name: '3 Columns',
    description: 'Three column layout',
    icon: <Columns className="w-5 h-5" />,
    category: 'layout',
    keywords: ['columns', '3', 'layout'],
    getHTML: () => '<div data-block="columns-3" style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin:24px 0;"><div style="padding:16px;background:#f9fafb;border-radius:8px;"><p>Column 1</p></div><div style="padding:16px;background:#f9fafb;border-radius:8px;"><p>Column 2</p></div><div style="padding:16px;background:#f9fafb;border-radius:8px;"><p>Column 3</p></div></div>'
  },
  {
    id: 'separator',
    name: 'Separator',
    description: 'Add a horizontal line',
    icon: <Minus className="w-5 h-5" />,
    category: 'layout',
    keywords: ['separator', 'divider', 'hr'],
    getHTML: () => '<hr data-block="separator" style="border:none;border-top:2px solid #e5e7eb;margin:32px 0;"/>'
  },
  {
    id: 'spacer',
    name: 'Spacer',
    description: 'Add vertical space',
    icon: <Box className="w-5 h-5" />,
    category: 'layout',
    keywords: ['spacer', 'space', 'gap'],
    getHTML: () => '<div data-block="spacer" style="height:48px;"></div>'
  },
  {
    id: 'group',
    name: 'Group',
    description: 'Group blocks together',
    icon: <Box className="w-5 h-5" />,
    category: 'layout',
    keywords: ['group', 'container', 'section'],
    getHTML: () => '<div data-block="group" style="padding:24px;background:#f9fafb;border-radius:12px;margin:24px 0;"><p>Group content goes here...</p></div>'
  },

  // Widget blocks
  {
    id: 'button',
    name: 'Button',
    description: 'Call-to-action button',
    icon: <Box className="w-5 h-5" />,
    category: 'widgets',
    keywords: ['button', 'cta', 'link'],
    getHTML: () => '<div data-block="button" style="margin:24px 0;"><a href="#" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:white;text-decoration:none;border-radius:6px;font-weight:500;">Click Me</a></div>'
  },
  {
    id: 'table',
    name: 'Table',
    description: 'Insert a data table',
    icon: <Table className="w-5 h-5" />,
    category: 'widgets',
    keywords: ['table', 'data', 'grid'],
    getHTML: () => '<table data-block="table" style="width:100%;border-collapse:collapse;margin:24px 0;"><thead><tr style="background:#f9fafb;"><th style="border:1px solid #e5e7eb;padding:12px;text-align:left;">Header 1</th><th style="border:1px solid #e5e7eb;padding:12px;text-align:left;">Header 2</th><th style="border:1px solid #e5e7eb;padding:12px;text-align:left;">Header 3</th></tr></thead><tbody><tr><td style="border:1px solid #e5e7eb;padding:12px;">Cell 1</td><td style="border:1px solid #e5e7eb;padding:12px;">Cell 2</td><td style="border:1px solid #e5e7eb;padding:12px;">Cell 3</td></tr></tbody></table>'
  },
  {
    id: 'alert-info',
    name: 'Info Alert',
    description: 'Informational message',
    icon: <AlertCircle className="w-5 h-5" />,
    category: 'widgets',
    keywords: ['alert', 'info', 'notice'],
    getHTML: () => '<div data-block="alert-info" style="padding:16px;background:#dbeafe;border-left:4px solid #3b82f6;border-radius:4px;margin:24px 0;"><strong>Info:</strong> This is an informational message.</div>'
  },
  {
    id: 'alert-warning',
    name: 'Warning Alert',
    description: 'Warning message',
    icon: <AlertCircle className="w-5 h-5" />,
    category: 'widgets',
    keywords: ['alert', 'warning'],
    getHTML: () => '<div data-block="alert-warning" style="padding:16px;background:#fef3c7;border-left:4px solid #f59e0b;border-radius:4px;margin:24px 0;"><strong>Warning:</strong> Please pay attention to this message.</div>'
  },
  {
    id: 'faq',
    name: 'FAQ Item',
    description: 'Collapsible FAQ',
    icon: <HelpCircle className="w-5 h-5" />,
    category: 'widgets',
    keywords: ['faq', 'question', 'accordion'],
    getHTML: () => '<details data-block="faq" style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;"><summary style="font-weight:600;cursor:pointer;">Question: What is this?</summary><p style="margin-top:12px;color:#6b7280;">Answer: This is a collapsible FAQ item.</p></details>'
  },
  {
    id: 'testimonial',
    name: 'Testimonial',
    description: 'Customer testimonial',
    icon: <MessageSquare className="w-5 h-5" />,
    category: 'widgets',
    keywords: ['testimonial', 'review', 'quote'],
    getHTML: () => '<div data-block="testimonial" style="padding:24px;background:#f9fafb;border-radius:12px;text-align:center;margin:24px 0;"><div style="font-size:48px;color:#3b82f6;line-height:1;">"</div><p style="font-style:italic;font-size:1.1rem;margin:16px 0;">This product exceeded my expectations!</p><div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-top:16px;"><div style="width:48px;height:48px;background:linear-gradient(135deg,#3b82f6,#10b981);border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:600;">JD</div><div style="text-align:left;"><strong>John Doe</strong><br/><small style="color:#6b7280;">Customer</small></div></div></div>'
  },
  {
    id: 'icon-box',
    name: 'Icon Box',
    description: 'Feature with icon',
    icon: <Star className="w-5 h-5" />,
    category: 'widgets',
    keywords: ['icon', 'feature', 'box'],
    getHTML: () => '<div data-block="icon-box" style="text-align:center;padding:32px;margin:24px 0;"><div style="width:64px;height:64px;background:#3b82f6;border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;"><span style="font-size:28px;color:white;">★</span></div><h3 style="margin:0 0 8px;font-size:1.25rem;">Feature Title</h3><p style="color:#6b7280;margin:0;">Description of this feature.</p></div>'
  },
  {
    id: 'progress',
    name: 'Progress Bar',
    description: 'Visual progress indicator',
    icon: <TrendingUp className="w-5 h-5" />,
    category: 'widgets',
    keywords: ['progress', 'bar', 'percentage'],
    getHTML: () => '<div data-block="progress" style="margin:24px 0;"><div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="font-weight:500;">Progress</span><span style="color:#6b7280;">75%</span></div><div style="height:12px;background:#e5e7eb;border-radius:6px;overflow:hidden;"><div style="width:75%;height:100%;background:linear-gradient(90deg,#3b82f6,#10b981);border-radius:6px;"></div></div></div>'
  },
  {
    id: 'map',
    name: 'Map',
    description: 'Embed Google Map',
    icon: <Map className="w-5 h-5" />,
    category: 'widgets',
    keywords: ['map', 'google', 'location'],
    getHTML: () => '<div data-block="map" style="border-radius:8px;overflow:hidden;margin:24px 0;"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387193.30591910525!2d-74.25986432970718!3d40.697149413085!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY!5e0!3m2!1sen!2sus!4v1234567890" width="100%" height="300" style="border:0;" allowfullscreen="" loading="lazy"></iframe></div>'
  },
  {
    id: 'form',
    name: 'Contact Form',
    description: 'Simple contact form',
    icon: <FormInput className="w-5 h-5" />,
    category: 'widgets',
    keywords: ['form', 'contact', 'email'],
    getHTML: () => '<form data-block="form" style="padding:24px;background:#f9fafb;border-radius:12px;margin:24px 0;"><div style="margin-bottom:16px;"><label style="display:block;font-weight:500;margin-bottom:4px;">Name</label><input type="text" placeholder="Your name" style="width:100%;padding:12px;border:1px solid #e5e7eb;border-radius:6px;"/></div><div style="margin-bottom:16px;"><label style="display:block;font-weight:500;margin-bottom:4px;">Email</label><input type="email" placeholder="your@email.com" style="width:100%;padding:12px;border:1px solid #e5e7eb;border-radius:6px;"/></div><div style="margin-bottom:16px;"><label style="display:block;font-weight:500;margin-bottom:4px;">Message</label><textarea placeholder="Your message..." rows="4" style="width:100%;padding:12px;border:1px solid #e5e7eb;border-radius:6px;resize:vertical;"></textarea></div><button type="submit" style="padding:12px 24px;background:#3b82f6;color:white;border:none;border-radius:6px;font-weight:500;cursor:pointer;">Send Message</button></form>'
  },

  // Advanced blocks
  {
    id: 'html',
    name: 'Custom HTML',
    description: 'Add custom HTML code',
    icon: <Code className="w-5 h-5" />,
    category: 'advanced',
    keywords: ['html', 'code', 'custom'],
    getHTML: () => '<div data-block="html" style="padding:16px;border:2px dashed #e5e7eb;border-radius:8px;margin:24px 0;"><!-- Custom HTML --><p>Custom HTML block</p></div>'
  },
  {
    id: 'shortcode',
    name: 'Shortcode',
    description: 'Insert a shortcode',
    icon: <Zap className="w-5 h-5" />,
    category: 'advanced',
    keywords: ['shortcode', 'plugin'],
    getHTML: () => '<div data-block="shortcode" style="padding:16px;background:#fef3c7;border-radius:8px;font-family:monospace;margin:24px 0;">[shortcode attribute="value"]</div>'
  },
]

const categories = [
  { id: 'all', name: 'All Blocks', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'text', name: 'Text', icon: <Type className="w-4 h-4" /> },
  { id: 'media', name: 'Media', icon: <Image className="w-4 h-4" /> },
  { id: 'layout', name: 'Layout', icon: <Columns className="w-4 h-4" /> },
  { id: 'widgets', name: 'Widgets', icon: <Box className="w-4 h-4" /> },
  { id: 'advanced', name: 'Advanced', icon: <Zap className="w-4 h-4" /> },
]

export default function PreviewBlockInserter({ onInsertBlock, isOpen, onToggle }: PreviewBlockInserterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [recentBlocks] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Filter blocks
  const filteredBlocks = blockItems.filter(block => {
    const matchesSearch = searchQuery === '' ||
      block.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      block.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || block.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Focus search on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onToggle()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onToggle])

  const handleInsert = (block: BlockItem) => {
    onInsertBlock(block.getHTML())
    onToggle()
    setSearchQuery('')
    setSelectedCategory('all')
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', zIndex: 50 }}>
      {/* Centered Small Toggle Button */}
      <button
        onClick={onToggle}
        className={clsx(
          'flex items-center justify-center rounded-full transition-all duration-200',
          isOpen
            ? 'bg-green-500 text-white shadow-lg'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary-500 hover:text-white shadow-md'
        )}
        style={{
          width: '32px',
          height: '32px',
          border: 'none',
          cursor: 'pointer',
        }}
        title={isOpen ? 'Close' : 'Add Block'}
      >
        {isOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
      </button>

      {/* Block Inserter Panel - Same UI as EditorBlockToolbar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 bottom-full mb-2 w-[400px] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            style={{ transform: 'translateX(-50%)' }}
          >
            {/* Search */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search blocks..."
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border-0 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex h-[400px]">
              {/* Categories Sidebar */}
              <div className="w-[140px] border-r border-gray-200 dark:border-gray-700 p-2 space-y-1 overflow-y-auto">
                {recentBlocks.length > 0 && (
                  <>
                    <button
                      onClick={() => setSelectedCategory('recent')}
                      className={clsx(
                        'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left',
                        selectedCategory === 'recent'
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      )}
                    >
                      <Clock className="w-4 h-4" />
                      Recent
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                  </>
                )}

                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={clsx(
                      'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left',
                      selectedCategory === category.id
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    )}
                  >
                    {category.icon}
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Blocks List */}
              <div className="flex-1 p-2 overflow-y-auto">
                {filteredBlocks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No blocks found</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredBlocks.map(block => (
                      <button
                        key={block.id}
                        onClick={() => handleInsert(block)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group text-left"
                      >
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 group-hover:bg-primary-100 group-hover:text-primary-600 dark:group-hover:bg-primary-900/30 dark:group-hover:text-primary-400">
                          {block.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-sm font-medium text-gray-900 dark:text-white truncate">
                            {block.name}
                          </span>
                          <p className="text-xs text-gray-500 truncate">{block.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { blockItems }
