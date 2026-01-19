/**
 * Test Utilities - Common testing utilities for RustPress IDE tests
 */

import React, { ReactElement, PropsWithChildren } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// ============================================
// PROVIDERS WRAPPER
// ============================================

interface WrapperProps {
  children: React.ReactNode;
}

const AllTheProviders: React.FC<WrapperProps> = ({ children }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

// ============================================
// CUSTOM RENDER
// ============================================

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult & { user: ReturnType<typeof userEvent.setup> } => {
  const user = userEvent.setup();
  return {
    user,
    ...render(ui, { wrapper: AllTheProviders, ...options }),
  };
};

// ============================================
// MOCK FACTORIES
// ============================================

export const createMockFile = (overrides = {}) => ({
  id: 'file-1',
  path: '/src/index.ts',
  name: 'index.ts',
  content: 'export default {}',
  language: 'typescript',
  isDirty: false,
  cursorPosition: { line: 1, column: 1 },
  ...overrides,
});

export const createMockFolder = (overrides = {}) => ({
  id: 'folder-1',
  path: '/src',
  name: 'src',
  type: 'folder' as const,
  children: [],
  isExpanded: false,
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  avatar: '/avatar.png',
  color: '#3b82f6',
  ...overrides,
});

export const createMockMessage = (overrides = {}) => ({
  id: 'msg-1',
  content: 'Test message',
  sender: createMockUser(),
  timestamp: new Date().toISOString(),
  reactions: [],
  ...overrides,
});

export const createMockConversation = (overrides = {}) => ({
  id: 'conv-1',
  title: 'Test Conversation',
  participants: [createMockUser()],
  messages: [createMockMessage()],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isPinned: false,
  tags: [],
  ...overrides,
});

export const createMockBreakpoint = (overrides = {}) => ({
  id: 'bp-1',
  file: '/src/index.ts',
  line: 10,
  enabled: true,
  condition: '',
  hitCount: 0,
  ...overrides,
});

export const createMockStackFrame = (overrides = {}) => ({
  id: 'frame-1',
  name: 'testFunction',
  file: '/src/index.ts',
  line: 10,
  column: 5,
  ...overrides,
});

export const createMockVariable = (overrides = {}) => ({
  name: 'testVar',
  value: 'test value',
  type: 'string',
  evaluateName: 'testVar',
  ...overrides,
});

export const createMockExtension = (overrides = {}) => ({
  id: 'ext-1',
  name: 'Test Extension',
  displayName: 'Test Extension',
  version: '1.0.0',
  description: 'A test extension',
  enabled: true,
  ...overrides,
});

export const createMockBookmark = (overrides = {}) => ({
  id: 'bookmark-1',
  file: '/src/index.ts',
  line: 10,
  label: 'Test bookmark',
  ...overrides,
});

export const createMockSearchResult = (overrides = {}) => ({
  file: '/src/index.ts',
  line: 10,
  column: 5,
  match: 'test',
  context: 'const test = "test"',
  ...overrides,
});

export const createMockGitStatus = (overrides = {}) => ({
  branch: 'main',
  ahead: 0,
  behind: 0,
  staged: [],
  unstaged: [],
  untracked: [],
  ...overrides,
});

export const createMockEditorConfig = (overrides = {}) => ({
  fontSize: 14,
  fontFamily: 'JetBrains Mono',
  tabSize: 2,
  wordWrap: false,
  minimap: true,
  lineNumbers: true,
  bracketMatching: true,
  indentGuides: true,
  ...overrides,
});

export const createMockTheme = (overrides = {}) => ({
  id: 'dark',
  name: 'Dark Theme',
  type: 'dark' as const,
  colors: {
    background: '#1e1e2e',
    foreground: '#d4d4d4',
    accent: '#3b82f6',
  },
  ...overrides,
});

// ============================================
// ASYNC HELPERS
// ============================================

export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

export const flushPromises = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// ============================================
// EVENT HELPERS
// ============================================

export const createKeyboardEvent = (
  key: string,
  options: Partial<KeyboardEventInit> = {}
) => {
  return new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  });
};

export const createMouseEvent = (
  type: string,
  options: Partial<MouseEventInit> = {}
) => {
  return new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    ...options,
  });
};

// ============================================
// MOCK API HELPERS
// ============================================

export const mockApiResponse = <T,>(data: T) => {
  return vi.fn().mockResolvedValue({ data, status: 200 });
};

export const mockApiError = (message: string, status = 500) => {
  return vi.fn().mockRejectedValue({
    response: { data: { message }, status },
  });
};

// ============================================
// ACCESSIBILITY HELPERS
// ============================================

export const getAccessibleName = (element: HTMLElement) => {
  return (
    element.getAttribute('aria-label') ||
    element.getAttribute('title') ||
    element.textContent
  );
};

// ============================================
// EXPORTS
// ============================================

export * from '@testing-library/react';
export { customRender as render, userEvent };
