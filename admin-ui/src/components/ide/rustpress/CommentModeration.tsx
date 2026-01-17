/**
 * CommentModeration - Comment management and moderation
 * RustPress-specific comment moderation functionality
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Check, X, Trash2, Flag, Reply, Edit,
  ThumbsUp, ThumbsDown, AlertTriangle, User, Calendar,
  Search, Filter, ChevronDown, MoreVertical, Mail, Link,
  Eye, EyeOff, Shield, Clock
} from 'lucide-react';

export interface Comment {
  id: string;
  author: string;
  email: string;
  website?: string;
  avatar?: string;
  content: string;
  postTitle: string;
  postId: string;
  status: 'pending' | 'approved' | 'spam' | 'trash';
  date: string;
  ip?: string;
  parentId?: string;
  replies?: Comment[];
  likes: number;
  dislikes: number;
  flagged?: boolean;
}

interface CommentModerationProps {
  onApprove?: (comment: Comment) => void;
  onReject?: (comment: Comment) => void;
  onSpam?: (comment: Comment) => void;
  onDelete?: (comment: Comment) => void;
  onReply?: (comment: Comment, reply: string) => void;
}

const mockComments: Comment[] = [
  {
    id: '1',
    author: 'John Doe',
    email: 'john@example.com',
    website: 'https://johndoe.com',
    content: 'Great article! Really helped me understand the concepts better. Looking forward to more content like this.',
    postTitle: 'Getting Started with RustPress',
    postId: 'post-1',
    status: 'pending',
    date: '2024-01-16 10:30',
    ip: '192.168.1.100',
    likes: 5,
    dislikes: 0
  },
  {
    id: '2',
    author: 'Jane Smith',
    email: 'jane@example.com',
    content: 'I have a question about the installation process. Can you provide more details about the Rust version requirements?',
    postTitle: 'Getting Started with RustPress',
    postId: 'post-1',
    status: 'pending',
    date: '2024-01-16 09:15',
    ip: '192.168.1.101',
    likes: 2,
    dislikes: 0
  },
  {
    id: '3',
    author: 'SpamBot',
    email: 'spam@fake.com',
    website: 'https://buy-cheap-stuff.com',
    content: 'Check out our amazing deals! Best prices guaranteed! Click here now!!!',
    postTitle: 'Advanced Plugin Development',
    postId: 'post-2',
    status: 'spam',
    date: '2024-01-16 08:00',
    ip: '10.0.0.1',
    likes: 0,
    dislikes: 10,
    flagged: true
  },
  {
    id: '4',
    author: 'Mike Johnson',
    email: 'mike@company.com',
    content: 'This is exactly what I was looking for. The performance tips are really useful.',
    postTitle: 'Performance Optimization Guide',
    postId: 'post-3',
    status: 'approved',
    date: '2024-01-15 14:20',
    ip: '192.168.1.102',
    likes: 8,
    dislikes: 1,
    replies: [
      {
        id: '4-1',
        author: 'Admin',
        email: 'admin@rustpress.io',
        content: 'Glad you found it helpful! Let us know if you have any questions.',
        postTitle: 'Performance Optimization Guide',
        postId: 'post-3',
        status: 'approved',
        date: '2024-01-15 15:00',
        parentId: '4',
        likes: 2,
        dislikes: 0
      }
    ]
  },
  {
    id: '5',
    author: 'Anonymous',
    email: 'anon@temp.com',
    content: 'This content is inappropriate and should be removed.',
    postTitle: 'Community Guidelines',
    postId: 'post-4',
    status: 'pending',
    date: '2024-01-15 12:00',
    ip: '192.168.1.103',
    likes: 0,
    dislikes: 5,
    flagged: true
  }
];

export const CommentModeration: React.FC<CommentModerationProps> = ({
  onApprove,
  onReject,
  onSpam,
  onDelete,
  onReply
}) => {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [expandedComments, setExpandedComments] = useState<string[]>([]);

  const handleStatusChange = (commentId: string, newStatus: Comment['status']) => {
    setComments(prev => prev.map(c =>
      c.id === commentId ? { ...c, status: newStatus } : c
    ));
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      if (newStatus === 'approved') onApprove?.(comment);
      if (newStatus === 'spam') onSpam?.(comment);
      if (newStatus === 'trash') onDelete?.(comment);
    }
  };

  const handleBulkAction = (action: string) => {
    selectedComments.forEach(id => {
      if (action === 'approve') handleStatusChange(id, 'approved');
      if (action === 'spam') handleStatusChange(id, 'spam');
      if (action === 'trash') handleStatusChange(id, 'trash');
    });
    setSelectedComments([]);
  };

  const handleReply = (commentId: string) => {
    if (!replyText.trim()) return;
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      onReply?.(comment, replyText);
    }
    setReplyingTo(null);
    setReplyText('');
  };

  const toggleSelectAll = () => {
    if (selectedComments.length === filteredComments.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(filteredComments.map(c => c.id));
    }
  };

  const toggleSelect = (commentId: string) => {
    setSelectedComments(prev =>
      prev.includes(commentId)
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const toggleExpand = (commentId: string) => {
    setExpandedComments(prev =>
      prev.includes(commentId)
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-500/10';
      case 'pending': return 'text-yellow-400 bg-yellow-500/10';
      case 'spam': return 'text-red-400 bg-red-500/10';
      case 'trash': return 'text-gray-400 bg-gray-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const filteredComments = comments.filter(comment => {
    if (selectedStatus !== 'all' && comment.status !== selectedStatus) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        comment.author.toLowerCase().includes(query) ||
        comment.content.toLowerCase().includes(query) ||
        comment.email.toLowerCase().includes(query) ||
        comment.postTitle.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const statusCounts = comments.reduce((acc, comment) => {
    acc[comment.status] = (acc[comment.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            Comment Moderation
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              {comments.filter(c => c.status === 'pending').length} pending
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search comments..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
            />
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 mt-3">
          {[
            { key: 'all', label: 'All', count: comments.length },
            { key: 'pending', label: 'Pending', count: statusCounts.pending || 0 },
            { key: 'approved', label: 'Approved', count: statusCounts.approved || 0 },
            { key: 'spam', label: 'Spam', count: statusCounts.spam || 0 },
            { key: 'trash', label: 'Trash', count: statusCounts.trash || 0 },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSelectedStatus(tab.key)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                selectedStatus === tab.key
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedComments.length > 0 && (
        <div className="px-4 py-2 bg-purple-900/20 border-b border-purple-800/30 flex items-center gap-3">
          <span className="text-sm text-purple-400">{selectedComments.length} selected</span>
          <button
            onClick={() => handleBulkAction('approve')}
            className="px-3 py-1 bg-green-600/20 text-green-400 text-sm rounded hover:bg-green-600/30"
          >
            Approve
          </button>
          <button
            onClick={() => handleBulkAction('spam')}
            className="px-3 py-1 bg-red-600/20 text-red-400 text-sm rounded hover:bg-red-600/30"
          >
            Mark Spam
          </button>
          <button
            onClick={() => handleBulkAction('trash')}
            className="px-3 py-1 bg-gray-600/20 text-gray-400 text-sm rounded hover:bg-gray-600/30"
          >
            Trash
          </button>
          <button
            onClick={() => setSelectedComments([])}
            className="ml-auto text-sm text-gray-400 hover:text-white"
          >
            Clear
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="flex-1 overflow-auto">
        <div className="divide-y divide-gray-800">
          {/* Select All */}
          <div className="px-4 py-2 bg-gray-800/30 flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedComments.length === filteredComments.length && filteredComments.length > 0}
              onChange={toggleSelectAll}
              className="rounded bg-gray-800 border-gray-600 text-purple-600"
            />
            <span className="text-sm text-gray-400">Select All</span>
          </div>

          {filteredComments.map(comment => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-4 hover:bg-gray-800/30 ${comment.flagged ? 'bg-red-900/10' : ''}`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedComments.includes(comment.id)}
                  onChange={() => toggleSelect(comment.id)}
                  className="mt-1 rounded bg-gray-800 border-gray-600 text-purple-600"
                />

                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white font-medium">
                  {comment.author.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">{comment.author}</span>
                    {comment.flagged && (
                      <Flag className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(comment.status)}`}>
                      {comment.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {comment.email}
                    </span>
                    {comment.website && (
                      <span className="flex items-center gap-1">
                        <Link className="w-3 h-3" />
                        {comment.website}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {comment.date}
                    </span>
                  </div>

                  <p className="text-gray-300 mb-2">{comment.content}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span>
                      On: <span className="text-purple-400">{comment.postTitle}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {comment.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsDown className="w-3 h-3" />
                      {comment.dislikes}
                    </span>
                    {comment.ip && (
                      <span>IP: {comment.ip}</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {comment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(comment.id, 'approved')}
                          className="flex items-center gap-1 px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded hover:bg-green-600/30"
                        >
                          <Check className="w-3 h-3" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(comment.id, 'spam')}
                          className="flex items-center gap-1 px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded hover:bg-red-600/30"
                        >
                          <X className="w-3 h-3" />
                          Spam
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded hover:bg-gray-600"
                    >
                      <Reply className="w-3 h-3" />
                      Reply
                    </button>
                    <button className="flex items-center gap-1 px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded hover:bg-gray-600">
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleStatusChange(comment.id, 'trash')}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded hover:bg-gray-600"
                    >
                      <Trash2 className="w-3 h-3" />
                      Trash
                    </button>
                  </div>

                  {/* Reply Form */}
                  <AnimatePresence>
                    {replyingTo === comment.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 overflow-hidden"
                      >
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                          rows={3}
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => handleReply(comment.id)}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg"
                          >
                            Send Reply
                          </button>
                          <button
                            onClick={() => { setReplyingTo(null); setReplyText(''); }}
                            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 ml-6 border-l-2 border-gray-700 pl-4 space-y-3">
                      {comment.replies.map(reply => (
                        <div key={reply.id} className="bg-gray-800/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm text-white font-medium">{reply.author}</span>
                            <span className="text-xs text-gray-500">{reply.date}</span>
                          </div>
                          <p className="text-sm text-gray-300">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredComments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">No comments found</p>
            <p className="text-sm">
              {selectedStatus === 'pending' ? 'No pending comments to moderate' : 'Try adjusting your filters'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentModeration;
