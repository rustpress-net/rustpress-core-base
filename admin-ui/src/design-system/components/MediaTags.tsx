import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// MEDIA TAGS - Component 18
// Media categorization with tags, collections, and smart organization
// ============================================================================

// Types
export interface MediaTag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  count: number;
  parentId?: string;
}

export interface MediaCollection {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  itemCount: number;
  isPrivate: boolean;
  createdAt: Date;
}

export interface TagSuggestion {
  tag: MediaTag;
  relevance: number;
  source: 'ai' | 'popular' | 'recent';
}

interface MediaTagsContextType {
  allTags: MediaTag[];
  collections: MediaCollection[];
  selectedTags: string[];
  searchQuery: string;
  suggestions: TagSuggestion[];
  addTag: (name: string, color?: string) => MediaTag;
  removeTag: (id: string) => void;
  selectTag: (id: string) => void;
  deselectTag: (id: string) => void;
  clearSelection: () => void;
  setSearchQuery: (query: string) => void;
  createCollection: (name: string, description?: string) => MediaCollection;
  deleteCollection: (id: string) => void;
  getTagsByParent: (parentId?: string) => MediaTag[];
  getSuggestions: () => TagSuggestion[];
}

const MediaTagsContext = createContext<MediaTagsContextType | null>(null);

export const useMediaTags = () => {
  const context = useContext(MediaTagsContext);
  if (!context) {
    throw new Error('useMediaTags must be used within MediaTagsProvider');
  }
  return context;
};

// Sample data
const sampleTags: MediaTag[] = [
  { id: '1', name: 'Hero Images', slug: 'hero-images', color: '#3b82f6', count: 24 },
  { id: '2', name: 'Product Photos', slug: 'product-photos', color: '#10b981', count: 156 },
  { id: '3', name: 'Team', slug: 'team', color: '#8b5cf6', count: 32 },
  { id: '4', name: 'Blog', slug: 'blog', color: '#f59e0b', count: 89 },
  { id: '5', name: 'Icons', slug: 'icons', color: '#6b7280', count: 45 },
  { id: '6', name: 'Backgrounds', slug: 'backgrounds', color: '#ec4899', count: 28 },
  { id: '7', name: 'Social Media', slug: 'social-media', color: '#14b8a6', count: 67 },
  { id: '8', name: 'Testimonials', slug: 'testimonials', color: '#f97316', count: 18 },
];

const sampleCollections: MediaCollection[] = [
  { id: '1', name: 'Brand Assets', description: 'Official brand imagery', itemCount: 45, isPrivate: false, createdAt: new Date('2024-01-15') },
  { id: '2', name: 'Marketing Campaign Q1', description: 'Q1 2024 marketing materials', itemCount: 123, isPrivate: false, createdAt: new Date('2024-01-20') },
  { id: '3', name: 'Private Drafts', description: 'Work in progress', itemCount: 12, isPrivate: true, createdAt: new Date('2024-02-01') },
];

// Provider
export interface MediaTagsProviderProps {
  children: React.ReactNode;
  initialTags?: MediaTag[];
  initialCollections?: MediaCollection[];
  onTagChange?: (tags: string[]) => void;
}

export const MediaTagsProvider: React.FC<MediaTagsProviderProps> = ({
  children,
  initialTags = sampleTags,
  initialCollections = sampleCollections,
  onTagChange,
}) => {
  const [allTags, setAllTags] = useState<MediaTag[]>(initialTags);
  const [collections, setCollections] = useState<MediaCollection[]>(initialCollections);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const generateId = () => Math.random().toString(36).substring(2, 11);
  const generateSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

  const addTag = useCallback((name: string, color?: string): MediaTag => {
    const newTag: MediaTag = {
      id: generateId(),
      name,
      slug: generateSlug(name),
      color: color || '#6b7280',
      count: 0,
    };
    setAllTags(prev => [...prev, newTag]);
    return newTag;
  }, []);

  const removeTag = useCallback((id: string) => {
    setAllTags(prev => prev.filter(t => t.id !== id));
    setSelectedTags(prev => prev.filter(t => t !== id));
  }, []);

  const selectTag = useCallback((id: string) => {
    setSelectedTags(prev => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      onTagChange?.(updated);
      return updated;
    });
  }, [onTagChange]);

  const deselectTag = useCallback((id: string) => {
    setSelectedTags(prev => {
      const updated = prev.filter(t => t !== id);
      onTagChange?.(updated);
      return updated;
    });
  }, [onTagChange]);

  const clearSelection = useCallback(() => {
    setSelectedTags([]);
    onTagChange?.([]);
  }, [onTagChange]);

  const createCollection = useCallback((name: string, description?: string): MediaCollection => {
    const newCollection: MediaCollection = {
      id: generateId(),
      name,
      description,
      itemCount: 0,
      isPrivate: false,
      createdAt: new Date(),
    };
    setCollections(prev => [...prev, newCollection]);
    return newCollection;
  }, []);

  const deleteCollection = useCallback((id: string) => {
    setCollections(prev => prev.filter(c => c.id !== id));
  }, []);

  const getTagsByParent = useCallback((parentId?: string) => {
    return allTags.filter(t => t.parentId === parentId);
  }, [allTags]);

  const suggestions = useMemo((): TagSuggestion[] => {
    const popularTags = allTags
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(tag => ({
        tag,
        relevance: 0.9,
        source: 'popular' as const,
      }));
    return popularTags;
  }, [allTags]);

  const getSuggestions = useCallback(() => suggestions, [suggestions]);

  const value: MediaTagsContextType = {
    allTags,
    collections,
    selectedTags,
    searchQuery,
    suggestions,
    addTag,
    removeTag,
    selectTag,
    deselectTag,
    clearSelection,
    setSearchQuery,
    createCollection,
    deleteCollection,
    getTagsByParent,
    getSuggestions,
  };

  return (
    <MediaTagsContext.Provider value={value}>
      {children}
    </MediaTagsContext.Provider>
  );
};

// Tag Badge
export const TagBadge: React.FC<{
  tag: MediaTag;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}> = ({ tag, selected, onClick, onRemove, size = 'md' }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: size === 'sm' ? '4px 8px' : '6px 10px',
        borderRadius: '6px',
        backgroundColor: selected ? `${tag.color}15` : '#f3f4f6',
        border: `1px solid ${selected ? tag.color : '#e5e7eb'}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s',
      }}
    >
      <div
        style={{
          width: size === 'sm' ? '6px' : '8px',
          height: size === 'sm' ? '6px' : '8px',
          borderRadius: '50%',
          backgroundColor: tag.color,
        }}
      />
      <span style={{ fontSize: size === 'sm' ? '12px' : '13px', color: '#374151' }}>
        {tag.name}
      </span>
      {tag.count > 0 && (
        <span style={{ fontSize: size === 'sm' ? '10px' : '11px', color: '#9ca3af' }}>
          ({tag.count})
        </span>
      )}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{
            width: '14px',
            height: '14px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '2px',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </motion.div>
  );
};

// Tag Search & Create
export const TagInput: React.FC<{ placeholder?: string }> = ({ placeholder = 'Search or create tags...' }) => {
  const { allTags, searchQuery, setSearchQuery, addTag, selectTag, selectedTags } = useMediaTags();
  const [isOpen, setIsOpen] = useState(false);

  const filteredTags = allTags.filter(
    tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()) && !selectedTags.includes(tag.id)
  );

  const handleCreate = () => {
    if (searchQuery.trim()) {
      const newTag = addTag(searchQuery.trim());
      selectTag(newTag.id);
      setSearchQuery('');
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          fontSize: '14px',
        }}
      />

      <AnimatePresence>
        {isOpen && (filteredTags.length > 0 || searchQuery) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '4px',
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 10,
            }}
          >
            {filteredTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => {
                  selectTag(tag.id);
                  setSearchQuery('');
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: tag.color,
                  }}
                />
                <span style={{ flex: 1, fontSize: '14px', color: '#374151' }}>{tag.name}</span>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>{tag.count}</span>
              </button>
            ))}

            {searchQuery && !filteredTags.some(t => t.name.toLowerCase() === searchQuery.toLowerCase()) && (
              <button
                onClick={handleCreate}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  border: 'none',
                  borderTop: filteredTags.length > 0 ? '1px solid #e5e7eb' : 'none',
                  backgroundColor: '#f0fdf4',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span style={{ fontSize: '14px', color: '#16a34a' }}>Create "{searchQuery}"</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Selected Tags Display
export const SelectedTags: React.FC = () => {
  const { allTags, selectedTags, deselectTag, clearSelection } = useMediaTags();
  const selected = allTags.filter(t => selectedTags.includes(t.id));

  if (selected.length === 0) return null;

  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>
          {selected.length} tag{selected.length !== 1 ? 's' : ''} selected
        </span>
        <button
          onClick={clearSelection}
          style={{
            padding: '2px 8px',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#6b7280',
            fontSize: '12px',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Clear all
        </button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        <AnimatePresence>
          {selected.map(tag => (
            <motion.div
              key={tag.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <TagBadge tag={tag} selected onRemove={() => deselectTag(tag.id)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Tag Cloud
export const TagCloud: React.FC = () => {
  const { allTags, selectedTags, selectTag, deselectTag } = useMediaTags();

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {allTags.map(tag => {
        const isSelected = selectedTags.includes(tag.id);
        return (
          <TagBadge
            key={tag.id}
            tag={tag}
            selected={isSelected}
            onClick={() => isSelected ? deselectTag(tag.id) : selectTag(tag.id)}
          />
        );
      })}
    </div>
  );
};

// Collection Card
export const CollectionCard: React.FC<{ collection: MediaCollection; onClick?: () => void }> = ({
  collection,
  onClick,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      style={{
        padding: '16px',
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '8px',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#1f2937' }}>
              {collection.name}
            </span>
            {collection.isPrivate && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            )}
          </div>
          {collection.description && (
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0' }}>
              {collection.description}
            </p>
          )}
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px' }}>
            {collection.itemCount} items
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Collections List
export const CollectionsList: React.FC<{ onSelect?: (collection: MediaCollection) => void }> = ({
  onSelect,
}) => {
  const { collections } = useMediaTags();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {collections.map(collection => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          onClick={() => onSelect?.(collection)}
        />
      ))}
    </div>
  );
};

// Create Collection Form
export const CreateCollectionForm: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { createCollection } = useMediaTags();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createCollection(name.trim(), description.trim() || undefined);
      setName('');
      setDescription('');
      onClose?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '16px' }}>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: '6px' }}>
          Collection Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter collection name..."
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px',
          }}
        />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: '6px' }}>
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe this collection..."
          rows={2}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px',
            resize: 'vertical',
          }}
        />
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              backgroundColor: '#fff',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={!name.trim()}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: name.trim() ? '#3b82f6' : '#93c5fd',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 500,
            cursor: name.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          Create Collection
        </button>
      </div>
    </form>
  );
};

// Main Component
export const MediaTags: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tags' | 'collections'>('tags');

  return (
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
      }}
    >
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
        {[
          { id: 'tags', label: 'Tags' },
          { id: 'collections', label: 'Collections' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'tags' | 'collections')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
              backgroundColor: 'transparent',
              fontSize: '14px',
              fontWeight: 500,
              color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        {activeTab === 'tags' && (
          <>
            <TagInput />
            <SelectedTags />
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: '10px' }}>
                All Tags
              </div>
              <TagCloud />
            </div>
          </>
        )}

        {activeTab === 'collections' && (
          <>
            <CollectionsList />
            <div style={{ marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', marginBottom: '12px' }}>
                Create New Collection
              </div>
              <CreateCollectionForm />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MediaTags;
