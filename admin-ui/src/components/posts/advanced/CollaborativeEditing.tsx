import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  User,
  Circle,
  MessageSquare,
  Send,
  Eye,
  Edit3,
  Lock,
  Unlock,
  Crown,
  Clock,
  AlertTriangle,
  Info,
  X,
  ChevronDown,
  Settings,
  Video,
  Phone,
  MoreVertical,
  UserPlus,
  UserMinus,
  Shield,
  Bell,
  BellOff,
  MousePointer,
} from 'lucide-react'
import clsx from 'clsx'

interface CollaborativeEditingProps {
  postId?: string
  currentUser?: Collaborator
  collaborators?: Collaborator[]
  activeSection?: string
  onInvite?: (email: string) => void
  onRemove?: (userId: string) => void
  onChangeRole?: (userId: string, role: CollaboratorRole) => void
  onLockSection?: (sectionId: string) => void
  onUnlockSection?: (sectionId: string) => void
  onSendMessage?: (message: string) => void
  className?: string
  content?: string
}

interface Collaborator {
  id: string
  name: string
  email: string
  avatar?: string
  role: CollaboratorRole
  status: 'online' | 'away' | 'offline'
  lastActive?: Date
  currentSection?: string
  cursorPosition?: { x: number; y: number }
  cursorColor?: string
  isTyping?: boolean
}

type CollaboratorRole = 'owner' | 'editor' | 'commenter' | 'viewer'

interface ChatMessage {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  message: string
  timestamp: Date
  isSystem?: boolean
}

interface SectionLock {
  sectionId: string
  userId: string
  userName: string
  lockedAt: Date
}

const roleIcons = {
  owner: <Crown className="w-3 h-3" />,
  editor: <Edit3 className="w-3 h-3" />,
  commenter: <MessageSquare className="w-3 h-3" />,
  viewer: <Eye className="w-3 h-3" />,
}

const roleColors = {
  owner: 'text-yellow-500',
  editor: 'text-blue-500',
  commenter: 'text-green-500',
  viewer: 'text-gray-500',
}

const statusColors = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  offline: 'bg-gray-400',
}

// Generate random cursor colors
const cursorColors = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e',
]

const defaultUser: Collaborator = {
  id: 'current',
  name: 'Current User',
  email: 'user@example.com',
  role: 'owner',
  status: 'online',
}

export default function CollaborativeEditing({
  postId = 'post-1',
  currentUser = defaultUser,
  collaborators = [],
  activeSection,
  onInvite,
  onRemove,
  onChangeRole,
  onLockSection,
  onUnlockSection,
  onSendMessage,
  className,
}: CollaborativeEditingProps) {
  const [showPanel, setShowPanel] = useState(false)
  const [activeTab, setActiveTab] = useState<'users' | 'chat' | 'locks'>('users')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [chatMessage, setChatMessage] = useState('')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [showCursors, setShowCursors] = useState(true)

  // Mock chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'system',
      userName: 'System',
      message: 'Collaborative editing session started',
      timestamp: new Date(Date.now() - 300000),
      isSystem: true,
    },
  ])

  // Mock section locks
  const [sectionLocks, setSectionLocks] = useState<SectionLock[]>([])

  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      message: chatMessage,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, newMessage])
    onSendMessage?.(chatMessage)
    setChatMessage('')
  }

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      onInvite?.(inviteEmail)
      setInviteEmail('')
      setShowInviteModal(false)
    }
  }

  const onlineCollaborators = collaborators.filter(c => c.status === 'online')
  const offlineCollaborators = collaborators.filter(c => c.status !== 'online')

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      {/* Floating Avatars (always visible) */}
      <div className={clsx('flex items-center gap-1', className)}>
        {/* Online users avatars */}
        <div className="flex -space-x-2">
          {onlineCollaborators.slice(0, 4).map((user, index) => (
            <div
              key={user.id}
              className="relative"
              style={{ zIndex: 10 - index }}
              title={`${user.name} (${user.role})`}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
                  style={{ borderColor: user.cursorColor }}
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-medium"
                  style={{ backgroundColor: user.cursorColor || cursorColors[index % cursorColors.length] }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span
                className={clsx(
                  'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800',
                  statusColors[user.status]
                )}
              />
              {user.isTyping && (
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500" />
                </span>
              )}
            </div>
          ))}
          {onlineCollaborators.length > 4 && (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium">
              +{onlineCollaborators.length - 4}
            </div>
          )}
        </div>

        {/* Toggle Panel Button */}
        <button
          onClick={() => setShowPanel(!showPanel)}
          className={clsx(
            'flex items-center gap-1 px-2 py-1 rounded-lg text-sm transition-colors',
            showPanel
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
          )}
        >
          <Users className="w-4 h-4" />
          <span>{collaborators.length}</span>
          <ChevronDown className={clsx('w-3 h-3 transition-transform', showPanel && 'rotate-180')} />
        </button>
      </div>

      {/* Collaboration Panel */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold">Collaborators</h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={clsx(
                    'p-1.5 rounded-lg transition-colors',
                    notificationsEnabled
                      ? 'text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                      : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                  title={notificationsEnabled ? 'Mute notifications' : 'Enable notifications'}
                >
                  {notificationsEnabled ? (
                    <Bell className="w-4 h-4" />
                  ) : (
                    <BellOff className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setShowCursors(!showCursors)}
                  className={clsx(
                    'p-1.5 rounded-lg transition-colors',
                    showCursors
                      ? 'text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                      : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                  title={showCursors ? 'Hide cursors' : 'Show cursors'}
                >
                  <MousePointer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowPanel(false)}
                  className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {(['users', 'chat', 'locks'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={clsx(
                    'flex-1 px-4 py-2 text-sm font-medium transition-colors',
                    activeTab === tab
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {tab === 'users' && 'Users'}
                  {tab === 'chat' && 'Chat'}
                  {tab === 'locks' && 'Locks'}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-auto">
              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {/* Online Users */}
                  {onlineCollaborators.length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1 text-xs text-gray-500 uppercase">
                        Online ({onlineCollaborators.length})
                      </div>
                      {onlineCollaborators.map(user => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  className="w-8 h-8 rounded-full"
                                />
                              ) : (
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                                  style={{ backgroundColor: user.cursorColor }}
                                >
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className={clsx(
                                'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800',
                                statusColors[user.status]
                              )} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {user.name}
                                  {user.id === currentUser.id && ' (You)'}
                                </span>
                                <span className={clsx('flex items-center gap-1 text-xs', roleColors[user.role])}>
                                  {roleIcons[user.role]}
                                  {user.role}
                                </span>
                              </div>
                              {user.currentSection && (
                                <span className="text-xs text-gray-500">
                                  Editing: {user.currentSection}
                                </span>
                              )}
                              {user.isTyping && (
                                <span className="text-xs text-primary-500">Typing...</span>
                              )}
                            </div>
                          </div>
                          {user.id !== currentUser.id && currentUser.role === 'owner' && (
                            <button className="p-1 text-gray-400 hover:text-gray-600">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Offline Users */}
                  {offlineCollaborators.length > 0 && (
                    <div className="p-2">
                      <div className="px-2 py-1 text-xs text-gray-500 uppercase">
                        Offline ({offlineCollaborators.length})
                      </div>
                      {offlineCollaborators.map(user => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 opacity-60"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={user.name}
                                  className="w-8 h-8 rounded-full grayscale"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-medium">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="text-sm font-medium">{user.name}</span>
                              <span className="block text-xs text-gray-500">
                                Last active: {user.lastActive ? formatTime(user.lastActive) : 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Invite Button */}
                  {currentUser.role === 'owner' && (
                    <div className="p-2">
                      <button
                        onClick={() => setShowInviteModal(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        Invite Collaborator
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Chat Tab */}
              {activeTab === 'chat' && (
                <div className="flex flex-col h-80">
                  <div ref={chatContainerRef} className="flex-1 overflow-auto p-3 space-y-3">
                    {messages.map(msg => (
                      <div
                        key={msg.id}
                        className={clsx(
                          'flex gap-2',
                          msg.userId === currentUser.id && 'flex-row-reverse'
                        )}
                      >
                        {!msg.isSystem && (
                          msg.userAvatar ? (
                            <img
                              src={msg.userAvatar}
                              alt={msg.userName}
                              className="w-6 h-6 rounded-full flex-shrink-0"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs flex-shrink-0">
                              {msg.userName.charAt(0).toUpperCase()}
                            </div>
                          )
                        )}
                        <div
                          className={clsx(
                            'max-w-[80%] rounded-lg px-3 py-2',
                            msg.isSystem
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs text-center w-full mx-auto'
                              : msg.userId === currentUser.id
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700'
                          )}
                        >
                          {!msg.isSystem && msg.userId !== currentUser.id && (
                            <div className="text-xs font-medium mb-0.5">{msg.userName}</div>
                          )}
                          <p className="text-sm">{msg.message}</p>
                          <div className={clsx(
                            'text-[10px] mt-1',
                            msg.userId === currentUser.id ? 'text-primary-200' : 'text-gray-400'
                          )}>
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={e => setChatMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!chatMessage.trim()}
                        className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Locks Tab */}
              {activeTab === 'locks' && (
                <div className="p-3">
                  {sectionLocks.length > 0 ? (
                    <div className="space-y-2">
                      {sectionLocks.map(lock => (
                        <div
                          key={lock.sectionId}
                          className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-yellow-600" />
                            <div>
                              <span className="text-sm font-medium">{lock.sectionId}</span>
                              <span className="block text-xs text-gray-500">
                                Locked by {lock.userName}
                              </span>
                            </div>
                          </div>
                          {(lock.userId === currentUser.id || currentUser.role === 'owner') && (
                            <button
                              onClick={() => onUnlockSection?.(lock.sectionId)}
                              className="p-1.5 text-yellow-600 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded"
                            >
                              <Unlock className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Lock className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No sections are currently locked</p>
                      <p className="text-xs mt-1">
                        Lock a section to prevent others from editing it
                      </p>
                    </div>
                  )}

                  {activeSection && (
                    <button
                      onClick={() => onLockSection?.(activeSection)}
                      className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                    >
                      <Lock className="w-4 h-4" />
                      Lock Current Section
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Invite Collaborator</h3>
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim()}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                >
                  Send Invite
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
