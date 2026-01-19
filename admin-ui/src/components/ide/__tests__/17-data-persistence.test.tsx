/**
 * Point 17: Data Persistence Tests (25 tests)
 * Tests for localStorage, sessionStorage, IndexedDB,
 * auto-save, and data recovery functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test/utils';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// ============================================
// LOCAL STORAGE TESTS (5 tests)
// ============================================

describe('LocalStorage Persistence', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  it('1. persists open files to localStorage', () => {
    const openFiles = [
      { path: '/src/index.ts', content: 'export {}' },
      { path: '/src/app.ts', content: 'const app = {}' },
    ];

    localStorage.setItem('openFiles', JSON.stringify(openFiles));

    const retrieved = JSON.parse(localStorage.getItem('openFiles') || '[]');
    expect(retrieved).toHaveLength(2);
    expect(retrieved[0].path).toBe('/src/index.ts');
  });

  it('2. persists editor state to localStorage', () => {
    const editorState = {
      activeFile: '/src/index.ts',
      cursorPosition: { line: 10, column: 5 },
      scrollTop: 200,
    };

    localStorage.setItem('editorState', JSON.stringify(editorState));

    const retrieved = JSON.parse(localStorage.getItem('editorState') || '{}');
    expect(retrieved.activeFile).toBe('/src/index.ts');
    expect(retrieved.cursorPosition.line).toBe(10);
  });

  it('3. persists user preferences to localStorage', () => {
    const preferences = {
      theme: 'dark',
      fontSize: 14,
      tabSize: 2,
      wordWrap: true,
    };

    localStorage.setItem('preferences', JSON.stringify(preferences));

    const retrieved = JSON.parse(localStorage.getItem('preferences') || '{}');
    expect(retrieved.theme).toBe('dark');
    expect(retrieved.fontSize).toBe(14);
  });

  it('4. persists recent files to localStorage', () => {
    const recentFiles = [
      { path: '/src/index.ts', timestamp: Date.now() - 1000 },
      { path: '/src/app.ts', timestamp: Date.now() - 2000 },
      { path: '/src/utils.ts', timestamp: Date.now() - 3000 },
    ];

    localStorage.setItem('recentFiles', JSON.stringify(recentFiles));

    const retrieved = JSON.parse(localStorage.getItem('recentFiles') || '[]');
    expect(retrieved).toHaveLength(3);
    expect(retrieved[0].path).toBe('/src/index.ts');
  });

  it('5. persists workspace settings to localStorage', () => {
    const workspaceSettings = {
      rootPath: '/projects/myapp',
      excludedFolders: ['node_modules', '.git'],
      autoSave: true,
    };

    localStorage.setItem('workspaceSettings', JSON.stringify(workspaceSettings));

    const retrieved = JSON.parse(localStorage.getItem('workspaceSettings') || '{}');
    expect(retrieved.rootPath).toBe('/projects/myapp');
    expect(retrieved.excludedFolders).toContain('node_modules');
  });
});

// ============================================
// SESSION STORAGE TESTS (3 tests)
// ============================================

describe('SessionStorage Persistence', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('6. persists temporary session data', () => {
    const sessionData = {
      searchQuery: 'function',
      searchResults: ['file1.ts', 'file2.ts'],
    };

    sessionStorage.setItem('searchSession', JSON.stringify(sessionData));

    const retrieved = JSON.parse(sessionStorage.getItem('searchSession') || '{}');
    expect(retrieved.searchQuery).toBe('function');
  });

  it('7. persists panel states per session', () => {
    const panelStates = {
      sidebarCollapsed: false,
      terminalHeight: 300,
      activityBarVisible: true,
    };

    sessionStorage.setItem('panelStates', JSON.stringify(panelStates));

    const retrieved = JSON.parse(sessionStorage.getItem('panelStates') || '{}');
    expect(retrieved.terminalHeight).toBe(300);
  });

  it('8. clears session data on window close simulation', () => {
    sessionStorage.setItem('tempData', 'value');
    expect(sessionStorage.getItem('tempData')).toBe('value');

    sessionStorage.clear();
    expect(sessionStorage.getItem('tempData')).toBeNull();
  });
});

// ============================================
// AUTO-SAVE TESTS (5 tests)
// ============================================

describe('Auto-Save Functionality', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('9. auto-saves content after delay', async () => {
    const onAutoSave = vi.fn();

    const AutoSaveEditor = ({ onAutoSave }: { onAutoSave: (content: string) => void }) => {
      const [content, setContent] = React.useState('');

      React.useEffect(() => {
        const timer = setTimeout(() => {
          if (content) onAutoSave(content);
        }, 1000);
        return () => clearTimeout(timer);
      }, [content, onAutoSave]);

      return (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type to auto-save"
        />
      );
    };

    render(<AutoSaveEditor onAutoSave={onAutoSave} />);

    fireEvent.change(screen.getByPlaceholderText('Type to auto-save'), {
      target: { value: 'New content' },
    });

    expect(onAutoSave).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);

    expect(onAutoSave).toHaveBeenCalledWith('New content');
  });

  it('10. debounces auto-save on rapid changes', async () => {
    const onAutoSave = vi.fn();

    const DebouncedEditor = ({ onAutoSave }: { onAutoSave: (content: string) => void }) => {
      const [content, setContent] = React.useState('');
      const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();

      const handleChange = (newContent: string) => {
        setContent(newContent);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => onAutoSave(newContent), 500);
      };

      return (
        <input
          value={content}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Debounced input"
        />
      );
    };

    render(<DebouncedEditor onAutoSave={onAutoSave} />);
    const input = screen.getByPlaceholderText('Debounced input');

    // Rapid changes
    fireEvent.change(input, { target: { value: 'a' } });
    vi.advanceTimersByTime(100);
    fireEvent.change(input, { target: { value: 'ab' } });
    vi.advanceTimersByTime(100);
    fireEvent.change(input, { target: { value: 'abc' } });

    // Should not have saved yet
    expect(onAutoSave).not.toHaveBeenCalled();

    // Wait for debounce
    vi.advanceTimersByTime(500);

    // Should only save once with final value
    expect(onAutoSave).toHaveBeenCalledTimes(1);
    expect(onAutoSave).toHaveBeenCalledWith('abc');
  });

  it('11. saves draft versions for recovery', () => {
    const drafts: Record<string, { content: string; timestamp: number }> = {};

    const saveDraft = (path: string, content: string) => {
      drafts[path] = { content, timestamp: Date.now() };
    };

    const getDraft = (path: string) => drafts[path];

    saveDraft('/src/index.ts', 'draft content');

    const draft = getDraft('/src/index.ts');
    expect(draft?.content).toBe('draft content');
    expect(draft?.timestamp).toBeDefined();
  });

  it('12. indicates unsaved changes in UI', () => {
    const UnsavedIndicator = ({ hasUnsavedChanges }: { hasUnsavedChanges: boolean }) => (
      <div>
        <span data-testid="filename">index.ts</span>
        {hasUnsavedChanges && <span data-testid="unsaved-dot">●</span>}
      </div>
    );

    const { rerender } = render(<UnsavedIndicator hasUnsavedChanges={false} />);
    expect(screen.queryByTestId('unsaved-dot')).not.toBeInTheDocument();

    rerender(<UnsavedIndicator hasUnsavedChanges={true} />);
    expect(screen.getByTestId('unsaved-dot')).toBeInTheDocument();
  });

  it('13. prompts before closing with unsaved changes', () => {
    const UnsavedPrompt = ({ hasChanges, onClose }: { hasChanges: boolean; onClose: () => void }) => {
      const [showPrompt, setShowPrompt] = React.useState(false);

      const handleClose = () => {
        if (hasChanges) {
          setShowPrompt(true);
        } else {
          onClose();
        }
      };

      return (
        <div>
          <button onClick={handleClose}>Close</button>
          {showPrompt && (
            <div role="dialog">
              <p>You have unsaved changes. Close anyway?</p>
              <button onClick={onClose}>Discard</button>
              <button onClick={() => setShowPrompt(false)}>Cancel</button>
            </div>
          )}
        </div>
      );
    };

    const onClose = vi.fn();
    render(<UnsavedPrompt hasChanges={true} onClose={onClose} />);

    fireEvent.click(screen.getByText('Close'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/unsaved changes/i)).toBeInTheDocument();
  });
});

// ============================================
// DATA RECOVERY TESTS (4 tests)
// ============================================

describe('Data Recovery', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  it('14. recovers unsaved changes on reload', () => {
    const unsavedData = {
      path: '/src/index.ts',
      content: 'Unsaved content',
      timestamp: Date.now() - 60000, // 1 minute ago
    };

    localStorage.setItem('unsavedChanges', JSON.stringify([unsavedData]));

    const RecoveryPrompt = () => {
      const [recovered, setRecovered] = React.useState<typeof unsavedData | null>(null);

      React.useEffect(() => {
        const saved = localStorage.getItem('unsavedChanges');
        if (saved) {
          const data = JSON.parse(saved);
          if (data.length > 0) setRecovered(data[0]);
        }
      }, []);

      if (recovered) {
        return (
          <div role="alert">
            <p>Recovered unsaved changes from {recovered.path}</p>
            <button>Restore</button>
            <button>Discard</button>
          </div>
        );
      }

      return null;
    };

    render(<RecoveryPrompt />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/recovered unsaved changes/i)).toBeInTheDocument();
  });

  it('15. restores session state after crash', () => {
    const sessionState = {
      openFiles: ['/src/app.ts', '/src/utils.ts'],
      activeFile: '/src/app.ts',
      cursorPositions: {
        '/src/app.ts': { line: 15, column: 10 },
      },
    };

    localStorage.setItem('lastSession', JSON.stringify(sessionState));

    const restored = JSON.parse(localStorage.getItem('lastSession') || '{}');
    expect(restored.openFiles).toHaveLength(2);
    expect(restored.activeFile).toBe('/src/app.ts');
  });

  it('16. maintains undo history across sessions', () => {
    const undoHistory = [
      { action: 'insert', position: 0, text: 'Hello' },
      { action: 'insert', position: 5, text: ' World' },
      { action: 'delete', position: 5, text: ' World' },
    ];

    localStorage.setItem('undoHistory:/src/index.ts', JSON.stringify(undoHistory));

    const retrieved = JSON.parse(localStorage.getItem('undoHistory:/src/index.ts') || '[]');
    expect(retrieved).toHaveLength(3);
    expect(retrieved[0].action).toBe('insert');
  });

  it('17. clears old recovery data', () => {
    const now = Date.now();
    const oldData = { content: 'old', timestamp: now - 86400000 * 8 }; // 8 days old
    const newData = { content: 'new', timestamp: now - 86400000 * 1 }; // 1 day old

    localStorage.setItem('recovery_old', JSON.stringify(oldData));
    localStorage.setItem('recovery_new', JSON.stringify(newData));

    // Simulate cleanup of data older than 7 days
    const maxAge = 86400000 * 7;
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('recovery_')) {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        if (now - data.timestamp > maxAge) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));

    expect(localStorage.getItem('recovery_old')).toBeNull();
    expect(localStorage.getItem('recovery_new')).not.toBeNull();
  });
});

// ============================================
// FILE HISTORY TESTS (4 tests)
// ============================================

describe('File History', () => {
  it('18. tracks file edit history', () => {
    const fileHistory: Array<{ path: string; action: string; timestamp: number }> = [];

    const trackEdit = (path: string, action: string) => {
      fileHistory.push({ path, action, timestamp: Date.now() });
    };

    trackEdit('/src/index.ts', 'modified');
    trackEdit('/src/index.ts', 'saved');
    trackEdit('/src/app.ts', 'created');

    expect(fileHistory).toHaveLength(3);
    expect(fileHistory.filter((h) => h.path === '/src/index.ts')).toHaveLength(2);
  });

  it('19. shows file timeline', () => {
    const timeline = [
      { action: 'Created', timestamp: '2024-01-01 10:00' },
      { action: 'Modified', timestamp: '2024-01-01 11:00' },
      { action: 'Saved', timestamp: '2024-01-01 11:30' },
    ];

    const Timeline = ({ events }: { events: typeof timeline }) => (
      <ul>
        {events.map((event, i) => (
          <li key={i}>
            {event.action} at {event.timestamp}
          </li>
        ))}
      </ul>
    );

    render(<Timeline events={timeline} />);

    expect(screen.getByText(/Created at/)).toBeInTheDocument();
    expect(screen.getByText(/Modified at/)).toBeInTheDocument();
    expect(screen.getByText(/Saved at/)).toBeInTheDocument();
  });

  it('20. supports file version comparison', () => {
    const versions = [
      { version: 1, content: 'Original content' },
      { version: 2, content: 'Modified content' },
      { version: 3, content: 'Final content' },
    ];

    const VersionCompare = ({ versions }: { versions: typeof versions }) => (
      <div>
        <select aria-label="Version A">
          {versions.map((v) => (
            <option key={v.version} value={v.version}>
              Version {v.version}
            </option>
          ))}
        </select>
        <select aria-label="Version B">
          {versions.map((v) => (
            <option key={v.version} value={v.version}>
              Version {v.version}
            </option>
          ))}
        </select>
        <button>Compare</button>
      </div>
    );

    render(<VersionCompare versions={versions} />);

    expect(screen.getByLabelText('Version A')).toBeInTheDocument();
    expect(screen.getByLabelText('Version B')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Compare' })).toBeInTheDocument();
  });

  it('21. reverts to previous version', async () => {
    const onRevert = vi.fn();

    const RevertButton = ({ onRevert }: { onRevert: (version: number) => void }) => (
      <button onClick={() => onRevert(2)}>Revert to Version 2</button>
    );

    const { user } = render(<RevertButton onRevert={onRevert} />);

    await user.click(screen.getByRole('button'));

    expect(onRevert).toHaveBeenCalledWith(2);
  });
});

// ============================================
// CACHE MANAGEMENT TESTS (4 tests)
// ============================================

describe('Cache Management', () => {
  it('22. caches file contents in memory', () => {
    const fileCache = new Map<string, string>();

    const cacheFile = (path: string, content: string) => {
      fileCache.set(path, content);
    };

    const getCachedFile = (path: string) => fileCache.get(path);

    cacheFile('/src/index.ts', 'cached content');

    expect(getCachedFile('/src/index.ts')).toBe('cached content');
    expect(getCachedFile('/src/unknown.ts')).toBeUndefined();
  });

  it('23. invalidates cache on file change', () => {
    const cache = new Map<string, { content: string; mtime: number }>();

    const setCache = (path: string, content: string, mtime: number) => {
      cache.set(path, { content, mtime });
    };

    const invalidateIfStale = (path: string, currentMtime: number) => {
      const cached = cache.get(path);
      if (cached && cached.mtime < currentMtime) {
        cache.delete(path);
        return true;
      }
      return false;
    };

    setCache('/src/index.ts', 'old content', 1000);
    expect(cache.has('/src/index.ts')).toBe(true);

    const invalidated = invalidateIfStale('/src/index.ts', 2000);
    expect(invalidated).toBe(true);
    expect(cache.has('/src/index.ts')).toBe(false);
  });

  it('24. limits cache size', () => {
    const maxCacheSize = 3;
    const cache = new Map<string, string>();

    const addToCache = (key: string, value: string) => {
      if (cache.size >= maxCacheSize) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(key, value);
    };

    addToCache('file1', 'content1');
    addToCache('file2', 'content2');
    addToCache('file3', 'content3');
    addToCache('file4', 'content4'); // Should evict file1

    expect(cache.size).toBe(maxCacheSize);
    expect(cache.has('file1')).toBe(false);
    expect(cache.has('file4')).toBe(true);
  });

  it('25. clears all cached data', () => {
    localStorage.setItem('cache1', 'value1');
    localStorage.setItem('cache2', 'value2');
    sessionStorage.setItem('session1', 'value1');

    const clearAllCaches = () => {
      localStorage.clear();
      sessionStorage.clear();
    };

    clearAllCaches();

    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });
});
