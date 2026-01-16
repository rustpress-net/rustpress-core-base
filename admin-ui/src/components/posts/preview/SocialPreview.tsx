import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Instagram,
  Image,
  Edit3,
  Copy,
  Check,
  RefreshCw,
  Eye,
  Smartphone,
  Monitor,
  Globe,
  ExternalLink,
  Settings,
  ChevronDown,
  X,
  Upload,
  Sparkles,
} from 'lucide-react'
import clsx from 'clsx'

interface SocialPreviewProps {
  title: string
  description?: string
  url?: string
  image?: string
  siteName?: string
  author?: {
    name: string
    username?: string
    avatar?: string
  }
  publishDate?: Date
  onTitleChange?: (title: string) => void
  onDescriptionChange?: (description: string) => void
  onImageChange?: (image: string) => void
  className?: string
}

interface SocialPlatform {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  bgColor: string
  maxTitleLength: number
  maxDescLength: number
  imageRatio: string
}

const platforms: SocialPlatform[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: <Facebook className="w-5 h-5" />,
    color: '#1877f2',
    bgColor: 'bg-[#1877f2]',
    maxTitleLength: 60,
    maxDescLength: 65,
    imageRatio: '1.91:1',
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: <Twitter className="w-5 h-5" />,
    color: '#1da1f2',
    bgColor: 'bg-black',
    maxTitleLength: 70,
    maxDescLength: 200,
    imageRatio: '2:1',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: <Linkedin className="w-5 h-5" />,
    color: '#0077b5',
    bgColor: 'bg-[#0077b5]',
    maxTitleLength: 60,
    maxDescLength: 150,
    imageRatio: '1.91:1',
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: <MessageCircle className="w-5 h-5" />,
    color: '#5865f2',
    bgColor: 'bg-[#5865f2]',
    maxTitleLength: 256,
    maxDescLength: 2048,
    imageRatio: '1.91:1',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: <MessageCircle className="w-5 h-5" />,
    color: '#25d366',
    bgColor: 'bg-[#25d366]',
    maxTitleLength: 50,
    maxDescLength: 100,
    imageRatio: '1.91:1',
  },
]

export default function SocialPreview({
  title,
  description = '',
  url = 'https://example.com/post',
  image,
  siteName = 'Your Site',
  author,
  publishDate,
  onTitleChange,
  onDescriptionChange,
  onImageChange,
  className,
}: SocialPreviewProps) {
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0])
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [editDescription, setEditDescription] = useState(description)
  const [copied, setCopied] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [customImage, setCustomImage] = useState(image || '')

  const handleCopy = () => {
    const text = `${title}\n\n${description}\n\n${url}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveEdits = () => {
    onTitleChange?.(editTitle)
    onDescriptionChange?.(editDescription)
    setIsEditing(false)
  }

  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength - 3) + '...'
  }

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return url
    }
  }

  const renderFacebookPreview = () => (
    <div className={clsx(
      'rounded-lg overflow-hidden border border-gray-300 bg-white',
      viewMode === 'mobile' ? 'max-w-[320px]' : 'max-w-[500px]'
    )}>
      {image || customImage ? (
        <div className="relative aspect-[1.91/1] bg-gray-100">
          <img
            src={image || customImage}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-[1.91/1] bg-gray-100 flex items-center justify-center">
          <Image className="w-12 h-12 text-gray-400" />
        </div>
      )}
      <div className="p-3 bg-[#f0f2f5]">
        <div className="text-xs text-gray-500 uppercase tracking-wider">
          {getHostname(url)}
        </div>
        <div className="font-semibold text-[#1c1e21] mt-1 leading-tight">
          {truncate(title, selectedPlatform.maxTitleLength) || 'Post Title'}
        </div>
        <div className="text-sm text-gray-500 mt-1 line-clamp-1">
          {truncate(description, selectedPlatform.maxDescLength) || 'Post description will appear here'}
        </div>
      </div>
    </div>
  )

  const renderTwitterPreview = () => (
    <div className={clsx(
      'rounded-xl overflow-hidden border border-gray-200',
      viewMode === 'mobile' ? 'max-w-[320px]' : 'max-w-[500px]'
    )}>
      <div className="p-3 flex gap-3">
        {author?.avatar ? (
          <img src={author.avatar} alt="" className="w-10 h-10 rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <span className="font-bold">{author?.name || 'User'}</span>
            <span className="text-gray-500">@{author?.username || 'username'}</span>
          </div>
          <p className="mt-1 text-[15px]">{description || 'Your tweet content'}</p>

          <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
            {image || customImage ? (
              <div className="relative aspect-[2/1] bg-gray-100">
                <img
                  src={image || customImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[2/1] bg-gray-100 flex items-center justify-center">
                <Image className="w-12 h-12 text-gray-400" />
              </div>
            )}
            <div className="p-3 bg-white">
              <div className="text-gray-500 text-sm">{getHostname(url)}</div>
              <div className="font-normal text-[15px] mt-0.5">
                {truncate(title, selectedPlatform.maxTitleLength) || 'Post Title'}
              </div>
              <div className="text-gray-500 text-sm mt-0.5 line-clamp-2">
                {truncate(description, selectedPlatform.maxDescLength)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderLinkedInPreview = () => (
    <div className={clsx(
      'rounded-lg overflow-hidden border border-gray-300 bg-white',
      viewMode === 'mobile' ? 'max-w-[320px]' : 'max-w-[500px]'
    )}>
      <div className="p-3 flex gap-3">
        {author?.avatar ? (
          <img src={author.avatar} alt="" className="w-12 h-12 rounded-full" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-300" />
        )}
        <div>
          <div className="font-semibold">{author?.name || 'User'}</div>
          <div className="text-xs text-gray-500">Your headline • 1h</div>
        </div>
      </div>
      <div className="px-3 pb-3 text-sm">{description || 'Your post content'}</div>

      <div className="border-t border-gray-200">
        {image || customImage ? (
          <div className="relative aspect-[1.91/1] bg-gray-100">
            <img
              src={image || customImage}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-[1.91/1] bg-gray-100 flex items-center justify-center">
            <Image className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="p-3 bg-[#f3f2ef]">
          <div className="font-semibold text-sm line-clamp-2">
            {truncate(title, selectedPlatform.maxTitleLength) || 'Post Title'}
          </div>
          <div className="text-xs text-gray-500 mt-1">{getHostname(url)}</div>
        </div>
      </div>
    </div>
  )

  const renderDiscordPreview = () => (
    <div className={clsx(
      'bg-[#36393f] p-4 rounded-lg',
      viewMode === 'mobile' ? 'max-w-[320px]' : 'max-w-[500px]'
    )}>
      <div className="flex gap-4">
        {author?.avatar ? (
          <img src={author.avatar} alt="" className="w-10 h-10 rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#5865f2]" />
        )}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{author?.name || 'User'}</span>
            <span className="text-xs text-gray-400">Today at 12:00 PM</span>
          </div>
          <p className="text-gray-300 mt-1">{url}</p>

          <div className="mt-3 border-l-4 border-[#5865f2] bg-[#2f3136] rounded overflow-hidden">
            <div className="p-3">
              <div className="text-xs text-gray-400">{siteName}</div>
              <a href={url} className="text-[#00aff4] hover:underline font-medium">
                {truncate(title, 256) || 'Post Title'}
              </a>
              <p className="text-gray-300 text-sm mt-1 line-clamp-3">
                {truncate(description, 300)}
              </p>
            </div>
            {(image || customImage) && (
              <img
                src={image || customImage}
                alt="Preview"
                className="w-full max-h-60 object-cover"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderWhatsAppPreview = () => (
    <div className={clsx(
      'bg-[#e5ddd5] p-4 rounded-lg',
      viewMode === 'mobile' ? 'max-w-[280px]' : 'max-w-[400px]'
    )}>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        {(image || customImage) && (
          <img
            src={image || customImage}
            alt="Preview"
            className="w-full aspect-[1.91/1] object-cover"
          />
        )}
        <div className="p-2">
          <div className="font-semibold text-sm text-[#1d1d1d] line-clamp-2">
            {truncate(title, 50) || 'Post Title'}
          </div>
          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
            {truncate(description, 100)}
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
            <Globe className="w-3 h-3" />
            {getHostname(url)}
          </div>
        </div>
      </div>
      <div className="mt-2 text-right text-xs text-gray-500">12:00 PM ✓✓</div>
    </div>
  )

  const renderPreview = () => {
    switch (selectedPlatform.id) {
      case 'facebook': return renderFacebookPreview()
      case 'twitter': return renderTwitterPreview()
      case 'linkedin': return renderLinkedInPreview()
      case 'discord': return renderDiscordPreview()
      case 'whatsapp': return renderWhatsAppPreview()
      default: return renderFacebookPreview()
    }
  }

  return (
    <div className={clsx('flex flex-col h-full bg-white dark:bg-gray-800', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold">Social Preview</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'desktop' ? 'mobile' : 'desktop')}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              viewMode === 'mobile'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
            title={viewMode === 'desktop' ? 'Switch to mobile view' : 'Switch to desktop view'}
          >
            {viewMode === 'desktop' ? (
              <Smartphone className="w-4 h-4" />
            ) : (
              <Monitor className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              isEditing
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
            title="Edit social content"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopy}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Copy content"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              showSettings
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Platform Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {platforms.map(platform => (
          <button
            key={platform.id}
            onClick={() => setSelectedPlatform(platform)}
            className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all',
              selectedPlatform.id === platform.id
                ? `${platform.bgColor} text-white`
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            {platform.icon}
            {platform.name}
          </button>
        ))}
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Platform Requirements</h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>Title:</span>
                    <span className={title.length > selectedPlatform.maxTitleLength ? 'text-red-500' : ''}>
                      {title.length}/{selectedPlatform.maxTitleLength}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Description:</span>
                    <span className={description.length > selectedPlatform.maxDescLength ? 'text-red-500' : ''}>
                      {description.length}/{selectedPlatform.maxDescLength}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Optimal Image Ratio:</span>
                    <span>{selectedPlatform.imageRatio}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Custom Image</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customImage}
                    onChange={e => setCustomImage(e.target.value)}
                    placeholder="Image URL..."
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  />
                  <button
                    onClick={() => onImageChange?.(customImage)}
                    className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Panel */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Social Title
                  <span className="ml-2 text-gray-500 font-normal">
                    ({editTitle.length}/{selectedPlatform.maxTitleLength})
                  </span>
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700',
                    editTitle.length > selectedPlatform.maxTitleLength
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Social Description
                  <span className="ml-2 text-gray-500 font-normal">
                    ({editDescription.length}/{selectedPlatform.maxDescLength})
                  </span>
                </label>
                <textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  rows={3}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 resize-none',
                    editDescription.length > selectedPlatform.maxDescLength
                      ? 'border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdits}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditTitle(title)
                    setEditDescription(description)
                    setIsEditing(false)
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors ml-auto"
                >
                  <Sparkles className="w-4 h-4" />
                  AI Optimize
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="transform transition-all duration-300">
          {renderPreview()}
        </div>
      </div>

      {/* Tips */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Sparkles className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
          <div>
            <strong>Tip:</strong> For {selectedPlatform.name}, use images with a {selectedPlatform.imageRatio} aspect ratio.
            Keep your title under {selectedPlatform.maxTitleLength} characters for best results.
          </div>
        </div>
      </div>
    </div>
  )
}
