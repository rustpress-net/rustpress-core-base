/**
 * RustPress Comments Thread Component
 * Discussion thread with replies, reactions, and mentions
 */

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Reply,
  MoreHorizontal,
  Edit2,
  Trash2,
  Flag,
  ThumbsUp,
  Heart,
  Smile,
  Send,
  Paperclip,
  AtSign,
  Bold,
  Italic,
  Link,
  Image,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface CommentAuthor {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  isVerified?: boolean;
}

export interface CommentReaction {
  emoji: string;
  count: number;
  users: string[];
  reacted: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: CommentAuthor;
  createdAt: Date;
  updatedAt?: Date;
  isEdited?: boolean;
  isPinned?: boolean;
  reactions?: CommentReaction[];
  replies?: Comment[];
  replyCount?: number;
  attachments?: { id: string; name: string; url: string; type: string }[];
  mentions?: string[];
  isDeleted?: boolean;
}

export interface CommentsThreadProps {
  comments: Comment[];
  currentUserId?: string;
  onAddComment?: (content: string, parentId?: string) => Promise<void>;
  onEditComment?: (id: string, content: string) => Promise<void>;
  onDeleteComment?: (id: string) => Promise<void>;
  onReact?: (commentId: string, emoji: string) => void;
  onLoadReplies?: (commentId: string) => Promise<Comment[]>;
  onMention?: (query: string) => Promise<CommentAuthor[]>;
  onReport?: (commentId: string) => void;
  onPin?: (commentId: string) => void;
  allowReplies?: boolean;
  allowReactions?: boolean;
  allowEditing?: boolean;
  allowDeleting?: boolean;
  maxNestingLevel?: number;
  sortOrder?: 'newest' | 'oldest' | 'popular';
  showCommentCount?: boolean;
  placeholder?: string;
  className?: string;
}

// ============================================================================
// Time Formatting
// ============================================================================

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

// ============================================================================
// Comment Input Component
// ============================================================================

interface CommentInputProps {
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  initialValue?: string;
  isReply?: boolean;
  isEditing?: boolean;
  autoFocus?: boolean;
}

function CommentInput({
  onSubmit,
  onCancel,
  placeholder = 'Write a comment...',
  initialValue = '',
  isReply = false,
  isEditing = false,
  autoFocus = false,
}: CommentInputProps) {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmit(content);
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
    if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  return (
    <div className="relative">
      <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={isReply ? 2 : 3}
          className={cn(
            'w-full px-3 py-2 text-sm resize-none',
            'bg-white dark:bg-neutral-900',
            'text-neutral-900 dark:text-white',
            'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
            'focus:outline-none'
          )}
        />

        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded"
              title="Link"
            >
              <Link className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded"
              title="Mention"
            >
              <AtSign className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded"
              title="Attach file"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded',
                'bg-primary-600 text-white',
                'hover:bg-primary-700',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <Send className="w-3.5 h-3.5" />
              {isEditing ? 'Save' : isReply ? 'Reply' : 'Comment'}
            </button>
          </div>
        </div>
      </div>

      <p className="mt-1 text-xs text-neutral-400">
        Press Cmd/Ctrl + Enter to submit
      </p>
    </div>
  );
}

// ============================================================================
// Reactions Component
// ============================================================================

interface ReactionsProps {
  reactions?: CommentReaction[];
  onReact?: (emoji: string) => void;
}

const defaultReactions = ['👍', '❤️', '😄', '🎉', '😮', '😢'];

function Reactions({ reactions = [], onReact }: ReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          onClick={() => onReact?.(reaction.emoji)}
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border',
            reaction.reacted
              ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/30 dark:border-primary-700'
              : 'bg-neutral-50 border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700',
            'hover:border-primary-300 dark:hover:border-primary-600'
          )}
        >
          <span>{reaction.emoji}</span>
          <span className="text-neutral-600 dark:text-neutral-400">{reaction.count}</span>
        </button>
      ))}

      {onReact && (
        <div className="relative">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded"
          >
            <Smile className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showPicker && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute left-0 top-full mt-1 z-10 p-2 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700"
              >
                <div className="flex gap-1">
                  {defaultReactions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onReact(emoji);
                        setShowPicker(false);
                      }}
                      className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Comment Item Component
// ============================================================================

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  nestingLevel: number;
  maxNestingLevel: number;
  allowReplies: boolean;
  allowReactions: boolean;
  allowEditing: boolean;
  allowDeleting: boolean;
  onAddReply?: (content: string) => Promise<void>;
  onEdit?: (content: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onReact?: (emoji: string) => void;
  onLoadReplies?: () => Promise<Comment[]>;
  onReport?: () => void;
  onPin?: () => void;
}

function CommentItem({
  comment,
  currentUserId,
  nestingLevel,
  maxNestingLevel,
  allowReplies,
  allowReactions,
  allowEditing,
  allowDeleting,
  onAddReply,
  onEdit,
  onDelete,
  onReact,
  onLoadReplies,
  onReport,
  onPin,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(nestingLevel < 2);
  const [showMenu, setShowMenu] = useState(false);
  const [replies, setReplies] = useState<Comment[]>(comment.replies || []);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const isOwner = currentUserId === comment.author.id;
  const canNest = nestingLevel < maxNestingLevel;

  const handleLoadReplies = async () => {
    if (onLoadReplies && !replies.length && comment.replyCount) {
      setLoadingReplies(true);
      try {
        const loadedReplies = await onLoadReplies();
        setReplies(loadedReplies);
      } finally {
        setLoadingReplies(false);
      }
    }
    setShowReplies(!showReplies);
  };

  const handleAddReply = async (content: string) => {
    await onAddReply?.(content);
    setIsReplying(false);
  };

  const handleEdit = async (content: string) => {
    await onEdit?.(content);
    setIsEditing(false);
  };

  if (comment.isDeleted) {
    return (
      <div className="py-3 px-4 text-sm text-neutral-500 dark:text-neutral-400 italic bg-neutral-50 dark:bg-neutral-800/50 rounded-lg">
        This comment has been deleted
      </div>
    );
  }

  return (
    <div className={cn('relative', nestingLevel > 0 && 'ml-8 pl-4 border-l-2 border-neutral-200 dark:border-neutral-700')}>
      {/* Pinned indicator */}
      {comment.isPinned && (
        <div className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 mb-2">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
          </svg>
          Pinned
        </div>
      )}

      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.author.avatar ? (
            <img
              src={comment.author.avatar}
              alt={comment.author.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">
                {comment.author.name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-neutral-900 dark:text-white">
              {comment.author.name}
            </span>
            {comment.author.role && (
              <span className="px-1.5 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded">
                {comment.author.role}
              </span>
            )}
            {comment.author.isVerified && (
              <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              {formatTimeAgo(comment.createdAt)}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-neutral-400 dark:text-neutral-500">(edited)</span>
            )}
          </div>

          {/* Body */}
          {isEditing ? (
            <div className="mt-2">
              <CommentInput
                onSubmit={handleEdit}
                onCancel={() => setIsEditing(false)}
                initialValue={comment.content}
                isEditing
                autoFocus
              />
            </div>
          ) : (
            <p className="mt-1 text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">
              {comment.content}
            </p>
          )}

          {/* Attachments */}
          {comment.attachments && comment.attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {comment.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-neutral-100 dark:bg-neutral-800 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                >
                  <Paperclip className="w-3 h-3" />
                  {attachment.name}
                </a>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="mt-2 flex items-center gap-4">
            {allowReactions && (
              <Reactions reactions={comment.reactions} onReact={onReact} />
            )}

            {allowReplies && canNest && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400"
              >
                <Reply className="w-3.5 h-3.5" />
                Reply
              </button>
            )}

            {/* Menu */}
            <div className="relative ml-auto">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 rounded"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-1 z-10 w-40 py-1 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700"
                  >
                    {isOwner && allowEditing && (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                    {isOwner && allowDeleting && (
                      <button
                        onClick={() => {
                          onDelete?.();
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-error-600 dark:text-error-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                    {onPin && (
                      <button
                        onClick={() => {
                          onPin();
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        {comment.isPinned ? 'Unpin' : 'Pin'}
                      </button>
                    )}
                    {onReport && (
                      <button
                        onClick={() => {
                          onReport();
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <Flag className="w-4 h-4" />
                        Report
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Reply input */}
          <AnimatePresence>
            {isReplying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <CommentInput
                  onSubmit={handleAddReply}
                  onCancel={() => setIsReplying(false)}
                  placeholder={`Reply to ${comment.author.name}...`}
                  isReply
                  autoFocus
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Replies */}
          {(replies.length > 0 || (comment.replyCount && comment.replyCount > 0)) && (
            <div className="mt-3">
              <button
                onClick={handleLoadReplies}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {showReplies ? 'Hide' : 'Show'} {replies.length || comment.replyCount} {(replies.length || comment.replyCount || 0) === 1 ? 'reply' : 'replies'}
              </button>

              <AnimatePresence>
                {showReplies && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 space-y-4"
                  >
                    {loadingReplies ? (
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <Clock className="w-4 h-4 animate-spin" />
                        Loading replies...
                      </div>
                    ) : (
                      replies.map((reply) => (
                        <CommentItem
                          key={reply.id}
                          comment={reply}
                          currentUserId={currentUserId}
                          nestingLevel={nestingLevel + 1}
                          maxNestingLevel={maxNestingLevel}
                          allowReplies={allowReplies}
                          allowReactions={allowReactions}
                          allowEditing={allowEditing}
                          allowDeleting={allowDeleting}
                          onAddReply={onAddReply ? (content) => onAddReply(content) : undefined}
                          onReact={onReact}
                        />
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Comments Thread Component
// ============================================================================

export function CommentsThread({
  comments,
  currentUserId,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onReact,
  onLoadReplies,
  onMention,
  onReport,
  onPin,
  allowReplies = true,
  allowReactions = true,
  allowEditing = true,
  allowDeleting = true,
  maxNestingLevel = 3,
  sortOrder = 'newest',
  showCommentCount = true,
  placeholder = 'Write a comment...',
  className,
}: CommentsThreadProps) {
  const sortedComments = [...comments].sort((a, b) => {
    switch (sortOrder) {
      case 'oldest':
        return a.createdAt.getTime() - b.createdAt.getTime();
      case 'popular':
        const aReactions = a.reactions?.reduce((sum, r) => sum + r.count, 0) || 0;
        const bReactions = b.reactions?.reduce((sum, r) => sum + r.count, 0) || 0;
        return bReactions - aReactions;
      case 'newest':
      default:
        return b.createdAt.getTime() - a.createdAt.getTime();
    }
  });

  // Separate pinned comments
  const pinnedComments = sortedComments.filter((c) => c.isPinned);
  const regularComments = sortedComments.filter((c) => !c.isPinned);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      {showCommentCount && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Comments ({comments.length})
          </h3>
        </div>
      )}

      {/* New comment input */}
      {onAddComment && (
        <CommentInput
          onSubmit={(content) => onAddComment(content)}
          placeholder={placeholder}
        />
      )}

      {/* Comments list */}
      <div className="space-y-6">
        {/* Pinned comments first */}
        {pinnedComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUserId={currentUserId}
            nestingLevel={0}
            maxNestingLevel={maxNestingLevel}
            allowReplies={allowReplies}
            allowReactions={allowReactions}
            allowEditing={allowEditing}
            allowDeleting={allowDeleting}
            onAddReply={onAddComment ? (content) => onAddComment(content, comment.id) : undefined}
            onEdit={onEditComment ? (content) => onEditComment(comment.id, content) : undefined}
            onDelete={onDeleteComment ? () => onDeleteComment(comment.id) : undefined}
            onReact={onReact ? (emoji) => onReact(comment.id, emoji) : undefined}
            onLoadReplies={onLoadReplies ? () => onLoadReplies(comment.id) : undefined}
            onReport={onReport ? () => onReport(comment.id) : undefined}
            onPin={onPin ? () => onPin(comment.id) : undefined}
          />
        ))}

        {/* Regular comments */}
        {regularComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUserId={currentUserId}
            nestingLevel={0}
            maxNestingLevel={maxNestingLevel}
            allowReplies={allowReplies}
            allowReactions={allowReactions}
            allowEditing={allowEditing}
            allowDeleting={allowDeleting}
            onAddReply={onAddComment ? (content) => onAddComment(content, comment.id) : undefined}
            onEdit={onEditComment ? (content) => onEditComment(comment.id, content) : undefined}
            onDelete={onDeleteComment ? () => onDeleteComment(comment.id) : undefined}
            onReact={onReact ? (emoji) => onReact(comment.id, emoji) : undefined}
            onLoadReplies={onLoadReplies ? () => onLoadReplies(comment.id) : undefined}
            onReport={onReport ? () => onReport(comment.id) : undefined}
            onPin={onPin ? () => onPin(comment.id) : undefined}
          />
        ))}

        {/* Empty state */}
        {comments.length === 0 && (
          <div className="py-12 text-center">
            <MessageSquare className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-3" />
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              No comments yet
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Be the first to share your thoughts!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CommentsThread;
