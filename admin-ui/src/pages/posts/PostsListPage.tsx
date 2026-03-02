/**
 * PostsListPage — Full posts list with search, filters, bulk actions
 * Replaces the inline mock PostsList in App.tsx
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, FileText, Send } from 'lucide-react';
import { PageHeader, Button, DataTable, Badge } from '../../design-system';
import { staggerContainer, fadeInUp } from '../../design-system';
import { usePostStore, useFilteredPosts } from '../../store/postStore';

const statusTabs = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'pending', label: 'Pending' },
] as const;

const PostsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { filters, setFilters, fetchPosts, isLoading, selectedIds, setSelectedIds, deletePost, bulkAction } = usePostStore();
  const filteredPosts = useFilteredPosts();
  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ search: searchInput });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, setFilters]);

  const handleDelete = useCallback((id: string) => {
    if (confirm('Delete this post?')) {
      deletePost(id);
    }
  }, [deletePost]);

  const handleBulkDelete = useCallback(() => {
    if (selectedIds.length > 0 && confirm(`Delete ${selectedIds.length} post(s)?`)) {
      bulkAction('delete', selectedIds);
    }
  }, [selectedIds, bulkAction]);

  // Bridge between DataTable's Set-based selection and store's array-based selection
  const handleSelectionChange = useCallback((ids: Set<string | number>) => {
    setSelectedIds(Array.from(ids).map(String));
  }, [setSelectedIds]);

  const selectedIdsSet = useMemo(() => new Set<string | number>(selectedIds), [selectedIds]);

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <PageHeader
        title="Posts"
        description="Manage your blog posts and articles"
        actions={
          <Link to="/posts/new">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              New Post
            </Button>
          </Link>
        }
      />

      <motion.div variants={fadeInUp} className="space-y-4">
        {/* Search + Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilters({ status: tab.value })}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filters.status === tab.value
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm font-medium'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl">
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
              {selectedIds.length} selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={handleBulkDelete}
              >
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<FileText className="w-3.5 h-3.5" />}
                onClick={() => bulkAction('draft', selectedIds)}
              >
                Set Draft
              </Button>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Send className="w-3.5 h-3.5" />}
                onClick={() => bulkAction('publish', selectedIds)}
              >
                Publish
              </Button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <DataTable
          columns={[
            {
              key: 'title',
              header: 'Title',
              sortable: true,
              render: (value, row) => (
                <Link
                  to={`/posts/${row.id}/edit`}
                  className="font-medium text-neutral-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {value || 'Untitled Post'}
                </Link>
              ),
            },
            {
              key: 'author_name',
              header: 'Author',
              sortable: true,
            },
            {
              key: 'categories',
              header: 'Categories',
              render: (value) => (
                <div className="flex flex-wrap gap-1">
                  {(value as string[] || []).map((cat: string) => (
                    <Badge key={cat} variant="info" size="xs">{cat}</Badge>
                  ))}
                </div>
              ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (value) => (
                <Badge
                  variant={
                    value === 'published' ? 'success' :
                    value === 'draft' ? 'warning' :
                    value === 'scheduled' ? 'info' :
                    'default'
                  }
                  size="sm"
                >
                  {value}
                </Badge>
              ),
            },
            {
              key: 'updated_at',
              header: 'Date',
              sortable: true,
              render: (value) => (
                <span className="text-sm text-neutral-500">
                  {new Date(value as string).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (_, row) => (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/posts/${row.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(row.id as string)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ),
            },
          ]}
          data={filteredPosts}
          selectable
          selectedIds={selectedIdsSet}
          onSelectionChange={handleSelectionChange}
          pagination
          pageSize={10}
          isLoading={isLoading}
        />
      </motion.div>
    </motion.div>
  );
};

export default PostsListPage;
