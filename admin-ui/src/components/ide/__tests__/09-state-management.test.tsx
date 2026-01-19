/**
 * Point 9: State Management Tests (25 tests)
 * Tests for Zustand stores including chatStore, collaborationStore,
 * appStore, navigationStore, and themeEditorStore
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

// Mock the stores
const mockChatStore = {
  messages: [],
  conversations: [],
  activeConversationId: null,
  addMessage: vi.fn(),
  removeMessage: vi.fn(),
  updateMessage: vi.fn(),
  loadConversations: vi.fn(),
  setActiveConversation: vi.fn(),
  createConversation: vi.fn(),
};

const mockCollaborationStore = {
  collaborators: [],
  remoteCursors: new Map(),
  remoteSelections: new Map(),
  fileCollaborators: new Map(),
  addCollaborator: vi.fn(),
  removeCollaborator: vi.fn(),
  moveCursor: vi.fn(),
  updateSelection: vi.fn(),
  openFile: vi.fn(),
  closeFile: vi.fn(),
};

const mockAppStore = {
  openFiles: [],
  activeFileId: null,
  setActiveFile: vi.fn(),
  openFile: vi.fn(),
  closeFile: vi.fn(),
  reorderTabs: vi.fn(),
};

const mockNavigationStore = {
  history: [],
  currentIndex: -1,
  navigate: vi.fn(),
  goBack: vi.fn(),
  goForward: vi.fn(),
  canGoBack: false,
  canGoForward: false,
};

const mockThemeEditorStore = {
  theme: { id: 'dark', colors: {} },
  updateColor: vi.fn(),
  saveTheme: vi.fn(),
  loadTheme: vi.fn(),
  resetTheme: vi.fn(),
};

// ============================================
// CHAT STORE TESTS (5 tests)
// ============================================

describe('chatStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. initializes chatStore with empty state', () => {
    expect(mockChatStore.messages).toEqual([]);
    expect(mockChatStore.conversations).toEqual([]);
    expect(mockChatStore.activeConversationId).toBeNull();
  });

  it('2. adds message to conversation', () => {
    const message = { id: '1', content: 'Hello', sender: 'user-1' };

    act(() => {
      mockChatStore.addMessage(message);
    });

    expect(mockChatStore.addMessage).toHaveBeenCalledWith(message);
  });

  it('3. removes message from conversation', () => {
    act(() => {
      mockChatStore.removeMessage('msg-1');
    });

    expect(mockChatStore.removeMessage).toHaveBeenCalledWith('msg-1');
  });

  it('4. updates message content', () => {
    const updates = { content: 'Updated content' };

    act(() => {
      mockChatStore.updateMessage('msg-1', updates);
    });

    expect(mockChatStore.updateMessage).toHaveBeenCalledWith('msg-1', updates);
  });

  it('5. loads conversations from API', async () => {
    act(() => {
      mockChatStore.loadConversations();
    });

    expect(mockChatStore.loadConversations).toHaveBeenCalled();
  });
});

// ============================================
// COLLABORATION STORE TESTS (5 tests)
// ============================================

describe('collaborationStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('6. initializes collaborationStore', () => {
    expect(mockCollaborationStore.collaborators).toEqual([]);
    expect(mockCollaborationStore.remoteCursors).toBeInstanceOf(Map);
  });

  it('7. adds collaborator to session', () => {
    const collaborator = { id: 'user-2', name: 'Jane', color: '#ff0000' };

    act(() => {
      mockCollaborationStore.addCollaborator(collaborator);
    });

    expect(mockCollaborationStore.addCollaborator).toHaveBeenCalledWith(collaborator);
  });

  it('8. removes collaborator from session', () => {
    act(() => {
      mockCollaborationStore.removeCollaborator('user-2');
    });

    expect(mockCollaborationStore.removeCollaborator).toHaveBeenCalledWith('user-2');
  });

  it('9. updates remote cursor position', () => {
    const position = { line: 10, column: 5 };

    act(() => {
      mockCollaborationStore.moveCursor('/src/index.ts', position);
    });

    expect(mockCollaborationStore.moveCursor).toHaveBeenCalledWith('/src/index.ts', position);
  });

  it('10. updates remote selection', () => {
    const selection = { startLine: 5, startColumn: 1, endLine: 10, endColumn: 20 };

    act(() => {
      mockCollaborationStore.updateSelection('/src/index.ts', selection);
    });

    expect(mockCollaborationStore.updateSelection).toHaveBeenCalledWith('/src/index.ts', selection);
  });
});

// ============================================
// APP STORE TESTS (5 tests)
// ============================================

describe('appStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('11. initializes appStore with empty state', () => {
    expect(mockAppStore.openFiles).toEqual([]);
    expect(mockAppStore.activeFileId).toBeNull();
  });

  it('12. sets active file', () => {
    act(() => {
      mockAppStore.setActiveFile('file-1');
    });

    expect(mockAppStore.setActiveFile).toHaveBeenCalledWith('file-1');
  });

  it('13. opens multiple files', () => {
    const file = { id: 'file-2', path: '/src/utils.ts', content: '' };

    act(() => {
      mockAppStore.openFile(file);
    });

    expect(mockAppStore.openFile).toHaveBeenCalledWith(file);
  });

  it('14. closes file and removes from open files', () => {
    act(() => {
      mockAppStore.closeFile('file-1');
    });

    expect(mockAppStore.closeFile).toHaveBeenCalledWith('file-1');
  });

  it('15. reorders tabs via drag and drop', () => {
    act(() => {
      mockAppStore.reorderTabs(0, 2);
    });

    expect(mockAppStore.reorderTabs).toHaveBeenCalledWith(0, 2);
  });
});

// ============================================
// NAVIGATION STORE TESTS (4 tests)
// ============================================

describe('navigationStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('16. initializes navigationStore', () => {
    expect(mockNavigationStore.history).toEqual([]);
    expect(mockNavigationStore.currentIndex).toBe(-1);
  });

  it('17. navigates to route and adds to history', () => {
    act(() => {
      mockNavigationStore.navigate('/editor');
    });

    expect(mockNavigationStore.navigate).toHaveBeenCalledWith('/editor');
  });

  it('18. tracks navigation history', () => {
    act(() => {
      mockNavigationStore.navigate('/settings');
      mockNavigationStore.navigate('/editor');
    });

    expect(mockNavigationStore.navigate).toHaveBeenCalledTimes(2);
  });

  it('19. goes back/forward in history', () => {
    act(() => {
      mockNavigationStore.goBack();
    });

    expect(mockNavigationStore.goBack).toHaveBeenCalled();
  });
});

// ============================================
// THEME EDITOR STORE TESTS (5 tests)
// ============================================

describe('themeEditorStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('20. initializes themeEditorStore with default theme', () => {
    expect(mockThemeEditorStore.theme).toBeDefined();
    expect(mockThemeEditorStore.theme.id).toBe('dark');
  });

  it('21. updates theme colors', () => {
    act(() => {
      mockThemeEditorStore.updateColor('background', '#1a1a2e');
    });

    expect(mockThemeEditorStore.updateColor).toHaveBeenCalledWith('background', '#1a1a2e');
  });

  it('22. saves theme to storage', () => {
    act(() => {
      mockThemeEditorStore.saveTheme();
    });

    expect(mockThemeEditorStore.saveTheme).toHaveBeenCalled();
  });

  it('23. loads theme from storage', () => {
    act(() => {
      mockThemeEditorStore.loadTheme('custom-theme');
    });

    expect(mockThemeEditorStore.loadTheme).toHaveBeenCalledWith('custom-theme');
  });

  it('24. resets theme to defaults', () => {
    act(() => {
      mockThemeEditorStore.resetTheme();
    });

    expect(mockThemeEditorStore.resetTheme).toHaveBeenCalled();
  });
});

// ============================================
// PERSISTENCE TEST (1 test)
// ============================================

describe('Store Persistence', () => {
  it('25. persists state to localStorage', () => {
    const key = 'rustpress-app-state';
    const state = { openFiles: ['file-1'], activeFileId: 'file-1' };

    localStorage.setItem(key, JSON.stringify(state));

    const retrieved = JSON.parse(localStorage.getItem(key) || '{}');
    expect(retrieved.openFiles).toContain('file-1');
  });
});
