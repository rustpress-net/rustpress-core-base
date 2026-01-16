import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  Highlighter,
  Subscript,
  Superscript,
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  RemoveFormatting,
  ChevronDown,
  X,
  Check,
  Sparkles,
  Wand2,
  MessageSquare,
  Languages,
  Minimize2,
  Maximize2,
} from 'lucide-react'
import clsx from 'clsx'

interface FloatingFormatToolbarProps {
  selection: Selection | null
  position: { x: number; y: number } | null
  onFormat: (command: string, value?: string) => void
  onAIAction?: (action: string, text: string) => void
  enabledFormats?: string[]
  showAITools?: boolean
}

interface ToolbarGroup {
  id: string
  tools: ToolbarTool[]
}

interface ToolbarTool {
  id: string
  icon: React.ReactNode
  label: string
  command: string
  value?: string
  isActive?: boolean
  hasDropdown?: boolean
  dropdownOptions?: { label: string; value: string }[]
}

// Color palette for highlighting and text color
const colorPalette = [
  { name: 'Yellow', value: '#fef08a' },
  { name: 'Green', value: '#bbf7d0' },
  { name: 'Blue', value: '#bfdbfe' },
  { name: 'Purple', value: '#ddd6fe' },
  { name: 'Pink', value: '#fbcfe8' },
  { name: 'Red', value: '#fecaca' },
  { name: 'Orange', value: '#fed7aa' },
  { name: 'Gray', value: '#e5e7eb' },
]

const textColors = [
  { name: 'Default', value: 'inherit' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Purple', value: '#9333ea' },
  { name: 'Pink', value: '#db2777' },
]

// AI actions
const aiActions = [
  { id: 'improve', label: 'Improve Writing', icon: <Wand2 className="w-4 h-4" /> },
  { id: 'simplify', label: 'Simplify', icon: <Minimize2 className="w-4 h-4" /> },
  { id: 'expand', label: 'Expand', icon: <Maximize2 className="w-4 h-4" /> },
  { id: 'summarize', label: 'Summarize', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'translate', label: 'Translate', icon: <Languages className="w-4 h-4" /> },
  { id: 'tone-formal', label: 'Make Formal', icon: <Type className="w-4 h-4" /> },
  { id: 'tone-casual', label: 'Make Casual', icon: <Type className="w-4 h-4" /> },
  { id: 'fix-grammar', label: 'Fix Grammar', icon: <Check className="w-4 h-4" /> },
]

export default function FloatingFormatToolbar({
  selection,
  position,
  onFormat,
  onAIAction,
  enabledFormats,
  showAITools = true,
}: FloatingFormatToolbarProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [showAIMenu, setShowAIMenu] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const linkInputRef = useRef<HTMLInputElement>(null)

  // Check if format is currently active
  const isFormatActive = (command: string): boolean => {
    try {
      return document.queryCommandState(command)
    } catch {
      return false
    }
  }

  // Toolbar groups
  const toolbarGroups: ToolbarGroup[] = [
    {
      id: 'text-style',
      tools: [
        { id: 'bold', icon: <Bold className="w-4 h-4" />, label: 'Bold (Ctrl+B)', command: 'bold', isActive: isFormatActive('bold') },
        { id: 'italic', icon: <Italic className="w-4 h-4" />, label: 'Italic (Ctrl+I)', command: 'italic', isActive: isFormatActive('italic') },
        { id: 'underline', icon: <Underline className="w-4 h-4" />, label: 'Underline (Ctrl+U)', command: 'underline', isActive: isFormatActive('underline') },
        { id: 'strikethrough', icon: <Strikethrough className="w-4 h-4" />, label: 'Strikethrough', command: 'strikeThrough', isActive: isFormatActive('strikeThrough') },
      ],
    },
    {
      id: 'text-format',
      tools: [
        { id: 'code', icon: <Code className="w-4 h-4" />, label: 'Inline Code', command: 'code' },
        { id: 'subscript', icon: <Subscript className="w-4 h-4" />, label: 'Subscript', command: 'subscript', isActive: isFormatActive('subscript') },
        { id: 'superscript', icon: <Superscript className="w-4 h-4" />, label: 'Superscript', command: 'superscript', isActive: isFormatActive('superscript') },
      ],
    },
    {
      id: 'headings',
      tools: [
        { id: 'h1', icon: <Heading1 className="w-4 h-4" />, label: 'Heading 1', command: 'formatBlock', value: 'h1' },
        { id: 'h2', icon: <Heading2 className="w-4 h-4" />, label: 'Heading 2', command: 'formatBlock', value: 'h2' },
        { id: 'h3', icon: <Heading3 className="w-4 h-4" />, label: 'Heading 3', command: 'formatBlock', value: 'h3' },
      ],
    },
    {
      id: 'alignment',
      tools: [
        { id: 'align-left', icon: <AlignLeft className="w-4 h-4" />, label: 'Align Left', command: 'justifyLeft', isActive: isFormatActive('justifyLeft') },
        { id: 'align-center', icon: <AlignCenter className="w-4 h-4" />, label: 'Align Center', command: 'justifyCenter', isActive: isFormatActive('justifyCenter') },
        { id: 'align-right', icon: <AlignRight className="w-4 h-4" />, label: 'Align Right', command: 'justifyRight', isActive: isFormatActive('justifyRight') },
        { id: 'align-justify', icon: <AlignJustify className="w-4 h-4" />, label: 'Justify', command: 'justifyFull', isActive: isFormatActive('justifyFull') },
      ],
    },
    {
      id: 'lists',
      tools: [
        { id: 'bullet-list', icon: <List className="w-4 h-4" />, label: 'Bullet List', command: 'insertUnorderedList', isActive: isFormatActive('insertUnorderedList') },
        { id: 'numbered-list', icon: <ListOrdered className="w-4 h-4" />, label: 'Numbered List', command: 'insertOrderedList', isActive: isFormatActive('insertOrderedList') },
        { id: 'quote', icon: <Quote className="w-4 h-4" />, label: 'Quote', command: 'formatBlock', value: 'blockquote' },
      ],
    },
    {
      id: 'colors',
      tools: [
        { id: 'highlight', icon: <Highlighter className="w-4 h-4" />, label: 'Highlight', command: 'highlight', hasDropdown: true },
        { id: 'text-color', icon: <Palette className="w-4 h-4" />, label: 'Text Color', command: 'textColor', hasDropdown: true },
      ],
    },
    {
      id: 'links',
      tools: [
        { id: 'link', icon: <Link className="w-4 h-4" />, label: 'Add Link (Ctrl+K)', command: 'link' },
        { id: 'remove-format', icon: <RemoveFormatting className="w-4 h-4" />, label: 'Clear Formatting', command: 'removeFormat' },
      ],
    },
  ]

  // Filter groups based on enabled formats
  const filteredGroups = enabledFormats
    ? toolbarGroups.map(group => ({
        ...group,
        tools: group.tools.filter(tool => enabledFormats.includes(tool.id)),
      })).filter(group => group.tools.length > 0)
    : toolbarGroups

  useEffect(() => {
    if (showLinkInput && linkInputRef.current) {
      linkInputRef.current.focus()
    }
  }, [showLinkInput])

  const handleToolClick = (tool: ToolbarTool) => {
    if (tool.hasDropdown) {
      setActiveDropdown(activeDropdown === tool.id ? null : tool.id)
      return
    }

    if (tool.id === 'link') {
      setShowLinkInput(true)
      return
    }

    if (tool.value) {
      onFormat(tool.command, tool.value)
    } else {
      onFormat(tool.command)
    }
  }

  const handleAddLink = () => {
    if (linkUrl) {
      onFormat('createLink', linkUrl)
      setLinkUrl('')
      setShowLinkInput(false)
    }
  }

  const handleColorSelect = (command: string, color: string) => {
    if (command === 'highlight') {
      onFormat('hiliteColor', color)
    } else {
      onFormat('foreColor', color)
    }
    setActiveDropdown(null)
  }

  const handleAIAction = (actionId: string) => {
    if (onAIAction && selection) {
      onAIAction(actionId, selection.toString())
    }
    setShowAIMenu(false)
  }

  if (!position || !selection || selection.isCollapsed) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={toolbarRef}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="fixed z-50 flex flex-col"
        style={{
          left: position.x,
          top: position.y - 50,
          transform: 'translateX(-50%)',
        }}
      >
        {/* Main Toolbar */}
        <div className="flex items-center gap-0.5 p-1 bg-gray-900 dark:bg-gray-800 rounded-lg shadow-xl">
          {filteredGroups.map((group, groupIndex) => (
            <div key={group.id} className="flex items-center">
              {groupIndex > 0 && (
                <div className="w-px h-6 bg-gray-700 mx-1" />
              )}
              {group.tools.map(tool => (
                <div key={tool.id} className="relative">
                  <button
                    onClick={() => handleToolClick(tool)}
                    className={clsx(
                      'p-2 rounded transition-colors',
                      tool.isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    )}
                    title={tool.label}
                  >
                    {tool.icon}
                    {tool.hasDropdown && (
                      <ChevronDown className="w-3 h-3 ml-0.5 inline" />
                    )}
                  </button>

                  {/* Color Dropdown */}
                  {tool.hasDropdown && activeDropdown === tool.id && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 mt-1 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-10"
                    >
                      <div className="grid grid-cols-4 gap-1">
                        {(tool.id === 'highlight' ? colorPalette : textColors).map(color => (
                          <button
                            key={color.value}
                            onClick={() => handleColorSelect(tool.command, color.value)}
                            className="w-6 h-6 rounded border border-gray-200 dark:border-gray-600 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          />
                        ))}
                      </div>
                      {tool.id === 'highlight' && (
                        <button
                          onClick={() => handleColorSelect(tool.command, 'transparent')}
                          className="mt-2 w-full text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        >
                          Remove Highlight
                        </button>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          ))}

          {/* AI Tools Button */}
          {showAITools && onAIAction && (
            <>
              <div className="w-px h-6 bg-gray-700 mx-1" />
              <button
                onClick={() => setShowAIMenu(!showAIMenu)}
                className={clsx(
                  'p-2 rounded transition-colors flex items-center gap-1',
                  showAIMenu
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-400 hover:text-white hover:bg-gray-700'
                )}
                title="AI Tools"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-xs">AI</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </>
          )}
        </div>

        {/* Link Input */}
        {showLinkInput && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex items-center gap-2 p-2 bg-gray-900 dark:bg-gray-800 rounded-lg shadow-xl"
          >
            <input
              ref={linkInputRef}
              type="url"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              placeholder="Enter URL..."
              className="flex-1 px-3 py-1.5 bg-gray-700 text-white text-sm rounded border-0 focus:ring-2 focus:ring-primary-500"
              onKeyDown={e => {
                if (e.key === 'Enter') handleAddLink()
                if (e.key === 'Escape') setShowLinkInput(false)
              }}
            />
            <button
              onClick={handleAddLink}
              className="p-1.5 bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowLinkInput(false)}
              className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* AI Menu */}
        {showAIMenu && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 p-1 bg-gray-900 dark:bg-gray-800 rounded-lg shadow-xl min-w-[180px]"
          >
            <div className="px-2 py-1 text-xs text-gray-500 uppercase tracking-wider">
              AI Actions
            </div>
            {aiActions.map(action => (
              <button
                key={action.id}
                onClick={() => handleAIAction(action.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
