/**
 * ContentManager - Create, edit, and manage posts & pages
 * RustPress-specific content management functionality
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Edit, Trash2, Eye, Calendar, Tag, User,
  Search, Filter, MoreVertical, Clock, CheckCircle, XCircle,
  Archive, Star, Copy, ExternalLink, ChevronDown, Folder
} from 'lucide-react';

export interface ContentItem {
  id: string;
  title: string;
  slug: string;
  type: 'post' | 'page';
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  author: string;
  category?: string;
  tags?: string[];
  excerpt?: string;
  featuredImage?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  views?: number;
  comments?: number;
}

interface ContentManagerProps {
  onCreateContent?: (type: 'post' | 'page') => void;
  onEditContent?: (item: ContentItem) => void;
  onPreviewContent?: (item: ContentItem) => void;
  onDeleteContent?: (item: ContentItem) => void;
}

// Mock content data
const mockContent: ContentItem[] = [
  {
    id: '1',
    title: 'Getting Started with RustPress',
    slug: 'getting-started-rustpress',
    type: 'post',
    status: 'published',
    author: 'Admin',
    category: 'Tutorials',
    tags: ['rustpress', 'getting-started', 'tutorial'],
    excerpt: 'Learn how to get started with RustPress and build your first website.',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    publishedAt: '2024-01-15T14:30:00Z',
    views: 1250,
    comments: 23
  },
  {
    id: '2',
    title: 'Advanced Theme Development',
    slug: 'advanced-theme-development',
    type: 'post',
    status: 'draft',
    author: 'Admin',
    category: 'Development',
    tags: ['themes', 'development', 'advanced'],
    excerpt: 'Deep dive into creating custom themes for RustPress.',
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-16T11:00:00Z',
    views: 0,
    comments: 0
  },
  {
    id: '3',
    title: 'About Us',
    slug: 'about-us',
    type: 'page',
    status: 'published',
    author: 'Admin',
    excerpt: 'Learn about our team and mission.',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-14T16:00:00Z',
    publishedAt: '2024-01-10T09:00:00Z',
    views: 890
  },
  {
    id: '4',
    title: 'Product Launch Announcement',
    slug: 'product-launch',
    type: 'post',
    status: 'scheduled',
    author: 'Marketing',
    category: 'News',
    tags: ['product', 'launch', 'announcement'],
    excerpt: 'Exciting news about our upcoming product launch.',
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z',
    publishedAt: '2024-01-25T09:00:00Z',
    views: 0,
    comments: 0
  }
];

export const ContentManager: React.FC<ContentManagerProps> = ({
  onCreateContent,
  onEditContent,
  onPreviewContent,
  onDeleteContent
}) => {
  const [content, setContent] = useState<ContentItem[]>(mockContent);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'post' | 'page'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'scheduled' | 'archived'>('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'views'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredContent = content
    .filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || item.type === filterType;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === 'views') {
        comparison = (b.views || 0) - (a.views || 0);
      }
      return sortOrder === 'desc' ? comparison : -comparison;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'draft': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'scheduled': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'archived': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="w-3 h-3" />;
      case 'draft': return <Edit className="w-3 h-3" />;
      case 'scheduled': return <Clock className="w-3 h-3" />;
      case 'archived': return <Archive className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredContent.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredContent.map(item => item.id)));
    }
  };

  const handleBulkDelete = () => {
    setContent(content.filter(item => !selectedItems.has(item.id)));
    setSelectedItems(new Set());
  };

  const handleBulkStatusChange = (status: ContentItem['status']) => {
    setContent(content.map(item =>
      selectedItems.has(item.id) ? { ...item, status } : item
    ));
    setSelectedItems(new Set());
  };

  const stats = {
    total: content.length,
    published: content.filter(c => c.status === 'published').length,
    drafts: content.filter(c => c.status === 'draft').length,
    scheduled: content.filter(c => c.status === 'scheduled').length,
    posts: content.filter(c => c.type === 'post').length,
    pages: content.filter(c => c.type === 'page').length
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Content Manager
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onCreateContent?.('post')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Post
            </button>
            <button
              onClick={() => onCreateContent?.('page')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Page
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-6 gap-2 mb-4">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-400' },
            { label: 'Published', value: stats.published, color: 'text-green-400' },
            { label: 'Drafts', value: stats.drafts, color: 'text-yellow-400' },
            { label: 'Scheduled', value: stats.scheduled, color: 'text-blue-400' },
            { label: 'Posts', value: stats.posts, color: 'text-purple-400' },
            { label: 'Pages', value: stats.pages, color: 'text-cyan-400' }
          ].map(stat => (
            <div key={stat.label} className="bg-gray-800/50 rounded-lg p-2 text-center">
              <div className={`text-lg font-semibold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search content..."
              className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
              showFilters ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 flex items-center gap-4 overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Type:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                  className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                >
                  <option value="all">All</option>
                  <option value="post">Posts</option>
                  <option value="page">Pages</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                  className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                >
                  <option value="all">All</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                >
                  <option value="date">Date</option>
                  <option value="title">Title</option>
                  <option value="views">Views</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedItems.size > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-2 bg-blue-900/30 border-b border-blue-800/50 flex items-center justify-between"
          >
            <span className="text-sm text-blue-400">
              {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatusChange('published')}
                className="px-2 py-1 text-xs bg-green-600/20 text-green-400 rounded hover:bg-green-600/30"
              >
                Publish
              </button>
              <button
                onClick={() => handleBulkStatusChange('draft')}
                className="px-2 py-1 text-xs bg-yellow-600/20 text-yellow-400 rounded hover:bg-yellow-600/30"
              >
                Draft
              </button>
              <button
                onClick={() => handleBulkStatusChange('archived')}
                className="px-2 py-1 text-xs bg-gray-600/20 text-gray-400 rounded hover:bg-gray-600/30"
              >
                Archive
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-2 py-1 text-xs bg-red-600/20 text-red-400 rounded hover:bg-red-600/30"
              >
                Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content List */}
      <div className="flex-1 overflow-auto">
        {/* Table Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center text-xs text-gray-500 uppercase tracking-wider">
          <div className="w-8">
            <input
              type="checkbox"
              checked={selectedItems.size === filteredContent.length && filteredContent.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">Title</div>
          <div className="w-24">Type</div>
          <div className="w-28">Status</div>
          <div className="w-24">Author</div>
          <div className="w-32">Updated</div>
          <div className="w-20 text-right">Views</div>
          <div className="w-16"></div>
        </div>

        {/* Content Items */}
        <div className="divide-y divide-gray-800/50">
          {filteredContent.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`px-4 py-3 flex items-center hover:bg-gray-800/30 transition-colors ${
                selectedItems.has(item.id) ? 'bg-blue-900/20' : ''
              }`}
            >
              <div className="w-8">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => handleSelectItem(item.id)}
                  className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium truncate">{item.title}</span>
                  {item.featuredImage && <Star className="w-3 h-3 text-yellow-500" />}
                </div>
                <div className="text-xs text-gray-500 truncate">{item.slug}</div>
              </div>
              <div className="w-24">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                  item.type === 'post' ? 'bg-purple-500/10 text-purple-400' : 'bg-cyan-500/10 text-cyan-400'
                }`}>
                  {item.type === 'post' ? <FileText className="w-3 h-3" /> : <Folder className="w-3 h-3" />}
                  {item.type}
                </span>
              </div>
              <div className="w-28">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${getStatusColor(item.status)}`}>
                  {getStatusIcon(item.status)}
                  {item.status}
                </span>
              </div>
              <div className="w-24 text-sm text-gray-400">{item.author}</div>
              <div className="w-32 text-sm text-gray-400">{formatDate(item.updatedAt)}</div>
              <div className="w-20 text-sm text-gray-400 text-right">{item.views?.toLocaleString() || '-'}</div>
              <div className="w-16 flex items-center justify-end gap-1">
                <button
                  onClick={() => onPreviewContent?.(item)}
                  className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-gray-700"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEditContent?.(item)}
                  className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-gray-700"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredContent.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No content found</p>
            <button
              onClick={() => onCreateContent?.('post')}
              className="mt-3 text-blue-400 hover:text-blue-300 text-sm"
            >
              Create your first post
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentManager;
