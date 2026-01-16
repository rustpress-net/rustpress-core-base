import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type RelationType = 'related' | 'parent' | 'child' | 'sibling' | 'series' | 'translation' | 'version' | 'custom';
export type ContentType = 'post' | 'page' | 'product' | 'event' | 'media';

export interface RelatedContent {
  id: string;
  title: string;
  type: ContentType;
  status: 'published' | 'draft' | 'pending' | 'private';
  thumbnail?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  date: Date;
  excerpt?: string;
  url?: string;
}

export interface ContentRelation {
  id: string;
  sourceId: string;
  targetId: string;
  target: RelatedContent;
  relationType: RelationType;
  customLabel?: string;
  bidirectional: boolean;
  order: number;
  createdAt: Date;
}

export interface RelationGroup {
  type: RelationType;
  label: string;
  icon?: string;
  color?: string;
  relations: ContentRelation[];
}

export interface ContentRelationsConfig {
  allowedRelationTypes: RelationType[];
  maxRelationsPerType: number;
  showSuggestions: boolean;
  bidirectionalByDefault: boolean;
}

interface ContentRelationsContextType {
  contentId: string;
  relations: ContentRelation[];
  relationGroups: RelationGroup[];
  availableContent: RelatedContent[];
  suggestions: RelatedContent[];
  searchQuery: string;
  searchResults: RelatedContent[];
  selectedRelationType: RelationType;
  config: ContentRelationsConfig;
  isLoading: boolean;
  setSearchQuery: (query: string) => void;
  setSelectedRelationType: (type: RelationType) => void;
  addRelation: (targetId: string, type: RelationType, options?: { bidirectional?: boolean; customLabel?: string }) => void;
  removeRelation: (relationId: string) => void;
  updateRelation: (relationId: string, updates: Partial<ContentRelation>) => void;
  reorderRelations: (type: RelationType, relationIds: string[]) => void;
  searchContent: (query: string) => void;
  getSuggestions: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ContentRelationsContext = createContext<ContentRelationsContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface ContentRelationsProviderProps {
  children: ReactNode;
  contentId: string;
  initialRelations?: ContentRelation[];
  availableContent?: RelatedContent[];
  initialConfig?: Partial<ContentRelationsConfig>;
  onRelationChange?: (relations: ContentRelation[]) => void;
  onSearch?: (query: string) => Promise<RelatedContent[]>;
  onGetSuggestions?: () => Promise<RelatedContent[]>;
}

const defaultConfig: ContentRelationsConfig = {
  allowedRelationTypes: ['related', 'parent', 'child', 'sibling', 'series', 'translation', 'version', 'custom'],
  maxRelationsPerType: 10,
  showSuggestions: true,
  bidirectionalByDefault: false,
};

const relationTypeLabels: Record<RelationType, { label: string; icon: string; color: string }> = {
  related: { label: 'Related', icon: '🔗', color: '#3b82f6' },
  parent: { label: 'Parent', icon: '⬆️', color: '#8b5cf6' },
  child: { label: 'Child', icon: '⬇️', color: '#10b981' },
  sibling: { label: 'Sibling', icon: '↔️', color: '#f59e0b' },
  series: { label: 'Series', icon: '📚', color: '#ec4899' },
  translation: { label: 'Translation', icon: '🌐', color: '#06b6d4' },
  version: { label: 'Version', icon: '📋', color: '#6366f1' },
  custom: { label: 'Custom', icon: '⚙️', color: '#64748b' },
};

export const ContentRelationsProvider: React.FC<ContentRelationsProviderProps> = ({
  children,
  contentId,
  initialRelations = [],
  availableContent = [],
  initialConfig = {},
  onRelationChange,
  onSearch,
  onGetSuggestions,
}) => {
  const [relations, setRelations] = useState<ContentRelation[]>(initialRelations);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RelatedContent[]>([]);
  const [suggestions, setSuggestions] = useState<RelatedContent[]>([]);
  const [selectedRelationType, setSelectedRelationType] = useState<RelationType>('related');
  const [isLoading, setIsLoading] = useState(false);
  const config = { ...defaultConfig, ...initialConfig };

  const relationGroups: RelationGroup[] = useMemo(() => {
    return config.allowedRelationTypes.map(type => ({
      type,
      ...relationTypeLabels[type],
      relations: relations.filter(r => r.relationType === type).sort((a, b) => a.order - b.order),
    }));
  }, [relations, config.allowedRelationTypes]);

  const addRelation = useCallback((targetId: string, type: RelationType, options?: { bidirectional?: boolean; customLabel?: string }) => {
    const existingRelations = relations.filter(r => r.relationType === type);
    if (existingRelations.length >= config.maxRelationsPerType) return;
    if (relations.some(r => r.targetId === targetId && r.relationType === type)) return;

    const target = [...availableContent, ...searchResults, ...suggestions].find(c => c.id === targetId);
    if (!target) return;

    const newRelation: ContentRelation = {
      id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sourceId: contentId,
      targetId,
      target,
      relationType: type,
      customLabel: options?.customLabel,
      bidirectional: options?.bidirectional ?? config.bidirectionalByDefault,
      order: existingRelations.length,
      createdAt: new Date(),
    };

    setRelations(prev => {
      const updated = [...prev, newRelation];
      onRelationChange?.(updated);
      return updated;
    });
  }, [relations, contentId, availableContent, searchResults, suggestions, config, onRelationChange]);

  const removeRelation = useCallback((relationId: string) => {
    setRelations(prev => {
      const relation = prev.find(r => r.id === relationId);
      if (!relation) return prev;

      const updated = prev
        .filter(r => r.id !== relationId)
        .map((r, idx) => r.relationType === relation.relationType ? { ...r, order: idx } : r);

      onRelationChange?.(updated);
      return updated;
    });
  }, [onRelationChange]);

  const updateRelation = useCallback((relationId: string, updates: Partial<ContentRelation>) => {
    setRelations(prev => {
      const updated = prev.map(r => r.id === relationId ? { ...r, ...updates } : r);
      onRelationChange?.(updated);
      return updated;
    });
  }, [onRelationChange]);

  const reorderRelations = useCallback((type: RelationType, relationIds: string[]) => {
    setRelations(prev => {
      const updated = prev.map(r => {
        if (r.relationType !== type) return r;
        const newOrder = relationIds.indexOf(r.id);
        return newOrder >= 0 ? { ...r, order: newOrder } : r;
      });
      onRelationChange?.(updated);
      return updated;
    });
  }, [onRelationChange]);

  const searchContent = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      if (onSearch) {
        const results = await onSearch(query);
        setSearchResults(results.filter(c => c.id !== contentId));
      } else {
        // Fallback to filtering available content
        const filtered = availableContent.filter(c =>
          c.id !== contentId &&
          (c.title.toLowerCase().includes(query.toLowerCase()) ||
           c.excerpt?.toLowerCase().includes(query.toLowerCase()))
        );
        setSearchResults(filtered);
      }
    } finally {
      setIsLoading(false);
    }
  }, [contentId, availableContent, onSearch]);

  const getSuggestions = useCallback(async () => {
    if (!config.showSuggestions) return;

    setIsLoading(true);
    try {
      if (onGetSuggestions) {
        const results = await onGetSuggestions();
        setSuggestions(results.filter(c => c.id !== contentId));
      }
    } finally {
      setIsLoading(false);
    }
  }, [contentId, config.showSuggestions, onGetSuggestions]);

  const value: ContentRelationsContextType = {
    contentId,
    relations,
    relationGroups,
    availableContent,
    suggestions,
    searchQuery,
    searchResults,
    selectedRelationType,
    config,
    isLoading,
    setSearchQuery,
    setSelectedRelationType,
    addRelation,
    removeRelation,
    updateRelation,
    reorderRelations,
    searchContent,
    getSuggestions,
  };

  return (
    <ContentRelationsContext.Provider value={value}>
      {children}
    </ContentRelationsContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useContentRelations = (): ContentRelationsContextType => {
  const context = useContext(ContentRelationsContext);
  if (!context) {
    throw new Error('useContentRelations must be used within ContentRelationsProvider');
  }
  return context;
};

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
    padding: '1.5rem',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0,
  },
  searchContainer: {
    display: 'flex',
    gap: '0.75rem',
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
  select: {
    padding: '0.625rem 2rem 0.625rem 0.75rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.875rem',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.5rem center',
    backgroundSize: '1rem',
  },
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
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
  searchResults: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    maxHeight: '300px',
    overflowY: 'auto' as const,
    padding: '0.5rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
  },
  contentCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  thumbnail: {
    width: '48px',
    height: '48px',
    borderRadius: '6px',
    objectFit: 'cover' as const,
    backgroundColor: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
  },
  contentInfo: {
    flex: 1,
    minWidth: 0,
  },
  contentTitle: {
    fontSize: '0.9375rem',
    fontWeight: 500,
    color: '#1e293b',
    marginBottom: '0.125rem',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  contentMeta: {
    fontSize: '0.75rem',
    color: '#64748b',
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  statusBadge: {
    display: 'inline-flex',
    padding: '0.125rem 0.5rem',
    borderRadius: '9999px',
    fontSize: '0.6875rem',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
  },
  statusColors: {
    published: { backgroundColor: '#dcfce7', color: '#16a34a' },
    draft: { backgroundColor: '#fef3c7', color: '#d97706' },
    pending: { backgroundColor: '#e0e7ff', color: '#4f46e5' },
    private: { backgroundColor: '#f1f5f9', color: '#64748b' },
  },
  typeIcon: {
    post: '📝',
    page: '📄',
    product: '🛍️',
    event: '📅',
    media: '🖼️',
  },
  relationGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  },
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0',
    borderBottom: '1px solid #e2e8f0',
  },
  groupIcon: {
    fontSize: '1rem',
  },
  groupLabel: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1e293b',
  },
  groupCount: {
    fontSize: '0.75rem',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: '0.125rem 0.5rem',
    borderRadius: '9999px',
  },
  relationItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  dragHandle: {
    color: '#94a3b8',
    cursor: 'grab',
  },
  bidirectionalBadge: {
    fontSize: '0.6875rem',
    color: '#3b82f6',
    backgroundColor: '#dbeafe',
    padding: '0.125rem 0.375rem',
    borderRadius: '4px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    textAlign: 'center' as const,
    color: '#64748b',
  },
  suggestions: {
    padding: '1rem',
    backgroundColor: '#f0f9ff',
    borderRadius: '8px',
    border: '1px solid #bae6fd',
  },
  suggestionsTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#0369a1',
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  suggestionsList: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  },
  suggestionChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.75rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '9999px',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '0',
    overflowX: 'auto' as const,
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
    whiteSpace: 'nowrap' as const,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  tabActive: {
    color: '#3b82f6',
    borderBottomColor: '#3b82f6',
  },
};

// ============================================================================
// CONTENT SEARCH
// ============================================================================

export const ContentSearch: React.FC = () => {
  const { searchQuery, searchContent, searchResults, isLoading, selectedRelationType, addRelation, relations } = useContentRelations();

  const existingRelationIds = relations.map(r => r.targetId);

  return (
    <div>
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search content to add..."
          value={searchQuery}
          onChange={(e) => searchContent(e.target.value)}
          style={styles.searchInput}
        />
        {isLoading && (
          <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Searching...</div>
        )}
      </div>

      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginTop: '0.75rem' }}
          >
            <div style={styles.searchResults}>
              {searchResults.map(content => {
                const isAlreadyAdded = existingRelationIds.includes(content.id);

                return (
                  <motion.div
                    key={content.id}
                    style={{
                      ...styles.contentCard,
                      opacity: isAlreadyAdded ? 0.5 : 1,
                      cursor: isAlreadyAdded ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() => !isAlreadyAdded && addRelation(content.id, selectedRelationType)}
                    whileHover={!isAlreadyAdded ? { backgroundColor: '#f8fafc' } : {}}
                  >
                    {content.thumbnail ? (
                      <img src={content.thumbnail} alt="" style={styles.thumbnail as React.CSSProperties} />
                    ) : (
                      <div style={styles.thumbnail}>
                        {styles.typeIcon[content.type]}
                      </div>
                    )}

                    <div style={styles.contentInfo}>
                      <div style={styles.contentTitle}>{content.title}</div>
                      <div style={styles.contentMeta}>
                        <span>{content.author.name}</span>
                        <span>•</span>
                        <span>{new Date(content.date).toLocaleDateString()}</span>
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...styles.statusColors[content.status],
                          }}
                        >
                          {content.status}
                        </span>
                      </div>
                    </div>

                    {isAlreadyAdded ? (
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Already added</span>
                    ) : (
                      <button style={{ ...styles.button, ...styles.primaryButton, padding: '0.375rem 0.75rem' }}>
                        Add
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// RELATION TYPE TABS
// ============================================================================

export const RelationTypeTabs: React.FC = () => {
  const { config, selectedRelationType, setSelectedRelationType, relationGroups } = useContentRelations();

  return (
    <div style={styles.tabs}>
      {config.allowedRelationTypes.map(type => {
        const typeInfo = relationTypeLabels[type];
        const group = relationGroups.find(g => g.type === type);
        const count = group?.relations.length || 0;

        return (
          <button
            key={type}
            onClick={() => setSelectedRelationType(type)}
            style={{
              ...styles.tab,
              ...(selectedRelationType === type ? styles.tabActive : {}),
            }}
          >
            <span>{typeInfo.icon}</span>
            <span>{typeInfo.label}</span>
            {count > 0 && <span style={styles.groupCount}>{count}</span>}
          </button>
        );
      })}
    </div>
  );
};

// ============================================================================
// RELATION LIST
// ============================================================================

export const RelationList: React.FC = () => {
  const { relationGroups, selectedRelationType, removeRelation, updateRelation } = useContentRelations();

  const currentGroup = relationGroups.find(g => g.type === selectedRelationType);
  const relations = currentGroup?.relations || [];

  if (relations.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>
          {relationTypeLabels[selectedRelationType].icon}
        </div>
        <p>No {relationTypeLabels[selectedRelationType].label.toLowerCase()} relations yet</p>
        <p style={{ fontSize: '0.8125rem' }}>Search and add content above</p>
      </div>
    );
  }

  return (
    <div style={styles.relationGroup}>
      {relations.map(relation => (
        <motion.div
          key={relation.id}
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          style={styles.relationItem}
        >
          <div style={styles.dragHandle}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="8" cy="6" r="2" />
              <circle cx="16" cy="6" r="2" />
              <circle cx="8" cy="12" r="2" />
              <circle cx="16" cy="12" r="2" />
              <circle cx="8" cy="18" r="2" />
              <circle cx="16" cy="18" r="2" />
            </svg>
          </div>

          {relation.target.thumbnail ? (
            <img src={relation.target.thumbnail} alt="" style={styles.thumbnail as React.CSSProperties} />
          ) : (
            <div style={styles.thumbnail}>
              {styles.typeIcon[relation.target.type]}
            </div>
          )}

          <div style={styles.contentInfo}>
            <div style={styles.contentTitle}>{relation.target.title}</div>
            <div style={styles.contentMeta}>
              <span>{relation.target.author.name}</span>
              <span>•</span>
              <span>{new Date(relation.target.date).toLocaleDateString()}</span>
              {relation.customLabel && (
                <>
                  <span>•</span>
                  <span style={{ fontStyle: 'italic' }}>{relation.customLabel}</span>
                </>
              )}
            </div>
          </div>

          {relation.bidirectional && (
            <span style={styles.bidirectionalBadge}>↔ Bidirectional</span>
          )}

          <span
            style={{
              ...styles.statusBadge,
              ...styles.statusColors[relation.target.status],
            }}
          >
            {relation.target.status}
          </span>

          <button
            onClick={() => updateRelation(relation.id, { bidirectional: !relation.bidirectional })}
            style={styles.iconButton}
            title={relation.bidirectional ? 'Make one-way' : 'Make bidirectional'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {relation.bidirectional ? (
                <path d="M5 12h14M12 5l7 7-7 7" />
              ) : (
                <path d="M5 12h14M5 12l7-7M5 12l7 7M19 12l-7-7M19 12l-7 7" />
              )}
            </svg>
          </button>

          <button
            onClick={() => removeRelation(relation.id)}
            style={{ ...styles.iconButton, color: '#dc2626' }}
            title="Remove relation"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================================
// SUGGESTIONS PANEL
// ============================================================================

export const SuggestionsPanel: React.FC = () => {
  const { suggestions, addRelation, selectedRelationType, getSuggestions, config, relations } = useContentRelations();

  const existingRelationIds = relations.map(r => r.targetId);
  const availableSuggestions = suggestions.filter(s => !existingRelationIds.includes(s.id));

  React.useEffect(() => {
    if (config.showSuggestions) {
      getSuggestions();
    }
  }, [config.showSuggestions, getSuggestions]);

  if (!config.showSuggestions || availableSuggestions.length === 0) {
    return null;
  }

  return (
    <div style={styles.suggestions}>
      <div style={styles.suggestionsTitle}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        Suggested Relations
      </div>
      <div style={styles.suggestionsList}>
        {availableSuggestions.slice(0, 5).map(suggestion => (
          <motion.button
            key={suggestion.id}
            style={styles.suggestionChip}
            onClick={() => addRelation(suggestion.id, selectedRelationType)}
            whileHover={{ backgroundColor: '#f0f9ff', borderColor: '#3b82f6' }}
          >
            <span>{styles.typeIcon[suggestion.type]}</span>
            <span>{suggestion.title}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// RELATION OVERVIEW
// ============================================================================

export const RelationOverview: React.FC = () => {
  const { relationGroups } = useContentRelations();

  const totalRelations = relationGroups.reduce((sum, g) => sum + g.relations.length, 0);

  if (totalRelations === 0) {
    return null;
  }

  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      {relationGroups
        .filter(g => g.relations.length > 0)
        .map(group => (
          <div
            key={group.type}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.375rem 0.75rem',
              backgroundColor: `${group.color}15`,
              border: `1px solid ${group.color}30`,
              borderRadius: '9999px',
              fontSize: '0.8125rem',
            }}
          >
            <span>{group.icon}</span>
            <span style={{ color: group.color, fontWeight: 500 }}>{group.label}</span>
            <span style={{ color: '#64748b' }}>({group.relations.length})</span>
          </div>
        ))}
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ContentRelations: React.FC = () => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Content Relations</h2>
        <RelationOverview />
      </div>

      <RelationTypeTabs />

      <ContentSearch />

      <SuggestionsPanel />

      <RelationList />
    </div>
  );
};

export default ContentRelations;
