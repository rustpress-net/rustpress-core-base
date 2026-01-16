import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Revision {
  id: string;
  version: number;
  title: string;
  content: string;
  excerpt?: string;
  author: RevisionAuthor;
  createdAt: Date;
  type: 'autosave' | 'manual' | 'publish' | 'scheduled';
  wordCount: number;
  characterCount: number;
  changes: RevisionChange[];
  metadata?: Record<string, unknown>;
}

export interface RevisionAuthor {
  id: string;
  name: string;
  avatar?: string;
}

export interface RevisionChange {
  field: string;
  type: 'added' | 'removed' | 'modified';
  oldValue?: string;
  newValue?: string;
}

export interface RevisionDiff {
  type: 'equal' | 'insert' | 'delete';
  text: string;
}

export interface RevisionConfig {
  maxRevisions?: number;
  autoSaveInterval?: number;
  showAutosaves?: boolean;
  enableRestore?: boolean;
  enablePreview?: boolean;
  enableCompare?: boolean;
}

interface RevisionContextType {
  revisions: Revision[];
  setRevisions: React.Dispatch<React.SetStateAction<Revision[]>>;
  currentRevision: Revision | null;
  selectedRevision: Revision | null;
  compareRevision: Revision | null;
  setSelectedRevision: (revision: Revision | null) => void;
  setCompareRevision: (revision: Revision | null) => void;
  config: RevisionConfig;
  filter: 'all' | 'manual' | 'autosave' | 'publish';
  setFilter: (filter: 'all' | 'manual' | 'autosave' | 'publish') => void;
  restoreRevision: (revision: Revision) => void;
  deleteRevision: (revisionId: string) => void;
  getDiff: (oldContent: string, newContent: string) => RevisionDiff[];
}

// ============================================================================
// CONTEXT
// ============================================================================

const RevisionContext = createContext<RevisionContextType | null>(null);

// ============================================================================
// PROVIDER
// ============================================================================

interface RevisionProviderProps {
  children: React.ReactNode;
  initialRevisions?: Revision[];
  currentRevision?: Revision | null;
  initialConfig?: RevisionConfig;
  onRestore?: (revision: Revision) => void;
  onDelete?: (revisionId: string) => void;
  onSelect?: (revision: Revision) => void;
}

export const RevisionProvider: React.FC<RevisionProviderProps> = ({
  children,
  initialRevisions = [],
  currentRevision = null,
  initialConfig = {},
  onRestore,
  onDelete,
  onSelect,
}) => {
  const [revisions, setRevisions] = useState<Revision[]>(initialRevisions);
  const [selectedRevision, setSelectedRevisionState] = useState<Revision | null>(null);
  const [compareRevision, setCompareRevision] = useState<Revision | null>(null);
  const [filter, setFilter] = useState<'all' | 'manual' | 'autosave' | 'publish'>('all');

  const config: RevisionConfig = {
    maxRevisions: 50,
    autoSaveInterval: 60000,
    showAutosaves: true,
    enableRestore: true,
    enablePreview: true,
    enableCompare: true,
    ...initialConfig,
  };

  const setSelectedRevision = useCallback((revision: Revision | null) => {
    setSelectedRevisionState(revision);
    if (revision) {
      onSelect?.(revision);
    }
  }, [onSelect]);

  const restoreRevision = useCallback((revision: Revision) => {
    onRestore?.(revision);
  }, [onRestore]);

  const deleteRevision = useCallback((revisionId: string) => {
    setRevisions(prev => prev.filter(r => r.id !== revisionId));
    onDelete?.(revisionId);
    if (selectedRevision?.id === revisionId) {
      setSelectedRevisionState(null);
    }
    if (compareRevision?.id === revisionId) {
      setCompareRevision(null);
    }
  }, [onDelete, selectedRevision, compareRevision]);

  const getDiff = useCallback((oldContent: string, newContent: string): RevisionDiff[] => {
    // Simple word-based diff implementation
    const oldWords = oldContent.split(/\s+/);
    const newWords = newContent.split(/\s+/);
    const diffs: RevisionDiff[] = [];

    let i = 0;
    let j = 0;

    while (i < oldWords.length || j < newWords.length) {
      if (i >= oldWords.length) {
        diffs.push({ type: 'insert', text: newWords[j] + ' ' });
        j++;
      } else if (j >= newWords.length) {
        diffs.push({ type: 'delete', text: oldWords[i] + ' ' });
        i++;
      } else if (oldWords[i] === newWords[j]) {
        diffs.push({ type: 'equal', text: oldWords[i] + ' ' });
        i++;
        j++;
      } else {
        // Look ahead for matches
        const oldLookAhead = oldWords.slice(i, i + 5).indexOf(newWords[j]);
        const newLookAhead = newWords.slice(j, j + 5).indexOf(oldWords[i]);

        if (oldLookAhead !== -1 && (newLookAhead === -1 || oldLookAhead <= newLookAhead)) {
          for (let k = 0; k < oldLookAhead; k++) {
            diffs.push({ type: 'delete', text: oldWords[i + k] + ' ' });
          }
          i += oldLookAhead;
        } else if (newLookAhead !== -1) {
          for (let k = 0; k < newLookAhead; k++) {
            diffs.push({ type: 'insert', text: newWords[j + k] + ' ' });
          }
          j += newLookAhead;
        } else {
          diffs.push({ type: 'delete', text: oldWords[i] + ' ' });
          diffs.push({ type: 'insert', text: newWords[j] + ' ' });
          i++;
          j++;
        }
      }
    }

    return diffs;
  }, []);

  return (
    <RevisionContext.Provider value={{
      revisions,
      setRevisions,
      currentRevision,
      selectedRevision,
      compareRevision,
      setSelectedRevision,
      setCompareRevision,
      config,
      filter,
      setFilter,
      restoreRevision,
      deleteRevision,
      getDiff,
    }}>
      {children}
    </RevisionContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useRevisionHistory = (): RevisionContextType => {
  const context = useContext(RevisionContext);
  if (!context) {
    throw new Error('useRevisionHistory must be used within a RevisionProvider');
  }
  return context;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

const formatDateTime = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const typeIcons: Record<Revision['type'], { icon: string; label: string; color: string }> = {
  autosave: { icon: '💾', label: 'Autosave', color: 'text-gray-500' },
  manual: { icon: '✏️', label: 'Saved', color: 'text-blue-500' },
  publish: { icon: '🚀', label: 'Published', color: 'text-green-500' },
  scheduled: { icon: '📅', label: 'Scheduled', color: 'text-purple-500' },
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Filter Bar
export const RevisionFilterBar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { filter, setFilter, revisions, config } = useRevisionHistory();

  const filters: { value: typeof filter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'manual', label: 'Manual Saves' },
    ...(config.showAutosaves ? [{ value: 'autosave' as const, label: 'Autosaves' }] : []),
    { value: 'publish', label: 'Published' },
  ];

  const getCounts = () => {
    return {
      all: revisions.length,
      manual: revisions.filter(r => r.type === 'manual').length,
      autosave: revisions.filter(r => r.type === 'autosave').length,
      publish: revisions.filter(r => r.type === 'publish' || r.type === 'scheduled').length,
    };
  };

  const counts = getCounts();

  return (
    <div className={`flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg ${className}`}>
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => setFilter(f.value)}
          className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            filter === f.value
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {f.label} ({counts[f.value]})
        </button>
      ))}
    </div>
  );
};

// Revision List Item
export const RevisionListItem: React.FC<{
  revision: Revision;
  isSelected: boolean;
  isCompare: boolean;
  className?: string;
}> = ({ revision, isSelected, isCompare, className = '' }) => {
  const { setSelectedRevision, setCompareRevision, config, selectedRevision, currentRevision } = useRevisionHistory();
  const typeInfo = typeIcons[revision.type];

  const isCurrent = currentRevision?.id === revision.id;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-3 border rounded-lg cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : isCompare
          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      } ${className}`}
      onClick={() => setSelectedRevision(revision)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className={typeInfo.color}>{typeInfo.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                v{revision.version}
              </span>
              {isCurrent && (
                <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded">
                  Current
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {formatRelativeTime(revision.createdAt)}
            </p>
          </div>
        </div>

        {config.enableCompare && selectedRevision && selectedRevision.id !== revision.id && !isCurrent && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCompareRevision(isCompare ? null : revision);
            }}
            className={`text-xs px-2 py-1 rounded ${
              isCompare
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {isCompare ? 'Comparing' : 'Compare'}
          </button>
        )}
      </div>

      <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          {revision.author.avatar ? (
            <img src={revision.author.avatar} alt="" className="w-4 h-4 rounded-full" />
          ) : (
            <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-[10px]">
              {revision.author.name[0]}
            </div>
          )}
          <span>{revision.author.name}</span>
        </div>
        <span>•</span>
        <span>{revision.wordCount} words</span>
      </div>

      {revision.changes.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {revision.changes.slice(0, 3).map((change, i) => (
            <span
              key={i}
              className={`px-1.5 py-0.5 text-xs rounded ${
                change.type === 'added'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : change.type === 'removed'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}
            >
              {change.field}
            </span>
          ))}
          {revision.changes.length > 3 && (
            <span className="text-xs text-gray-400">
              +{revision.changes.length - 3} more
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

// Revision List
export const RevisionList: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { revisions, filter, selectedRevision, compareRevision, config } = useRevisionHistory();

  const filteredRevisions = useMemo(() => {
    let filtered = [...revisions];

    if (!config.showAutosaves && filter !== 'autosave') {
      filtered = filtered.filter(r => r.type !== 'autosave');
    }

    if (filter === 'manual') {
      filtered = filtered.filter(r => r.type === 'manual');
    } else if (filter === 'autosave') {
      filtered = filtered.filter(r => r.type === 'autosave');
    } else if (filter === 'publish') {
      filtered = filtered.filter(r => r.type === 'publish' || r.type === 'scheduled');
    }

    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [revisions, filter, config.showAutosaves]);

  return (
    <div className={`space-y-2 ${className}`}>
      {filteredRevisions.map((revision) => (
        <RevisionListItem
          key={revision.id}
          revision={revision}
          isSelected={selectedRevision?.id === revision.id}
          isCompare={compareRevision?.id === revision.id}
        />
      ))}

      {filteredRevisions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-3xl mb-2">📜</div>
          <p>No revisions found</p>
        </div>
      )}
    </div>
  );
};

// Revision Preview
export const RevisionPreview: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { selectedRevision, compareRevision, restoreRevision, deleteRevision, config, currentRevision, getDiff } = useRevisionHistory();

  if (!selectedRevision) {
    return (
      <div className={`flex items-center justify-center h-64 text-gray-500 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-2">👈</div>
          <p>Select a revision to preview</p>
        </div>
      </div>
    );
  }

  const isCurrent = currentRevision?.id === selectedRevision.id;
  const typeInfo = typeIcons[selectedRevision.type];

  const renderDiff = () => {
    if (!compareRevision) return null;

    const diffs = getDiff(compareRevision.content, selectedRevision.content);

    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg font-mono text-sm overflow-x-auto">
        {diffs.map((diff, i) => (
          <span
            key={i}
            className={
              diff.type === 'insert'
                ? 'bg-green-200 dark:bg-green-900/50 text-green-900 dark:text-green-300'
                : diff.type === 'delete'
                ? 'bg-red-200 dark:bg-red-900/50 text-red-900 dark:text-red-300 line-through'
                : 'text-gray-700 dark:text-gray-300'
            }
          >
            {diff.text}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{typeInfo.icon}</span>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                Version {selectedRevision.version}
                {isCurrent && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded">
                    Current
                  </span>
                )}
              </h4>
              <p className="text-sm text-gray-500">
                {formatDateTime(selectedRevision.createdAt)} by {selectedRevision.author.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {config.enableRestore && !isCurrent && (
              <button
                onClick={() => restoreRevision(selectedRevision)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Restore
              </button>
            )}
            {!isCurrent && (
              <button
                onClick={() => deleteRevision(selectedRevision.id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        {compareRevision && (
          <div className="mt-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-sm">
            <span className="text-purple-700 dark:text-purple-300">
              Comparing with v{compareRevision.version} ({formatRelativeTime(compareRevision.createdAt)})
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 flex items-center gap-6 text-sm">
        <div>
          <span className="text-gray-500">Words:</span>
          <span className="ml-1 font-medium text-gray-900 dark:text-white">
            {selectedRevision.wordCount}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Characters:</span>
          <span className="ml-1 font-medium text-gray-900 dark:text-white">
            {selectedRevision.characterCount}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Changes:</span>
          <span className="ml-1 font-medium text-gray-900 dark:text-white">
            {selectedRevision.changes.length}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {compareRevision ? (
          renderDiff()
        ) : (
          <div className="prose dark:prose-invert max-w-none">
            <h3>{selectedRevision.title}</h3>
            <div dangerouslySetInnerHTML={{ __html: selectedRevision.content }} />
          </div>
        )}
      </div>

      {/* Changes Summary */}
      {selectedRevision.changes.length > 0 && !compareRevision && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Changes in this version
          </h5>
          <div className="space-y-2">
            {selectedRevision.changes.map((change, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className={`mt-0.5 ${
                  change.type === 'added' ? 'text-green-500' :
                  change.type === 'removed' ? 'text-red-500' : 'text-yellow-500'
                }`}>
                  {change.type === 'added' ? '+' : change.type === 'removed' ? '-' : '~'}
                </span>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {change.field}
                  </span>
                  <span className="text-gray-500 ml-1">
                    {change.type === 'added' ? 'added' :
                     change.type === 'removed' ? 'removed' : 'modified'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Compact Revision Timeline
export const RevisionTimeline: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { revisions, selectedRevision, setSelectedRevision } = useRevisionHistory();

  const sortedRevisions = useMemo(() =>
    [...revisions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10),
    [revisions]
  );

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

      <div className="space-y-4">
        {sortedRevisions.map((revision, index) => {
          const typeInfo = typeIcons[revision.type];
          const isSelected = selectedRevision?.id === revision.id;

          return (
            <motion.div
              key={revision.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedRevision(revision)}
              className={`relative pl-10 cursor-pointer ${
                isSelected ? 'opacity-100' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 ${
                isSelected
                  ? 'bg-blue-500 border-blue-500'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
              }`} />

              <div className="flex items-center gap-2">
                <span className={typeInfo.color}>{typeInfo.icon}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  v{revision.version}
                </span>
                <span className="text-xs text-gray-500">
                  {formatRelativeTime(revision.createdAt)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const RevisionHistory: React.FC<{
  initialRevisions?: Revision[];
  currentRevision?: Revision | null;
  initialConfig?: RevisionConfig;
  onRestore?: (revision: Revision) => void;
  onDelete?: (revisionId: string) => void;
  onSelect?: (revision: Revision) => void;
  className?: string;
}> = ({
  initialRevisions,
  currentRevision,
  initialConfig,
  onRestore,
  onDelete,
  onSelect,
  className = '',
}) => {
  return (
    <RevisionProvider
      initialRevisions={initialRevisions}
      currentRevision={currentRevision}
      initialConfig={initialConfig}
      onRestore={onRestore}
      onDelete={onDelete}
      onSelect={onSelect}
    >
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden ${className}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Revision History
            </h3>
          </div>
          <RevisionFilterBar />
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 dark:divide-gray-700">
          <div className="p-4 max-h-[500px] overflow-y-auto">
            <RevisionList />
          </div>
          <div className="p-4 max-h-[500px] overflow-y-auto">
            <RevisionPreview />
          </div>
        </div>
      </div>
    </RevisionProvider>
  );
};

export default RevisionHistory;
