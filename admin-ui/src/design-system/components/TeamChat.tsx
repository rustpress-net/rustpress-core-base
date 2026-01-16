import React, { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES
// ============================================================================

export type ChannelType = 'public' | 'private' | 'direct' | 'content';
export type MessageType = 'text' | 'file' | 'image' | 'mention' | 'system';
export type UserStatus = 'online' | 'away' | 'busy' | 'offline';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: UserStatus;
  lastSeen?: Date;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: ChannelType;
  members: string[];
  createdBy: string;
  createdAt: Date;
  lastMessage?: Message;
  unreadCount: number;
  isPinned?: boolean;
  contentId?: string; // For content-specific channels
  contentTitle?: string;
}

export interface Message {
  id: string;
  channelId: string;
  authorId: string;
  content: string;
  type: MessageType;
  createdAt: Date;
  editedAt?: Date;
  replyTo?: string;
  reactions: { emoji: string; userIds: string[] }[];
  attachments?: Attachment[];
  mentions?: string[];
  isDeleted?: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

export interface TeamChatConfig {
  maxMessageLength: number;
  allowFileUploads: boolean;
  allowReactions: boolean;
  allowEditing: boolean;
  typingIndicatorTimeout: number;
}

// ============================================================================
// CONTEXT
// ============================================================================

interface TeamChatContextValue {
  channels: Channel[];
  messages: Message[];
  members: TeamMember[];
  currentUserId: string;
  selectedChannel: Channel | null;
  typingUsers: { channelId: string; userId: string }[];
  searchQuery: string;
  setSelectedChannel: (channel: Channel | null) => void;
  setSearchQuery: (query: string) => void;
  sendMessage: (channelId: string, content: string, replyTo?: string) => void;
  editMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  removeReaction: (messageId: string, emoji: string) => void;
  createChannel: (name: string, type: ChannelType, memberIds: string[]) => void;
  setTyping: (channelId: string, isTyping: boolean) => void;
  markAsRead: (channelId: string) => void;
  pinChannel: (channelId: string) => void;
  getChannelMessages: (channelId: string) => Message[];
  getMemberById: (id: string) => TeamMember | undefined;
  config: TeamChatConfig;
}

const TeamChatContext = createContext<TeamChatContextValue | null>(null);

export const useTeamChat = () => {
  const context = useContext(TeamChatContext);
  if (!context) {
    throw new Error('useTeamChat must be used within a TeamChatProvider');
  }
  return context;
};

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    height: '600px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  sidebar: {
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#fafafa',
  },
  sidebarHeader: {
    padding: '1rem',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
  },
  searchInput: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.875rem',
    outline: 'none',
    backgroundColor: '#f8fafc',
  },
  channelSection: {
    padding: '0.75rem 0',
  },
  sectionTitle: {
    padding: '0.5rem 1rem',
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addButton: {
    padding: '0.25rem',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelList: {
    flex: 1,
    overflowY: 'auto' as const,
  },
  channelItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.625rem 1rem',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
    borderLeft: '3px solid transparent',
  },
  channelItemActive: {
    backgroundColor: '#eff6ff',
    borderLeftColor: '#3b82f6',
  },
  channelIcon: {
    fontSize: '1rem',
    color: '#64748b',
  },
  channelInfo: {
    flex: 1,
    minWidth: 0,
  },
  channelName: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#1e293b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  channelPreview: {
    fontSize: '0.75rem',
    color: '#64748b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  unreadBadge: {
    minWidth: '18px',
    height: '18px',
    padding: '0 0.375rem',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    borderRadius: '9999px',
    fontSize: '0.6875rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  directMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#e2e8f0',
    position: 'relative' as const,
  },
  statusDot: {
    position: 'absolute' as const,
    bottom: '0',
    right: '0',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: '2px solid #ffffff',
  },
  mainContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#ffffff',
  },
  chatHeader: {
    padding: '1rem 1.25rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
  },
  chatName: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  chatDescription: {
    fontSize: '0.8125rem',
    color: '#64748b',
  },
  headerActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  iconButton: {
    padding: '0.5rem',
    backgroundColor: 'transparent',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem',
  },
  messageGroup: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '0.5rem',
  },
  messageAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#e2e8f0',
    flexShrink: 0,
  },
  messageContent: {
    flex: 1,
    minWidth: 0,
  },
  messageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.25rem',
  },
  authorName: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  messageTime: {
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  messageText: {
    fontSize: '0.9375rem',
    color: '#374151',
    lineHeight: 1.5,
    wordBreak: 'break-word' as const,
  },
  messageActions: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.375rem',
  },
  reactionButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#f1f5f9',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.75rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  reactionActive: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
  },
  typingIndicator: {
    padding: '0.75rem 1rem',
    fontSize: '0.8125rem',
    color: '#64748b',
    fontStyle: 'italic' as const,
  },
  inputContainer: {
    padding: '1rem',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
  },
  inputWrapper: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-end',
  },
  textArea: {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.9375rem',
    outline: 'none',
    resize: 'none' as const,
    fontFamily: 'inherit',
    minHeight: '44px',
    maxHeight: '150px',
  },
  sendButton: {
    padding: '0.75rem',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachButton: {
    padding: '0.75rem',
    backgroundColor: 'transparent',
    color: '#64748b',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    textAlign: 'center' as const,
    padding: '2rem',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  dateDivider: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    margin: '1rem 0',
  },
  dateLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e2e8f0',
  },
  dateText: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    fontWeight: 500,
  },
  replyPreview: {
    padding: '0.5rem 0.75rem',
    backgroundColor: '#f8fafc',
    borderLeft: '3px solid #3b82f6',
    borderRadius: '4px',
    fontSize: '0.8125rem',
    color: '#64748b',
    marginBottom: '0.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mentionHighlight: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    padding: '0.125rem 0.25rem',
    borderRadius: '2px',
    fontWeight: 500,
  },
  membersList: {
    padding: '0.75rem 0',
    borderTop: '1px solid #e2e8f0',
  },
  membersTitle: {
    padding: '0.5rem 1rem',
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
  },
  memberItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.625rem',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  },
  memberName: {
    fontSize: '0.875rem',
    color: '#1e293b',
  },
  memberRole: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  emojiPicker: {
    position: 'absolute' as const,
    bottom: '100%',
    right: 0,
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '0.5rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(8, 1fr)',
    gap: '0.25rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  emoji: {
    padding: '0.375rem',
    fontSize: '1.25rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  pinnedIcon: {
    color: '#f59e0b',
    marginLeft: '0.25rem',
  },
};

const statusColors: Record<UserStatus, string> = {
  online: '#10b981',
  away: '#f59e0b',
  busy: '#ef4444',
  offline: '#94a3b8',
};

// ============================================================================
// PROVIDER
// ============================================================================

interface TeamChatProviderProps {
  children: React.ReactNode;
  initialChannels?: Channel[];
  initialMessages?: Message[];
  members?: TeamMember[];
  currentUserId?: string;
  config?: Partial<TeamChatConfig>;
  onMessageSend?: (message: Message) => void;
  onChannelCreate?: (channel: Channel) => void;
}

export const TeamChatProvider: React.FC<TeamChatProviderProps> = ({
  children,
  initialChannels = [],
  initialMessages = [],
  members = [],
  currentUserId = 'current-user',
  config: configOverrides = {},
  onMessageSend,
  onChannelCreate,
}) => {
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(initialChannels[0] || null);
  const [typingUsers, setTypingUsers] = useState<{ channelId: string; userId: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const config: TeamChatConfig = {
    maxMessageLength: 4000,
    allowFileUploads: true,
    allowReactions: true,
    allowEditing: true,
    typingIndicatorTimeout: 3000,
    ...configOverrides,
  };

  const getMemberById = useCallback((id: string) => {
    return members.find(m => m.id === id);
  }, [members]);

  const getChannelMessages = useCallback((channelId: string) => {
    return messages.filter(m => m.channelId === channelId);
  }, [messages]);

  const sendMessage = useCallback((channelId: string, content: string, replyTo?: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      channelId,
      authorId: currentUserId,
      content,
      type: 'text',
      createdAt: new Date(),
      replyTo,
      reactions: [],
      mentions: content.match(/@\w+/g)?.map(m => m.slice(1)) || [],
    };
    setMessages(prev => [...prev, newMessage]);
    setChannels(prev => prev.map(c =>
      c.id === channelId ? { ...c, lastMessage: newMessage } : c
    ));
    onMessageSend?.(newMessage);
  }, [currentUserId, onMessageSend]);

  const editMessage = useCallback((messageId: string, content: string) => {
    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, content, editedAt: new Date() } : m
    ));
  }, []);

  const deleteMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, isDeleted: true, content: 'This message has been deleted' } : m
    ));
  }, []);

  const addReaction = useCallback((messageId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m;
      const existingReaction = m.reactions.find(r => r.emoji === emoji);
      if (existingReaction) {
        if (existingReaction.userIds.includes(currentUserId)) return m;
        return {
          ...m,
          reactions: m.reactions.map(r =>
            r.emoji === emoji ? { ...r, userIds: [...r.userIds, currentUserId] } : r
          ),
        };
      }
      return { ...m, reactions: [...m.reactions, { emoji, userIds: [currentUserId] }] };
    }));
  }, [currentUserId]);

  const removeReaction = useCallback((messageId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m;
      return {
        ...m,
        reactions: m.reactions
          .map(r => r.emoji === emoji
            ? { ...r, userIds: r.userIds.filter(id => id !== currentUserId) }
            : r
          )
          .filter(r => r.userIds.length > 0),
      };
    }));
  }, [currentUserId]);

  const createChannel = useCallback((name: string, type: ChannelType, memberIds: string[]) => {
    const newChannel: Channel = {
      id: `channel-${Date.now()}`,
      name,
      type,
      members: [currentUserId, ...memberIds],
      createdBy: currentUserId,
      createdAt: new Date(),
      unreadCount: 0,
    };
    setChannels(prev => [...prev, newChannel]);
    onChannelCreate?.(newChannel);
  }, [currentUserId, onChannelCreate]);

  const setTyping = useCallback((channelId: string, isTyping: boolean) => {
    if (isTyping) {
      setTypingUsers(prev => [...prev.filter(t => t.userId !== currentUserId || t.channelId !== channelId), { channelId, userId: currentUserId }]);
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(t => t.userId !== currentUserId || t.channelId !== channelId));
      }, config.typingIndicatorTimeout);
    } else {
      setTypingUsers(prev => prev.filter(t => t.userId !== currentUserId || t.channelId !== channelId));
    }
  }, [currentUserId, config.typingIndicatorTimeout]);

  const markAsRead = useCallback((channelId: string) => {
    setChannels(prev => prev.map(c =>
      c.id === channelId ? { ...c, unreadCount: 0 } : c
    ));
  }, []);

  const pinChannel = useCallback((channelId: string) => {
    setChannels(prev => prev.map(c =>
      c.id === channelId ? { ...c, isPinned: !c.isPinned } : c
    ));
  }, []);

  const value: TeamChatContextValue = {
    channels,
    messages,
    members,
    currentUserId,
    selectedChannel,
    typingUsers,
    searchQuery,
    setSelectedChannel,
    setSearchQuery,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    createChannel,
    setTyping,
    markAsRead,
    pinChannel,
    getChannelMessages,
    getMemberById,
    config,
  };

  return (
    <TeamChatContext.Provider value={value}>
      {children}
    </TeamChatContext.Provider>
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

export const ChannelList: React.FC = () => {
  const { channels, selectedChannel, setSelectedChannel, members, searchQuery, setSearchQuery, markAsRead } = useTeamChat();

  const publicChannels = useMemo(() =>
    channels.filter(c => c.type === 'public' || c.type === 'content'), [channels]);
  const directMessages = useMemo(() =>
    channels.filter(c => c.type === 'direct'), [channels]);

  const getChannelIcon = (type: ChannelType) => {
    switch (type) {
      case 'public': return '#';
      case 'private': return '🔒';
      case 'content': return '📄';
      default: return '#';
    }
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.sidebarHeader}>
        <input
          type="text"
          placeholder="Search channels..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.channelList}>
        <div style={styles.channelSection}>
          <div style={styles.sectionTitle}>
            Channels
            <button style={styles.addButton}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
          {publicChannels.map(channel => (
            <motion.div
              key={channel.id}
              style={{
                ...styles.channelItem,
                ...(selectedChannel?.id === channel.id ? styles.channelItemActive : {}),
              }}
              onClick={() => {
                setSelectedChannel(channel);
                markAsRead(channel.id);
              }}
              whileHover={{ backgroundColor: '#f1f5f9' }}
            >
              <span style={styles.channelIcon}>{getChannelIcon(channel.type)}</span>
              <div style={styles.channelInfo}>
                <div style={styles.channelName}>
                  {channel.name}
                  {channel.isPinned && <span style={styles.pinnedIcon}>📌</span>}
                </div>
                {channel.lastMessage && (
                  <div style={styles.channelPreview}>
                    {channel.lastMessage.content.substring(0, 30)}...
                  </div>
                )}
              </div>
              {channel.unreadCount > 0 && (
                <span style={styles.unreadBadge}>{channel.unreadCount}</span>
              )}
            </motion.div>
          ))}
        </div>

        <div style={styles.channelSection}>
          <div style={styles.sectionTitle}>Direct Messages</div>
          {directMessages.map(channel => {
            const otherMemberId = channel.members.find(m => m !== 'current-user');
            const member = members.find(m => m.id === otherMemberId);
            if (!member) return null;

            return (
              <motion.div
                key={channel.id}
                style={styles.directMessage}
                onClick={() => {
                  setSelectedChannel(channel);
                  markAsRead(channel.id);
                }}
                whileHover={{ backgroundColor: '#f1f5f9' }}
              >
                <div style={styles.avatar}>
                  <img src={member.avatar} alt={member.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                  <div style={{ ...styles.statusDot, backgroundColor: statusColors[member.status] }} />
                </div>
                <div style={styles.channelInfo}>
                  <div style={styles.channelName}>{member.name}</div>
                  <div style={styles.channelPreview}>{member.role}</div>
                </div>
                {channel.unreadCount > 0 && (
                  <span style={styles.unreadBadge}>{channel.unreadCount}</span>
                )}
              </motion.div>
            );
          })}
        </div>

        <div style={styles.membersList}>
          <div style={styles.membersTitle}>Team Members</div>
          {members.slice(0, 5).map(member => (
            <div key={member.id} style={styles.memberItem}>
              <div style={styles.avatar}>
                <img src={member.avatar} alt={member.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                <div style={{ ...styles.statusDot, backgroundColor: statusColors[member.status] }} />
              </div>
              <div style={styles.channelInfo}>
                <div style={styles.memberName}>{member.name}</div>
                <div style={styles.memberRole}>{member.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const MessageBubble: React.FC<{
  message: Message;
  showAvatar: boolean;
}> = ({ message, showAvatar }) => {
  const { getMemberById, addReaction, removeReaction, currentUserId } = useTeamChat();
  const author = getMemberById(message.authorId);
  const [showReactions, setShowReactions] = useState(false);

  const commonEmojis = ['👍', '❤️', '😂', '🎉', '🔥', '👀', '✅', '🙏'];

  const toggleReaction = (emoji: string) => {
    const existingReaction = message.reactions.find(r => r.emoji === emoji);
    if (existingReaction?.userIds.includes(currentUserId)) {
      removeReaction(message.id, emoji);
    } else {
      addReaction(message.id, emoji);
    }
    setShowReactions(false);
  };

  if (message.isDeleted) {
    return (
      <div style={{ ...styles.messageGroup, opacity: 0.5 }}>
        {showAvatar && <div style={styles.messageAvatar} />}
        <div style={styles.messageContent}>
          <p style={{ ...styles.messageText, fontStyle: 'italic' }}>{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.messageGroup}>
      {showAvatar ? (
        <img src={author?.avatar} alt={author?.name} style={styles.messageAvatar} />
      ) : (
        <div style={{ width: '36px' }} />
      )}
      <div style={styles.messageContent}>
        {showAvatar && (
          <div style={styles.messageHeader}>
            <span style={styles.authorName}>{author?.name}</span>
            <span style={styles.messageTime}>
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {message.editedAt && <span style={{ ...styles.messageTime, fontStyle: 'italic' }}>(edited)</span>}
          </div>
        )}
        <p style={styles.messageText}>{message.content}</p>

        {(message.reactions.length > 0 || showReactions) && (
          <div style={styles.messageActions}>
            {message.reactions.map(reaction => (
              <button
                key={reaction.emoji}
                style={{
                  ...styles.reactionButton,
                  ...(reaction.userIds.includes(currentUserId) ? styles.reactionActive : {}),
                }}
                onClick={() => toggleReaction(reaction.emoji)}
              >
                {reaction.emoji} {reaction.userIds.length}
              </button>
            ))}
            <div style={{ position: 'relative' }}>
              <button
                style={styles.reactionButton}
                onClick={() => setShowReactions(!showReactions)}
              >
                😊+
              </button>
              <AnimatePresence>
                {showReactions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    style={styles.emojiPicker}
                  >
                    {commonEmojis.map(emoji => (
                      <button
                        key={emoji}
                        style={styles.emoji}
                        onClick={() => toggleReaction(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const MessageList: React.FC = () => {
  const { selectedChannel, getChannelMessages, typingUsers, getMemberById } = useTeamChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = selectedChannel ? getChannelMessages(selectedChannel.id) : [];
  const channelTypingUsers = typingUsers.filter(t => t.channelId === selectedChannel?.id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';

    messages.forEach(msg => {
      const msgDate = new Date(msg.createdAt).toDateString();
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });

    return groups;
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div style={styles.messagesContainer}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>💬</div>
          <p>No messages yet. Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.messagesContainer}>
      {groupedMessages.map(group => (
        <React.Fragment key={group.date}>
          <div style={styles.dateDivider}>
            <div style={styles.dateLine} />
            <span style={styles.dateText}>
              {group.date === new Date().toDateString() ? 'Today' : group.date}
            </span>
            <div style={styles.dateLine} />
          </div>
          {group.messages.map((msg, idx) => {
            const prevMsg = group.messages[idx - 1];
            const showAvatar = !prevMsg ||
              prevMsg.authorId !== msg.authorId ||
              new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 300000;

            return <MessageBubble key={msg.id} message={msg} showAvatar={showAvatar} />;
          })}
        </React.Fragment>
      ))}

      {channelTypingUsers.length > 0 && (
        <div style={styles.typingIndicator}>
          {channelTypingUsers.map(t => getMemberById(t.userId)?.name).join(', ')} is typing...
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export const MessageInput: React.FC = () => {
  const { selectedChannel, sendMessage, setTyping, config } = useTeamChat();
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!message.trim() || !selectedChannel) return;
    sendMessage(selectedChannel.id, message.trim());
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (selectedChannel) {
      setTyping(selectedChannel.id, e.target.value.length > 0);
    }
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  if (!selectedChannel) return null;

  return (
    <div style={styles.inputContainer}>
      <div style={styles.inputWrapper}>
        {config.allowFileUploads && (
          <button style={styles.attachButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>
        )}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${selectedChannel.name}`}
          style={styles.textArea}
          rows={1}
          maxLength={config.maxMessageLength}
        />
        <button
          style={{
            ...styles.sendButton,
            opacity: message.trim() ? 1 : 0.5,
          }}
          onClick={handleSend}
          disabled={!message.trim()}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export const ChatHeader: React.FC = () => {
  const { selectedChannel, members, pinChannel } = useTeamChat();

  if (!selectedChannel) return null;

  const memberCount = selectedChannel.members.length;
  const channelIcon = selectedChannel.type === 'public' ? '#' :
    selectedChannel.type === 'private' ? '🔒' :
    selectedChannel.type === 'content' ? '📄' : '';

  return (
    <div style={styles.chatHeader}>
      <div style={styles.chatTitle}>
        <span style={{ fontSize: '1.25rem' }}>{channelIcon}</span>
        <div>
          <div style={styles.chatName}>
            {selectedChannel.name}
            {selectedChannel.isPinned && <span style={styles.pinnedIcon}>📌</span>}
          </div>
          {selectedChannel.description && (
            <div style={styles.chatDescription}>{selectedChannel.description}</div>
          )}
        </div>
      </div>
      <div style={styles.headerActions}>
        <button
          style={styles.iconButton}
          onClick={() => pinChannel(selectedChannel.id)}
          title={selectedChannel.isPinned ? 'Unpin' : 'Pin'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v6" />
            <path d="M5 10H19" />
            <path d="M5 10V20a2 2 0 002 2h10a2 2 0 002-2V10" />
            <path d="M12 16v6" />
          </svg>
        </button>
        <button style={styles.iconButton} title="Members">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
          <span style={{ marginLeft: '0.25rem', fontSize: '0.75rem' }}>{memberCount}</span>
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const TeamChat: React.FC = () => {
  const { selectedChannel } = useTeamChat();

  return (
    <div style={styles.container}>
      <ChannelList />
      <div style={styles.mainContent}>
        {selectedChannel ? (
          <>
            <ChatHeader />
            <MessageList />
            <MessageInput />
          </>
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>💬</div>
            <p>Select a channel to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamChat;
