import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout,
  FileText,
  Columns,
  PanelLeft,
  PanelRight,
  Square,
  Maximize2,
  Grid,
  Image,
  ShoppingBag,
  User,
  Mail,
  Search,
  Star,
  Check,
  Eye,
  Settings,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import clsx from 'clsx';

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: 'basic' | 'blog' | 'commerce' | 'portfolio' | 'landing' | 'utility';
  layout: {
    hasHeader: boolean;
    hasFooter: boolean;
    hasSidebar: 'none' | 'left' | 'right' | 'both';
    contentWidth: 'full' | 'contained' | 'narrow';
  };
  sections: string[];
  isDefault?: boolean;
  isPremium?: boolean;
}

interface Theme {
  id: string;
  name: string;
  version: string;
  templates: PageTemplate[];
}

interface PageTemplateSelectorProps {
  currentTheme?: Theme;
  onSelectTemplate?: (template: PageTemplate) => void;
  selectedTemplateId?: string;
  className?: string;
}

const defaultTheme: Theme = {
  id: 'rustpress-developer',
  name: 'Developer Theme',
  version: '1.0.0',
  templates: [
    {
      id: 'empty',
      name: 'Empty Page',
      description: 'A blank canvas with no predefined sections. Build your page from scratch.',
      thumbnail: '/templates/empty.png',
      category: 'basic',
      layout: { hasHeader: false, hasFooter: false, hasSidebar: 'none', contentWidth: 'full' },
      sections: [],
      isDefault: true
    },
    {
      id: 'default',
      name: 'Default Page',
      description: 'Standard page layout with header, footer, and content area.',
      thumbnail: '/templates/default.png',
      category: 'basic',
      layout: { hasHeader: true, hasFooter: true, hasSidebar: 'none', contentWidth: 'contained' },
      sections: ['header', 'content', 'footer']
    },
    {
      id: 'sidebar-left',
      name: 'Left Sidebar',
      description: 'Page with left sidebar for navigation or widgets.',
      thumbnail: '/templates/sidebar-left.png',
      category: 'basic',
      layout: { hasHeader: true, hasFooter: true, hasSidebar: 'left', contentWidth: 'contained' },
      sections: ['header', 'sidebar', 'content', 'footer']
    },
    {
      id: 'sidebar-right',
      name: 'Right Sidebar',
      description: 'Page with right sidebar for related content or ads.',
      thumbnail: '/templates/sidebar-right.png',
      category: 'basic',
      layout: { hasHeader: true, hasFooter: true, hasSidebar: 'right', contentWidth: 'contained' },
      sections: ['header', 'content', 'sidebar', 'footer']
    },
    {
      id: 'full-width',
      name: 'Full Width',
      description: 'Edge-to-edge content area for immersive experiences.',
      thumbnail: '/templates/full-width.png',
      category: 'basic',
      layout: { hasHeader: true, hasFooter: true, hasSidebar: 'none', contentWidth: 'full' },
      sections: ['header', 'content', 'footer']
    },
    {
      id: 'landing-page',
      name: 'Landing Page',
      description: 'Conversion-focused layout with hero, features, testimonials, and CTA.',
      thumbnail: '/templates/landing.png',
      category: 'landing',
      layout: { hasHeader: true, hasFooter: true, hasSidebar: 'none', contentWidth: 'full' },
      sections: ['header', 'hero', 'features', 'testimonials', 'cta', 'footer']
    },
    {
      id: 'blog-post',
      name: 'Blog Post',
      description: 'Optimized for readability with author info and related posts.',
      thumbnail: '/templates/blog-post.png',
      category: 'blog',
      layout: { hasHeader: true, hasFooter: true, hasSidebar: 'right', contentWidth: 'narrow' },
      sections: ['header', 'featured-image', 'content', 'author', 'related', 'comments', 'footer']
    },
    {
      id: 'blog-archive',
      name: 'Blog Archive',
      description: 'Grid or list view for blog post listings with filters.',
      thumbnail: '/templates/blog-archive.png',
      category: 'blog',
      layout: { hasHeader: true, hasFooter: true, hasSidebar: 'left', contentWidth: 'contained' },
      sections: ['header', 'filters', 'post-grid', 'pagination', 'footer']
    },
    {
      id: 'portfolio',
      name: 'Portfolio',
      description: 'Showcase your work with a masonry grid layout.',
      thumbnail: '/templates/portfolio.png',
      category: 'portfolio',
      layout: { hasHeader: true, hasFooter: true, hasSidebar: 'none', contentWidth: 'full' },
      sections: ['header', 'portfolio-grid', 'footer']
    },
    {
      id: 'portfolio-single',
      name: 'Portfolio Single',
      description: 'Detailed project page with gallery and description.',
      thumbnail: '/templates/portfolio-single.png',
      category: 'portfolio',
      layout: { hasHeader: true, hasFooter: true, hasSidebar: 'none', contentWidth: 'contained' },
      sections: ['header', 'gallery', 'project-info', 'related-projects', 'footer']
    },
    {
      id: 'shop',
      name: 'Shop Page',
      description: 'E-commerce product listing with filters and sorting.',
      thumbnail: '/templates/shop.png',
      category: 'commerce',
      layout: { hasHeader: true, hasFooter: true, hasSidebar: 'left', contentWidth: 'full' },
      sections: ['header', 'filters', 'product-grid', 'pagination', 'footer'],
      isPremium: true
    },
    {
      id: 'product',
      name: 'Product Page',
      description: 'Single product page with gallery, details, and reviews.',
      thumbnail: '/templates/product.png',
      category: 'commerce',
      layout: { hasHeader: true, hasFooter: true, hasSidebar: 'none', contentWidth: 'contained' },
      sections: ['header', 'product-gallery', 'product-info', 'tabs', 'related', 'footer'],
      isPremium: true
    },
    {
      id: 'contact',
      name: 'Contact Page',
      description: 'Contact form with map and company information.',
      thumbnail: '/templates/contact.png',
      category: 'utility',
      layout: { hasHeader: true, hasFooter: true, hasSidebar: 'none', contentWidth: 'contained' },
      sections: ['header', 'contact-info', 'form', 'map', 'footer']
    },
    {
      id: 'about',
      name: 'About Page',
      description: 'Team, mission, and company story layout.',
      thumbnail: '/templates/about.png',
      category: 'utility',
      layout: { hasHeader: true, hasFooter: true, hasSidebar: 'none', contentWidth: 'contained' },
      sections: ['header', 'hero', 'story', 'team', 'values', 'footer']
    },
    {
      id: 'search-results',
      name: 'Search Results',
      description: 'Display search results with filters.',
      thumbnail: '/templates/search.png',
      category: 'utility',
      layout: { hasHeader: true, hasFooter: true, hasSidebar: 'left', contentWidth: 'contained' },
      sections: ['header', 'search-bar', 'filters', 'results', 'pagination', 'footer']
    },
    {
      id: '404',
      name: '404 Error',
      description: 'Custom 404 page with search and navigation.',
      thumbnail: '/templates/404.png',
      category: 'utility',
      layout: { hasHeader: true, hasFooter: true, hasSidebar: 'none', contentWidth: 'narrow' },
      sections: ['header', 'error-message', 'search', 'footer']
    }
  ]
};

const categoryIcons: Record<string, React.ElementType> = {
  basic: Layout,
  blog: FileText,
  commerce: ShoppingBag,
  portfolio: Image,
  landing: Sparkles,
  utility: Settings
};

const categoryLabels: Record<string, string> = {
  basic: 'Basic Layouts',
  blog: 'Blog Templates',
  commerce: 'E-Commerce',
  portfolio: 'Portfolio',
  landing: 'Landing Pages',
  utility: 'Utility Pages'
};

export const PageTemplateSelector: React.FC<PageTemplateSelectorProps> = ({
  currentTheme = defaultTheme,
  onSelectTemplate,
  selectedTemplateId,
  className
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<PageTemplate | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = ['all', ...new Set(currentTheme.templates.map(t => t.category))];

  const filteredTemplates = activeCategory === 'all'
    ? currentTheme.templates
    : currentTheme.templates.filter(t => t.category === activeCategory);

  const getLayoutIcon = (template: PageTemplate) => {
    if (template.layout.hasSidebar === 'left') return PanelLeft;
    if (template.layout.hasSidebar === 'right') return PanelRight;
    if (template.layout.hasSidebar === 'both') return Columns;
    if (template.layout.contentWidth === 'full') return Maximize2;
    return Square;
  };

  const renderLayoutPreview = (template: PageTemplate) => {
    return (
      <div className="w-full h-24 bg-gray-100 dark:bg-gray-800 rounded border-2 border-dashed border-gray-300 dark:border-gray-600 p-2 flex flex-col">
        {template.layout.hasHeader && (
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-1" />
        )}
        <div className="flex-1 flex gap-1">
          {template.layout.hasSidebar === 'left' && (
            <div className="w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
          )}
          {template.layout.hasSidebar === 'both' && (
            <div className="w-1/5 bg-gray-200 dark:bg-gray-700 rounded" />
          )}
          <div className={clsx(
            'bg-blue-100 dark:bg-blue-900/30 rounded flex-1',
            template.layout.contentWidth === 'narrow' && 'mx-4'
          )} />
          {template.layout.hasSidebar === 'right' && (
            <div className="w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
          )}
          {template.layout.hasSidebar === 'both' && (
            <div className="w-1/5 bg-gray-200 dark:bg-gray-700 rounded" />
          )}
        </div>
        {template.layout.hasFooter && (
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mt-1" />
        )}
      </div>
    );
  };

  return (
    <div className={clsx('bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
            <Layout size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Choose Page Template</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Theme: {currentTheme.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={clsx('p-2 rounded-lg', viewMode === 'grid' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700')}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={clsx('p-2 rounded-lg', viewMode === 'list' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700')}
          >
            <FileText size={18} />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 p-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {categories.map(category => {
          const Icon = category === 'all' ? Grid : categoryIcons[category] || Layout;
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                activeCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              )}
            >
              <Icon size={16} />
              {category === 'all' ? 'All Templates' : categoryLabels[category] || category}
            </button>
          );
        })}
      </div>

      {/* Templates Grid/List */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        <div className={clsx(
          viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-3'
        )}>
          {filteredTemplates.map((template, idx) => {
            const LayoutIcon = getLayoutIcon(template);
            const isSelected = selectedTemplateId === template.id;

            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onSelectTemplate?.(template)}
                className={clsx(
                  'relative group cursor-pointer rounded-xl border-2 overflow-hidden transition-all',
                  isSelected
                    ? 'border-indigo-500 ring-2 ring-indigo-200'
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300',
                  viewMode === 'list' && 'flex items-center gap-4 p-4'
                )}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Layout Preview */}
                    <div className="p-3">
                      {renderLayoutPreview(template)}
                    </div>

                    {/* Info */}
                    <div className="p-3 pt-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white">{template.name}</h4>
                        {template.isDefault && (
                          <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded">Default</span>
                        )}
                        {template.isPremium && (
                          <Star size={14} className="text-amber-500 fill-amber-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{template.description}</p>
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                        <Check size={14} className="text-white" />
                      </div>
                    )}

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTemplate(template);
                        }}
                        className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium flex items-center gap-1 text-gray-700"
                      >
                        <Eye size={14} />
                        Preview
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTemplate?.(template);
                        }}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-indigo-700"
                      >
                        <Check size={14} />
                        Apply
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-32 flex-shrink-0">
                      {renderLayoutPreview(template)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                        {template.isDefault && (
                          <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">Default</span>
                        )}
                        {template.isPremium && (
                          <Star size={14} className="text-amber-500 fill-amber-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{template.description}</p>
                      <div className="flex gap-2 text-xs text-gray-400 dark:text-gray-500">
                        <span>{template.sections.length} sections</span>
                        <span>•</span>
                        <span className="capitalize">{template.layout.contentWidth} width</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTemplate(template);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400"
                        title="Preview"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTemplate?.(template);
                        }}
                        className={clsx(
                          'px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1',
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900'
                        )}
                      >
                        <Check size={14} />
                        {isSelected ? 'Applied' : 'Apply'}
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{previewTemplate.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{previewTemplate.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      onSelectTemplate?.(previewTemplate);
                      setPreviewTemplate(null);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Use Template
                  </button>
                </div>

                {/* Large Layout Preview */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 mb-6">
                  <div className="max-w-2xl mx-auto">
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
                      {previewTemplate.layout.hasHeader && (
                        <div className="h-12 bg-gray-800 flex items-center px-4">
                          <div className="w-24 h-4 bg-gray-600 rounded" />
                          <div className="flex-1" />
                          <div className="flex gap-4">
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} className="w-12 h-3 bg-gray-600 rounded" />
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex min-h-[300px]">
                        {(previewTemplate.layout.hasSidebar === 'left' || previewTemplate.layout.hasSidebar === 'both') && (
                          <div className="w-48 bg-gray-100 dark:bg-gray-800 p-4 border-r">
                            <div className="space-y-2">
                              {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-3 bg-gray-300 dark:bg-gray-600 rounded" style={{ width: `${70 + Math.random() * 30}%` }} />
                              ))}
                            </div>
                          </div>
                        )}
                        <div className={clsx('flex-1 p-6', previewTemplate.layout.contentWidth === 'narrow' && 'max-w-2xl mx-auto')}>
                          <div className="space-y-4">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded" />
                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-5/6" />
                            <div className="h-32 bg-blue-100 dark:bg-blue-900/30 rounded" />
                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded" />
                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-4/5" />
                          </div>
                        </div>
                        {(previewTemplate.layout.hasSidebar === 'right' || previewTemplate.layout.hasSidebar === 'both') && (
                          <div className="w-48 bg-gray-100 dark:bg-gray-800 p-4 border-l">
                            <div className="space-y-3">
                              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
                              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded" />
                              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-4/5" />
                            </div>
                          </div>
                        )}
                      </div>
                      {previewTemplate.layout.hasFooter && (
                        <div className="h-24 bg-gray-800 p-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="w-20 h-4 bg-gray-600 rounded" />
                              <div className="w-32 h-3 bg-gray-700 rounded" />
                            </div>
                            <div className="flex gap-8">
                              {[1, 2, 3].map(i => (
                                <div key={i} className="space-y-2">
                                  <div className="w-16 h-3 bg-gray-600 rounded" />
                                  <div className="w-12 h-2 bg-gray-700 rounded" />
                                  <div className="w-14 h-2 bg-gray-700 rounded" />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sections */}
                <div>
                  <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Included Sections</h4>
                  <div className="flex flex-wrap gap-2">
                    {previewTemplate.sections.map(section => (
                      <span key={section} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm capitalize text-gray-700 dark:text-gray-300">
                        {section.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PageTemplateSelector;
