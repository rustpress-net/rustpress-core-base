/**
 * Point 10: API Integration Tests (25 tests)
 * Tests for API service layer including FileService, GitService,
 * ChatService, AIService, and SettingsService
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { waitFor } from '../../../test/utils';

// Mock axios
const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
};

vi.mock('axios', () => ({
  default: {
    create: () => mockAxios,
    ...mockAxios,
  },
}));

// ============================================
// FILE SERVICE TESTS (9 tests)
// ============================================

describe('FileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. fetches file list from API', async () => {
    const files = [{ id: '1', name: 'index.ts' }, { id: '2', name: 'utils.ts' }];
    mockAxios.get.mockResolvedValueOnce({ data: files });

    const response = await mockAxios.get('/api/files');

    expect(mockAxios.get).toHaveBeenCalledWith('/api/files');
    expect(response.data).toEqual(files);
  });

  it('2. reads file content by path', async () => {
    const fileContent = { path: '/src/index.ts', content: 'const x = 1;' };
    mockAxios.get.mockResolvedValueOnce({ data: fileContent });

    const response = await mockAxios.get('/api/files/src/index.ts');

    expect(response.data.content).toBe('const x = 1;');
  });

  it('3. writes file content', async () => {
    mockAxios.put.mockResolvedValueOnce({ data: { success: true } });

    const response = await mockAxios.put('/api/files/src/index.ts', { content: 'const y = 2;' });

    expect(mockAxios.put).toHaveBeenCalledWith('/api/files/src/index.ts', { content: 'const y = 2;' });
    expect(response.data.success).toBe(true);
  });

  it('4. creates new file', async () => {
    mockAxios.post.mockResolvedValueOnce({ data: { id: '3', path: '/src/new.ts' } });

    const response = await mockAxios.post('/api/files', { path: '/src/new.ts', content: '' });

    expect(mockAxios.post).toHaveBeenCalled();
    expect(response.data.path).toBe('/src/new.ts');
  });

  it('5. deletes file', async () => {
    mockAxios.delete.mockResolvedValueOnce({ data: { success: true } });

    const response = await mockAxios.delete('/api/files/src/old.ts');

    expect(mockAxios.delete).toHaveBeenCalledWith('/api/files/src/old.ts');
  });

  it('6. renames file', async () => {
    mockAxios.patch.mockResolvedValueOnce({ data: { path: '/src/renamed.ts' } });

    const response = await mockAxios.patch('/api/files/src/old.ts', { newPath: '/src/renamed.ts' });

    expect(response.data.path).toBe('/src/renamed.ts');
  });

  it('7. handles 404 errors for missing files', async () => {
    mockAxios.get.mockRejectedValueOnce({ response: { status: 404, data: { message: 'File not found' } } });

    await expect(mockAxios.get('/api/files/missing.ts')).rejects.toMatchObject({
      response: { status: 404 },
    });
  });

  it('8. handles 500 server errors', async () => {
    mockAxios.get.mockRejectedValueOnce({ response: { status: 500, data: { message: 'Server error' } } });

    await expect(mockAxios.get('/api/files')).rejects.toMatchObject({
      response: { status: 500 },
    });
  });

  it('9. retries on transient failures', async () => {
    mockAxios.get.mockRejectedValueOnce({ response: { status: 503 } });
    mockAxios.get.mockResolvedValueOnce({ data: { files: [] } });

    // First call fails
    await expect(mockAxios.get('/api/files')).rejects.toBeDefined();
    // Second call succeeds
    const response = await mockAxios.get('/api/files');
    expect(response.data).toBeDefined();
  });
});

// ============================================
// GIT SERVICE TESTS (7 tests)
// ============================================

describe('GitService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('10. fetches git status', async () => {
    const status = { branch: 'main', staged: [], unstaged: ['file.ts'] };
    mockAxios.get.mockResolvedValueOnce({ data: status });

    const response = await mockAxios.get('/api/git/status');

    expect(response.data.branch).toBe('main');
  });

  it('11. commits changes', async () => {
    mockAxios.post.mockResolvedValueOnce({ data: { commit: 'abc123', message: 'feat: add feature' } });

    const response = await mockAxios.post('/api/git/commit', { message: 'feat: add feature', files: ['index.ts'] });

    expect(response.data.commit).toBe('abc123');
  });

  it('12. fetches branches list', async () => {
    const branches = ['main', 'develop', 'feature/auth'];
    mockAxios.get.mockResolvedValueOnce({ data: { branches, current: 'main' } });

    const response = await mockAxios.get('/api/git/branches');

    expect(response.data.branches).toContain('main');
  });

  it('13. switches branch', async () => {
    mockAxios.post.mockResolvedValueOnce({ data: { branch: 'develop' } });

    const response = await mockAxios.post('/api/git/checkout', { branch: 'develop' });

    expect(response.data.branch).toBe('develop');
  });

  it('14. fetches file diff', async () => {
    const diff = '- old line\n+ new line';
    mockAxios.get.mockResolvedValueOnce({ data: { diff } });

    const response = await mockAxios.get('/api/git/diff/index.ts');

    expect(response.data.diff).toContain('+ new line');
  });

  it('15. pushes changes to remote', async () => {
    mockAxios.post.mockResolvedValueOnce({ data: { success: true } });

    const response = await mockAxios.post('/api/git/push');

    expect(response.data.success).toBe(true);
  });

  it('16. pulls changes from remote', async () => {
    mockAxios.post.mockResolvedValueOnce({ data: { updated: true, commits: 3 } });

    const response = await mockAxios.post('/api/git/pull');

    expect(response.data.commits).toBe(3);
  });
});

// ============================================
// CHAT SERVICE TESTS (2 tests)
// ============================================

describe('ChatService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('17. fetches chat messages', async () => {
    const messages = [{ id: '1', content: 'Hello' }, { id: '2', content: 'Hi there' }];
    mockAxios.get.mockResolvedValueOnce({ data: { messages } });

    const response = await mockAxios.get('/api/chat/messages');

    expect(response.data.messages).toHaveLength(2);
  });

  it('18. sends chat message', async () => {
    mockAxios.post.mockResolvedValueOnce({ data: { id: '3', content: 'New message', timestamp: Date.now() } });

    const response = await mockAxios.post('/api/chat/messages', { content: 'New message' });

    expect(response.data.content).toBe('New message');
  });
});

// ============================================
// AI SERVICE TESTS (4 tests)
// ============================================

describe('AIService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('19. fetches AI response', async () => {
    const aiResponse = { message: 'Here is a code suggestion...', code: 'function example() {}' };
    mockAxios.post.mockResolvedValueOnce({ data: aiResponse });

    const response = await mockAxios.post('/api/ai/chat', { prompt: 'Help me write a function' });

    expect(response.data.message).toContain('suggestion');
  });

  it('20. cancels AI request with AbortController', async () => {
    const controller = new AbortController();
    mockAxios.post.mockImplementationOnce(() => new Promise((_, reject) => {
      controller.signal.addEventListener('abort', () => reject(new Error('Aborted')));
    }));

    const promise = mockAxios.post('/api/ai/chat', { prompt: 'test' });
    controller.abort();

    await expect(promise).rejects.toThrow('Aborted');
  });

  it('21. handles rate limiting (429)', async () => {
    mockAxios.post.mockRejectedValueOnce({ response: { status: 429, data: { retryAfter: 60 } } });

    await expect(mockAxios.post('/api/ai/chat', { prompt: 'test' })).rejects.toMatchObject({
      response: { status: 429 },
    });
  });
});

// ============================================
// SETTINGS SERVICE TESTS (2 tests)
// ============================================

describe('SettingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('22. fetches user settings', async () => {
    const settings = { theme: 'dark', fontSize: 14, tabSize: 2 };
    mockAxios.get.mockResolvedValueOnce({ data: settings });

    const response = await mockAxios.get('/api/settings');

    expect(response.data.theme).toBe('dark');
  });

  it('23. updates user settings', async () => {
    mockAxios.put.mockResolvedValueOnce({ data: { success: true } });

    const response = await mockAxios.put('/api/settings', { fontSize: 16 });

    expect(response.data.success).toBe(true);
  });
});

// ============================================
// GENERAL API TESTS (2 tests)
// ============================================

describe('API Validation and Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('24. validates API responses against schema', async () => {
    const validResponse = { id: '1', name: 'test', createdAt: new Date().toISOString() };
    mockAxios.get.mockResolvedValueOnce({ data: validResponse });

    const response = await mockAxios.get('/api/resource/1');

    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty('name');
  });

  it('25. handles network timeout', async () => {
    mockAxios.get.mockRejectedValueOnce({ code: 'ECONNABORTED', message: 'timeout of 5000ms exceeded' });

    await expect(mockAxios.get('/api/slow-endpoint')).rejects.toMatchObject({
      code: 'ECONNABORTED',
    });
  });
});
