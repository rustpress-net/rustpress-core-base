import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type TaxonomyType = 'hierarchical' | 'flat' | 'tag';
export type FieldType = 'text' | 'textarea' | 'number' | 'url' | 'email' | 'color' | 'image' | 'select' | 'checkbox' | 'date';

export interface TaxonomyField {
  id: string;
  name: string;
  slug: string;
  type: FieldType;
  required: boolean;
  defaultValue?: string;
  placeholder?: string;
  helpText?: string;
  options?: { label: string; value: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
  order: number;
}

export interface Taxonomy {
  id: string;
  name: string;
  singularName: string;
  slug: string;
  description?: string;
  type: TaxonomyType;
  hierarchical: boolean;
  showInMenu: boolean;
  showInRest: boolean;
  publiclyQueryable: boolean;
  labels: {
    addNew: string;
    editItem: string;
    searchItems: string;
    notFound: string;
  };
  fields: TaxonomyField[];
  postTypes: string[];
  capabilities: {
    manage: string;
    edit: string;
    delete: string;
    assign: string;
  };
  rewrite: {
    slug: string;
    withFront: boolean;
    hierarchical: boolean;
  };
  icon?: string;
  color?: string;
  termCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaxonomyConfig {
  availablePostTypes: { id: string; name: string }[];
  maxFields: number;
  allowCustomCapabilities: boolean;
}

interface TaxonomyBuilderContextType {
  taxonomies: Taxonomy[];
  selectedTaxonomy: Taxonomy | null;
  editingTaxonomy: Taxonomy | null;
  editingField: TaxonomyField | null;
  config: TaxonomyConfig;
  setSelectedTaxonomy: (taxonomy: Taxonomy | null) => void;
  setEditingTaxonomy: (taxonomy: Taxonomy | null) => void;
  setEditingField: (field: TaxonomyField | null) => void;
  addTaxonomy: (taxonomy: Omit<Taxonomy, 'id' | 'createdAt' | 'updatedAt' | 'termCount'>) => void;
  updateTaxonomy: (id: string, updates: Partial<Taxonomy>) => void;
  deleteTaxonomy: (id: string) => void;
  duplicateTaxonomy: (id: string) => void;
  addField: (taxonomyId: string, field: Omit<TaxonomyField, 'id' | 'order'>) => void;
  updateField: (taxonomyId: string, fieldId: string, updates: Partial<TaxonomyField>) => void;
  deleteField: (taxonomyId: string, fieldId: string) => void;
  reorderFields: (taxonomyId: string, fieldIds: string[]) => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const TaxonomyBuilderContext = createContext<TaxonomyBuilderContextType | null>(null);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
};

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ============================================================================
// PROVIDER
// ============================================================================

interface TaxonomyBuilderProviderProps {
  children: ReactNode;
  initialTaxonomies?: Taxonomy[];
  initialConfig?: Partial<TaxonomyConfig>;
  onTaxonomyChange?: (taxonomies: Taxonomy[]) => void;
}

const defaultConfig: TaxonomyConfig = {
  availablePostTypes: [
    { id: 'post', name: 'Posts' },
    { id: 'page', name: 'Pages' },
    { id: 'product', name: 'Products' },
    { id: 'event', name: 'Events' },
  ],
  maxFields: 20,
  allowCustomCapabilities: true,
};

export const TaxonomyBuilderProvider: React.FC<TaxonomyBuilderProviderProps> = ({
  children,
  initialTaxonomies = [],
  initialConfig = {},
  onTaxonomyChange,
}) => {
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>(initialTaxonomies);
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<Taxonomy | null>(null);
  const [editingTaxonomy, setEditingTaxonomy] = useState<Taxonomy | null>(null);
  const [editingField, setEditingField] = useState<TaxonomyField | null>(null);
  const config = { ...defaultConfig, ...initialConfig };

  const addTaxonomy = useCallback((data: Omit<Taxonomy, 'id' | 'createdAt' | 'updatedAt' | 'termCount'>) => {
    const newTaxonomy: Taxonomy = {
      ...data,
      id: `taxonomy-${generateId()}`,
      termCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setTaxonomies(prev => {
      const updated = [...prev, newTaxonomy];
      onTaxonomyChange?.(updated);
      return updated;
    });
  }, [onTaxonomyChange]);

  const updateTaxonomy = useCallback((id: string, updates: Partial<Taxonomy>) => {
    setTaxonomies(prev => {
      const updated = prev.map(tax =>
        tax.id === id ? { ...tax, ...updates, updatedAt: new Date() } : tax
      );
      onTaxonomyChange?.(updated);
      return updated;
    });

    if (selectedTaxonomy?.id === id) {
      setSelectedTaxonomy(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedTaxonomy, onTaxonomyChange]);

  const deleteTaxonomy = useCallback((id: string) => {
    setTaxonomies(prev => {
      const updated = prev.filter(tax => tax.id !== id);
      onTaxonomyChange?.(updated);
      return updated;
    });

    if (selectedTaxonomy?.id === id) {
      setSelectedTaxonomy(null);
    }
  }, [selectedTaxonomy, onTaxonomyChange]);

  const duplicateTaxonomy = useCallback((id: string) => {
    const original = taxonomies.find(t => t.id === id);
    if (!original) return;

    const duplicate: Taxonomy = {
      ...original,
      id: `taxonomy-${generateId()}`,
      name: `${original.name} (Copy)`,
      slug: `${original.slug}_copy`,
      termCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      fields: original.fields.map(f => ({ ...f, id: `field-${generateId()}` })),
    };

    setTaxonomies(prev => {
      const updated = [...prev, duplicate];
      onTaxonomyChange?.(updated);
      return updated;
    });
  }, [taxonomies, onTaxonomyChange]);

  const addField = useCallback((taxonomyId: string, field: Omit<TaxonomyField, 'id' | 'order'>) => {
    setTaxonomies(prev => {
      const updated = prev.map(tax => {
        if (tax.id !== taxonomyId) return tax;
        if (tax.fields.length >= config.maxFields) return tax;

        const newField: TaxonomyField = {
          ...field,
          id: `field-${generateId()}`,
          order: tax.fields.length,
        };

        return {
          ...tax,
          fields: [...tax.fields, newField],
          updatedAt: new Date(),
        };
      });
      onTaxonomyChange?.(updated);
      return updated;
    });
  }, [config.maxFields, onTaxonomyChange]);

  const updateField = useCallback((taxonomyId: string, fieldId: string, updates: Partial<TaxonomyField>) => {
    setTaxonomies(prev => {
      const updated = prev.map(tax => {
        if (tax.id !== taxonomyId) return tax;

        return {
          ...tax,
          fields: tax.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f),
          updatedAt: new Date(),
        };
      });
      onTaxonomyChange?.(updated);
      return updated;
    });
  }, [onTaxonomyChange]);

  const deleteField = useCallback((taxonomyId: string, fieldId: string) => {
    setTaxonomies(prev => {
      const updated = prev.map(tax => {
        if (tax.id !== taxonomyId) return tax;

        const fields = tax.fields
          .filter(f => f.id !== fieldId)
          .map((f, idx) => ({ ...f, order: idx }));

        return { ...tax, fields, updatedAt: new Date() };
      });
      onTaxonomyChange?.(updated);
      return updated;
    });
  }, [onTaxonomyChange]);

  const reorderFields = useCallback((taxonomyId: string, fieldIds: string[]) => {
    setTaxonomies(prev => {
      const updated = prev.map(tax => {
        if (tax.id !== taxonomyId) return tax;

        const fields = fieldIds
          .map((id, idx) => {
            const field = tax.fields.find(f => f.id === id);
            return field ? { ...field, order: idx } : null;
          })
          .filter(Boolean) as TaxonomyField[];

        return { ...tax, fields, updatedAt: new Date() };
      });
      onTaxonomyChange?.(updated);
      return updated;
    });
  }, [onTaxonomyChange]);

  const value: TaxonomyBuilderContextType = {
    taxonomies,
    selectedTaxonomy,
    editingTaxonomy,
    editingField,
    config,
    setSelectedTaxonomy,
    setEditingTaxonomy,
    setEditingField,
    addTaxonomy,
    updateTaxonomy,
    deleteTaxonomy,
    duplicateTaxonomy,
    addField,
    updateField,
    deleteField,
    reorderFields,
  };

  return (
    <TaxonomyBuilderContext.Provider value={value}>
      {children}
    </TaxonomyBuilderContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useTaxonomyBuilder = (): TaxonomyBuilderContextType => {
  const context = useContext(TaxonomyBuilderContext);
  if (!context) {
    throw new Error('useTaxonomyBuilder must be used within TaxonomyBuilderProvider');
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
    minHeight: '600px',
  },
  sidebar: {
    flex: '0 0 300px',
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
    gap: '1.5rem',
    overflow: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#64748b',
    margin: 0,
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.875rem',
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
  taxonomyList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    flex: 1,
    overflowY: 'auto' as const,
  },
  taxonomyItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    border: '1px solid transparent',
  },
  taxonomyItemSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  taxonomyIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
  },
  taxonomyInfo: {
    flex: 1,
    minWidth: 0,
  },
  taxonomyName: {
    fontSize: '0.9375rem',
    fontWeight: 500,
    color: '#1e293b',
  },
  taxonomySlug: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontFamily: 'monospace',
  },
  taxonomyCount: {
    fontSize: '0.75rem',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: '0.125rem 0.5rem',
    borderRadius: '9999px',
  },
  panel: {
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
  },
  panelTitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#1e293b',
    marginBottom: '1rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
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
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  toggle: {
    position: 'relative' as const,
    width: '44px',
    height: '24px',
    backgroundColor: '#e2e8f0',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  toggleActive: {
    backgroundColor: '#3b82f6',
  },
  toggleKnob: {
    position: 'absolute' as const,
    top: '2px',
    left: '2px',
    width: '20px',
    height: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    transition: 'transform 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  toggleKnobActive: {
    transform: 'translateX(20px)',
  },
  typeBadge: {
    hierarchical: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
    flat: { backgroundColor: '#dcfce7', color: '#16a34a' },
    tag: { backgroundColor: '#fef3c7', color: '#d97706' },
  },
  fieldList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  fieldItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'grab',
  },
  fieldDragHandle: {
    color: '#94a3b8',
    cursor: 'grab',
  },
  fieldIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    backgroundColor: '#e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    color: '#64748b',
  },
  fieldInfo: {
    flex: 1,
    minWidth: 0,
  },
  fieldName: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#1e293b',
  },
  fieldType: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  requiredBadge: {
    fontSize: '0.6875rem',
    color: '#dc2626',
    backgroundColor: '#fee2e2',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
    fontWeight: 600,
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '1rem',
  },
  tab: {
    padding: '0.75rem 1rem',
    border: 'none',
    background: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#64748b',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s',
  },
  tabActive: {
    color: '#3b82f6',
    borderBottomColor: '#3b82f6',
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
  postTypeChips: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.625rem',
    backgroundColor: '#e2e8f0',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  chipActive: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1rem',
  },
};

const fieldTypeIcons: Record<FieldType, string> = {
  text: 'T',
  textarea: '¶',
  number: '#',
  url: '🔗',
  email: '@',
  color: '🎨',
  image: '🖼️',
  select: '▼',
  checkbox: '☑',
  date: '📅',
};

// ============================================================================
// TAXONOMY LIST
// ============================================================================

export const TaxonomyList: React.FC = () => {
  const { taxonomies, selectedTaxonomy, setSelectedTaxonomy, setEditingTaxonomy } = useTaxonomyBuilder();

  return (
    <div style={styles.taxonomyList}>
      {taxonomies.length === 0 ? (
        <div style={{ ...styles.emptyState, padding: '2rem' }}>
          <p>No taxonomies yet</p>
        </div>
      ) : (
        taxonomies.map(tax => {
          const isSelected = selectedTaxonomy?.id === tax.id;

          return (
            <motion.div
              key={tax.id}
              onClick={() => setSelectedTaxonomy(tax)}
              style={{
                ...styles.taxonomyItem,
                ...(isSelected ? styles.taxonomyItemSelected : {}),
                backgroundColor: isSelected ? '#eff6ff' : 'transparent',
              }}
              whileHover={{ backgroundColor: isSelected ? '#eff6ff' : '#f8fafc' }}
            >
              <div
                style={{
                  ...styles.taxonomyIcon,
                  backgroundColor: tax.color || '#e2e8f0',
                  color: tax.color ? '#ffffff' : '#64748b',
                }}
              >
                {tax.icon || tax.name.charAt(0).toUpperCase()}
              </div>

              <div style={styles.taxonomyInfo}>
                <div style={styles.taxonomyName}>{tax.name}</div>
                <div style={styles.taxonomySlug}>{tax.slug}</div>
              </div>

              <span
                style={{
                  ...styles.taxonomyCount,
                  ...styles.typeBadge[tax.type],
                }}
              >
                {tax.type}
              </span>
            </motion.div>
          );
        })
      )}
    </div>
  );
};

// ============================================================================
// TAXONOMY FORM
// ============================================================================

interface TaxonomyFormProps {
  onCancel?: () => void;
}

export const TaxonomyForm: React.FC<TaxonomyFormProps> = ({ onCancel }) => {
  const { editingTaxonomy, addTaxonomy, updateTaxonomy, setEditingTaxonomy, config } = useTaxonomyBuilder();

  const [formData, setFormData] = useState({
    name: editingTaxonomy?.name || '',
    singularName: editingTaxonomy?.singularName || '',
    slug: editingTaxonomy?.slug || '',
    description: editingTaxonomy?.description || '',
    type: editingTaxonomy?.type || 'hierarchical' as TaxonomyType,
    hierarchical: editingTaxonomy?.hierarchical ?? true,
    showInMenu: editingTaxonomy?.showInMenu ?? true,
    showInRest: editingTaxonomy?.showInRest ?? true,
    publiclyQueryable: editingTaxonomy?.publiclyQueryable ?? true,
    postTypes: editingTaxonomy?.postTypes || ['post'],
    color: editingTaxonomy?.color || '#3b82f6',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const taxonomyData = {
      name: formData.name,
      singularName: formData.singularName || formData.name,
      slug: formData.slug || generateSlug(formData.name),
      description: formData.description,
      type: formData.type,
      hierarchical: formData.type === 'hierarchical',
      showInMenu: formData.showInMenu,
      showInRest: formData.showInRest,
      publiclyQueryable: formData.publiclyQueryable,
      postTypes: formData.postTypes,
      color: formData.color,
      fields: editingTaxonomy?.fields || [],
      labels: {
        addNew: `Add New ${formData.singularName || formData.name}`,
        editItem: `Edit ${formData.singularName || formData.name}`,
        searchItems: `Search ${formData.name}`,
        notFound: `No ${formData.name.toLowerCase()} found`,
      },
      capabilities: {
        manage: `manage_${formData.slug || generateSlug(formData.name)}`,
        edit: `edit_${formData.slug || generateSlug(formData.name)}`,
        delete: `delete_${formData.slug || generateSlug(formData.name)}`,
        assign: `assign_${formData.slug || generateSlug(formData.name)}`,
      },
      rewrite: {
        slug: formData.slug || generateSlug(formData.name),
        withFront: true,
        hierarchical: formData.type === 'hierarchical',
      },
    };

    if (editingTaxonomy) {
      updateTaxonomy(editingTaxonomy.id, taxonomyData);
    } else {
      addTaxonomy(taxonomyData);
    }

    setEditingTaxonomy(null);
    onCancel?.();
  };

  const togglePostType = (postTypeId: string) => {
    setFormData(prev => ({
      ...prev,
      postTypes: prev.postTypes.includes(postTypeId)
        ? prev.postTypes.filter(pt => pt !== postTypeId)
        : [...prev.postTypes, postTypeId],
    }));
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Name (Plural) *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={styles.input}
            placeholder="e.g., Categories"
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Singular Name</label>
          <input
            type="text"
            value={formData.singularName}
            onChange={(e) => setFormData({ ...formData, singularName: e.target.value })}
            style={styles.input}
            placeholder="e.g., Category"
          />
        </div>
      </div>

      <div style={styles.formRow}>
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

        <div style={styles.formGroup}>
          <label style={styles.label}>Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as TaxonomyType })}
            style={styles.select}
          >
            <option value="hierarchical">Hierarchical (like Categories)</option>
            <option value="flat">Flat (like Tags)</option>
            <option value="tag">Tag-based</option>
          </select>
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          style={styles.textarea}
          placeholder="Optional description"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Post Types</label>
        <div style={styles.postTypeChips}>
          {config.availablePostTypes.map(pt => (
            <button
              key={pt.id}
              type="button"
              onClick={() => togglePostType(pt.id)}
              style={{
                ...styles.chip,
                ...(formData.postTypes.includes(pt.id) ? styles.chipActive : {}),
              }}
            >
              {pt.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
        <label style={styles.checkbox}>
          <input
            type="checkbox"
            checked={formData.showInMenu}
            onChange={(e) => setFormData({ ...formData, showInMenu: e.target.checked })}
          />
          <span style={styles.label}>Show in Menu</span>
        </label>

        <label style={styles.checkbox}>
          <input
            type="checkbox"
            checked={formData.showInRest}
            onChange={(e) => setFormData({ ...formData, showInRest: e.target.checked })}
          />
          <span style={styles.label}>Show in REST API</span>
        </label>

        <label style={styles.checkbox}>
          <input
            type="checkbox"
            checked={formData.publiclyQueryable}
            onChange={(e) => setFormData({ ...formData, publiclyQueryable: e.target.checked })}
          />
          <span style={styles.label}>Publicly Queryable</span>
        </label>
      </div>

      <div style={styles.actions}>
        <button type="submit" style={{ ...styles.button, ...styles.primaryButton }}>
          {editingTaxonomy ? 'Update' : 'Create'} Taxonomy
        </button>
        <button type="button" onClick={onCancel} style={{ ...styles.button, ...styles.secondaryButton }}>
          Cancel
        </button>
      </div>
    </form>
  );
};

// ============================================================================
// FIELD FORM
// ============================================================================

interface FieldFormProps {
  taxonomyId: string;
  onCancel: () => void;
}

export const FieldForm: React.FC<FieldFormProps> = ({ taxonomyId, onCancel }) => {
  const { editingField, addField, updateField, setEditingField } = useTaxonomyBuilder();

  const [formData, setFormData] = useState({
    name: editingField?.name || '',
    slug: editingField?.slug || '',
    type: editingField?.type || 'text' as FieldType,
    required: editingField?.required || false,
    defaultValue: editingField?.defaultValue || '',
    placeholder: editingField?.placeholder || '',
    helpText: editingField?.helpText || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const fieldData = {
      name: formData.name,
      slug: formData.slug || generateSlug(formData.name),
      type: formData.type,
      required: formData.required,
      defaultValue: formData.defaultValue,
      placeholder: formData.placeholder,
      helpText: formData.helpText,
    };

    if (editingField) {
      updateField(taxonomyId, editingField.id, fieldData);
    } else {
      addField(taxonomyId, fieldData);
    }

    setEditingField(null);
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b' }}>
        {editingField ? 'Edit Field' : 'Add Field'}
      </h4>

      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Field Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={styles.input}
            placeholder="e.g., Image"
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Field Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as FieldType })}
            style={styles.select}
          >
            <option value="text">Text</option>
            <option value="textarea">Textarea</option>
            <option value="number">Number</option>
            <option value="url">URL</option>
            <option value="email">Email</option>
            <option value="color">Color</option>
            <option value="image">Image</option>
            <option value="select">Select</option>
            <option value="checkbox">Checkbox</option>
            <option value="date">Date</option>
          </select>
        </div>
      </div>

      <div style={styles.formRow}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Placeholder</label>
          <input
            type="text"
            value={formData.placeholder}
            onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
            style={styles.input}
            placeholder="Placeholder text"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Default Value</label>
          <input
            type="text"
            value={formData.defaultValue}
            onChange={(e) => setFormData({ ...formData, defaultValue: e.target.value })}
            style={styles.input}
            placeholder="Default value"
          />
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Help Text</label>
        <input
          type="text"
          value={formData.helpText}
          onChange={(e) => setFormData({ ...formData, helpText: e.target.value })}
          style={styles.input}
          placeholder="Help text shown below the field"
        />
      </div>

      <label style={styles.checkbox}>
        <input
          type="checkbox"
          checked={formData.required}
          onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
        />
        <span style={styles.label}>Required field</span>
      </label>

      <div style={styles.actions}>
        <button type="submit" style={{ ...styles.button, ...styles.primaryButton }}>
          {editingField ? 'Update' : 'Add'} Field
        </button>
        <button type="button" onClick={onCancel} style={{ ...styles.button, ...styles.secondaryButton }}>
          Cancel
        </button>
      </div>
    </form>
  );
};

// ============================================================================
// FIELD LIST
// ============================================================================

interface FieldListProps {
  taxonomyId: string;
}

export const FieldList: React.FC<FieldListProps> = ({ taxonomyId }) => {
  const { taxonomies, setEditingField, deleteField } = useTaxonomyBuilder();
  const taxonomy = taxonomies.find(t => t.id === taxonomyId);

  if (!taxonomy || taxonomy.fields.length === 0) {
    return (
      <div style={{ ...styles.emptyState, padding: '2rem' }}>
        <p>No custom fields yet</p>
      </div>
    );
  }

  return (
    <div style={styles.fieldList}>
      {taxonomy.fields.sort((a, b) => a.order - b.order).map(field => (
        <motion.div
          key={field.id}
          layout
          style={styles.fieldItem}
        >
          <div style={styles.fieldDragHandle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="8" cy="6" r="2" />
              <circle cx="16" cy="6" r="2" />
              <circle cx="8" cy="12" r="2" />
              <circle cx="16" cy="12" r="2" />
              <circle cx="8" cy="18" r="2" />
              <circle cx="16" cy="18" r="2" />
            </svg>
          </div>

          <div style={styles.fieldIcon}>
            {fieldTypeIcons[field.type]}
          </div>

          <div style={styles.fieldInfo}>
            <div style={styles.fieldName}>{field.name}</div>
            <div style={styles.fieldType}>{field.type}</div>
          </div>

          {field.required && (
            <span style={styles.requiredBadge}>Required</span>
          )}

          <button
            onClick={() => setEditingField(field)}
            style={styles.iconButton}
            title="Edit"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          <button
            onClick={() => deleteField(taxonomyId, field.id)}
            style={{ ...styles.iconButton, color: '#dc2626' }}
            title="Delete"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================================
// TAXONOMY DETAILS
// ============================================================================

export const TaxonomyDetails: React.FC = () => {
  const { selectedTaxonomy, setEditingTaxonomy, deleteTaxonomy, duplicateTaxonomy, editingField, setEditingField } = useTaxonomyBuilder();
  const [activeTab, setActiveTab] = useState<'settings' | 'fields'>('settings');
  const [showFieldForm, setShowFieldForm] = useState(false);

  if (!selectedTaxonomy) {
    return (
      <div style={styles.emptyState}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📂</div>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#475569' }}>Select a Taxonomy</h3>
        <p style={{ margin: 0 }}>Choose a taxonomy from the list or create a new one</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ ...styles.header, marginBottom: '1rem' }}>
        <div>
          <h2 style={{ ...styles.title, marginBottom: '0.25rem' }}>{selectedTaxonomy.name}</h2>
          <p style={styles.subtitle}>/{selectedTaxonomy.slug}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setEditingTaxonomy(selectedTaxonomy)}
            style={{ ...styles.button, ...styles.secondaryButton }}
          >
            Edit
          </button>
          <button
            onClick={() => duplicateTaxonomy(selectedTaxonomy.id)}
            style={{ ...styles.button, ...styles.secondaryButton }}
          >
            Duplicate
          </button>
          <button
            onClick={() => deleteTaxonomy(selectedTaxonomy.id)}
            style={{ ...styles.button, ...styles.dangerButton }}
          >
            Delete
          </button>
        </div>
      </div>

      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('settings')}
          style={{ ...styles.tab, ...(activeTab === 'settings' ? styles.tabActive : {}) }}
        >
          Settings
        </button>
        <button
          onClick={() => setActiveTab('fields')}
          style={{ ...styles.tab, ...(activeTab === 'fields' ? styles.tabActive : {}) }}
        >
          Custom Fields ({selectedTaxonomy.fields.length})
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div style={styles.panel}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Type</div>
                  <div style={{ fontWeight: 500, color: '#1e293b' }}>{selectedTaxonomy.type}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Terms</div>
                  <div style={{ fontWeight: 500, color: '#1e293b' }}>{selectedTaxonomy.termCount}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Post Types</div>
                  <div style={{ fontWeight: 500, color: '#1e293b' }}>{selectedTaxonomy.postTypes.join(', ')}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Hierarchical</div>
                  <div style={{ fontWeight: 500, color: '#1e293b' }}>{selectedTaxonomy.hierarchical ? 'Yes' : 'No'}</div>
                </div>
              </div>

              {selectedTaxonomy.description && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Description</div>
                  <div style={{ color: '#475569' }}>{selectedTaxonomy.description}</div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'fields' && (
          <motion.div
            key="fields"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <button
                onClick={() => { setEditingField(null); setShowFieldForm(true); }}
                style={{ ...styles.button, ...styles.primaryButton }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Field
              </button>
            </div>

            {(showFieldForm || editingField) && (
              <div style={{ marginBottom: '1rem' }}>
                <FieldForm
                  taxonomyId={selectedTaxonomy.id}
                  onCancel={() => { setShowFieldForm(false); setEditingField(null); }}
                />
              </div>
            )}

            <FieldList taxonomyId={selectedTaxonomy.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const TaxonomyBuilder: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const { editingTaxonomy, setEditingTaxonomy } = useTaxonomyBuilder();

  const handleAddNew = () => {
    setEditingTaxonomy(null);
    setShowForm(true);
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.header}>
          <h2 style={styles.title}>Taxonomies</h2>
          <button onClick={handleAddNew} style={{ ...styles.button, ...styles.primaryButton }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New
          </button>
        </div>
        <TaxonomyList />
      </div>

      <div style={styles.main}>
        <AnimatePresence mode="wait">
          {(showForm || editingTaxonomy) ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div style={styles.panel}>
                <TaxonomyForm onCancel={() => { setShowForm(false); setEditingTaxonomy(null); }} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <TaxonomyDetails />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TaxonomyBuilder;
