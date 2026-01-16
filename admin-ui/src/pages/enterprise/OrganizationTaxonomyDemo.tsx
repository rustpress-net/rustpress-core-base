import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import Organization & Taxonomy components (37-42)
import {
  CategoryManagerProvider,
  CategoryManager,
} from '../../design-system/components/CategoryManager';

import {
  TagManagerProvider,
  TagManager,
} from '../../design-system/components/TagManager';

import {
  TaxonomyBuilderProvider,
  TaxonomyBuilder,
} from '../../design-system/components/TaxonomyBuilder';

import {
  ContentRelationsProvider,
  ContentRelations,
} from '../../design-system/components/ContentRelations';

import {
  SeriesManagerProvider,
  SeriesManager,
} from '../../design-system/components/SeriesManager';

import {
  ArchiveOrganizerProvider,
  ArchiveOrganizer,
} from '../../design-system/components/ArchiveOrganizer';

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '2rem',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#64748b',
    marginBottom: '1.5rem',
  },
  tabsContainer: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '0',
    marginBottom: '2rem',
    overflowX: 'auto' as const,
  },
  tab: {
    padding: '0.75rem 1.25rem',
    border: 'none',
    background: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#64748b',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap' as const,
  },
  activeTab: {
    color: '#3b82f6',
    borderBottomColor: '#3b82f6',
  },
  content: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '1rem',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.25rem 0.75rem',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 500,
    marginLeft: '0.5rem',
  },
};

// ============================================================================
// SAMPLE DATA
// ============================================================================

const sampleCategories = [
  {
    id: 'tech',
    name: 'Technology',
    slug: 'technology',
    description: 'Articles about technology and innovation',
    color: '#3b82f6',
    postCount: 45,
    parentId: undefined,
    children: [
      {
        id: 'web',
        name: 'Web Development',
        slug: 'web-development',
        description: 'Web technologies and frameworks',
        color: '#10b981',
        postCount: 23,
        parentId: 'tech',
        children: [
          {
            id: 'frontend',
            name: 'Frontend',
            slug: 'frontend',
            description: 'Frontend technologies',
            color: '#f59e0b',
            postCount: 12,
            parentId: 'web',
            children: [],
          },
          {
            id: 'backend',
            name: 'Backend',
            slug: 'backend',
            description: 'Server-side development',
            color: '#8b5cf6',
            postCount: 11,
            parentId: 'web',
            children: [],
          },
        ],
      },
      {
        id: 'mobile',
        name: 'Mobile Development',
        slug: 'mobile-development',
        description: 'iOS and Android development',
        color: '#ef4444',
        postCount: 15,
        parentId: 'tech',
        children: [],
      },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    slug: 'business',
    description: 'Business strategy and entrepreneurship',
    color: '#06b6d4',
    postCount: 32,
    parentId: undefined,
    children: [
      {
        id: 'startup',
        name: 'Startups',
        slug: 'startups',
        description: 'Startup ecosystem and funding',
        color: '#ec4899',
        postCount: 18,
        parentId: 'business',
        children: [],
      },
    ],
  },
  {
    id: 'design',
    name: 'Design',
    slug: 'design',
    description: 'UI/UX and graphic design',
    color: '#a855f7',
    postCount: 28,
    parentId: undefined,
    children: [],
  },
];

const sampleTags = [
  { id: 't1', name: 'React', slug: 'react', color: '#61dafb', postCount: 42, description: 'React.js framework', createdAt: new Date('2024-01-15') },
  { id: 't2', name: 'TypeScript', slug: 'typescript', color: '#3178c6', postCount: 38, description: 'TypeScript language', createdAt: new Date('2024-01-20') },
  { id: 't3', name: 'Rust', slug: 'rust', color: '#dea584', postCount: 25, description: 'Rust programming', createdAt: new Date('2024-02-10') },
  { id: 't4', name: 'JavaScript', slug: 'javascript', color: '#f7df1e', postCount: 55, description: 'JavaScript language', createdAt: new Date('2024-01-05') },
  { id: 't5', name: 'CSS', slug: 'css', color: '#264de4', postCount: 30, description: 'Cascading Style Sheets', createdAt: new Date('2024-01-25') },
  { id: 't6', name: 'Node.js', slug: 'nodejs', color: '#339933', postCount: 28, description: 'Node.js runtime', createdAt: new Date('2024-02-01') },
  { id: 't7', name: 'GraphQL', slug: 'graphql', color: '#e10098', postCount: 15, description: 'GraphQL API', createdAt: new Date('2024-02-15') },
  { id: 't8', name: 'Docker', slug: 'docker', color: '#2496ed', postCount: 20, description: 'Docker containers', createdAt: new Date('2024-02-20') },
  { id: 't9', name: 'AWS', slug: 'aws', color: '#ff9900', postCount: 18, description: 'Amazon Web Services', createdAt: new Date('2024-03-01') },
  { id: 't10', name: 'PostgreSQL', slug: 'postgresql', color: '#336791', postCount: 12, description: 'PostgreSQL database', createdAt: new Date('2024-03-05') },
  { id: 't11', name: 'Tutorial', slug: 'tutorial', color: '#22c55e', postCount: 65, description: 'Tutorial content', createdAt: new Date('2024-01-01') },
  { id: 't12', name: 'Best Practices', slug: 'best-practices', color: '#eab308', postCount: 35, description: 'Best practices and patterns', createdAt: new Date('2024-01-10') },
];

const sampleTaxonomies = [
  {
    id: 'tax-1',
    name: 'Content Type',
    slug: 'content-type',
    type: 'hierarchical' as const,
    description: 'Type of content',
    postTypes: ['post', 'page'],
    fields: [
      { id: 'f1', name: 'Name', slug: 'name', type: 'text' as const, required: true },
      { id: 'f2', name: 'Icon', slug: 'icon', type: 'text' as const, required: false },
    ],
    termCount: 8,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-03-01'),
  },
  {
    id: 'tax-2',
    name: 'Difficulty Level',
    slug: 'difficulty-level',
    type: 'flat' as const,
    description: 'Content difficulty rating',
    postTypes: ['post', 'tutorial'],
    fields: [
      { id: 'f3', name: 'Name', slug: 'name', type: 'text' as const, required: true },
      { id: 'f4', name: 'Color', slug: 'color', type: 'color' as const, required: false },
    ],
    termCount: 4,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-10'),
  },
];

const sampleRelatedContent = [
  {
    id: 'c1',
    title: 'Getting Started with React Hooks',
    type: 'post' as const,
    status: 'published' as const,
    excerpt: 'Learn the fundamentals of React Hooks and how to use them effectively.',
    thumbnail: '',
    author: { id: '1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=john' },
    publishedAt: new Date('2024-03-01'),
    categories: ['Technology', 'Web Development'],
    tags: ['React', 'JavaScript'],
    url: '/blog/react-hooks-guide',
  },
  {
    id: 'c2',
    title: 'TypeScript Best Practices',
    type: 'post' as const,
    status: 'published' as const,
    excerpt: 'Discover the best practices for writing maintainable TypeScript code.',
    thumbnail: '',
    author: { id: '2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?u=jane' },
    publishedAt: new Date('2024-02-28'),
    categories: ['Technology', 'Web Development'],
    tags: ['TypeScript', 'JavaScript'],
    url: '/blog/typescript-best-practices',
  },
  {
    id: 'c3',
    title: 'Building Modern Web Apps',
    type: 'page' as const,
    status: 'published' as const,
    excerpt: 'A comprehensive guide to building modern web applications.',
    thumbnail: '',
    author: { id: '1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=john' },
    publishedAt: new Date('2024-02-20'),
    categories: ['Technology'],
    tags: ['React', 'TypeScript', 'Node.js'],
    url: '/guides/modern-web-apps',
  },
];

const sampleSeries = [
  {
    id: 's1',
    title: 'React Masterclass',
    slug: 'react-masterclass',
    description: 'A comprehensive series covering everything from React basics to advanced patterns.',
    status: 'active' as const,
    thumbnail: '',
    posts: [
      { id: 'p1', title: 'Introduction to React', position: 0, status: 'published' as const, publishedAt: new Date('2024-01-15'), wordCount: 1500 },
      { id: 'p2', title: 'React Components Deep Dive', position: 1, status: 'published' as const, publishedAt: new Date('2024-01-22'), wordCount: 2000 },
      { id: 'p3', title: 'State Management Patterns', position: 2, status: 'published' as const, publishedAt: new Date('2024-01-29'), wordCount: 1800 },
      { id: 'p4', title: 'React Performance Optimization', position: 3, status: 'draft' as const, wordCount: 2200 },
      { id: 'p5', title: 'Testing React Applications', position: 4, status: 'draft' as const, wordCount: 1600 },
    ],
    totalParts: 5,
    publishedParts: 3,
    author: { id: '1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=john' },
    startDate: new Date('2024-01-15'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-03-01'),
    views: 15420,
    subscribers: 342,
  },
  {
    id: 's2',
    title: 'Rust for Web Developers',
    slug: 'rust-for-web-developers',
    description: 'Learn Rust from a web development perspective.',
    status: 'active' as const,
    thumbnail: '',
    posts: [
      { id: 'p6', title: 'Why Rust for Web?', position: 0, status: 'published' as const, publishedAt: new Date('2024-02-01'), wordCount: 1200 },
      { id: 'p7', title: 'Setting Up Your Environment', position: 1, status: 'published' as const, publishedAt: new Date('2024-02-08'), wordCount: 900 },
      { id: 'p8', title: 'Building Your First API', position: 2, status: 'draft' as const, wordCount: 2500 },
    ],
    totalParts: 8,
    publishedParts: 2,
    author: { id: '2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?u=jane' },
    startDate: new Date('2024-02-01'),
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-02-15'),
    views: 8320,
    subscribers: 156,
  },
  {
    id: 's3',
    title: 'Docker Fundamentals',
    slug: 'docker-fundamentals',
    description: 'Everything you need to know about Docker containerization.',
    status: 'completed' as const,
    thumbnail: '',
    posts: [
      { id: 'p9', title: 'What is Docker?', position: 0, status: 'published' as const, publishedAt: new Date('2023-11-01'), wordCount: 1000 },
      { id: 'p10', title: 'Docker Images and Containers', position: 1, status: 'published' as const, publishedAt: new Date('2023-11-08'), wordCount: 1500 },
      { id: 'p11', title: 'Docker Compose', position: 2, status: 'published' as const, publishedAt: new Date('2023-11-15'), wordCount: 1800 },
    ],
    totalParts: 3,
    publishedParts: 3,
    author: { id: '3', name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?u=mike' },
    startDate: new Date('2023-11-01'),
    endDate: new Date('2023-11-15'),
    createdAt: new Date('2023-10-25'),
    updatedAt: new Date('2023-11-15'),
    views: 24560,
    subscribers: 0,
  },
];

const sampleArchiveItems = [
  {
    id: 'a1',
    title: 'Getting Started with React 18',
    slug: 'getting-started-react-18',
    type: 'post' as const,
    status: 'published' as const,
    author: { id: '1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=john' },
    publishedAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15'),
    categories: ['Technology', 'Web Development'],
    tags: ['React', 'JavaScript'],
    views: 2450,
    comments: 23,
    wordCount: 1500,
  },
  {
    id: 'a2',
    title: 'TypeScript 5.0 Features',
    slug: 'typescript-5-features',
    type: 'post' as const,
    status: 'published' as const,
    author: { id: '2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?u=jane' },
    publishedAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-12'),
    categories: ['Technology'],
    tags: ['TypeScript'],
    views: 1820,
    comments: 15,
    wordCount: 2200,
  },
  {
    id: 'a3',
    title: 'Building a REST API with Rust',
    slug: 'rest-api-rust',
    type: 'tutorial' as const,
    status: 'published' as const,
    author: { id: '1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=john' },
    publishedAt: new Date('2024-02-28'),
    updatedAt: new Date('2024-03-01'),
    categories: ['Technology', 'Backend'],
    tags: ['Rust', 'API'],
    views: 3100,
    comments: 42,
    wordCount: 3500,
  },
  {
    id: 'a4',
    title: 'Docker Best Practices',
    slug: 'docker-best-practices',
    type: 'post' as const,
    status: 'draft' as const,
    author: { id: '3', name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?u=mike' },
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-25'),
    categories: ['Technology', 'DevOps'],
    tags: ['Docker', 'Best Practices'],
    views: 0,
    comments: 0,
    wordCount: 1800,
  },
  {
    id: 'a5',
    title: 'Introduction to GraphQL',
    slug: 'intro-graphql',
    type: 'post' as const,
    status: 'published' as const,
    author: { id: '2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?u=jane' },
    publishedAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    categories: ['Technology', 'Web Development'],
    tags: ['GraphQL', 'API'],
    views: 4200,
    comments: 35,
    wordCount: 2000,
  },
  {
    id: 'a6',
    title: 'AWS Lambda Tutorial',
    slug: 'aws-lambda-tutorial',
    type: 'tutorial' as const,
    status: 'archived' as const,
    author: { id: '1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?u=john' },
    publishedAt: new Date('2023-11-20'),
    updatedAt: new Date('2024-01-10'),
    archivedAt: new Date('2024-01-10'),
    categories: ['Technology', 'Cloud'],
    tags: ['AWS', 'Lambda', 'Serverless'],
    views: 8500,
    comments: 67,
    wordCount: 4000,
  },
];

// ============================================================================
// TAB CONTENT COMPONENTS
// ============================================================================

const CategoryManagerDemo: React.FC = () => (
  <div style={styles.section}>
    <h3 style={styles.sectionTitle}>
      Category Manager
      <span style={styles.badge}>Component 37</span>
    </h3>
    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
      Hierarchical category management with drag-and-drop organization, color coding, and parent-child relationships.
    </p>
    <CategoryManagerProvider
      initialCategories={sampleCategories}
      onCategoryCreate={(category) => console.log('Category created:', category)}
      onCategoryUpdate={(category) => console.log('Category updated:', category)}
      onCategoryDelete={(id) => console.log('Category deleted:', id)}
      onCategoryMove={(id, newParentId) => console.log('Category moved:', id, 'to', newParentId)}
    >
      <CategoryManager />
    </CategoryManagerProvider>
  </div>
);

const TagManagerDemo: React.FC = () => (
  <div style={styles.section}>
    <h3 style={styles.sectionTitle}>
      Tag Manager
      <span style={styles.badge}>Component 38</span>
    </h3>
    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
      Tag management with list, cloud, and grid views. Features bulk operations, tag merging, and similar tag detection.
    </p>
    <TagManagerProvider
      initialTags={sampleTags}
      onTagCreate={(tag) => console.log('Tag created:', tag)}
      onTagUpdate={(tag) => console.log('Tag updated:', tag)}
      onTagDelete={(id) => console.log('Tag deleted:', id)}
      onTagMerge={(sourceIds, targetId) => console.log('Tags merged:', sourceIds, 'into', targetId)}
    >
      <TagManager />
    </TagManagerProvider>
  </div>
);

const TaxonomyBuilderDemo: React.FC = () => (
  <div style={styles.section}>
    <h3 style={styles.sectionTitle}>
      Taxonomy Builder
      <span style={styles.badge}>Component 39</span>
    </h3>
    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
      Create custom taxonomies with field builder, post type associations, and advanced settings.
    </p>
    <TaxonomyBuilderProvider
      initialTaxonomies={sampleTaxonomies}
      availablePostTypes={['post', 'page', 'tutorial', 'product']}
      onTaxonomyCreate={(taxonomy) => console.log('Taxonomy created:', taxonomy)}
      onTaxonomyUpdate={(taxonomy) => console.log('Taxonomy updated:', taxonomy)}
      onTaxonomyDelete={(id) => console.log('Taxonomy deleted:', id)}
    >
      <TaxonomyBuilder />
    </TaxonomyBuilderProvider>
  </div>
);

const ContentRelationsDemo: React.FC = () => (
  <div style={styles.section}>
    <h3 style={styles.sectionTitle}>
      Content Relations
      <span style={styles.badge}>Component 40</span>
    </h3>
    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
      Manage content relationships: related posts, parent-child, siblings, series, translations, and custom relations.
    </p>
    <ContentRelationsProvider
      currentContentId="current-post-123"
      currentContentTitle="Understanding React Hooks"
      availableContent={sampleRelatedContent}
      initialRelations={[
        { id: 'r1', contentId: 'c1', type: 'related', addedAt: new Date() },
        { id: 'r2', contentId: 'c2', type: 'related', addedAt: new Date() },
      ]}
      onRelationAdd={(relation) => console.log('Relation added:', relation)}
      onRelationRemove={(id) => console.log('Relation removed:', id)}
      onRelationTypeChange={(id, type) => console.log('Relation type changed:', id, type)}
    >
      <ContentRelations />
    </ContentRelationsProvider>
  </div>
);

const SeriesManagerDemo: React.FC = () => (
  <div style={styles.section}>
    <h3 style={styles.sectionTitle}>
      Series Manager
      <span style={styles.badge}>Component 41</span>
    </h3>
    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
      Manage multi-part content series with post ordering, settings, and engagement statistics.
    </p>
    <SeriesManagerProvider
      initialSeries={sampleSeries}
      onSeriesCreate={(series) => console.log('Series created:', series)}
      onSeriesUpdate={(series) => console.log('Series updated:', series)}
      onSeriesDelete={(id) => console.log('Series deleted:', id)}
      onPostReorder={(seriesId, posts) => console.log('Posts reordered:', seriesId, posts)}
    >
      <SeriesManager />
    </SeriesManagerProvider>
  </div>
);

const ArchiveOrganizerDemo: React.FC = () => (
  <div style={styles.section}>
    <h3 style={styles.sectionTitle}>
      Archive Organizer
      <span style={styles.badge}>Component 42</span>
    </h3>
    <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
      Content archive with grouping by year, month, category, author, or type. Features list, grid, and timeline views.
    </p>
    <ArchiveOrganizerProvider
      initialItems={sampleArchiveItems}
      onItemArchive={(id) => console.log('Item archived:', id)}
      onItemRestore={(id) => console.log('Item restored:', id)}
      onItemDelete={(id) => console.log('Item deleted:', id)}
      onBulkAction={(action, ids) => console.log('Bulk action:', action, ids)}
      onExport={(format, items) => console.log('Export:', format, items.length, 'items')}
    >
      <ArchiveOrganizer />
    </ArchiveOrganizerProvider>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

type TabId = 'categories' | 'tags' | 'taxonomies' | 'relations' | 'series' | 'archive';

interface Tab {
  id: TabId;
  label: string;
  component: React.FC;
}

const tabs: Tab[] = [
  { id: 'categories', label: 'Category Manager', component: CategoryManagerDemo },
  { id: 'tags', label: 'Tag Manager', component: TagManagerDemo },
  { id: 'taxonomies', label: 'Taxonomy Builder', component: TaxonomyBuilderDemo },
  { id: 'relations', label: 'Content Relations', component: ContentRelationsDemo },
  { id: 'series', label: 'Series Manager', component: SeriesManagerDemo },
  { id: 'archive', label: 'Archive Organizer', component: ArchiveOrganizerDemo },
];

const OrganizationTaxonomyDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('categories');

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component || CategoryManagerDemo;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <header style={styles.header}>
          <h1 style={styles.title}>Organization & Taxonomy Components</h1>
          <p style={styles.subtitle}>
            Content organization, categorization, and taxonomy management tools (Components 37-42)
          </p>
        </header>

        <nav style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.activeTab : {}),
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrganizationTaxonomyDemo;
