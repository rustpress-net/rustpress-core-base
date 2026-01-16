/**
 * Git Service
 * Handles Git operations for themes, plugins, and functions
 * Each item is its own repository with sync status tracking
 */

const API_BASE = '/api/v1';

// ============================================
// TYPES
// ============================================

export type RepoType = 'theme' | 'plugin' | 'function';

export interface GitStatus {
  branch: string;
  remoteBranch: string;
  ahead: number;  // commits ahead of remote
  behind: number; // commits behind remote
  hasUncommittedChanges: boolean;
  hasUnpushedChanges: boolean;
  lastFetch: string;
  remoteUrl: string;
  isClean: boolean;
}

export interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed' | 'untracked';
  oldPath?: string; // for renamed files
  staged: boolean;
}

export interface CommitInfo {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  email: string;
  date: string;
  isPushed: boolean;
}

export interface Repository {
  id: string;
  name: string;
  type: RepoType;
  path: string;
  status: GitStatus;
  changes: FileChange[];
  recentCommits: CommitInfo[];
  isLoading: boolean;
  error: string | null;
}

export interface SyncResult {
  success: boolean;
  message: string;
  conflicts?: string[];
  newCommits?: number;
}

export interface BranchInfo {
  name: string;
  isRemote: boolean;
  isCurrent: boolean;
  lastCommit: string;
  behindMain: number;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Get Git status for a repository
 */
export async function getRepoStatus(type: RepoType, id: string): Promise<GitStatus> {
  try {
    const response = await fetch(`${API_BASE}/${type}s/${id}/git/status`);
    if (!response.ok) throw new Error('Failed to fetch git status');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching git status for ${type}/${id}:`, error);
    // Return mock data for development
    return getMockGitStatus(type, id);
  }
}

/**
 * Get list of changed files in a repository
 */
export async function getRepoChanges(type: RepoType, id: string): Promise<FileChange[]> {
  try {
    const response = await fetch(`${API_BASE}/${type}s/${id}/git/changes`);
    if (!response.ok) throw new Error('Failed to fetch changes');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching changes for ${type}/${id}:`, error);
    return [];
  }
}

/**
 * Get recent commits for a repository
 */
export async function getRepoCommits(type: RepoType, id: string, limit: number = 10): Promise<CommitInfo[]> {
  try {
    const response = await fetch(`${API_BASE}/${type}s/${id}/git/commits?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch commits');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching commits for ${type}/${id}:`, error);
    return getMockCommits();
  }
}

/**
 * Get all repositories with their status
 */
export async function getAllRepositories(): Promise<Repository[]> {
  try {
    const response = await fetch(`${API_BASE}/git/repositories`);
    if (!response.ok) throw new Error('Failed to fetch repositories');
    return await response.json();
  } catch (error) {
    console.error('Error fetching all repositories:', error);
    return getMockRepositories();
  }
}

/**
 * Stage files for commit
 */
export async function stageFiles(type: RepoType, id: string, paths: string[]): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/${type}s/${id}/git/stage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths }),
    });
    return response.ok;
  } catch (error) {
    console.error(`Error staging files for ${type}/${id}:`, error);
    return false;
  }
}

/**
 * Unstage files
 */
export async function unstageFiles(type: RepoType, id: string, paths: string[]): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/${type}s/${id}/git/unstage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths }),
    });
    return response.ok;
  } catch (error) {
    console.error(`Error unstaging files for ${type}/${id}:`, error);
    return false;
  }
}

/**
 * Commit changes
 */
export async function commitChanges(
  type: RepoType,
  id: string,
  message: string,
  stagedOnly: boolean = true
): Promise<{ success: boolean; commitHash?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/${type}s/${id}/git/commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, stagedOnly }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    const data = await response.json();
    return { success: true, commitHash: data.hash };
  } catch (error) {
    console.error(`Error committing changes for ${type}/${id}:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * Push changes to remote
 */
export async function pushChanges(type: RepoType, id: string, force: boolean = false): Promise<SyncResult> {
  try {
    const response = await fetch(`${API_BASE}/${type}s/${id}/git/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ force }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, message: error };
    }

    return { success: true, message: 'Changes pushed successfully' };
  } catch (error) {
    console.error(`Error pushing changes for ${type}/${id}:`, error);
    return { success: false, message: String(error) };
  }
}

/**
 * Pull changes from remote
 */
export async function pullChanges(type: RepoType, id: string): Promise<SyncResult> {
  try {
    const response = await fetch(`${API_BASE}/${type}s/${id}/git/pull`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        message: error.message || 'Pull failed',
        conflicts: error.conflicts
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: `Pulled ${data.newCommits || 0} new commits`,
      newCommits: data.newCommits
    };
  } catch (error) {
    console.error(`Error pulling changes for ${type}/${id}:`, error);
    return { success: false, message: String(error) };
  }
}

/**
 * Fetch updates from remote without merging
 */
export async function fetchUpdates(type: RepoType, id: string): Promise<GitStatus> {
  try {
    const response = await fetch(`${API_BASE}/${type}s/${id}/git/fetch`, {
      method: 'POST',
    });

    if (!response.ok) throw new Error('Fetch failed');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching updates for ${type}/${id}:`, error);
    return getMockGitStatus(type, id);
  }
}

/**
 * Sync all repositories (fetch status for all)
 */
export async function syncAllRepositories(): Promise<Repository[]> {
  try {
    const response = await fetch(`${API_BASE}/git/sync-all`, {
      method: 'POST',
    });

    if (!response.ok) throw new Error('Sync failed');
    return await response.json();
  } catch (error) {
    console.error('Error syncing all repositories:', error);
    return getMockRepositories();
  }
}

/**
 * Get branches for a repository
 */
export async function getBranches(type: RepoType, id: string): Promise<BranchInfo[]> {
  try {
    const response = await fetch(`${API_BASE}/${type}s/${id}/git/branches`);
    if (!response.ok) throw new Error('Failed to fetch branches');
    return await response.json();
  } catch (error) {
    console.error(`Error fetching branches for ${type}/${id}:`, error);
    return [
      { name: 'main', isRemote: false, isCurrent: true, lastCommit: 'a1b2c3d', behindMain: 0 },
      { name: 'develop', isRemote: false, isCurrent: false, lastCommit: 'e4f5g6h', behindMain: 2 },
    ];
  }
}

/**
 * Switch branch
 */
export async function switchBranch(type: RepoType, id: string, branch: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/${type}s/${id}/git/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branch }),
    });
    return response.ok;
  } catch (error) {
    console.error(`Error switching branch for ${type}/${id}:`, error);
    return false;
  }
}

/**
 * Create new branch
 */
export async function createBranch(
  type: RepoType,
  id: string,
  name: string,
  baseBranch?: string
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/${type}s/${id}/git/branch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, baseBranch }),
    });
    return response.ok;
  } catch (error) {
    console.error(`Error creating branch for ${type}/${id}:`, error);
    return false;
  }
}

/**
 * Discard changes to a file
 */
export async function discardChanges(type: RepoType, id: string, path: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/${type}s/${id}/git/discard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
    return response.ok;
  } catch (error) {
    console.error(`Error discarding changes for ${type}/${id}:`, error);
    return false;
  }
}

/**
 * Get diff for a file
 */
export async function getFileDiff(type: RepoType, id: string, path: string): Promise<string> {
  try {
    const response = await fetch(
      `${API_BASE}/${type}s/${id}/git/diff?path=${encodeURIComponent(path)}`
    );
    if (!response.ok) throw new Error('Failed to fetch diff');
    return await response.text();
  } catch (error) {
    console.error(`Error fetching diff for ${type}/${id}/${path}:`, error);
    return '';
  }
}

/**
 * Clone a repository
 */
export async function cloneRepository(
  type: RepoType,
  url: string,
  name: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE}/${type}s/clone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, name }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    const data = await response.json();
    return { success: true, id: data.id };
  } catch (error) {
    console.error(`Error cloning repository:`, error);
    return { success: false, error: String(error) };
  }
}

// ============================================
// MOCK DATA FOR DEVELOPMENT
// ============================================

function getMockGitStatus(type: RepoType, id: string): GitStatus {
  // Simulate different states for demo
  const hasUnpushed = Math.random() > 0.5;
  const hasBehind = Math.random() > 0.7;

  return {
    branch: 'main',
    remoteBranch: 'origin/main',
    ahead: hasUnpushed ? Math.floor(Math.random() * 5) + 1 : 0,
    behind: hasBehind ? Math.floor(Math.random() * 3) : 0,
    hasUncommittedChanges: Math.random() > 0.6,
    hasUnpushedChanges: hasUnpushed,
    lastFetch: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    remoteUrl: `https://github.com/rustpress/${type}s-${id}.git`,
    isClean: !hasUnpushed && !hasBehind,
  };
}

function getMockCommits(): CommitInfo[] {
  return [
    {
      hash: 'a1b2c3d4e5f6g7h8i9j0',
      shortHash: 'a1b2c3d',
      message: 'Update header styles',
      author: 'Developer',
      email: 'dev@example.com',
      date: new Date(Date.now() - 7200000).toISOString(),
      isPushed: true,
    },
    {
      hash: 'k1l2m3n4o5p6q7r8s9t0',
      shortHash: 'k1l2m3n',
      message: 'Add responsive navigation',
      author: 'Developer',
      email: 'dev@example.com',
      date: new Date(Date.now() - 86400000).toISOString(),
      isPushed: true,
    },
    {
      hash: 'u1v2w3x4y5z6a7b8c9d0',
      shortHash: 'u1v2w3x',
      message: 'Initial setup',
      author: 'Developer',
      email: 'dev@example.com',
      date: new Date(Date.now() - 172800000).toISOString(),
      isPushed: true,
    },
  ];
}

function getMockRepositories(): Repository[] {
  const themes: Repository[] = [
    {
      id: 'rustpress-developer',
      name: 'RustPress Developer',
      type: 'theme',
      path: 'themes/rustpress-developer',
      status: getMockGitStatus('theme', 'rustpress-developer'),
      changes: [],
      recentCommits: getMockCommits(),
      isLoading: false,
      error: null,
    },
    {
      id: 'rustpress-enterprise',
      name: 'RustPress Enterprise',
      type: 'theme',
      path: 'themes/rustpress-enterprise',
      status: {
        ...getMockGitStatus('theme', 'rustpress-enterprise'),
        ahead: 2,
        hasUnpushedChanges: true,
      },
      changes: [
        { path: 'templates/home.html', status: 'modified', staged: true },
        { path: 'assets/css/style.css', status: 'modified', staged: false },
      ],
      recentCommits: getMockCommits(),
      isLoading: false,
      error: null,
    },
  ];

  const plugins: Repository[] = [
    {
      id: 'seo-optimizer',
      name: 'SEO Optimizer',
      type: 'plugin',
      path: 'plugins/seo-optimizer',
      status: getMockGitStatus('plugin', 'seo-optimizer'),
      changes: [],
      recentCommits: getMockCommits(),
      isLoading: false,
      error: null,
    },
    {
      id: 'analytics-dashboard',
      name: 'Analytics Dashboard',
      type: 'plugin',
      path: 'plugins/analytics-dashboard',
      status: {
        ...getMockGitStatus('plugin', 'analytics-dashboard'),
        behind: 3,
      },
      changes: [],
      recentCommits: getMockCommits(),
      isLoading: false,
      error: null,
    },
  ];

  const functions: Repository[] = [
    {
      id: 'email-handler',
      name: 'Email Handler',
      type: 'function',
      path: 'functions/email-handler',
      status: getMockGitStatus('function', 'email-handler'),
      changes: [],
      recentCommits: getMockCommits(),
      isLoading: false,
      error: null,
    },
  ];

  return [...themes, ...plugins, ...functions];
}

export default {
  getRepoStatus,
  getRepoChanges,
  getRepoCommits,
  getAllRepositories,
  stageFiles,
  unstageFiles,
  commitChanges,
  pushChanges,
  pullChanges,
  fetchUpdates,
  syncAllRepositories,
  getBranches,
  switchBranch,
  createBranch,
  discardChanges,
  getFileDiff,
  cloneRepository,
};
