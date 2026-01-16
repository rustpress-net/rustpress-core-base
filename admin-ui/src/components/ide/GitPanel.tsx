/**
 * GitPanel - Multi-repository Git controls for the IDE
 * Tracks themes, plugins, and functions as separate repositories
 * Shows sync status (commits ahead/behind) for each
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  GitBranch, GitCommit, Upload, Download, RefreshCw, ChevronDown, ChevronRight,
  File, Check, AlertCircle, Cloud, CloudOff, Plus, Minus, Edit, AlertTriangle,
  Package, Puzzle, Zap, FolderGit, GitMerge, Loader2, ExternalLink, X,
  GitPullRequest, History, Server, Laptop, FolderPlus, CheckCircle2
} from 'lucide-react';
import gitService, {
  Repository, RepoType, FileChange, CommitInfo, BranchInfo
} from '../../services/gitService';

// ============================================
// TYPES
// ============================================

interface GitPanelProps {
  modifiedFiles: string[];
  currentRepo?: {
    type: RepoType;
    id: string;
  };
  onFileSelect?: (path: string) => void;
  /** Triggers a refresh - increment to force reload */
  refreshTrigger?: number;
  /** Called when a PR is created */
  onCreatePR?: (repo: Repository, targetBranch: string, title: string, description: string) => void;
}

type ViewMode = 'all' | 'current';

// ============================================
// SUB-COMPONENTS
// ============================================

const StatusBadge: React.FC<{
  ahead: number;
  behind: number;
  hasChanges: boolean;
}> = ({ ahead, behind, hasChanges }) => {
  if (!ahead && !behind && !hasChanges) {
    return (
      <span className="flex items-center gap-1 text-xs text-green-400">
        <Check className="w-3 h-3" /> Synced
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {ahead > 0 && (
        <span className="flex items-center gap-0.5 text-xs text-blue-400" title={`${ahead} commits to push`}>
          <Upload className="w-3 h-3" />{ahead}
        </span>
      )}
      {behind > 0 && (
        <span className="flex items-center gap-0.5 text-xs text-orange-400" title={`${behind} commits to pull`}>
          <Download className="w-3 h-3" />{behind}
        </span>
      )}
      {hasChanges && (
        <span className="w-2 h-2 bg-yellow-400 rounded-full" title="Has uncommitted changes" />
      )}
    </div>
  );
};

const RepoIcon: React.FC<{ type: RepoType; className?: string }> = ({ type, className }) => {
  const icons = {
    theme: Package,
    plugin: Puzzle,
    function: Zap,
  };
  const Icon = icons[type];
  return <Icon className={className} />;
};

const FileChangeItem: React.FC<{
  change: FileChange;
  isSelected: boolean;
  onToggle: () => void;
  onView?: () => void;
}> = ({ change, isSelected, onToggle, onView }) => {
  const statusColors = {
    added: 'text-green-400',
    modified: 'text-yellow-400',
    deleted: 'text-red-400',
    renamed: 'text-blue-400',
    untracked: 'text-gray-400',
  };

  const statusIcons = {
    added: Plus,
    modified: Edit,
    deleted: Minus,
    renamed: GitMerge,
    untracked: AlertCircle,
  };

  const StatusIcon = statusIcons[change.status];

  return (
    <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-800 rounded cursor-pointer group">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        className="w-3.5 h-3.5 rounded border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 bg-gray-700"
      />
      <StatusIcon className={`w-3.5 h-3.5 ${statusColors[change.status]}`} />
      <span className="text-xs text-gray-300 truncate flex-1">{change.path}</span>
      {change.staged && (
        <span className="text-[10px] px-1 py-0.5 bg-green-500/20 text-green-400 rounded">staged</span>
      )}
      {onView && (
        <button
          onClick={(e) => { e.preventDefault(); onView(); }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
          title="View changes"
        >
          <ExternalLink className="w-3 h-3" />
        </button>
      )}
    </label>
  );
};

const CommitItem: React.FC<{ commit: CommitInfo }> = ({ commit }) => (
  <div className="px-2 py-2 hover:bg-gray-800 rounded cursor-pointer">
    <div className="flex items-center gap-2">
      <span className="text-xs font-mono text-blue-400">{commit.shortHash}</span>
      {!commit.isPushed && (
        <span className="text-[10px] px-1 py-0.5 bg-orange-500/20 text-orange-400 rounded">unpushed</span>
      )}
      <span className="text-xs text-gray-500 ml-auto">
        {new Date(commit.date).toLocaleDateString()}
      </span>
    </div>
    <p className="text-xs text-gray-300 truncate mt-0.5">{commit.message}</p>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================

export const GitPanel: React.FC<GitPanelProps> = ({
  modifiedFiles,
  currentRepo,
  onFileSelect,
  refreshTrigger,
  onCreatePR
}) => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [expandedRepos, setExpandedRepos] = useState<Set<string>>(new Set());
  const [selectedFiles, setSelectedFiles] = useState<Map<string, Set<string>>>(new Map());
  const [commitMessages, setCommitMessages] = useState<Map<string, string>>(new Map());
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [operatingRepos, setOperatingRepos] = useState<Set<string>>(new Set());
  const [branches, setBranches] = useState<Map<string, BranchInfo[]>>(new Map());
  const [showBranchSelector, setShowBranchSelector] = useState<string | null>(null);
  const [showCommitHistory, setShowCommitHistory] = useState<string | null>(null);
  const [showCreatePR, setShowCreatePR] = useState<Repository | null>(null);
  const [prTitle, setPrTitle] = useState('');
  const [prDescription, setPrDescription] = useState('');
  const [prTargetBranch, setPrTargetBranch] = useState('main');
  const [showInitRepo, setShowInitRepo] = useState<{ type: RepoType; id: string; name: string } | null>(null);
  const [initRepoStatus, setInitRepoStatus] = useState<'idle' | 'initializing' | 'success' | 'error'>('idle');

  // Load repositories on mount
  useEffect(() => {
    loadRepositories();
  }, []);

  // Refresh when trigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      loadRepositories();
    }
  }, [refreshTrigger]);

  // Auto-expand current repo
  useEffect(() => {
    if (currentRepo) {
      setExpandedRepos(prev => new Set([...prev, `${currentRepo.type}-${currentRepo.id}`]));
    }
  }, [currentRepo]);

  const loadRepositories = async () => {
    setIsLoading(true);
    try {
      const repos = await gitService.getAllRepositories();
      setRepositories(repos);

      // Initialize selected files for repos with changes
      const newSelected = new Map<string, Set<string>>();
      repos.forEach(repo => {
        if (repo.changes.length > 0) {
          newSelected.set(repo.id, new Set(repo.changes.filter(c => c.staged).map(c => c.path)));
        }
      });
      setSelectedFiles(newSelected);
    } catch (error) {
      console.error('Failed to load repositories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncAllRepositories = async () => {
    setIsSyncing(true);
    try {
      const repos = await gitService.syncAllRepositories();
      setRepositories(repos);
    } catch (error) {
      console.error('Failed to sync repositories:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleRepo = (repoId: string) => {
    setExpandedRepos(prev => {
      const next = new Set(prev);
      if (next.has(repoId)) {
        next.delete(repoId);
      } else {
        next.add(repoId);
      }
      return next;
    });
  };

  const toggleFile = (repoId: string, path: string) => {
    setSelectedFiles(prev => {
      const next = new Map(prev);
      const repoFiles = new Set(next.get(repoId) || []);
      if (repoFiles.has(path)) {
        repoFiles.delete(path);
      } else {
        repoFiles.add(path);
      }
      next.set(repoId, repoFiles);
      return next;
    });
  };

  const selectAllFiles = (repoId: string, repo: Repository) => {
    setSelectedFiles(prev => {
      const next = new Map(prev);
      next.set(repoId, new Set(repo.changes.map(c => c.path)));
      return next;
    });
  };

  const deselectAllFiles = (repoId: string) => {
    setSelectedFiles(prev => {
      const next = new Map(prev);
      next.set(repoId, new Set());
      return next;
    });
  };

  const handleCommit = async (repo: Repository) => {
    const message = commitMessages.get(repo.id);
    const files = selectedFiles.get(repo.id);

    if (!message?.trim() || !files?.size) return;

    setOperatingRepos(prev => new Set([...prev, repo.id]));

    try {
      // Stage files first
      await gitService.stageFiles(repo.type, repo.id, Array.from(files));

      // Commit
      const result = await gitService.commitChanges(repo.type, repo.id, message);

      if (result.success) {
        // Clear message and refresh
        setCommitMessages(prev => {
          const next = new Map(prev);
          next.delete(repo.id);
          return next;
        });
        setSelectedFiles(prev => {
          const next = new Map(prev);
          next.delete(repo.id);
          return next;
        });

        // Reload this repo's status
        await loadRepositories();
      }
    } catch (error) {
      console.error('Commit failed:', error);
    } finally {
      setOperatingRepos(prev => {
        const next = new Set(prev);
        next.delete(repo.id);
        return next;
      });
    }
  };

  const handlePush = async (repo: Repository) => {
    setOperatingRepos(prev => new Set([...prev, repo.id]));

    try {
      const result = await gitService.pushChanges(repo.type, repo.id);
      if (result.success) {
        await loadRepositories();
      }
    } catch (error) {
      console.error('Push failed:', error);
    } finally {
      setOperatingRepos(prev => {
        const next = new Set(prev);
        next.delete(repo.id);
        return next;
      });
    }
  };

  const handlePull = async (repo: Repository) => {
    setOperatingRepos(prev => new Set([...prev, repo.id]));

    try {
      const result = await gitService.pullChanges(repo.type, repo.id);
      if (result.success) {
        await loadRepositories();
      }
    } catch (error) {
      console.error('Pull failed:', error);
    } finally {
      setOperatingRepos(prev => {
        const next = new Set(prev);
        next.delete(repo.id);
        return next;
      });
    }
  };

  const handleFetch = async (repo: Repository) => {
    setOperatingRepos(prev => new Set([...prev, repo.id]));

    try {
      await gitService.fetchUpdates(repo.type, repo.id);
      await loadRepositories();
    } catch (error) {
      console.error('Fetch failed:', error);
    } finally {
      setOperatingRepos(prev => {
        const next = new Set(prev);
        next.delete(repo.id);
        return next;
      });
    }
  };

  const loadBranches = async (repo: Repository) => {
    try {
      const repoBranches = await gitService.getBranches(repo.type, repo.id);
      setBranches(prev => new Map([...prev, [repo.id, repoBranches]]));
    } catch (error) {
      console.error('Failed to load branches:', error);
    }
  };

  const handleSwitchBranch = async (repo: Repository, branch: string) => {
    setOperatingRepos(prev => new Set([...prev, repo.id]));
    setShowBranchSelector(null);

    try {
      await gitService.switchBranch(repo.type, repo.id, branch);
      await loadRepositories();
    } catch (error) {
      console.error('Branch switch failed:', error);
    } finally {
      setOperatingRepos(prev => {
        const next = new Set(prev);
        next.delete(repo.id);
        return next;
      });
    }
  };

  // Initialize new repository with main and dev branches
  const handleInitRepo = async (type: RepoType, id: string, name: string) => {
    setInitRepoStatus('initializing');
    try {
      // Create repo with main branch (simulated - would call backend)
      const result = await gitService.cloneRepository(type, '', name);
      if (result.success) {
        // Create dev branch
        await gitService.createBranch(type, id, 'dev', 'main');
        setInitRepoStatus('success');
        await loadRepositories();
        setTimeout(() => {
          setShowInitRepo(null);
          setInitRepoStatus('idle');
        }, 1500);
      } else {
        setInitRepoStatus('error');
      }
    } catch (error) {
      console.error('Failed to initialize repository:', error);
      setInitRepoStatus('error');
    }
  };

  // Create pull request
  const handleCreatePullRequest = async () => {
    if (!showCreatePR || !prTitle.trim()) return;

    if (onCreatePR) {
      onCreatePR(showCreatePR, prTargetBranch, prTitle, prDescription);
    }

    // Reset form
    setShowCreatePR(null);
    setPrTitle('');
    setPrDescription('');
    setPrTargetBranch('main');
  };

  // Check if repo has dev branch
  const hasDevBranch = (repoBranches: BranchInfo[]) => {
    return repoBranches.some(b => b.name === 'dev' || b.name === 'develop' || b.name === 'development');
  };

  // Group repositories by type
  const groupedRepos = {
    theme: repositories.filter(r => r.type === 'theme'),
    plugin: repositories.filter(r => r.type === 'plugin'),
    function: repositories.filter(r => r.type === 'function'),
  };

  // Filter for current repo view
  const displayRepos = viewMode === 'current' && currentRepo
    ? repositories.filter(r => r.type === currentRepo.type && r.id === currentRepo.id)
    : repositories;

  // Summary stats
  const totalAhead = repositories.reduce((sum, r) => sum + r.status.ahead, 0);
  const totalBehind = repositories.reduce((sum, r) => sum + r.status.behind, 0);
  const totalChanges = repositories.reduce((sum, r) => sum + r.changes.length, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <FolderGit className="w-4 h-4" />
            Repositories
          </h3>
          <button
            onClick={syncAllRepositories}
            disabled={isSyncing}
            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
            title="Sync all repositories"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Summary */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-gray-500">{repositories.length} repos</span>
          {totalAhead > 0 && (
            <span className="flex items-center gap-1 text-blue-400">
              <Upload className="w-3 h-3" />{totalAhead} to push
            </span>
          )}
          {totalBehind > 0 && (
            <span className="flex items-center gap-1 text-orange-400">
              <Download className="w-3 h-3" />{totalBehind} to pull
            </span>
          )}
          {totalChanges > 0 && (
            <span className="flex items-center gap-1 text-yellow-400">
              <Edit className="w-3 h-3" />{totalChanges} changes
            </span>
          )}
        </div>

        {/* View mode toggle */}
        {currentRepo && (
          <div className="flex gap-1 mt-2">
            <button
              onClick={() => setViewMode('all')}
              className={`px-2 py-1 text-xs rounded ${viewMode === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              All
            </button>
            <button
              onClick={() => setViewMode('current')}
              className={`px-2 py-1 text-xs rounded ${viewMode === 'current' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              Current
            </button>
          </div>
        )}
      </div>

      {/* Repository List */}
      <div className="flex-1 overflow-auto">
        {Object.entries(groupedRepos).map(([type, repos]) => {
          const filteredRepos = viewMode === 'current' && currentRepo
            ? repos.filter(r => r.id === currentRepo.id)
            : repos;

          if (filteredRepos.length === 0) return null;

          return (
            <div key={type} className="border-b border-gray-800">
              {/* Type Header */}
              <div className="px-3 py-2 bg-gray-800/50 text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <RepoIcon type={type as RepoType} className="w-3.5 h-3.5" />
                {type}s ({filteredRepos.length})
              </div>

              {/* Repos */}
              {filteredRepos.map(repo => {
                const repoKey = `${repo.type}-${repo.id}`;
                const isExpanded = expandedRepos.has(repoKey);
                const isOperating = operatingRepos.has(repo.id);
                const repoSelectedFiles = selectedFiles.get(repo.id) || new Set();
                const commitMessage = commitMessages.get(repo.id) || '';
                const repoBranches = branches.get(repo.id) || [];

                return (
                  <div key={repo.id} className="border-b border-gray-800 last:border-0">
                    {/* Repo Header */}
                    <button
                      onClick={() => toggleRepo(repoKey)}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800/50 text-left"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                      <span className="text-sm text-white font-medium truncate flex-1">
                        {repo.name}
                      </span>
                      <StatusBadge
                        ahead={repo.status.ahead}
                        behind={repo.status.behind}
                        hasChanges={repo.status.hasUncommittedChanges}
                      />
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-3 pb-3 space-y-3">
                        {/* Branch Selector */}
                        <div className="relative">
                          <button
                            onClick={() => {
                              loadBranches(repo);
                              setShowBranchSelector(showBranchSelector === repo.id ? null : repo.id);
                            }}
                            className="w-full flex items-center justify-between px-2 py-1.5 bg-gray-800 rounded border border-gray-700 hover:border-gray-600 text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <GitBranch className="w-3.5 h-3.5 text-green-400" />
                              <span>{repo.status.branch}</span>
                            </div>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                          </button>

                          {showBranchSelector === repo.id && repoBranches.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded shadow-lg z-10 max-h-40 overflow-auto">
                              {repoBranches.map(branch => (
                                <button
                                  key={branch.name}
                                  onClick={() => handleSwitchBranch(repo, branch.name)}
                                  className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-gray-700 ${
                                    branch.isCurrent ? 'text-green-400' : 'text-gray-300'
                                  }`}
                                >
                                  <GitBranch className="w-3.5 h-3.5" />
                                  <span className="truncate">{branch.name}</span>
                                  {branch.isCurrent && <Check className="w-3.5 h-3.5 ml-auto" />}
                                  {branch.isRemote && (
                                    <Cloud className="w-3.5 h-3.5 text-gray-500 ml-auto" />
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Changes */}
                        {repo.changes.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Changes ({repo.changes.length})
                              </span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => selectAllFiles(repo.id, repo)}
                                  className="text-xs text-blue-400 hover:text-blue-300"
                                >
                                  All
                                </button>
                                <span className="text-gray-600">/</span>
                                <button
                                  onClick={() => deselectAllFiles(repo.id)}
                                  className="text-xs text-blue-400 hover:text-blue-300"
                                >
                                  None
                                </button>
                              </div>
                            </div>
                            <div className="max-h-32 overflow-auto">
                              {repo.changes.map(change => (
                                <FileChangeItem
                                  key={change.path}
                                  change={change}
                                  isSelected={repoSelectedFiles.has(change.path)}
                                  onToggle={() => toggleFile(repo.id, change.path)}
                                  onView={onFileSelect ? () => onFileSelect(change.path) : undefined}
                                />
                              ))}
                            </div>

                            {/* Commit Form */}
                            <textarea
                              value={commitMessage}
                              onChange={(e) => setCommitMessages(prev => new Map([...prev, [repo.id, e.target.value]]))}
                              placeholder="Commit message..."
                              className="w-full px-2 py-1.5 text-xs bg-gray-800 border border-gray-700 rounded resize-none focus:outline-none focus:border-blue-500"
                              rows={2}
                            />
                            <button
                              onClick={() => handleCommit(repo)}
                              disabled={!commitMessage.trim() || repoSelectedFiles.size === 0 || isOperating}
                              className="w-full flex items-center justify-center gap-2 px-2 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 rounded transition-colors"
                            >
                              {isOperating ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <GitCommit className="w-3.5 h-3.5" />
                              )}
                              Commit ({repoSelectedFiles.size})
                            </button>
                          </div>
                        )}

                        {/* No changes */}
                        {repo.changes.length === 0 && repo.status.isClean && (
                          <div className="flex items-center gap-2 px-2 py-2 text-xs text-gray-500 bg-gray-800/50 rounded">
                            <Check className="w-4 h-4 text-green-500" />
                            Working tree clean
                          </div>
                        )}

                        {/* Sync Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleFetch(repo)}
                            disabled={isOperating}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded transition-colors"
                            title="Fetch updates"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isOperating ? 'animate-spin' : ''}`} />
                            Fetch
                          </button>
                          <button
                            onClick={() => handlePull(repo)}
                            disabled={isOperating || repo.status.behind === 0}
                            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded transition-colors ${
                              repo.status.behind > 0
                                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                            }`}
                          >
                            <Download className="w-3.5 h-3.5" />
                            Pull{repo.status.behind > 0 && ` (${repo.status.behind})`}
                          </button>
                          <button
                            onClick={() => handlePush(repo)}
                            disabled={isOperating || repo.status.ahead === 0}
                            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs rounded transition-colors ${
                              repo.status.ahead > 0
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                            }`}
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Push{repo.status.ahead > 0 && ` (${repo.status.ahead})`}
                          </button>
                        </div>

                        {/* Commit History with Local/Remote indicator */}
                        {repo.recentCommits.length > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Recent Commits</span>
                              <button
                                onClick={() => setShowCommitHistory(showCommitHistory === repo.id ? null : repo.id)}
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                              >
                                <History className="w-3 h-3" />
                                {showCommitHistory === repo.id ? 'Hide' : 'Show All'}
                              </button>
                            </div>
                            <div className={`space-y-1 ${showCommitHistory === repo.id ? 'max-h-60' : 'max-h-24'} overflow-auto`}>
                              {(showCommitHistory === repo.id ? repo.recentCommits : repo.recentCommits.slice(0, 3)).map(commit => (
                                <div key={commit.hash} className="px-2 py-2 hover:bg-gray-800 rounded cursor-pointer">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-blue-400">{commit.shortHash}</span>
                                    {commit.isPushed ? (
                                      <span className="flex items-center gap-1 text-[10px] px-1 py-0.5 bg-green-500/20 text-green-400 rounded" title="Pushed to remote">
                                        <Server className="w-3 h-3" /> Remote
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 text-[10px] px-1 py-0.5 bg-orange-500/20 text-orange-400 rounded" title="Local only">
                                        <Laptop className="w-3 h-3" /> Local
                                      </span>
                                    )}
                                    <span className="text-xs text-gray-500 ml-auto">
                                      {new Date(commit.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-300 truncate mt-0.5">{commit.message}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Create PR Button - shown when not on main and has commits */}
                        {repo.status.branch !== 'main' && repo.status.ahead > 0 && (
                          <button
                            onClick={() => {
                              setShowCreatePR(repo);
                              loadBranches(repo);
                            }}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded"
                          >
                            <GitPullRequest className="w-3.5 h-3.5" />
                            Create Pull Request
                          </button>
                        )}

                        {/* Dev branch warning - show if dev branch doesn't exist */}
                        {repoBranches.length > 0 && !hasDevBranch(repoBranches) && (
                          <div className="flex items-center gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-400">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            <span>No dev branch found.</span>
                            <button
                              onClick={() => gitService.createBranch(repo.type, repo.id, 'dev', 'main')}
                              className="ml-auto text-yellow-300 hover:text-yellow-200 underline"
                            >
                              Create dev branch
                            </button>
                          </div>
                        )}

                        {/* Remote URL */}
                        <div className="text-xs text-gray-600 truncate">
                          <Cloud className="w-3 h-3 inline mr-1" />
                          {repo.status.remoteUrl}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Empty State */}
        {repositories.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <FolderGit className="w-12 h-12 text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">No repositories found</p>
            <p className="text-xs text-gray-600 mt-1">
              Add themes, plugins, or functions to see them here
            </p>
          </div>
        )}
      </div>

      {/* Create PR Modal */}
      {showCreatePR && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-medium text-white">Create Pull Request</h3>
              </div>
              <button
                onClick={() => setShowCreatePR(null)}
                className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">From:</span>
                <span className="flex items-center gap-2 text-white">
                  <GitBranch className="w-4 h-4 text-blue-400" />
                  {showCreatePR.status.branch}
                </span>
              </div>
              <div className="flex items-center justify-center text-gray-500">
                <ChevronDown className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">To:</span>
                <select
                  value={prTargetBranch}
                  onChange={(e) => setPrTargetBranch(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                >
                  <option value="main">main</option>
                  <option value="dev">dev</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={prTitle}
                  onChange={(e) => setPrTitle(e.target.value)}
                  placeholder="Enter PR title..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Description</label>
                <textarea
                  value={prDescription}
                  onChange={(e) => setPrDescription(e.target.value)}
                  placeholder="Enter PR description..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreatePR(null)}
                  className="flex-1 px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePullRequest}
                  disabled={!prTitle.trim()}
                  className="flex-1 px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded text-white"
                >
                  Create PR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Init Repo Modal */}
      {showInitRepo && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-green-400" />
                <h3 className="text-sm font-medium text-white">Initialize Git Repository</h3>
              </div>
              <button
                onClick={() => setShowInitRepo(null)}
                className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-300">
                Initialize a new Git repository for <strong>{showInitRepo.name}</strong> with:
              </p>
              <ul className="text-sm text-gray-400 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <code className="px-2 py-0.5 bg-gray-700 rounded">main</code> branch (production)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <code className="px-2 py-0.5 bg-gray-700 rounded">dev</code> branch (development)
                </li>
              </ul>
              {initRepoStatus === 'success' && (
                <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/20 rounded text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  Repository initialized successfully!
                </div>
              )}
              {initRepoStatus === 'error' && (
                <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  Failed to initialize repository.
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowInitRepo(null)}
                  className="flex-1 px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleInitRepo(showInitRepo.type, showInitRepo.id, showInitRepo.name)}
                  disabled={initRepoStatus === 'initializing'}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded text-white"
                >
                  {initRepoStatus === 'initializing' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FolderPlus className="w-4 h-4" />
                  )}
                  Initialize
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GitPanel;
