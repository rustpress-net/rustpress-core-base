import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  GitBranch,
  GitCommit,
  GitMerge,
  User,
  Eye,
  RotateCcw,
  Diff,
  ChevronDown,
  ChevronRight,
  Star,
  StarOff,
  MessageSquare,
  Tag,
  Calendar,
  Filter,
  Search,
  Download,
  Upload,
  Trash2,
  MoreVertical,
  Check,
  X,
  FileText,
  Edit3,
  Save,
  Loader2,
} from 'lucide-react'
import clsx from 'clsx'

interface Version {
  id: string
  number: number
  title: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: Date
  type: 'auto' | 'manual' | 'scheduled' | 'restore' | 'import'
  status: 'draft' | 'published' | 'scheduled'
  isStarred?: boolean
  isCurrent?: boolean
  comment?: string
  tags?: string[]
  wordCount: number
  changes: {
    added: number
    removed: number
    modified: number
  }
  metadata?: {
    device?: string
    browser?: string
    location?: string
  }
}

interface VersionTimelineProps {
  versions?: Version[]
  currentVersionId?: string
  onPreview?: (version: Version) => void
  onRestore?: (version: Version) => void
  onCompare?: (version1: Version, version2: Version) => void
  onDelete?: (version: Version) => void
  onStar?: (version: Version) => void
  onAddComment?: (version: Version, comment: string) => void
  onAddTag?: (version: Version, tag: string) => void
  onExport?: (version: Version) => void
  className?: string
  content?: string
}

const versionTypeIcons = {
  auto: <Clock className="w-4 h-4" />,
  manual: <Save className="w-4 h-4" />,
  scheduled: <Calendar className="w-4 h-4" />,
  restore: <RotateCcw className="w-4 h-4" />,
  import: <Upload className="w-4 h-4" />,
}

const versionTypeLabels = {
  auto: 'Auto-saved',
  manual: 'Manual save',
  scheduled: 'Scheduled publish',
  restore: 'Restored',
  import: 'Imported',
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  published: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  scheduled: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
}

export default function VersionTimeline({
  versions = [],
  currentVersionId,
  onPreview,
  onRestore,
  onCompare,
  onDelete,
  onStar,
  onAddComment,
  onAddTag,
  onExport,
  className,
}: VersionTimelineProps) {
  const [selectedVersions, setSelectedVersions] = useState<string[]>([])
  const [expandedVersions, setExpandedVersions] = useState<string[]>([])
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStarred, setFilterStarred] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [commentingVersion, setCommentingVersion] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [taggingVersion, setTaggingVersion] = useState<string | null>(null)
  const [newTag, setNewTag] = useState('')
  const [restoringVersion, setRestoringVersion] = useState<string | null>(null)

  // Filter and sort versions
  const filteredVersions = useMemo(() => {
    return versions
      .filter(v => {
        if (filterType !== 'all' && v.type !== filterType) return false
        if (filterStarred && !v.isStarred) return false
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          return (
            v.title.toLowerCase().includes(query) ||
            v.author.name.toLowerCase().includes(query) ||
            v.comment?.toLowerCase().includes(query) ||
            v.tags?.some(t => t.toLowerCase().includes(query))
          )
        }
        return true
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }, [versions, filterType, filterStarred, searchQuery])

  // Group versions by date
  const groupedVersions = useMemo(() => {
    const groups: { date: string; versions: Version[] }[] = []
    let currentDate = ''

    filteredVersions.forEach(version => {
      const date = version.createdAt.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

      if (date !== currentDate) {
        currentDate = date
        groups.push({ date, versions: [] })
      }

      groups[groups.length - 1].versions.push(version)
    })

    return groups
  }, [filteredVersions])

  const toggleVersionExpand = (id: string) => {
    setExpandedVersions(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    )
  }

  const toggleVersionSelect = (id: string) => {
    setSelectedVersions(prev => {
      if (prev.includes(id)) {
        return prev.filter(v => v !== id)
      }
      if (prev.length >= 2) {
        return [prev[1], id]
      }
      return [...prev, id]
    })
  }

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      const v1 = versions.find(v => v.id === selectedVersions[0])
      const v2 = versions.find(v => v.id === selectedVersions[1])
      if (v1 && v2 && onCompare) {
        onCompare(v1, v2)
      }
    }
  }

  const handleAddComment = (versionId: string) => {
    if (newComment.trim() && onAddComment) {
      const version = versions.find(v => v.id === versionId)
      if (version) {
        onAddComment(version, newComment.trim())
        setNewComment('')
        setCommentingVersion(null)
      }
    }
  }

  const handleAddTag = (versionId: string) => {
    if (newTag.trim() && onAddTag) {
      const version = versions.find(v => v.id === versionId)
      if (version) {
        onAddTag(version, newTag.trim())
        setNewTag('')
        setTaggingVersion(null)
      }
    }
  }

  const handleRestore = async (version: Version) => {
    setRestoringVersion(version.id)
    await onRestore?.(version)
    setRestoringVersion(null)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={clsx('flex flex-col h-full bg-white dark:bg-gray-800', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <GitBranch className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold">Version History</h2>
          <span className="text-sm text-gray-500">
            {versions.length} version{versions.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {selectedVersions.length === 2 && (
            <button
              onClick={handleCompare}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors"
            >
              <Diff className="w-4 h-4" />
              Compare
            </button>
          )}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              showFilters
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search versions..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center gap-4">
                {/* Type Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Type:</span>
                  <div className="flex gap-1">
                    {['all', 'auto', 'manual', 'scheduled', 'restore'].map(type => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={clsx(
                          'px-2 py-1 text-xs rounded transition-colors',
                          filterType === type
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        )}
                      >
                        {type === 'all' ? 'All' : versionTypeLabels[type as keyof typeof versionTypeLabels]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Starred Filter */}
                <button
                  onClick={() => setFilterStarred(!filterStarred)}
                  className={clsx(
                    'flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors',
                    filterStarred
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  )}
                >
                  <Star className="w-3 h-3" />
                  Starred
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection Info */}
      {selectedVersions.length > 0 && (
        <div className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 border-b border-primary-100 dark:border-primary-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-primary-700 dark:text-primary-300">
              {selectedVersions.length} version{selectedVersions.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedVersions([])}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="flex-1 overflow-auto">
        {groupedVersions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Clock className="w-12 h-12 mb-3 opacity-50" />
            <p>No versions found</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-7 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />

            {groupedVersions.map((group, groupIndex) => (
              <div key={group.date} className="relative">
                {/* Date Header */}
                <div className="sticky top-0 z-10 px-4 py-2 bg-gray-50 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {group.date}
                  </span>
                </div>

                {/* Versions */}
                {group.versions.map((version, versionIndex) => {
                  const isExpanded = expandedVersions.includes(version.id)
                  const isSelected = selectedVersions.includes(version.id)
                  const isCurrent = version.id === currentVersionId

                  return (
                    <div
                      key={version.id}
                      className={clsx(
                        'relative px-4 py-3 transition-colors',
                        isSelected && 'bg-primary-50 dark:bg-primary-900/20',
                        isCurrent && 'bg-green-50 dark:bg-green-900/10'
                      )}
                    >
                      {/* Timeline Node */}
                      <div
                        className={clsx(
                          'absolute left-5 top-5 w-5 h-5 rounded-full border-2 flex items-center justify-center z-10',
                          isCurrent
                            ? 'bg-green-500 border-green-500'
                            : isSelected
                            ? 'bg-primary-500 border-primary-500'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                        )}
                      >
                        {isCurrent && <Check className="w-3 h-3 text-white" />}
                      </div>

                      {/* Version Card */}
                      <div className="ml-10">
                        <div
                          className={clsx(
                            'p-3 rounded-lg border transition-all cursor-pointer',
                            isSelected
                              ? 'border-primary-300 dark:border-primary-600'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          )}
                          onClick={() => toggleVersionExpand(version.id)}
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={e => {
                                  e.stopPropagation()
                                  toggleVersionSelect(version.id)
                                }}
                                className="rounded border-gray-300"
                              />
                              <div className="flex items-center gap-2">
                                {versionTypeIcons[version.type]}
                                <span className="font-medium">v{version.number}</span>
                                <span className={clsx('px-2 py-0.5 text-xs rounded-full', statusColors[version.status])}>
                                  {version.status}
                                </span>
                                {isCurrent && (
                                  <span className="px-2 py-0.5 text-xs bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                    Current
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                {formatTime(version.createdAt)}
                              </span>
                              {version.isStarred && (
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              )}
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>

                          {/* Meta */}
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {version.author.name}
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {version.wordCount} words
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-green-500">+{version.changes.added}</span>
                              <span className="text-red-500">-{version.changes.removed}</span>
                              <span className="text-blue-500">~{version.changes.modified}</span>
                            </div>
                          </div>

                          {/* Tags */}
                          {version.tags && version.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {version.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Comment */}
                          {version.comment && (
                            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-sm text-gray-600 dark:text-gray-400">
                              <MessageSquare className="w-3 h-3 inline mr-1" />
                              {version.comment}
                            </div>
                          )}

                          {/* Expanded Content */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                  {/* Actions */}
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      onClick={e => {
                                        e.stopPropagation()
                                        onPreview?.(version)
                                      }}
                                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                      <Eye className="w-4 h-4" />
                                      Preview
                                    </button>

                                    {!isCurrent && (
                                      <button
                                        onClick={e => {
                                          e.stopPropagation()
                                          handleRestore(version)
                                        }}
                                        disabled={restoringVersion === version.id}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors disabled:opacity-50"
                                      >
                                        {restoringVersion === version.id ? (
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <RotateCcw className="w-4 h-4" />
                                        )}
                                        Restore
                                      </button>
                                    )}

                                    <button
                                      onClick={e => {
                                        e.stopPropagation()
                                        onStar?.(version)
                                      }}
                                      className={clsx(
                                        'flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors',
                                        version.isStarred
                                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                      )}
                                    >
                                      {version.isStarred ? (
                                        <StarOff className="w-4 h-4" />
                                      ) : (
                                        <Star className="w-4 h-4" />
                                      )}
                                      {version.isStarred ? 'Unstar' : 'Star'}
                                    </button>

                                    <button
                                      onClick={e => {
                                        e.stopPropagation()
                                        setCommentingVersion(version.id)
                                      }}
                                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                      <MessageSquare className="w-4 h-4" />
                                      Comment
                                    </button>

                                    <button
                                      onClick={e => {
                                        e.stopPropagation()
                                        setTaggingVersion(version.id)
                                      }}
                                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                      <Tag className="w-4 h-4" />
                                      Tag
                                    </button>

                                    <button
                                      onClick={e => {
                                        e.stopPropagation()
                                        onExport?.(version)
                                      }}
                                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                      <Download className="w-4 h-4" />
                                      Export
                                    </button>

                                    {!isCurrent && (
                                      <button
                                        onClick={e => {
                                          e.stopPropagation()
                                          onDelete?.(version)
                                        }}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                      </button>
                                    )}
                                  </div>

                                  {/* Comment Input */}
                                  {commentingVersion === version.id && (
                                    <div className="mt-3 flex gap-2">
                                      <input
                                        type="text"
                                        value={newComment}
                                        onChange={e => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primary-500"
                                        onClick={e => e.stopPropagation()}
                                        onKeyDown={e => {
                                          if (e.key === 'Enter') handleAddComment(version.id)
                                        }}
                                      />
                                      <button
                                        onClick={e => {
                                          e.stopPropagation()
                                          handleAddComment(version.id)
                                        }}
                                        className="p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={e => {
                                          e.stopPropagation()
                                          setCommentingVersion(null)
                                          setNewComment('')
                                        }}
                                        className="p-1.5 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}

                                  {/* Tag Input */}
                                  {taggingVersion === version.id && (
                                    <div className="mt-3 flex gap-2">
                                      <input
                                        type="text"
                                        value={newTag}
                                        onChange={e => setNewTag(e.target.value)}
                                        placeholder="Add a tag..."
                                        className="flex-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-primary-500"
                                        onClick={e => e.stopPropagation()}
                                        onKeyDown={e => {
                                          if (e.key === 'Enter') handleAddTag(version.id)
                                        }}
                                      />
                                      <button
                                        onClick={e => {
                                          e.stopPropagation()
                                          handleAddTag(version.id)
                                        }}
                                        className="p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={e => {
                                          e.stopPropagation()
                                          setTaggingVersion(null)
                                          setNewTag('')
                                        }}
                                        className="p-1.5 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}

                                  {/* Metadata */}
                                  {version.metadata && (
                                    <div className="mt-3 text-xs text-gray-500">
                                      <span className="font-medium">Saved from: </span>
                                      {version.metadata.browser} on {version.metadata.device}
                                      {version.metadata.location && ` (${version.metadata.location})`}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
