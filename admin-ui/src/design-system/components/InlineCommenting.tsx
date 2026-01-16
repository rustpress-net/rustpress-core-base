import React, { useState, useCallback, createContext, useContext, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// INLINE COMMENTING - COMPONENT 10 OF 10 (POST EDITOR ENHANCEMENTS)
// Text selection comments, threaded discussions, comment resolution
// ============================================================================

// Types
export type CommentStatus = 'open' | 'resolved' | 'pending';

export interface CommentAuthor {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

export interface CommentReply {
  id: string;
  content: string;
  author: CommentAuthor;
  createdAt: Date;
  updatedAt?: Date;
  mentions?: string[];
}

export interface InlineComment {
  id: string;
  content: string;
  author: CommentAuthor;
  status: CommentStatus;
  textSelection: {
    text: string;
    startOffset: number;
    endOffset: number;
    blockId?: string;
  };
  replies: CommentReply[];
  createdAt: Date;
  updatedAt?: Date;
  resolvedAt?: Date;
  resolvedBy?: CommentAuthor;
}

export interface InlineCommentingConfig {
  enabled: boolean;
  allowReplies: boolean;
  allowMentions: boolean;
  showResolved: boolean;
  highlightColor: string;
  currentUser?: CommentAuthor;
}

interface InlineCommentingContextValue {
  comments: InlineComment[];
  config: InlineCommentingConfig;
  activeCommentId: string | null;
  addComment: (selection: InlineComment['textSelection'], content: string) => string;
  updateComment: (id: string, content: string) => void;
  deleteComment: (id: string) => void;
  resolveComment: (id: string) => void;
  reopenComment: (id: string) => void;
  addReply: (commentId: string, content: string) => void;
  deleteReply: (commentId: string, replyId: string) => void;
  setActiveComment: (id: string | null) => void;
  getCommentsForBlock: (blockId: string) => InlineComment[];
  updateConfig: (config: Partial<InlineCommentingConfig>) => void;
}

const defaultUser: CommentAuthor = {
  id: 'current-user',
  name: 'You',
  email: 'user@example.com',
};

const defaultConfig: InlineCommentingConfig = {
  enabled: true,
  allowReplies: true,
  allowMentions: true,
  showResolved: false,
  highlightColor: '#FEF3C7',
  currentUser: defaultUser,
};

const InlineCommentingContext = createContext<InlineCommentingContextValue | null>(null);

// Helper to generate unique IDs
const generateId = () => `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============================================================================
// INLINE COMMENTING PROVIDER
// ============================================================================

interface InlineCommentingProviderProps {
  children: React.ReactNode;
  initialComments?: InlineComment[];
  initialConfig?: Partial<InlineCommentingConfig>;
  onCommentAdd?: (comment: InlineComment) => void;
  onCommentResolve?: (comment: InlineComment) => void;
}

export const InlineCommentingProvider: React.FC<InlineCommentingProviderProps> = ({
  children,
  initialComments = [],
  initialConfig,
  onCommentAdd,
  onCommentResolve,
}) => {
  const [comments, setComments] = useState<InlineComment[]>(initialComments);
  const [config, setConfig] = useState<InlineCommentingConfig>({ ...defaultConfig, ...initialConfig });
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  const addComment = useCallback((selection: InlineComment['textSelection'], content: string): string => {
    const id = generateId();
    const newComment: InlineComment = {
      id,
      content,
      author: config.currentUser || defaultUser,
      status: 'open',
      textSelection: selection,
      replies: [],
      createdAt: new Date(),
    };

    setComments(prev => [...prev, newComment]);
    setActiveCommentId(id);
    onCommentAdd?.(newComment);

    return id;
  }, [config.currentUser, onCommentAdd]);

  const updateComment = useCallback((id: string, content: string) => {
    setComments(prev => prev.map(c =>
      c.id === id ? { ...c, content, updatedAt: new Date() } : c
    ));
  }, []);

  const deleteComment = useCallback((id: string) => {
    setComments(prev => prev.filter(c => c.id !== id));
    if (activeCommentId === id) {
      setActiveCommentId(null);
    }
  }, [activeCommentId]);

  const resolveComment = useCallback((id: string) => {
    setComments(prev => prev.map(c => {
      if (c.id !== id) return c;
      const resolved = {
        ...c,
        status: 'resolved' as CommentStatus,
        resolvedAt: new Date(),
        resolvedBy: config.currentUser || defaultUser,
      };
      onCommentResolve?.(resolved);
      return resolved;
    }));
  }, [config.currentUser, onCommentResolve]);

  const reopenComment = useCallback((id: string) => {
    setComments(prev => prev.map(c =>
      c.id === id ? { ...c, status: 'open' as CommentStatus, resolvedAt: undefined, resolvedBy: undefined } : c
    ));
  }, []);

  const addReply = useCallback((commentId: string, content: string) => {
    const reply: CommentReply = {
      id: generateId(),
      content,
      author: config.currentUser || defaultUser,
      createdAt: new Date(),
    };

    setComments(prev => prev.map(c =>
      c.id === commentId ? { ...c, replies: [...c.replies, reply], updatedAt: new Date() } : c
    ));
  }, [config.currentUser]);

  const deleteReply = useCallback((commentId: string, replyId: string) => {
    setComments(prev => prev.map(c =>
      c.id === commentId ? { ...c, replies: c.replies.filter(r => r.id !== replyId) } : c
    ));
  }, []);

  const getCommentsForBlock = useCallback((blockId: string): InlineComment[] => {
    return comments.filter(c => c.textSelection.blockId === blockId);
  }, [comments]);

  const updateConfig = useCallback((updates: Partial<InlineCommentingConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const value: InlineCommentingContextValue = {
    comments,
    config,
    activeCommentId,
    addComment,
    updateComment,
    deleteComment,
    resolveComment,
    reopenComment,
    addReply,
    deleteReply,
    setActiveComment: setActiveCommentId,
    getCommentsForBlock,
    updateConfig,
  };

  return (
    <InlineCommentingContext.Provider value={value}>
      {children}
    </InlineCommentingContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useInlineCommenting = (): InlineCommentingContextValue => {
  const context = useContext(InlineCommentingContext);
  if (!context) {
    throw new Error('useInlineCommenting must be used within an InlineCommentingProvider');
  }
  return context;
};

// ============================================================================
// COMMENTABLE TEXT
// ============================================================================

interface CommentableTextProps {
  children: React.ReactNode;
  blockId?: string;
  className?: string;
  onCommentCreate?: (selection: string) => void;
}

export const CommentableText: React.FC<CommentableTextProps> = ({
  children,
  blockId,
  className = '',
  onCommentCreate,
}) => {
  const { config, addComment, comments, setActiveComment } = useInlineCommenting();
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const blockComments = comments.filter(c =>
    c.textSelection.blockId === blockId &&
    (config.showResolved || c.status !== 'resolved')
  );

  const handleMouseUp = () => {
    if (!config.enabled) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setShowPopup(false);
      return;
    }

    const text = selection.toString().trim();
    if (!text) {
      setShowPopup(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();

    if (containerRect) {
      setPopupPosition({
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top - containerRect.top - 10,
      });
    }

    setSelectedText(text);
    setSelectionRange({
      start: range.startOffset,
      end: range.endOffset,
    });
    setShowPopup(true);
  };

  const handleAddComment = () => {
    if (!selectedText || !selectionRange) return;

    addComment(
      {
        text: selectedText,
        startOffset: selectionRange.start,
        endOffset: selectionRange.end,
        blockId,
      },
      ''
    );

    setShowPopup(false);
    setSelectedText('');
    setSelectionRange(null);
    window.getSelection()?.removeAllRanges();
    onCommentCreate?.(selectedText);
  };

  // Render text with highlighted comment ranges
  const renderHighlightedText = () => {
    if (typeof children !== 'string') return children;

    const text = children;
    const highlights = blockComments
      .map(c => ({
        start: c.textSelection.startOffset,
        end: c.textSelection.endOffset,
        id: c.id,
        status: c.status,
      }))
      .sort((a, b) => a.start - b.start);

    if (highlights.length === 0) return children;

    const elements: React.ReactNode[] = [];
    let lastEnd = 0;

    highlights.forEach((highlight, index) => {
      // Add text before highlight
      if (highlight.start > lastEnd) {
        elements.push(
          <span key={`text-${index}`}>{text.slice(lastEnd, highlight.start)}</span>
        );
      }

      // Add highlighted text
      elements.push(
        <span
          key={`highlight-${highlight.id}`}
          onClick={() => setActiveComment(highlight.id)}
          style={{
            backgroundColor: highlight.status === 'resolved' ? '#E5E7EB' : config.highlightColor,
            cursor: 'pointer',
            borderBottom: highlight.status === 'resolved' ? 'none' : '2px solid #F59E0B',
          }}
        >
          {text.slice(highlight.start, highlight.end)}
        </span>
      );

      lastEnd = highlight.end;
    });

    // Add remaining text
    if (lastEnd < text.length) {
      elements.push(<span key="text-end">{text.slice(lastEnd)}</span>);
    }

    return <>{elements}</>;
  };

  return (
    <div
      ref={containerRef}
      className={className}
      onMouseUp={handleMouseUp}
      style={{ position: 'relative' }}
    >
      {renderHighlightedText()}

      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              position: 'absolute',
              left: popupPosition.x,
              top: popupPosition.y,
              transform: 'translate(-50%, -100%)',
              zIndex: 100,
            }}
          >
            <button
              onClick={handleAddComment}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                backgroundColor: '#1f2937',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              <span>💬</span>
              <span>Add comment</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// COMMENT THREAD
// ============================================================================

interface CommentThreadProps {
  comment: InlineComment;
  onClose?: () => void;
  className?: string;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  comment,
  onClose,
  className = '',
}) => {
  const {
    config,
    updateComment,
    deleteComment,
    resolveComment,
    reopenComment,
    addReply,
    deleteReply,
  } = useInlineCommenting();

  const [isEditing, setIsEditing] = useState(!comment.content);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);

  const handleSaveComment = () => {
    if (!editContent.trim()) return;
    updateComment(comment.id, editContent.trim());
    setIsEditing(false);
  };

  const handleAddReply = () => {
    if (!replyContent.trim()) return;
    addReply(comment.id, replyContent.trim());
    setReplyContent('');
    setShowReplyBox(false);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={className}
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        width: '320px',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: comment.status === 'resolved' ? '#F3F4F6' : '#FEF3C7',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {comment.status === 'resolved' ? (
            <>
              <span style={{ color: '#10B981' }}>✓</span>
              <span style={{ fontSize: '13px', color: '#6b7280' }}>Resolved</span>
            </>
          ) : (
            <span style={{ fontSize: '13px', color: '#92400E' }}>
              "{comment.textSelection.text.slice(0, 30)}..."
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              fontSize: '18px',
              color: '#9ca3af',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Main Comment */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: 600,
            flexShrink: 0,
          }}>
            {comment.author.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                {comment.author.name}
              </span>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                {formatDate(comment.createdAt)}
              </span>
            </div>

            {isEditing ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Add your comment..."
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '13px',
                    resize: 'none',
                    outline: 'none',
                    minHeight: '60px',
                  }}
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    onClick={handleSaveComment}
                    disabled={!editContent.trim()}
                    style={{
                      padding: '6px 12px',
                      border: 'none',
                      borderRadius: '6px',
                      backgroundColor: editContent.trim() ? '#3b82f6' : '#d1d5db',
                      color: 'white',
                      fontSize: '12px',
                      cursor: editContent.trim() ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Save
                  </button>
                  {comment.content && (
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditContent(comment.content);
                      }}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        color: '#374151',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: 1.5 }}>
                {comment.content}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div style={{ borderTop: '1px solid #f3f4f6' }}>
          {comment.replies.map((reply) => (
            <div key={reply.id} style={{ padding: '12px 16px', backgroundColor: '#f9fafb' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 600,
                  flexShrink: 0,
                }}>
                  {reply.author.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                      {reply.author.name}
                    </span>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                      {formatDate(reply.createdAt)}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#4b5563', lineHeight: 1.4 }}>
                    {reply.content}
                  </p>
                </div>
                {reply.author.id === config.currentUser?.id && (
                  <button
                    onClick={() => deleteReply(comment.id, reply.id)}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#9ca3af',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Box */}
      {config.allowReplies && comment.status !== 'resolved' && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb' }}>
          {showReplyBox ? (
            <div>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                autoFocus
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '13px',
                  resize: 'none',
                  outline: 'none',
                  minHeight: '50px',
                }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                  onClick={handleAddReply}
                  disabled={!replyContent.trim()}
                  style={{
                    padding: '6px 12px',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: replyContent.trim() ? '#3b82f6' : '#d1d5db',
                    color: 'white',
                    fontSize: '12px',
                    cursor: replyContent.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Reply
                </button>
                <button
                  onClick={() => {
                    setShowReplyBox(false);
                    setReplyContent('');
                  }}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowReplyBox(true)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px dashed #d1d5db',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                color: '#6b7280',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Reply...
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {comment.status !== 'resolved' ? (
            <button
              onClick={() => resolveComment(comment.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#10B981',
                color: 'white',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              <span>✓</span>
              <span>Resolve</span>
            </button>
          ) : (
            <button
              onClick={() => reopenComment(comment.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              <span>↩️</span>
              <span>Re-open</span>
            </button>
          )}
        </div>

        {comment.author.id === config.currentUser?.id && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setIsEditing(true)}
              style={{
                padding: '6px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#374151',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Edit
            </button>
            <button
              onClick={() => deleteComment(comment.id)}
              style={{
                padding: '6px 12px',
                border: '1px solid #FEE2E2',
                borderRadius: '6px',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// COMMENTS SIDEBAR
// ============================================================================

interface CommentsSidebarProps {
  className?: string;
  onClose?: () => void;
}

export const CommentsSidebar: React.FC<CommentsSidebarProps> = ({
  className = '',
  onClose,
}) => {
  const { comments, config, activeCommentId, setActiveComment, updateConfig } = useInlineCommenting();
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

  const filteredComments = comments.filter(c => {
    if (filter === 'open') return c.status === 'open';
    if (filter === 'resolved') return c.status === 'resolved';
    return config.showResolved || c.status !== 'resolved';
  });

  const openCount = comments.filter(c => c.status === 'open').length;
  const resolvedCount = comments.filter(c => c.status === 'resolved').length;

  return (
    <div
      className={className}
      style={{
        width: '360px',
        height: '100%',
        backgroundColor: 'white',
        borderLeft: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid #e5e7eb',
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>
          💬 Comments ({openCount})
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: 'none',
              fontSize: '20px',
              color: '#9ca3af',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '12px 20px',
        borderBottom: '1px solid #e5e7eb',
      }}>
        {(['all', 'open', 'resolved'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 12px',
              border: filter === f ? '2px solid #3b82f6' : '1px solid #e5e7eb',
              borderRadius: '20px',
              backgroundColor: filter === f ? '#EFF6FF' : 'white',
              color: filter === f ? '#3b82f6' : '#6b7280',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {f} {f === 'open' ? `(${openCount})` : f === 'resolved' ? `(${resolvedCount})` : ''}
          </button>
        ))}
      </div>

      {/* Comment List */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {filteredComments.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#9ca3af' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>💬</span>
            <p style={{ margin: 0 }}>No comments yet</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '13px' }}>
              Select text to add a comment
            </p>
          </div>
        ) : (
          filteredComments.map(comment => (
            <div
              key={comment.id}
              onClick={() => setActiveComment(comment.id)}
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #f3f4f6',
                cursor: 'pointer',
                backgroundColor: activeCommentId === comment.id ? '#F3F4F6' : 'transparent',
                transition: 'background-color 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  flexShrink: 0,
                }}>
                  {comment.author.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                      {comment.author.name}
                    </span>
                    {comment.status === 'resolved' && (
                      <span style={{
                        padding: '2px 6px',
                        backgroundColor: '#D1FAE5',
                        color: '#059669',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 500,
                      }}>
                        Resolved
                      </span>
                    )}
                  </div>
                  <p style={{
                    margin: '0 0 8px 0',
                    fontSize: '13px',
                    color: '#4b5563',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {comment.content || 'No content'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '2px 8px',
                      backgroundColor: '#FEF3C7',
                      borderRadius: '4px',
                      fontSize: '11px',
                      color: '#92400E',
                    }}>
                      "{comment.textSelection.text.slice(0, 20)}..."
                    </span>
                    {comment.replies.length > 0 && (
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                        💬 {comment.replies.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Settings */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid #e5e7eb' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={config.showResolved}
            onChange={(e) => updateConfig({ showResolved: e.target.checked })}
          />
          <span style={{ fontSize: '13px', color: '#6b7280' }}>Show resolved comments</span>
        </label>
      </div>
    </div>
  );
};

// ============================================================================
// COMMENT INDICATOR
// ============================================================================

interface CommentIndicatorProps {
  count: number;
  onClick?: () => void;
  className?: string;
}

export const CommentIndicator: React.FC<CommentIndicatorProps> = ({
  count,
  onClick,
  className = '',
}) => {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px 8px',
        border: 'none',
        borderRadius: '12px',
        backgroundColor: '#FEF3C7',
        color: '#92400E',
        fontSize: '12px',
        fontWeight: 500,
        cursor: 'pointer',
      }}
    >
      <span>💬</span>
      <span>{count}</span>
    </button>
  );
};

// ============================================================================
// ACTIVE COMMENT POPOVER
// ============================================================================

interface ActiveCommentPopoverProps {
  position?: { x: number; y: number };
}

export const ActiveCommentPopover: React.FC<ActiveCommentPopoverProps> = ({
  position,
}) => {
  const { comments, activeCommentId, setActiveComment } = useInlineCommenting();

  const activeComment = comments.find(c => c.id === activeCommentId);

  if (!activeComment) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        style={{
          position: 'fixed',
          left: position?.x || 20,
          top: position?.y || 100,
          zIndex: 1000,
        }}
      >
        <CommentThread
          comment={activeComment}
          onClose={() => setActiveComment(null)}
        />
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  CommentThread as InlineCommenting,
};

export default InlineCommentingProvider;
