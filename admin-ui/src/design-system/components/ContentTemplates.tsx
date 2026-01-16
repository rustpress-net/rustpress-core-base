import React, { useState, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// CONTENT TEMPLATES - COMPONENT 9 OF 10 (POST EDITOR ENHANCEMENTS)
// Pre-defined post structures, custom templates, template management
// ============================================================================

// Types
export type TemplateCategory = 'blog' | 'news' | 'tutorial' | 'review' | 'listicle' | 'custom';

export interface TemplateBlock {
  type: string;
  content: string;
  placeholder?: string;
  required?: boolean;
  data?: Record<string, any>;
}

export interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  icon: string;
  thumbnail?: string;
  blocks: TemplateBlock[];
  tags: string[];
  isCustom: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  usageCount: number;
}

export interface ContentTemplatesConfig {
  enableCustomTemplates: boolean;
  showTemplateCategories: boolean;
  recentTemplates: string[];
  favoriteTemplates: string[];
}

interface ContentTemplatesContextValue {
  templates: ContentTemplate[];
  config: ContentTemplatesConfig;
  addTemplate: (template: Omit<ContentTemplate, 'id' | 'usageCount' | 'createdAt'>) => string;
  updateTemplate: (id: string, updates: Partial<ContentTemplate>) => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => string;
  applyTemplate: (id: string) => TemplateBlock[];
  toggleFavorite: (id: string) => void;
  searchTemplates: (query: string) => ContentTemplate[];
  getTemplatesByCategory: (category: TemplateCategory) => ContentTemplate[];
  updateConfig: (config: Partial<ContentTemplatesConfig>) => void;
}

// Default templates
const defaultTemplates: ContentTemplate[] = [
  {
    id: 'blog-standard',
    name: 'Standard Blog Post',
    description: 'A classic blog post structure with introduction, body, and conclusion',
    category: 'blog',
    icon: '📝',
    blocks: [
      { type: 'heading', content: '', placeholder: 'Your Compelling Title Here', required: true, data: { level: 1 } },
      { type: 'paragraph', content: '', placeholder: 'Write an engaging introduction that hooks your readers...', required: true },
      { type: 'heading', content: 'Main Point 1', placeholder: 'First Main Point', data: { level: 2 } },
      { type: 'paragraph', content: '', placeholder: 'Elaborate on your first main point...' },
      { type: 'heading', content: 'Main Point 2', placeholder: 'Second Main Point', data: { level: 2 } },
      { type: 'paragraph', content: '', placeholder: 'Elaborate on your second main point...' },
      { type: 'heading', content: 'Conclusion', data: { level: 2 } },
      { type: 'paragraph', content: '', placeholder: 'Wrap up your post with a strong conclusion and call-to-action...' },
    ],
    tags: ['blog', 'article', 'standard'],
    isCustom: false,
    usageCount: 0,
  },
  {
    id: 'how-to-guide',
    name: 'How-To Guide',
    description: 'Step-by-step tutorial with numbered instructions',
    category: 'tutorial',
    icon: '📚',
    blocks: [
      { type: 'heading', content: '', placeholder: 'How to [Achieve Something]', required: true, data: { level: 1 } },
      { type: 'paragraph', content: '', placeholder: 'Brief introduction explaining what readers will learn...' },
      { type: 'callout', content: '', placeholder: 'What you\'ll need: List prerequisites here...', data: { emoji: '📋', type: 'info' } },
      { type: 'heading', content: 'Step 1: Getting Started', data: { level: 2 } },
      { type: 'paragraph', content: '', placeholder: 'Describe the first step in detail...' },
      { type: 'heading', content: 'Step 2: [Next Step]', data: { level: 2 } },
      { type: 'paragraph', content: '', placeholder: 'Describe the second step...' },
      { type: 'heading', content: 'Step 3: [Final Step]', data: { level: 2 } },
      { type: 'paragraph', content: '', placeholder: 'Describe the final step...' },
      { type: 'callout', content: '', placeholder: 'Pro tip: Share an expert tip here...', data: { emoji: '💡', type: 'success' } },
      { type: 'heading', content: 'Conclusion', data: { level: 2 } },
      { type: 'paragraph', content: '', placeholder: 'Summarize what was learned and encourage next steps...' },
    ],
    tags: ['tutorial', 'how-to', 'guide', 'step-by-step'],
    isCustom: false,
    usageCount: 0,
  },
  {
    id: 'product-review',
    name: 'Product Review',
    description: 'Comprehensive product review with pros, cons, and rating',
    category: 'review',
    icon: '⭐',
    blocks: [
      { type: 'heading', content: '', placeholder: '[Product Name] Review: [Brief Summary]', required: true, data: { level: 1 } },
      { type: 'paragraph', content: '', placeholder: 'Quick introduction about the product and your experience...' },
      { type: 'image', content: '', placeholder: 'Add product image', data: { caption: 'Product photo' } },
      { type: 'heading', content: 'Overview', data: { level: 2 } },
      { type: 'paragraph', content: '', placeholder: 'General overview of the product, its purpose, and target audience...' },
      { type: 'heading', content: 'Key Features', data: { level: 2 } },
      { type: 'list', content: 'Feature 1\nFeature 2\nFeature 3', data: { type: 'bullet' } },
      { type: 'heading', content: 'Pros', data: { level: 2 } },
      { type: 'callout', content: '', placeholder: '✅ List the pros here...', data: { emoji: '👍', type: 'success' } },
      { type: 'heading', content: 'Cons', data: { level: 2 } },
      { type: 'callout', content: '', placeholder: '❌ List the cons here...', data: { emoji: '👎', type: 'error' } },
      { type: 'heading', content: 'Final Verdict', data: { level: 2 } },
      { type: 'paragraph', content: '', placeholder: 'Your final thoughts and recommendation...' },
    ],
    tags: ['review', 'product', 'rating'],
    isCustom: false,
    usageCount: 0,
  },
  {
    id: 'listicle',
    name: 'Listicle',
    description: 'Numbered list article format (Top 10, Best X, etc.)',
    category: 'listicle',
    icon: '📋',
    blocks: [
      { type: 'heading', content: '', placeholder: 'Top [X] [Things/Tips/Ways] to [Achieve Goal]', required: true, data: { level: 1 } },
      { type: 'paragraph', content: '', placeholder: 'Brief introduction setting up the list...' },
      { type: 'heading', content: '1. [First Item]', data: { level: 2 } },
      { type: 'paragraph', content: '', placeholder: 'Explain the first item...' },
      { type: 'heading', content: '2. [Second Item]', data: { level: 2 } },
      { type: 'paragraph', content: '', placeholder: 'Explain the second item...' },
      { type: 'heading', content: '3. [Third Item]', data: { level: 2 } },
      { type: 'paragraph', content: '', placeholder: 'Explain the third item...' },
      { type: 'heading', content: '4. [Fourth Item]', data: { level: 2 } },
      { type: 'paragraph', content: '', placeholder: 'Explain the fourth item...' },
      { type: 'heading', content: '5. [Fifth Item]', data: { level: 2 } },
      { type: 'paragraph', content: '', placeholder: 'Explain the fifth item...' },
      { type: 'heading', content: 'Conclusion', data: { level: 2 } },
      { type: 'paragraph', content: '', placeholder: 'Wrap up the list with key takeaways...' },
    ],
    tags: ['listicle', 'top', 'list', 'best'],
    isCustom: false,
    usageCount: 0,
  },
  {
    id: 'news-article',
    name: 'News Article',
    description: 'Journalistic style with lead, body, and quotes',
    category: 'news',
    icon: '📰',
    blocks: [
      { type: 'heading', content: '', placeholder: 'News Headline: Clear, Concise, Compelling', required: true, data: { level: 1 } },
      { type: 'paragraph', content: '', placeholder: 'Lead paragraph: Who, What, When, Where, Why (most important info first)...', required: true },
      { type: 'paragraph', content: '', placeholder: 'Additional context and background information...' },
      { type: 'quote', content: '', placeholder: '"Direct quote from a relevant source" - Source Name, Title' },
      { type: 'paragraph', content: '', placeholder: 'More details and supporting information...' },
      { type: 'quote', content: '', placeholder: '"Another perspective or quote" - Another Source' },
      { type: 'paragraph', content: '', placeholder: 'Closing paragraph with next steps or future outlook...' },
    ],
    tags: ['news', 'article', 'journalism', 'press'],
    isCustom: false,
    usageCount: 0,
  },
  {
    id: 'case-study',
    name: 'Case Study',
    description: 'Problem, solution, and results format for case studies',
    category: 'blog',
    icon: '📊',
    blocks: [
      { type: 'heading', content: '', placeholder: 'Case Study: [Client/Project Name]', required: true, data: { level: 1 } },
      { type: 'paragraph', content: '', placeholder: 'Brief executive summary of the case study...' },
      { type: 'heading', content: 'The Challenge', data: { level: 2 } },
      { type: 'paragraph', content: '', placeholder: 'Describe the problem or challenge faced...' },
      { type: 'heading', content: 'The Solution', data: { level: 2 } },
      { type: 'paragraph', content: '', placeholder: 'Explain the approach and solution implemented...' },
      { type: 'heading', content: 'The Results', data: { level: 2 } },
      { type: 'paragraph', content: '', placeholder: 'Present the outcomes and metrics...' },
      { type: 'callout', content: '', placeholder: '📈 Key Metrics: List impressive results here...', data: { emoji: '📈', type: 'success' } },
      { type: 'heading', content: 'Key Takeaways', data: { level: 2 } },
      { type: 'list', content: 'Takeaway 1\nTakeaway 2\nTakeaway 3', data: { type: 'bullet' } },
    ],
    tags: ['case-study', 'business', 'results'],
    isCustom: false,
    usageCount: 0,
  },
];

const defaultConfig: ContentTemplatesConfig = {
  enableCustomTemplates: true,
  showTemplateCategories: true,
  recentTemplates: [],
  favoriteTemplates: [],
};

const ContentTemplatesContext = createContext<ContentTemplatesContextValue | null>(null);

// Helper to generate unique IDs
const generateId = () => `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============================================================================
// CONTENT TEMPLATES PROVIDER
// ============================================================================

interface ContentTemplatesProviderProps {
  children: React.ReactNode;
  initialTemplates?: ContentTemplate[];
  initialConfig?: Partial<ContentTemplatesConfig>;
}

export const ContentTemplatesProvider: React.FC<ContentTemplatesProviderProps> = ({
  children,
  initialTemplates,
  initialConfig,
}) => {
  const [templates, setTemplates] = useState<ContentTemplate[]>(
    initialTemplates || defaultTemplates
  );
  const [config, setConfig] = useState<ContentTemplatesConfig>({ ...defaultConfig, ...initialConfig });

  const addTemplate = useCallback((template: Omit<ContentTemplate, 'id' | 'usageCount' | 'createdAt'>): string => {
    const id = generateId();
    const newTemplate: ContentTemplate = {
      ...template,
      id,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTemplates(prev => [...prev, newTemplate]);
    return id;
  }, []);

  const updateTemplate = useCallback((id: string, updates: Partial<ContentTemplate>) => {
    setTemplates(prev => prev.map(t =>
      t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
    ));
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    setConfig(prev => ({
      ...prev,
      recentTemplates: prev.recentTemplates.filter(tid => tid !== id),
      favoriteTemplates: prev.favoriteTemplates.filter(tid => tid !== id),
    }));
  }, []);

  const duplicateTemplate = useCallback((id: string): string => {
    const template = templates.find(t => t.id === id);
    if (!template) return '';

    const newId = generateId();
    const newTemplate: ContentTemplate = {
      ...template,
      id: newId,
      name: `${template.name} (Copy)`,
      isCustom: true,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setTemplates(prev => [...prev, newTemplate]);
    return newId;
  }, [templates]);

  const applyTemplate = useCallback((id: string): TemplateBlock[] => {
    const template = templates.find(t => t.id === id);
    if (!template) return [];

    // Update usage count and recent templates
    setTemplates(prev => prev.map(t =>
      t.id === id ? { ...t, usageCount: t.usageCount + 1 } : t
    ));

    setConfig(prev => ({
      ...prev,
      recentTemplates: [id, ...prev.recentTemplates.filter(tid => tid !== id)].slice(0, 5),
    }));

    return template.blocks.map(block => ({ ...block }));
  }, [templates]);

  const toggleFavorite = useCallback((id: string) => {
    setConfig(prev => {
      const isFavorite = prev.favoriteTemplates.includes(id);
      return {
        ...prev,
        favoriteTemplates: isFavorite
          ? prev.favoriteTemplates.filter(tid => tid !== id)
          : [...prev.favoriteTemplates, id],
      };
    });
  }, []);

  const searchTemplates = useCallback((query: string): ContentTemplate[] => {
    if (!query.trim()) return templates;

    const normalizedQuery = query.toLowerCase();
    return templates.filter(t =>
      t.name.toLowerCase().includes(normalizedQuery) ||
      t.description.toLowerCase().includes(normalizedQuery) ||
      t.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))
    );
  }, [templates]);

  const getTemplatesByCategory = useCallback((category: TemplateCategory): ContentTemplate[] => {
    return templates.filter(t => t.category === category);
  }, [templates]);

  const updateConfig = useCallback((updates: Partial<ContentTemplatesConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const value: ContentTemplatesContextValue = {
    templates,
    config,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    applyTemplate,
    toggleFavorite,
    searchTemplates,
    getTemplatesByCategory,
    updateConfig,
  };

  return (
    <ContentTemplatesContext.Provider value={value}>
      {children}
    </ContentTemplatesContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useContentTemplates = (): ContentTemplatesContextValue => {
  const context = useContext(ContentTemplatesContext);
  if (!context) {
    throw new Error('useContentTemplates must be used within a ContentTemplatesProvider');
  }
  return context;
};

// ============================================================================
// TEMPLATE PICKER
// ============================================================================

interface TemplatePickerProps {
  onSelect: (blocks: TemplateBlock[]) => void;
  onClose?: () => void;
  className?: string;
}

export const TemplatePicker: React.FC<TemplatePickerProps> = ({
  onSelect,
  onClose,
  className = '',
}) => {
  const { templates, config, applyTemplate, toggleFavorite } = useContentTemplates();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all' | 'favorites' | 'recent'>('all');

  const categoryLabels: Record<TemplateCategory | 'all' | 'favorites' | 'recent', string> = {
    all: '📚 All Templates',
    favorites: '⭐ Favorites',
    recent: '🕐 Recent',
    blog: '📝 Blog',
    news: '📰 News',
    tutorial: '📚 Tutorial',
    review: '⭐ Review',
    listicle: '📋 Listicle',
    custom: '✨ Custom',
  };

  const getFilteredTemplates = (): ContentTemplate[] => {
    let filtered = templates;

    // Apply category filter
    if (selectedCategory === 'favorites') {
      filtered = templates.filter(t => config.favoriteTemplates.includes(t.id));
    } else if (selectedCategory === 'recent') {
      filtered = config.recentTemplates
        .map(id => templates.find(t => t.id === id))
        .filter(Boolean) as ContentTemplate[];
    } else if (selectedCategory !== 'all') {
      filtered = templates.filter(t => t.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.includes(query))
      );
    }

    return filtered;
  };

  const handleSelectTemplate = (templateId: string) => {
    const blocks = applyTemplate(templateId);
    onSelect(blocks);
    onClose?.();
  };

  const filteredTemplates = getFilteredTemplates();

  return (
    <div className={className} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#111827' }}>
            Choose a Template
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                border: 'none',
                background: 'none',
                fontSize: '24px',
                color: '#9ca3af',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
          }}
        />
      </div>

      {/* Categories */}
      <div style={{ padding: '12px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {(Object.keys(categoryLabels) as (TemplateCategory | 'all' | 'favorites' | 'recent')[]).map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 12px',
              border: selectedCategory === cat ? '2px solid #3b82f6' : '1px solid #e5e7eb',
              borderRadius: '20px',
              backgroundColor: selectedCategory === cat ? '#EFF6FF' : 'white',
              color: selectedCategory === cat ? '#3b82f6' : '#6b7280',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div style={{ padding: '24px', maxHeight: '400px', overflow: 'auto' }}>
        {filteredTemplates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📄</span>
            <p style={{ margin: 0 }}>No templates found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {filteredTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                isFavorite={config.favoriteTemplates.includes(template.id)}
                onSelect={() => handleSelectTemplate(template.id)}
                onToggleFavorite={() => toggleFavorite(template.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// TEMPLATE CARD
// ============================================================================

interface TemplateCardProps {
  template: ContentTemplate;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isFavorite,
  onSelect,
  onToggleFavorite,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease',
      }}
      onClick={onSelect}
    >
      {/* Preview */}
      <div style={{
        height: '120px',
        backgroundColor: '#f9fafb',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        <span style={{ fontSize: '48px' }}>{template.icon}</span>

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '32px',
            height: '32px',
            border: 'none',
            borderRadius: '50%',
            backgroundColor: 'white',
            color: isFavorite ? '#F59E0B' : '#d1d5db',
            cursor: 'pointer',
            fontSize: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: '#111827' }}>
          {template.name}
        </h3>
        <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#6b7280', lineHeight: 1.4 }}>
          {template.description}
        </p>

        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {template.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              style={{
                padding: '2px 8px',
                backgroundColor: '#f3f4f6',
                borderRadius: '4px',
                fontSize: '11px',
                color: '#6b7280',
              }}
            >
              {tag}
            </span>
          ))}
          {template.isCustom && (
            <span style={{
              padding: '2px 8px',
              backgroundColor: '#EFF6FF',
              borderRadius: '4px',
              fontSize: '11px',
              color: '#3b82f6',
            }}>
              Custom
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// TEMPLATE CREATOR
// ============================================================================

interface TemplateCreatorProps {
  initialBlocks?: TemplateBlock[];
  onSave: (template: Omit<ContentTemplate, 'id' | 'usageCount' | 'createdAt'>) => void;
  onCancel: () => void;
  className?: string;
}

export const TemplateCreator: React.FC<TemplateCreatorProps> = ({
  initialBlocks = [],
  onSave,
  onCancel,
  className = '',
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TemplateCategory>('custom');
  const [icon, setIcon] = useState('📄');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [blocks] = useState<TemplateBlock[]>(initialBlocks);

  const categoryOptions: { value: TemplateCategory; label: string }[] = [
    { value: 'blog', label: 'Blog' },
    { value: 'news', label: 'News' },
    { value: 'tutorial', label: 'Tutorial' },
    { value: 'review', label: 'Review' },
    { value: 'listicle', label: 'Listicle' },
    { value: 'custom', label: 'Custom' },
  ];

  const emojiOptions = ['📄', '📝', '📰', '📚', '⭐', '📋', '📊', '💡', '🎯', '🚀', '✨', '🔥'];

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      name: name.trim(),
      description: description.trim(),
      category,
      icon,
      blocks,
      tags,
      isCustom: true,
    });
  };

  return (
    <div className={className} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px' }}>
      <h2 style={{ margin: '0 0 24px 0', fontSize: '20px', fontWeight: 600, color: '#111827' }}>
        Create Template
      </h2>

      {/* Icon Picker */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
          Icon
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {emojiOptions.map(emoji => (
            <button
              key={emoji}
              onClick={() => setIcon(emoji)}
              style={{
                width: '40px',
                height: '40px',
                border: icon === emoji ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: icon === emoji ? '#EFF6FF' : 'white',
                fontSize: '20px',
                cursor: 'pointer',
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
          Template Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., My Blog Template"
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
          }}
        />
      </div>

      {/* Description */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe when to use this template..."
          rows={3}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            resize: 'vertical',
          }}
        />
      </div>

      {/* Category */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as TemplateCategory)}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            backgroundColor: 'white',
          }}
        >
          {categoryOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
          Tags
        </label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            placeholder="Add a tag..."
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <button
            onClick={handleAddTag}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#3b82f6',
              color: 'white',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Add
          </button>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {tags.map(tag => (
            <span
              key={tag}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                backgroundColor: '#f3f4f6',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#374151',
              }}
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: 0,
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Blocks Preview */}
      {blocks.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
            Template Structure ({blocks.length} blocks)
          </label>
          <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', maxHeight: '200px', overflow: 'auto' }}>
            {blocks.map((block, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', fontSize: '13px', color: '#6b7280' }}>
                <span style={{ width: '20px', textAlign: 'center' }}>{index + 1}.</span>
                <span style={{ textTransform: 'capitalize' }}>{block.type}</span>
                {block.required && <span style={{ color: '#EF4444' }}>*</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '10px 20px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: 'white',
            color: '#374151',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: name.trim() ? '#3b82f6' : '#d1d5db',
            color: 'white',
            fontSize: '14px',
            fontWeight: 500,
            cursor: name.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          Save Template
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// TEMPLATE MODAL
// ============================================================================

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (blocks: TemplateBlock[]) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            style={{
              width: '100%',
              maxWidth: '900px',
              maxHeight: '80vh',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              borderRadius: '12px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <TemplatePicker onSelect={onSelect} onClose={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// START FROM TEMPLATE BUTTON
// ============================================================================

interface StartFromTemplateButtonProps {
  onSelect: (blocks: TemplateBlock[]) => void;
  className?: string;
}

export const StartFromTemplateButton: React.FC<StartFromTemplateButtonProps> = ({
  onSelect,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 20px',
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
          backgroundColor: 'transparent',
          color: '#6b7280',
          fontSize: '14px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = '#3b82f6';
          e.currentTarget.style.color = '#3b82f6';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = '#d1d5db';
          e.currentTarget.style.color = '#6b7280';
        }}
      >
        <span>📑</span>
        <span>Start from template</span>
      </button>

      <TemplateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(blocks) => {
          onSelect(blocks);
          setIsModalOpen(false);
        }}
      />
    </>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  TemplatePicker as ContentTemplates,
  defaultTemplates,
};

export default ContentTemplatesProvider;
