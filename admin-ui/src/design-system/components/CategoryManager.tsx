import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  count: number;
  image?: string;
  color?: string;
  icon?: string;
  order: number;
  isDefault?: boolean;
  meta?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
  level: number;
  path: string[];
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  image: string;
  color: string;
  icon: string;
}

export interface CategoryConfig {
  allowNesting: boolean;
  maxDepth: number;
  allowImages: boolean;
  allowColors: boolean;
  allowIcons: boolean;
  showCounts: boolean;
  showDescriptions: boolean;
  confirmDelete: boolean;
}

interface CategoryManagerContextType {
  categories: Category[];
  categoryTree: CategoryTree[];
  selectedCategory: Category | null;
  editingCategory: Category | null;
  expandedIds: string[];
  searchQuery: string;
  config: CategoryConfig;
  setSelectedCategory: (category: Category | null) => void;
  setEditingCategory: (category: Category | null) => void;
  toggleExpanded: (id: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  setSearchQuery: (query: string) => void;
  addCategory: (data: CategoryFormData) => void;
  updateCategory: (id: string, data: Partial<CategoryFormData>) => void;
  deleteCategory: (id: string) => void;
  moveCategory: (id: string, newParentId: string | null, newOrder: number) => void;
  mergeCategories: (sourceId: string, targetId: string) => void;
  setDefaultCategory: (id: string) => void;
  getCategoryPath: (id: string) => Category[];
  getCategoryChildren: (id: string) => Category[];
}

// ============================================================================
// CONTEXT
// ============================================================================

const CategoryManagerContext = createContext<CategoryManagerContextType | null>(null);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const buildCategoryTree = (categories: Category[], parentId: string | null = null, level: number = 0, path: string[] = []): CategoryTree[] => {
  return categories
    .filter(cat => cat.parentId === parentId)
    .sort((a, b) => a.order - b.order)
    .map(cat => ({
      ...cat,
      level,
      path: [...path, cat.id],
      children: buildCategoryTree(categories, cat.id, level + 1, [...path, cat.id]),
    }));
};

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

// ============================================================================
// PROVIDER
// ============================================================================

interface CategoryManagerProviderProps {
  children: ReactNode;
  initialCategories?: Category[];
  initialConfig?: Partial<CategoryConfig>;
  onCategoryChange?: (categories: Category[]) => void;
  onCategorySelect?: (category: Category | null) => void;
}

const defaultConfig: CategoryConfig = {
  allowNesting: true,
  maxDepth: 5,
  allowImages: true,
  allowColors: true,
  allowIcons: true,
  showCounts: true,
  showDescriptions: true,
  confirmDelete: true,
};

export const CategoryManagerProvider: React.FC<CategoryManagerProviderProps> = ({
  children,
  initialCategories = [],
  initialConfig = {},
  onCategoryChange,
  onCategorySelect,
}) => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selectedCategory, setSelectedCategoryState] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const config = { ...defaultConfig, ...initialConfig };

  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);

  const filteredTree = useMemo(() => {
    if (!searchQuery) return categoryTree;

    const matchesSearch = (cat: Category): boolean =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);

    const filterTree = (tree: CategoryTree[]): CategoryTree[] => {
      return tree
        .map(node => ({
          ...node,
          children: filterTree(node.children),
        }))
        .filter(node => matchesSearch(node) || node.children.length > 0);
    };

    return filterTree(categoryTree);
  }, [categoryTree, searchQuery]);

  const setSelectedCategory = useCallback((category: Category | null) => {
    setSelectedCategoryState(category);
    onCategorySelect?.(category);
  }, [onCategorySelect]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }, []);

  const expandAll = useCallback(() => {
    const getAllIds = (tree: CategoryTree[]): string[] => {
      return tree.flatMap(node => [node.id, ...getAllIds(node.children)]);
    };
    setExpandedIds(getAllIds(categoryTree));
  }, [categoryTree]);

  const collapseAll = useCallback(() => {
    setExpandedIds([]);
  }, []);

  const addCategory = useCallback((data: CategoryFormData) => {
    const newCategory: Category = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      slug: data.slug || generateSlug(data.name),
      description: data.description,
      parentId: data.parentId,
      count: 0,
      image: data.image,
      color: data.color,
      icon: data.icon,
      order: categories.filter(c => c.parentId === data.parentId).length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setCategories(prev => {
      const updated = [...prev, newCategory];
      onCategoryChange?.(updated);
      return updated;
    });
  }, [categories, onCategoryChange]);

  const updateCategory = useCallback((id: string, data: Partial<CategoryFormData>) => {
    setCategories(prev => {
      const updated = prev.map(cat =>
        cat.id === id
          ? { ...cat, ...data, slug: data.slug || (data.name ? generateSlug(data.name) : cat.slug), updatedAt: new Date() }
          : cat
      );
      onCategoryChange?.(updated);
      return updated;
    });
  }, [onCategoryChange]);

  const deleteCategory = useCallback((id: string) => {
    const getDescendantIds = (catId: string): string[] => {
      const children = categories.filter(c => c.parentId === catId);
      return [catId, ...children.flatMap(c => getDescendantIds(c.id))];
    };

    const idsToDelete = getDescendantIds(id);

    setCategories(prev => {
      const updated = prev.filter(cat => !idsToDelete.includes(cat.id));
      onCategoryChange?.(updated);
      return updated;
    });

    if (selectedCategory && idsToDelete.includes(selectedCategory.id)) {
      setSelectedCategory(null);
    }
  }, [categories, selectedCategory, setSelectedCategory, onCategoryChange]);

  const moveCategory = useCallback((id: string, newParentId: string | null, newOrder: number) => {
    setCategories(prev => {
      const category = prev.find(c => c.id === id);
      if (!category) return prev;

      // Check max depth
      if (config.maxDepth && newParentId) {
        const getDepth = (catId: string): number => {
          const cat = prev.find(c => c.id === catId);
          if (!cat?.parentId) return 1;
          return 1 + getDepth(cat.parentId);
        };
        if (getDepth(newParentId) >= config.maxDepth) return prev;
      }

      const updated = prev.map(cat => {
        if (cat.id === id) {
          return { ...cat, parentId: newParentId, order: newOrder, updatedAt: new Date() };
        }
        // Reorder siblings
        if (cat.parentId === newParentId && cat.order >= newOrder && cat.id !== id) {
          return { ...cat, order: cat.order + 1 };
        }
        return cat;
      });

      onCategoryChange?.(updated);
      return updated;
    });
  }, [config.maxDepth, onCategoryChange]);

  const mergeCategories = useCallback((sourceId: string, targetId: string) => {
    setCategories(prev => {
      const source = prev.find(c => c.id === sourceId);
      const target = prev.find(c => c.id === targetId);
      if (!source || !target) return prev;

      // Move all children of source to target
      const updated = prev
        .map(cat => {
          if (cat.parentId === sourceId) {
            return { ...cat, parentId: targetId, updatedAt: new Date() };
          }
          if (cat.id === targetId) {
            return { ...cat, count: cat.count + source.count, updatedAt: new Date() };
          }
          return cat;
        })
        .filter(cat => cat.id !== sourceId);

      onCategoryChange?.(updated);
      return updated;
    });
  }, [onCategoryChange]);

  const setDefaultCategory = useCallback((id: string) => {
    setCategories(prev => {
      const updated = prev.map(cat => ({
        ...cat,
        isDefault: cat.id === id,
        updatedAt: cat.id === id ? new Date() : cat.updatedAt,
      }));
      onCategoryChange?.(updated);
      return updated;
    });
  }, [onCategoryChange]);

  const getCategoryPath = useCallback((id: string): Category[] => {
    const path: Category[] = [];
    let current = categories.find(c => c.id === id);

    while (current) {
      path.unshift(current);
      current = current.parentId ? categories.find(c => c.id === current!.parentId) : undefined;
    }

    return path;
  }, [categories]);

  const getCategoryChildren = useCallback((id: string): Category[] => {
    return categories.filter(c => c.parentId === id).sort((a, b) => a.order - b.order);
  }, [categories]);

  const value: CategoryManagerContextType = {
    categories,
    categoryTree: filteredTree,
    selectedCategory,
    editingCategory,
    expandedIds,
    searchQuery,
    config,
    setSelectedCategory,
    setEditingCategory,
    toggleExpanded,
    expandAll,
    collapseAll,
    setSearchQuery,
    addCategory,
    updateCategory,
    deleteCategory,
    moveCategory,
    mergeCategories,
    setDefaultCategory,
    getCategoryPath,
    getCategoryChildren,
  };

  return (
    <CategoryManagerContext.Provider value={value}>
      {children}
    </CategoryManagerContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useCategoryManager = (): CategoryManagerContextType => {
  const context = useContext(CategoryManagerContext);
  if (!context) {
    throw new Error('useCategoryManager must be used within CategoryManagerProvider');
  }
  return context;
};

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  container: {
    display: 'flex',
    gap: '1.5rem',
    padding: '1.5rem',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    minHeight: '500px',
  },
  sidebar: {
    flex: '0 0 350px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    borderRight: '1px solid #e2e8f0',
    paddingRight: '1.5rem',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0,
  },
  toolbar: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    padding: '0.625rem 1rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.875rem',
    outline: 'none',
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
  },
  dangerButton: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  },
  iconButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  treeContainer: {
    flex: 1,
    overflowY: 'auto' as const,
  },
  treeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  treeItemSelected: {
    backgroundColor: '#eff6ff',
  },
  treeItemHover: {
    backgroundColor: '#f8fafc',
  },
  expandIcon: {
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#94a3b8',
    transition: 'transform 0.2s',
  },
  categoryIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
  },
  categoryName: {
    flex: 1,
    fontSize: '0.875rem',
    color: '#1e293b',
    fontWeight: 500,
  },
  categoryCount: {
    fontSize: '0.75rem',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: '0.125rem 0.5rem',
    borderRadius: '9999px',
  },
  defaultBadge: {
    fontSize: '0.6875rem',
    color: '#16a34a',
    backgroundColor: '#dcfce7',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
    fontWeight: 600,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.375rem',
  },
  label: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: '#475569',
  },
  input: {
    padding: '0.625rem 0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  textarea: {
    padding: '0.625rem 0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.875rem',
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: '80px',
  },
  select: {
    padding: '0.625rem 0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.875rem',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
  },
  colorPicker: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  },
  colorOption: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    cursor: 'pointer',
    border: '2px solid transparent',
    transition: 'all 0.2s',
  },
  colorOptionSelected: {
    borderColor: '#1e293b',
    transform: 'scale(1.1)',
  },
  detailsPanel: {
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
  },
  detailsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  detailsIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
  },
  detailsTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0,
  },
  detailsSlug: {
    fontSize: '0.875rem',
    color: '#64748b',
    fontFamily: 'monospace',
  },
  detailsStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statCard: {
    padding: '1rem',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    textTransform: 'uppercase' as const,
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8125rem',
    color: '#64748b',
    marginBottom: '1rem',
  },
  breadcrumbItem: {
    color: '#3b82f6',
    cursor: 'pointer',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem',
    textAlign: 'center' as const,
    color: '#64748b',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
    opacity: 0.5,
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1rem',
  },
};

const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

// ============================================================================
// CATEGORY TREE ITEM
// ============================================================================

interface CategoryTreeItemProps {
  category: CategoryTree;
}

export const CategoryTreeItem: React.FC<CategoryTreeItemProps> = ({ category }) => {
  const { selectedCategory, setSelectedCategory, expandedIds, toggleExpanded, config } = useCategoryManager();

  const isSelected = selectedCategory?.id === category.id;
  const isExpanded = expandedIds.includes(category.id);
  const hasChildren = category.children.length > 0;

  return (
    <div>
      <motion.div
        style={{
          ...styles.treeItem,
          ...(isSelected ? styles.treeItemSelected : {}),
          paddingLeft: `${0.75 + category.level * 1.25}rem`,
        }}
        onClick={() => setSelectedCategory(category)}
        whileHover={{ backgroundColor: isSelected ? '#eff6ff' : '#f8fafc' }}
      >
        {config.allowNesting && (
          <div
            style={{
              ...styles.expandIcon,
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
              visibility: hasChildren ? 'visible' : 'hidden',
            }}
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded(category.id);
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9,18 15,12 9,6" />
            </svg>
          </div>
        )}

        <div
          style={{
            ...styles.categoryIcon,
            backgroundColor: category.color || '#e2e8f0',
            color: category.color ? '#ffffff' : '#64748b',
          }}
        >
          {category.icon || category.name.charAt(0).toUpperCase()}
        </div>

        <span style={styles.categoryName}>{category.name}</span>

        {category.isDefault && (
          <span style={styles.defaultBadge}>Default</span>
        )}

        {config.showCounts && (
          <span style={styles.categoryCount}>{category.count}</span>
        )}
      </motion.div>

      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {category.children.map(child => (
              <CategoryTreeItem key={child.id} category={child} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// CATEGORY TREE
// ============================================================================

export const CategoryTree: React.FC = () => {
  const { categoryTree, expandAll, collapseAll, searchQuery, setSearchQuery } = useCategoryManager();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={expandAll} style={{ ...styles.button, ...styles.secondaryButton }}>
          Expand All
        </button>
        <button onClick={collapseAll} style={{ ...styles.button, ...styles.secondaryButton }}>
          Collapse All
        </button>
      </div>

      <div style={styles.treeContainer}>
        {categoryTree.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📁</div>
            <p>No categories found</p>
          </div>
        ) : (
          categoryTree.map(category => (
            <CategoryTreeItem key={category.id} category={category} />
          ))
        )}
      </div>
    </div>
  );
};

// ============================================================================
// CATEGORY FORM
// ============================================================================

interface CategoryFormProps {
  onCancel?: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ onCancel }) => {
  const { editingCategory, addCategory, updateCategory, setEditingCategory, categories, config } = useCategoryManager();

  const [formData, setFormData] = useState<CategoryFormData>({
    name: editingCategory?.name || '',
    slug: editingCategory?.slug || '',
    description: editingCategory?.description || '',
    parentId: editingCategory?.parentId || null,
    image: editingCategory?.image || '',
    color: editingCategory?.color || colors[0],
    icon: editingCategory?.icon || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
    } else {
      addCategory(formData);
    }

    setEditingCategory(null);
    onCancel?.();
  };

  const handleCancel = () => {
    setEditingCategory(null);
    onCancel?.();
  };

  const parentOptions = categories.filter(c => c.id !== editingCategory?.id);

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={{ ...styles.title, marginBottom: '0.5rem' }}>
        {editingCategory ? 'Edit Category' : 'Add Category'}
      </h3>

      <div style={styles.formGroup}>
        <label style={styles.label}>Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={styles.input}
          placeholder="Category name"
          required
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Slug</label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          style={styles.input}
          placeholder={generateSlug(formData.name) || 'auto-generated'}
        />
      </div>

      {config.showDescriptions && (
        <div style={styles.formGroup}>
          <label style={styles.label}>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={styles.textarea}
            placeholder="Optional description"
          />
        </div>
      )}

      {config.allowNesting && (
        <div style={styles.formGroup}>
          <label style={styles.label}>Parent Category</label>
          <select
            value={formData.parentId || ''}
            onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
            style={styles.select}
          >
            <option value="">None (Top Level)</option>
            {parentOptions.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      )}

      {config.allowColors && (
        <div style={styles.formGroup}>
          <label style={styles.label}>Color</label>
          <div style={styles.colorPicker}>
            {colors.map(color => (
              <div
                key={color}
                style={{
                  ...styles.colorOption,
                  backgroundColor: color,
                  ...(formData.color === color ? styles.colorOptionSelected : {}),
                }}
                onClick={() => setFormData({ ...formData, color })}
              />
            ))}
          </div>
        </div>
      )}

      <div style={styles.actions}>
        <button type="submit" style={{ ...styles.button, ...styles.primaryButton }}>
          {editingCategory ? 'Update' : 'Add'} Category
        </button>
        <button type="button" onClick={handleCancel} style={{ ...styles.button, ...styles.secondaryButton }}>
          Cancel
        </button>
      </div>
    </form>
  );
};

// ============================================================================
// CATEGORY DETAILS
// ============================================================================

export const CategoryDetails: React.FC = () => {
  const { selectedCategory, setEditingCategory, deleteCategory, setDefaultCategory, getCategoryPath, getCategoryChildren, config } = useCategoryManager();

  if (!selectedCategory) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>👆</div>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#475569' }}>Select a Category</h3>
        <p style={{ margin: 0 }}>Choose a category from the list to view details</p>
      </div>
    );
  }

  const path = getCategoryPath(selectedCategory.id);
  const children = getCategoryChildren(selectedCategory.id);

  return (
    <div style={styles.detailsPanel}>
      {path.length > 1 && (
        <div style={styles.breadcrumb}>
          {path.map((cat, idx) => (
            <React.Fragment key={cat.id}>
              {idx > 0 && <span>/</span>}
              <span style={idx === path.length - 1 ? {} : styles.breadcrumbItem}>
                {cat.name}
              </span>
            </React.Fragment>
          ))}
        </div>
      )}

      <div style={styles.detailsHeader}>
        <div
          style={{
            ...styles.detailsIcon,
            backgroundColor: selectedCategory.color || '#e2e8f0',
            color: selectedCategory.color ? '#ffffff' : '#64748b',
          }}
        >
          {selectedCategory.icon || selectedCategory.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 style={styles.detailsTitle}>{selectedCategory.name}</h2>
          <span style={styles.detailsSlug}>/{selectedCategory.slug}</span>
        </div>
        {selectedCategory.isDefault && (
          <span style={{ ...styles.defaultBadge, marginLeft: 'auto' }}>Default Category</span>
        )}
      </div>

      {config.showDescriptions && selectedCategory.description && (
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{selectedCategory.description}</p>
      )}

      <div style={styles.detailsStats}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{selectedCategory.count}</div>
          <div style={styles.statLabel}>Posts</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{children.length}</div>
          <div style={styles.statLabel}>Subcategories</div>
        </div>
      </div>

      {children.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
            Subcategories
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {children.map(child => (
              <span
                key={child.id}
                style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: child.color || '#e2e8f0',
                  color: child.color ? '#ffffff' : '#475569',
                  borderRadius: '9999px',
                  fontSize: '0.8125rem',
                }}
              >
                {child.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={styles.actions}>
        <button
          onClick={() => setEditingCategory(selectedCategory)}
          style={{ ...styles.button, ...styles.primaryButton }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit
        </button>
        {!selectedCategory.isDefault && (
          <button
            onClick={() => setDefaultCategory(selectedCategory.id)}
            style={{ ...styles.button, ...styles.secondaryButton }}
          >
            Set as Default
          </button>
        )}
        <button
          onClick={() => deleteCategory(selectedCategory.id)}
          style={{ ...styles.button, ...styles.dangerButton }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const CategoryManager: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const { editingCategory, setEditingCategory } = useCategoryManager();

  const handleAddNew = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.header}>
          <h2 style={styles.title}>Categories</h2>
          <button onClick={handleAddNew} style={{ ...styles.button, ...styles.primaryButton }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add
          </button>
        </div>
        <CategoryTree />
      </div>

      <div style={styles.main}>
        <AnimatePresence mode="wait">
          {(showForm || editingCategory) ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CategoryForm onCancel={() => setShowForm(false)} />
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <CategoryDetails />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CategoryManager;
