/**
 * RustPress Advanced Table Demo
 * Showcases all advanced table features
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  User,
  Calendar,
  Tag,
  Eye,
  Edit2,
  Trash2,
  MoreHorizontal,
  RefreshCw,
  Plus,
  Download,
} from 'lucide-react';
import {
  PageHeader,
  Button,
  EnhancedDataTable,
  EnhancedColumn,
  Badge,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
  IconButton,
  staggerContainer,
  fadeInUp,
} from '../../design-system';

// Sample data type
interface Post {
  id: number;
  title: string;
  author: string;
  authorAvatar: string;
  status: 'published' | 'draft' | 'pending' | 'scheduled';
  category: string;
  views: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  featured: boolean;
}

// Generate sample data
function generateSampleData(count: number): Post[] {
  const statuses: Post['status'][] = ['published', 'draft', 'pending', 'scheduled'];
  const categories = ['Technology', 'Design', 'Marketing', 'Business', 'Development', 'News'];
  const authors = [
    { name: 'John Doe', avatar: 'https://i.pravatar.cc/40?u=john' },
    { name: 'Jane Smith', avatar: 'https://i.pravatar.cc/40?u=jane' },
    { name: 'Bob Wilson', avatar: 'https://i.pravatar.cc/40?u=bob' },
    { name: 'Alice Brown', avatar: 'https://i.pravatar.cc/40?u=alice' },
    { name: 'Charlie Davis', avatar: 'https://i.pravatar.cc/40?u=charlie' },
  ];

  return Array.from({ length: count }, (_, i) => {
    const author = authors[Math.floor(Math.random() * authors.length)];
    const daysAgo = Math.floor(Math.random() * 365);
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - daysAgo);

    return {
      id: i + 1,
      title: `${['How to', 'Guide to', 'Understanding', 'Building', 'Mastering'][Math.floor(Math.random() * 5)]} ${['React', 'TypeScript', 'Rust', 'Design Systems', 'Performance', 'UX'][Math.floor(Math.random() * 6)]} ${['Basics', 'Best Practices', 'in 2024', 'for Beginners', 'Advanced Techniques'][Math.floor(Math.random() * 5)]}`,
      author: author.name,
      authorAvatar: author.avatar,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      views: Math.floor(Math.random() * 50000),
      comments: Math.floor(Math.random() * 200),
      createdAt: createdDate.toISOString(),
      updatedAt: new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      featured: Math.random() > 0.8,
    };
  });
}

const statusColors: Record<Post['status'], 'success' | 'warning' | 'error' | 'primary'> = {
  published: 'success',
  draft: 'warning',
  pending: 'primary',
  scheduled: 'primary',
};

export function AdvancedTable() {
  const [data] = useState(() => generateSampleData(1000));

  // Column definitions
  const columns: EnhancedColumn<Post>[] = useMemo(
    () => [
      {
        key: 'title',
        header: 'Title',
        width: 300,
        minWidth: 200,
        maxWidth: 500,
        filterable: true,
        filterType: 'string',
        editable: true,
        editorConfig: { type: 'text', placeholder: 'Enter title...' },
        render: (value, row) => (
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-medium text-neutral-900 dark:text-white truncate">
                {value as string}
              </div>
              {row.featured && (
                <span className="text-xs text-warning-600">Featured</span>
              )}
            </div>
          </div>
        ),
      },
      {
        key: 'author',
        header: 'Author',
        width: 180,
        filterable: true,
        filterType: 'string',
        render: (value, row) => (
          <div className="flex items-center gap-2">
            <Avatar
              src={row.authorAvatar}
              name={value as string}
              size="sm"
            />
            <span className="truncate">{value as string}</span>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        width: 120,
        filterable: true,
        filterType: 'enum',
        enumOptions: [
          { value: 'published', label: 'Published' },
          { value: 'draft', label: 'Draft' },
          { value: 'pending', label: 'Pending' },
          { value: 'scheduled', label: 'Scheduled' },
        ],
        editable: true,
        editorConfig: {
          type: 'select',
          options: [
            { value: 'published', label: 'Published' },
            { value: 'draft', label: 'Draft' },
            { value: 'pending', label: 'Pending' },
            { value: 'scheduled', label: 'Scheduled' },
          ],
        },
        render: (value) => (
          <Badge variant={statusColors[value as Post['status']]}>
            {(value as string).charAt(0).toUpperCase() + (value as string).slice(1)}
          </Badge>
        ),
      },
      {
        key: 'category',
        header: 'Category',
        width: 140,
        filterable: true,
        filterType: 'enum',
        enumOptions: [
          { value: 'Technology', label: 'Technology' },
          { value: 'Design', label: 'Design' },
          { value: 'Marketing', label: 'Marketing' },
          { value: 'Business', label: 'Business' },
          { value: 'Development', label: 'Development' },
          { value: 'News', label: 'News' },
        ],
        render: (value) => (
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-neutral-400" />
            <span>{value as string}</span>
          </div>
        ),
      },
      {
        key: 'views',
        header: 'Views',
        width: 100,
        align: 'right',
        filterable: true,
        filterType: 'number',
        render: (value) => (
          <div className="flex items-center justify-end gap-1">
            <Eye className="w-3.5 h-3.5 text-neutral-400" />
            <span>{(value as number).toLocaleString()}</span>
          </div>
        ),
      },
      {
        key: 'comments',
        header: 'Comments',
        width: 100,
        align: 'right',
        filterable: true,
        filterType: 'number',
        render: (value) => (value as number).toLocaleString(),
      },
      {
        key: 'createdAt',
        header: 'Created',
        width: 140,
        filterable: true,
        filterType: 'date',
        render: (value) => (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <span>{new Date(value as string).toLocaleDateString()}</span>
          </div>
        ),
      },
      {
        key: 'featured',
        header: 'Featured',
        width: 100,
        align: 'center',
        filterable: true,
        filterType: 'boolean',
        editable: true,
        editorConfig: { type: 'boolean' },
        render: (value) => (
          value ? (
            <Badge variant="warning">Yes</Badge>
          ) : (
            <span className="text-neutral-400">No</span>
          )
        ),
      },
    ],
    []
  );

  // Row actions
  const rowActions = (row: Post) => (
    <Dropdown>
      <DropdownTrigger asChild>
        <IconButton variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </IconButton>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem onClick={() => console.log('View:', row.id)}>
          <Eye className="w-4 h-4 mr-2" />
          View
        </DropdownItem>
        <DropdownItem onClick={() => console.log('Edit:', row.id)}>
          <Edit2 className="w-4 h-4 mr-2" />
          Edit
        </DropdownItem>
        <DropdownSeparator />
        <DropdownItem
          onClick={() => console.log('Delete:', row.id)}
          className="text-error-600"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );

  // Bulk actions
  const bulkActions = [
    {
      id: 'publish',
      label: 'Publish',
      icon: <Eye className="w-4 h-4" />,
      variant: 'success' as const,
      onClick: (ids: Set<string | number>) => {
        console.log('Publishing:', Array.from(ids));
      },
    },
    {
      id: 'draft',
      label: 'Move to Draft',
      icon: <FileText className="w-4 h-4" />,
      onClick: (ids: Set<string | number>) => {
        console.log('Moving to draft:', Array.from(ids));
      },
    },
    {
      id: 'export',
      label: 'Export',
      icon: <Download className="w-4 h-4" />,
      onClick: (ids: Set<string | number>) => {
        console.log('Exporting:', Array.from(ids));
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      variant: 'danger' as const,
      requiresConfirmation: true,
      confirmMessage: 'Are you sure you want to delete the selected posts?',
      onClick: (ids: Set<string | number>) => {
        console.log('Deleting:', Array.from(ids));
      },
    },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* Page Header */}
      <PageHeader
        title="Advanced Table Demo"
        description="Enterprise-grade data table with 1,000 rows showcasing all features"
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" leftIcon={<RefreshCw className="w-4 h-4" />}>
              Refresh
            </Button>
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              New Post
            </Button>
          </div>
        }
      />

      {/* Feature highlights */}
      <motion.div variants={fadeInUp} className="grid grid-cols-4 gap-4">
        {[
          { label: 'Virtual Scrolling', desc: '1,000+ rows, no lag' },
          { label: 'Advanced Filters', desc: 'AND/OR logic' },
          { label: 'Inline Editing', desc: 'Click to edit cells' },
          { label: 'Export Options', desc: 'CSV, Excel, JSON, PDF' },
        ].map((feature) => (
          <div
            key={feature.label}
            className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800"
          >
            <h3 className="font-semibold text-neutral-900 dark:text-white">
              {feature.label}
            </h3>
            <p className="text-sm text-neutral-500">{feature.desc}</p>
          </div>
        ))}
      </motion.div>

      {/* Enhanced Data Table */}
      <motion.div variants={fadeInUp}>
        <EnhancedDataTable
          tableId="posts-demo"
          data={data}
          columns={columns}
          getRowId={(row) => row.id}
          height={600}
          virtualScrolling={true}
          selectable={true}
          sortable={true}
          filterable={true}
          resizable={true}
          editable={true}
          exportable={true}
          showViewManager={true}
          showColumnToggle={true}
          bulkActions={bulkActions}
          rowActions={rowActions}
          onRowClick={(row) => console.log('Row clicked:', row)}
          onCellSave={async (rowId, columnKey, value) => {
            console.log('Cell saved:', { rowId, columnKey, value });
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 500));
          }}
          striped={true}
        />
      </motion.div>
    </motion.div>
  );
}

export default AdvancedTable;
