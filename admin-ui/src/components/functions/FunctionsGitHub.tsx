// FunctionsGitHub.tsx - GitHub Integration Components (Enhancements 11-20)
// Repository Connector, Branch Selector, Commit History, PR Integration,
// GitHub Actions, File Browser, Diff Viewer, Branch Compare, Webhooks

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch,
  GitCommit,
  GitPullRequest,
  GitMerge,
  Github,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Check,
  X,
  Clock,
  User,
  Calendar,
  FileText,
  File,
  Folder,
  FolderOpen,
  Plus,
  Minus,
  Edit3,
  Copy,
  Link,
  Unlink,
  Settings,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Eye,
  Code,
  Play,
  Square,
  Zap,
  Webhook,
  Lock,
  Unlock,
  Tag,
  Star,
  Activity,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  History,
  Diff,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface GitHubRepository {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  description?: string;
  url: string;
  defaultBranch: string;
  isPrivate: boolean;
  stars: number;
  forks: number;
  lastPush: Date;
}

export interface GitHubBranch {
  name: string;
  sha: string;
  protected: boolean;
  isDefault: boolean;
  aheadBy?: number;
  behindBy?: number;
}

export interface GitHubCommit {
  sha: string;
  shortSha: string;
  message: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  date: Date;
  parents: string[];
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
  files?: CommitFile[];
}

export interface CommitFile {
  filename: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
  patch?: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  description?: string;
  state: 'open' | 'closed' | 'merged';
  author: {
    name: string;
    avatar?: string;
  };
  sourceBranch: string;
  targetBranch: string;
  createdAt: Date;
  updatedAt: Date;
  mergedAt?: Date;
  commits: number;
  additions: number;
  deletions: number;
  changedFiles: number;
  labels: string[];
  reviewers: string[];
  isDraft: boolean;
}

export interface GitHubAction {
  id: string;
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion?: 'success' | 'failure' | 'cancelled' | 'skipped';
  workflowName: string;
  branch: string;
  commit: string;
  actor: string;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  jobs: GitHubJob[];
}

export interface GitHubJob {
  id: string;
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion?: 'success' | 'failure' | 'cancelled' | 'skipped';
  startedAt?: Date;
  completedAt?: Date;
  steps: GitHubStep[];
}

export interface GitHubStep {
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion?: 'success' | 'failure' | 'cancelled' | 'skipped';
  number: number;
}

export interface GitHubWebhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  secret?: string;
  createdAt: Date;
  lastDelivery?: Date;
  lastStatus?: 'success' | 'failure';
}

export interface FileDiff {
  filename: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  oldPath?: string;
  additions: number;
  deletions: number;
  hunks: DiffHunk[];
}

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

export interface DiffLine {
  type: 'context' | 'addition' | 'deletion';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

// ============================================================================
// ENHANCEMENT 11: GitHub Repository Connector
// ============================================================================

interface GitHubConnectorProps {
  connectedRepo?: GitHubRepository;
  onConnect: (repo: GitHubRepository) => void;
  onDisconnect: () => void;
}

export function GitHubConnector({
  connectedRepo,
  onConnect,
  onDisconnect
}: GitHubConnectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [repos, setRepos] = useState<GitHubRepository[]>(sampleRepositories);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepository | null>(null);
  const [repoUrl, setRepoUrl] = useState('');

  const filteredRepos = repos.filter(repo =>
    repo.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConnect = () => {
    if (selectedRepo) {
      onConnect(selectedRepo);
      setIsOpen(false);
    }
  };

  const handleUrlConnect = () => {
    if (repoUrl) {
      // Parse URL and create repo object
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (match) {
        const [, owner, name] = match;
        onConnect({
          id: `${owner}/${name}`,
          owner,
          name: name.replace('.git', ''),
          fullName: `${owner}/${name.replace('.git', '')}`,
          url: `https://github.com/${owner}/${name.replace('.git', '')}`,
          defaultBranch: 'main',
          isPrivate: false,
          stars: 0,
          forks: 0,
          lastPush: new Date()
        });
        setIsOpen(false);
      }
    }
  };

  return (
    <div className="bg-[#252526] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-3">
          <Github className="w-6 h-6 text-gray-400" />
          <div>
            <h3 className="text-sm font-medium text-white">GitHub Integration</h3>
            <p className="text-xs text-gray-500">Connect your repository for deployments</p>
          </div>
        </div>
        {connectedRepo ? (
          <span className="flex items-center gap-2 text-xs text-green-400">
            <CheckCircle className="w-4 h-4" />
            Connected
          </span>
        ) : (
          <span className="flex items-center gap-2 text-xs text-gray-500">
            <Unlink className="w-4 h-4" />
            Not Connected
          </span>
        )}
      </div>

      {/* Connected Repository */}
      {connectedRepo ? (
        <div className="p-4">
          <div className="flex items-center justify-between bg-[#1e1e1e] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                <Github className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{connectedRepo.fullName}</span>
                  {connectedRepo.isPrivate && <Lock className="w-3 h-3 text-gray-500" />}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <GitBranch className="w-3 h-3" />
                    {connectedRepo.defaultBranch}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {connectedRepo.stars}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={connectedRepo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-[#3c3c3c] rounded text-gray-400"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={onDisconnect}
                className="p-2 hover:bg-red-500/10 rounded text-red-400"
              >
                <Unlink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <button
            onClick={() => setIsOpen(true)}
            className="w-full py-3 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium flex items-center justify-center gap-2"
          >
            <Github className="w-5 h-5" />
            Connect Repository
          </button>
        </div>
      )}

      {/* Connect Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-[600px] bg-[#252526] rounded-lg shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
                <h3 className="text-lg font-medium text-white">Connect GitHub Repository</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-[#3c3c3c] rounded"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* URL Input */}
              <div className="p-4 border-b border-[#3c3c3c]">
                <label className="block text-sm text-gray-400 mb-2">Repository URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://github.com/owner/repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#007acc]"
                  />
                  <button
                    onClick={handleUrlConnect}
                    disabled={!repoUrl}
                    className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium"
                  >
                    Connect
                  </button>
                </div>
              </div>

              {/* Search Repositories */}
              <div className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search your repositories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#007acc]"
                  />
                </div>

                {/* Repository List */}
                <div className="max-h-[300px] overflow-auto space-y-2">
                  {filteredRepos.map(repo => (
                    <button
                      key={repo.id}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                        selectedRepo?.id === repo.id
                          ? 'bg-[#094771] border border-[#007acc]'
                          : 'bg-[#1e1e1e] hover:bg-[#2a2d2e] border border-transparent'
                      )}
                      onClick={() => setSelectedRepo(repo)}
                    >
                      <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                        <Github className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white truncate">{repo.fullName}</span>
                          {repo.isPrivate && <Lock className="w-3 h-3 text-gray-500 flex-shrink-0" />}
                        </div>
                        {repo.description && (
                          <p className="text-xs text-gray-500 truncate">{repo.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {repo.stars}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          {repo.defaultBranch}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-4 border-t border-[#3c3c3c]">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConnect}
                  disabled={!selectedRepo}
                  className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium"
                >
                  Connect Repository
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 12: Branch Selector Dropdown
// ============================================================================

interface BranchSelectorProps {
  branches: GitHubBranch[];
  selectedBranch: string;
  onBranchSelect: (branch: string) => void;
  onCreateBranch?: (name: string, fromBranch: string) => void;
  onRefresh?: () => void;
}

export function BranchSelector({
  branches,
  selectedBranch,
  onBranchSelect,
  onCreateBranch,
  onRefresh
}: BranchSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentBranch = branches.find(b => b.name === selectedBranch);

  const handleCreate = () => {
    if (newBranchName) {
      onCreateBranch?.(newBranchName, selectedBranch);
      setNewBranchName('');
      setShowCreateForm(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-[#252526] border border-[#3c3c3c] rounded-lg hover:bg-[#2a2d2e] text-white"
      >
        <GitBranch className="w-4 h-4 text-gray-400" />
        <span className="text-sm">{selectedBranch}</span>
        {currentBranch?.protected && <Lock className="w-3 h-3 text-yellow-500" />}
        <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 w-80 bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-xl z-50 overflow-hidden"
            >
              {/* Search */}
              <div className="p-3 border-b border-[#3c3c3c]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Find a branch..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#007acc]"
                  />
                </div>
              </div>

              {/* Branch List */}
              <div className="max-h-[300px] overflow-auto">
                {/* Default Branch */}
                {filteredBranches.filter(b => b.isDefault).map(branch => (
                  <button
                    key={branch.name}
                    onClick={() => {
                      onBranchSelect(branch.name);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2 hover:bg-[#2a2d2e] text-left",
                      selectedBranch === branch.name && 'bg-[#094771]'
                    )}
                  >
                    {selectedBranch === branch.name ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <span className="w-4" />
                    )}
                    <GitBranch className="w-4 h-4 text-gray-400" />
                    <span className="flex-1 text-sm text-white">{branch.name}</span>
                    <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded">default</span>
                    {branch.protected && <Lock className="w-3 h-3 text-yellow-500" />}
                  </button>
                ))}

                {/* Other Branches */}
                <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider border-b border-[#3c3c3c]">
                  Branches
                </div>
                {filteredBranches.filter(b => !b.isDefault).map(branch => (
                  <button
                    key={branch.name}
                    onClick={() => {
                      onBranchSelect(branch.name);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2 hover:bg-[#2a2d2e] text-left",
                      selectedBranch === branch.name && 'bg-[#094771]'
                    )}
                  >
                    {selectedBranch === branch.name ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <span className="w-4" />
                    )}
                    <GitBranch className="w-4 h-4 text-gray-400" />
                    <span className="flex-1 text-sm text-white truncate">{branch.name}</span>
                    {branch.aheadBy !== undefined && branch.aheadBy > 0 && (
                      <span className="text-xs text-green-400">+{branch.aheadBy}</span>
                    )}
                    {branch.behindBy !== undefined && branch.behindBy > 0 && (
                      <span className="text-xs text-red-400">-{branch.behindBy}</span>
                    )}
                    {branch.protected && <Lock className="w-3 h-3 text-yellow-500" />}
                  </button>
                ))}
              </div>

              {/* Create Branch */}
              <div className="p-3 border-t border-[#3c3c3c]">
                {showCreateForm ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="New branch name"
                      value={newBranchName}
                      onChange={(e) => setNewBranchName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#007acc]"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreate}
                        disabled={!newBranchName}
                        className="flex-1 px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white rounded text-sm"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => setShowCreateForm(false)}
                        className="px-3 py-1.5 text-gray-400 hover:text-white text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Branch from: <span className="text-white">{selectedBranch}</span>
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#2a2d2e] rounded"
                  >
                    <Plus className="w-4 h-4" />
                    Create new branch
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 13: Commit History Browser
// ============================================================================

interface CommitHistoryProps {
  commits: GitHubCommit[];
  selectedCommit?: string;
  onCommitSelect: (sha: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

export function CommitHistory({
  commits,
  selectedCommit,
  onCommitSelect,
  onLoadMore,
  hasMore = false,
  isLoading = false
}: CommitHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'author' | 'message'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCommits = commits.filter(commit => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    switch (filter) {
      case 'author':
        return commit.author.name.toLowerCase().includes(query);
      case 'message':
        return commit.message.toLowerCase().includes(query);
      default:
        return (
          commit.message.toLowerCase().includes(query) ||
          commit.author.name.toLowerCase().includes(query) ||
          commit.shortSha.toLowerCase().includes(query)
        );
    }
  });

  return (
    <div className="flex flex-col h-full bg-[#252526] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-white">Commit History</h3>
          <span className="text-xs text-gray-500">({commits.length} commits)</span>
        </div>
        <button className="p-1.5 hover:bg-[#3c3c3c] rounded text-gray-400">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Search & Filter */}
      <div className="p-3 border-b border-[#3c3c3c]">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search commits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#007acc]"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-gray-300 focus:outline-none focus:border-[#007acc]"
          >
            <option value="all">All</option>
            <option value="message">Message</option>
            <option value="author">Author</option>
          </select>
        </div>
      </div>

      {/* Commit List */}
      <div className="flex-1 overflow-auto">
        {filteredCommits.map(commit => (
          <button
            key={commit.sha}
            onClick={() => onCommitSelect(commit.sha)}
            className={cn(
              "w-full flex items-start gap-3 p-4 text-left border-b border-[#3c3c3c] hover:bg-[#2a2d2e]",
              selectedCommit === commit.sha && 'bg-[#094771]'
            )}
          >
            {/* Commit Graph Line */}
            <div className="relative flex flex-col items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <div className="w-0.5 flex-1 bg-[#3c3c3c] absolute top-3" />
            </div>

            {/* Commit Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-white line-clamp-2">{commit.message}</p>
                <code className="text-xs text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded flex-shrink-0">
                  {commit.shortSha}
                </code>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  {commit.author.avatar ? (
                    <img src={commit.author.avatar} alt="" className="w-4 h-4 rounded-full" />
                  ) : (
                    <User className="w-3 h-3" />
                  )}
                  {commit.author.name}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {commit.date.toLocaleDateString()}
                </span>
                {commit.stats && (
                  <span className="flex items-center gap-2">
                    <span className="text-green-400">+{commit.stats.additions}</span>
                    <span className="text-red-400">-{commit.stats.deletions}</span>
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}

        {/* Load More */}
        {hasMore && (
          <button
            onClick={onLoadMore}
            disabled={isLoading}
            className="w-full py-3 text-sm text-blue-400 hover:bg-[#2a2d2e] disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              'Load more commits'
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 14: Commit Selector with Diff Preview
// ============================================================================

interface CommitSelectorProps {
  commits: GitHubCommit[];
  selectedCommit?: string;
  onSelect: (sha: string) => void;
  showDiffPreview?: boolean;
}

export function CommitSelector({
  commits,
  selectedCommit,
  onSelect,
  showDiffPreview = true
}: CommitSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewCommit, setPreviewCommit] = useState<GitHubCommit | null>(null);

  const currentCommit = commits.find(c => c.sha === selectedCommit);

  return (
    <div className="space-y-4">
      {/* Selector */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-[#252526] border border-[#3c3c3c] rounded-lg hover:bg-[#2a2d2e]"
        >
          <div className="flex items-center gap-3">
            <GitCommit className="w-5 h-5 text-gray-400" />
            {currentCommit ? (
              <div className="text-left">
                <p className="text-sm text-white truncate max-w-[300px]">{currentCommit.message}</p>
                <p className="text-xs text-gray-500">
                  {currentCommit.shortSha} by {currentCommit.author.name}
                </p>
              </div>
            ) : (
              <span className="text-sm text-gray-400">Select a commit...</span>
            )}
          </div>
          <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform", isOpen && "rotate-180")} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-[#252526] border border-[#3c3c3c] rounded-lg shadow-xl z-50 max-h-[400px] overflow-auto"
              >
                {commits.map(commit => (
                  <button
                    key={commit.sha}
                    onClick={() => {
                      onSelect(commit.sha);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setPreviewCommit(commit)}
                    onMouseLeave={() => setPreviewCommit(null)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#2a2d2e] border-b border-[#3c3c3c] last:border-0",
                      selectedCommit === commit.sha && 'bg-[#094771]'
                    )}
                  >
                    {selectedCommit === commit.sha ? (
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    ) : (
                      <GitCommit className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{commit.message}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <code className="text-blue-400">{commit.shortSha}</code>
                        <span>{commit.author.name}</span>
                        <span>{commit.date.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Diff Preview */}
      {showDiffPreview && currentCommit && currentCommit.files && (
        <div className="bg-[#1e1e1e] rounded-lg border border-[#3c3c3c] overflow-hidden">
          <div className="px-4 py-2 border-b border-[#3c3c3c]">
            <span className="text-sm text-gray-400">Changed files ({currentCommit.files.length})</span>
          </div>
          <div className="max-h-[200px] overflow-auto">
            {currentCommit.files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-4 py-2 hover:bg-[#252526]"
              >
                <div className="flex items-center gap-2">
                  {file.status === 'added' && <Plus className="w-4 h-4 text-green-400" />}
                  {file.status === 'modified' && <Edit3 className="w-4 h-4 text-yellow-400" />}
                  {file.status === 'deleted' && <Minus className="w-4 h-4 text-red-400" />}
                  <span className="text-sm text-gray-300">{file.filename}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-green-400">+{file.additions}</span>
                  <span className="text-red-400">-{file.deletions}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 15: Pull Request Integration Panel
// ============================================================================

interface PullRequestPanelProps {
  pullRequests: GitHubPullRequest[];
  onPRSelect: (pr: GitHubPullRequest) => void;
  onCreatePR?: () => void;
  filter?: 'all' | 'open' | 'closed' | 'merged';
}

export function PullRequestPanel({
  pullRequests,
  onPRSelect,
  onCreatePR,
  filter = 'all'
}: PullRequestPanelProps) {
  const [currentFilter, setCurrentFilter] = useState(filter);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPRs = pullRequests.filter(pr => {
    const matchesFilter = currentFilter === 'all' ||
      (currentFilter === 'merged' && pr.state === 'merged') ||
      pr.state === currentFilter;
    const matchesSearch = !searchQuery ||
      pr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.number.toString().includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (pr: GitHubPullRequest) => {
    if (pr.state === 'merged') {
      return <GitMerge className="w-4 h-4 text-purple-400" />;
    }
    if (pr.state === 'closed') {
      return <XCircle className="w-4 h-4 text-red-400" />;
    }
    if (pr.isDraft) {
      return <Edit3 className="w-4 h-4 text-gray-400" />;
    }
    return <GitPullRequest className="w-4 h-4 text-green-400" />;
  };

  return (
    <div className="flex flex-col h-full bg-[#252526] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <GitPullRequest className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-white">Pull Requests</h3>
        </div>
        {onCreatePR && (
          <button
            onClick={onCreatePR}
            className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-sm font-medium"
          >
            New PR
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="p-3 border-b border-[#3c3c3c] space-y-3">
        <div className="flex gap-2">
          {(['all', 'open', 'closed', 'merged'] as const).map(f => (
            <button
              key={f}
              onClick={() => setCurrentFilter(f)}
              className={cn(
                "px-3 py-1 rounded text-sm capitalize",
                currentFilter === f
                  ? 'bg-[#094771] text-white'
                  : 'text-gray-400 hover:bg-[#3c3c3c]'
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search pull requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#007acc]"
          />
        </div>
      </div>

      {/* PR List */}
      <div className="flex-1 overflow-auto">
        {filteredPRs.map(pr => (
          <button
            key={pr.id}
            onClick={() => onPRSelect(pr)}
            className="w-full flex items-start gap-3 p-4 text-left border-b border-[#3c3c3c] hover:bg-[#2a2d2e]"
          >
            {getStatusIcon(pr)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{pr.title}</span>
                {pr.isDraft && (
                  <span className="text-xs text-gray-500 bg-[#3c3c3c] px-2 py-0.5 rounded">Draft</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <span>#{pr.number}</span>
                <span>opened by {pr.author.name}</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="text-gray-500">
                  {pr.sourceBranch} <ArrowRight className="w-3 h-3 inline" /> {pr.targetBranch}
                </span>
                <span className="text-green-400">+{pr.additions}</span>
                <span className="text-red-400">-{pr.deletions}</span>
              </div>
              {pr.labels.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {pr.labels.map(label => (
                    <span
                      key={label}
                      className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </button>
        ))}
        {filteredPRs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <GitPullRequest className="w-12 h-12 mb-3" />
            <p className="text-sm">No pull requests found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 16: GitHub Actions Status Display
// ============================================================================

interface GitHubActionsProps {
  actions: GitHubAction[];
  onActionSelect: (action: GitHubAction) => void;
  onRerun?: (actionId: string) => void;
  onCancel?: (actionId: string) => void;
}

export function GitHubActionsDisplay({
  actions,
  onActionSelect,
  onRerun,
  onCancel
}: GitHubActionsProps) {
  const getStatusIcon = (action: GitHubAction) => {
    if (action.status === 'in_progress') {
      return <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />;
    }
    if (action.status === 'queued') {
      return <Clock className="w-4 h-4 text-gray-400" />;
    }
    switch (action.conclusion) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failure':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'cancelled':
        return <Square className="w-4 h-4 text-gray-400" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '--';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="flex flex-col h-full bg-[#252526] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-white">GitHub Actions</h3>
        </div>
        <button className="p-1.5 hover:bg-[#3c3c3c] rounded text-gray-400">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Actions List */}
      <div className="flex-1 overflow-auto">
        {actions.map(action => (
          <div
            key={action.id}
            className="border-b border-[#3c3c3c] hover:bg-[#2a2d2e]"
          >
            <button
              onClick={() => onActionSelect(action)}
              className="w-full flex items-start gap-3 p-4 text-left"
            >
              {getStatusIcon(action)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-white truncate">{action.name}</span>
                  <span className="text-xs text-gray-500">{formatDuration(action.duration)}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <GitBranch className="w-3 h-3" />
                    {action.branch}
                  </span>
                  <span>{action.workflowName}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span>{action.actor}</span>
                  <span>{action.startedAt.toLocaleString()}</span>
                </div>
              </div>
            </button>

            {/* Jobs */}
            <div className="px-4 pb-3 pl-11 space-y-1">
              {action.jobs.map(job => (
                <div key={job.id} className="flex items-center gap-2 text-xs">
                  {job.status === 'in_progress' ? (
                    <Loader2 className="w-3 h-3 text-yellow-400 animate-spin" />
                  ) : job.conclusion === 'success' ? (
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  ) : job.conclusion === 'failure' ? (
                    <XCircle className="w-3 h-3 text-red-400" />
                  ) : (
                    <Circle className="w-3 h-3 text-gray-400" />
                  )}
                  <span className="text-gray-400">{job.name}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 px-4 pb-3 pl-11">
              {action.status === 'in_progress' && onCancel && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancel(action.id);
                  }}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Cancel
                </button>
              )}
              {action.status === 'completed' && onRerun && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRerun(action.id);
                  }}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                >
                  <RotateCcw className="w-3 h-3" />
                  Re-run
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 17: Repository File Browser
// ============================================================================

interface RepoFileBrowserProps {
  files: RepoFile[];
  currentPath: string;
  branch: string;
  onNavigate: (path: string) => void;
  onFileSelect: (file: RepoFile) => void;
}

interface RepoFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  sha?: string;
}

export function RepoFileBrowser({
  files,
  currentPath,
  branch,
  onNavigate,
  onFileSelect
}: RepoFileBrowserProps) {
  const pathParts = currentPath.split('/').filter(Boolean);

  const getFileIcon = (file: RepoFile) => {
    if (file.type === 'dir') {
      return <Folder className="w-4 h-4 text-yellow-400" />;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    const icons: Record<string, string> = {
      ts: 'text-blue-400',
      tsx: 'text-blue-400',
      js: 'text-yellow-400',
      jsx: 'text-yellow-400',
      json: 'text-yellow-500',
      md: 'text-blue-300',
      rs: 'text-orange-400',
      py: 'text-green-400',
    };
    return <File className={cn("w-4 h-4", icons[ext || ''] || 'text-gray-400')} />;
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-[#252526] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-white">Files</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <GitBranch className="w-3 h-3" />
          {branch}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-[#3c3c3c] text-sm overflow-x-auto">
        <button
          onClick={() => onNavigate('')}
          className="text-blue-400 hover:underline"
        >
          root
        </button>
        {pathParts.map((part, index) => (
          <React.Fragment key={index}>
            <span className="text-gray-500">/</span>
            <button
              onClick={() => onNavigate(pathParts.slice(0, index + 1).join('/'))}
              className="text-blue-400 hover:underline"
            >
              {part}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* File List */}
      <div className="max-h-[400px] overflow-auto">
        {/* Parent directory */}
        {currentPath && (
          <button
            onClick={() => onNavigate(pathParts.slice(0, -1).join('/'))}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#2a2d2e] text-left"
          >
            <Folder className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-gray-300">..</span>
          </button>
        )}

        {/* Directories first, then files */}
        {[...files.filter(f => f.type === 'dir'), ...files.filter(f => f.type === 'file')].map(file => (
          <button
            key={file.path}
            onClick={() => file.type === 'dir' ? onNavigate(file.path) : onFileSelect(file)}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#2a2d2e] text-left"
          >
            {getFileIcon(file)}
            <span className="flex-1 text-sm text-gray-300">{file.name}</span>
            {file.size && (
              <span className="text-xs text-gray-500">{formatSize(file.size)}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 18: Git Diff Viewer with Side-by-Side
// ============================================================================

interface DiffViewerProps {
  diffs: FileDiff[];
  viewMode?: 'unified' | 'split';
  onViewModeChange?: (mode: 'unified' | 'split') => void;
}

export function DiffViewer({
  diffs,
  viewMode = 'unified',
  onViewModeChange
}: DiffViewerProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set(diffs.map(d => d.filename)));

  const toggleFile = (filename: string) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(filename)) {
      newExpanded.delete(filename);
    } else {
      newExpanded.add(filename);
    }
    setExpandedFiles(newExpanded);
  };

  const getStatusColor = (status: FileDiff['status']) => {
    switch (status) {
      case 'added': return 'text-green-400';
      case 'deleted': return 'text-red-400';
      case 'modified': return 'text-yellow-400';
      case 'renamed': return 'text-blue-400';
    }
  };

  return (
    <div className="bg-[#1e1e1e] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#252526] border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Diff className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-white">Changes</h3>
          <span className="text-xs text-gray-500">({diffs.length} files)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewModeChange?.('unified')}
            className={cn(
              "px-3 py-1 text-xs rounded",
              viewMode === 'unified' ? 'bg-[#094771] text-white' : 'text-gray-400 hover:bg-[#3c3c3c]'
            )}
          >
            Unified
          </button>
          <button
            onClick={() => onViewModeChange?.('split')}
            className={cn(
              "px-3 py-1 text-xs rounded",
              viewMode === 'split' ? 'bg-[#094771] text-white' : 'text-gray-400 hover:bg-[#3c3c3c]'
            )}
          >
            Split
          </button>
        </div>
      </div>

      {/* Diff Files */}
      <div className="divide-y divide-[#3c3c3c]">
        {diffs.map(diff => (
          <div key={diff.filename}>
            {/* File Header */}
            <button
              onClick={() => toggleFile(diff.filename)}
              className="w-full flex items-center gap-3 px-4 py-2 bg-[#252526] hover:bg-[#2a2d2e] text-left"
            >
              <ChevronRight
                className={cn(
                  "w-4 h-4 text-gray-400 transition-transform",
                  expandedFiles.has(diff.filename) && "rotate-90"
                )}
              />
              {diff.status === 'added' && <Plus className="w-4 h-4 text-green-400" />}
              {diff.status === 'deleted' && <Minus className="w-4 h-4 text-red-400" />}
              {diff.status === 'modified' && <Edit3 className="w-4 h-4 text-yellow-400" />}
              {diff.status === 'renamed' && <ArrowRight className="w-4 h-4 text-blue-400" />}
              <span className={cn("text-sm", getStatusColor(diff.status))}>{diff.filename}</span>
              {diff.oldPath && diff.status === 'renamed' && (
                <span className="text-xs text-gray-500">(from {diff.oldPath})</span>
              )}
              <span className="ml-auto flex items-center gap-2 text-xs">
                <span className="text-green-400">+{diff.additions}</span>
                <span className="text-red-400">-{diff.deletions}</span>
              </span>
            </button>

            {/* Diff Content */}
            <AnimatePresence>
              {expandedFiles.has(diff.filename) && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  {viewMode === 'unified' ? (
                    <div className="font-mono text-xs">
                      {diff.hunks.map((hunk, hunkIndex) => (
                        <div key={hunkIndex}>
                          <div className="bg-[#252526] px-4 py-1 text-blue-400">
                            @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
                          </div>
                          {hunk.lines.map((line, lineIndex) => (
                            <div
                              key={lineIndex}
                              className={cn(
                                "flex",
                                line.type === 'addition' && 'bg-green-900/20',
                                line.type === 'deletion' && 'bg-red-900/20'
                              )}
                            >
                              <span className="w-12 px-2 text-right text-gray-600 select-none border-r border-[#3c3c3c]">
                                {line.oldLineNumber || ''}
                              </span>
                              <span className="w-12 px-2 text-right text-gray-600 select-none border-r border-[#3c3c3c]">
                                {line.newLineNumber || ''}
                              </span>
                              <span className="w-6 text-center select-none">
                                {line.type === 'addition' && <span className="text-green-400">+</span>}
                                {line.type === 'deletion' && <span className="text-red-400">-</span>}
                              </span>
                              <pre className={cn(
                                "flex-1 px-2",
                                line.type === 'addition' && 'text-green-300',
                                line.type === 'deletion' && 'text-red-300',
                                line.type === 'context' && 'text-gray-400'
                              )}>
                                {line.content}
                              </pre>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Split view
                    <div className="flex font-mono text-xs">
                      {/* Old side */}
                      <div className="flex-1 border-r border-[#3c3c3c]">
                        {diff.hunks.map((hunk, hunkIndex) => (
                          <div key={hunkIndex}>
                            <div className="bg-[#252526] px-4 py-1 text-blue-400">
                              @@ -{hunk.oldStart},{hunk.oldLines} @@
                            </div>
                            {hunk.lines.filter(l => l.type !== 'addition').map((line, lineIndex) => (
                              <div
                                key={lineIndex}
                                className={cn(
                                  "flex",
                                  line.type === 'deletion' && 'bg-red-900/20'
                                )}
                              >
                                <span className="w-12 px-2 text-right text-gray-600 select-none">
                                  {line.oldLineNumber || ''}
                                </span>
                                <pre className={cn(
                                  "flex-1 px-2",
                                  line.type === 'deletion' && 'text-red-300',
                                  line.type === 'context' && 'text-gray-400'
                                )}>
                                  {line.content}
                                </pre>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                      {/* New side */}
                      <div className="flex-1">
                        {diff.hunks.map((hunk, hunkIndex) => (
                          <div key={hunkIndex}>
                            <div className="bg-[#252526] px-4 py-1 text-blue-400">
                              @@ +{hunk.newStart},{hunk.newLines} @@
                            </div>
                            {hunk.lines.filter(l => l.type !== 'deletion').map((line, lineIndex) => (
                              <div
                                key={lineIndex}
                                className={cn(
                                  "flex",
                                  line.type === 'addition' && 'bg-green-900/20'
                                )}
                              >
                                <span className="w-12 px-2 text-right text-gray-600 select-none">
                                  {line.newLineNumber || ''}
                                </span>
                                <pre className={cn(
                                  "flex-1 px-2",
                                  line.type === 'addition' && 'text-green-300',
                                  line.type === 'context' && 'text-gray-400'
                                )}>
                                  {line.content}
                                </pre>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 19: Branch Comparison Tool
// ============================================================================

interface BranchCompareProps {
  branches: GitHubBranch[];
  baseBranch: string;
  compareBranch: string;
  comparison?: BranchComparison;
  onBaseBranchChange: (branch: string) => void;
  onCompareBranchChange: (branch: string) => void;
  onCompare: () => void;
}

interface BranchComparison {
  aheadBy: number;
  behindBy: number;
  commits: GitHubCommit[];
  files: FileDiff[];
}

export function BranchCompare({
  branches,
  baseBranch,
  compareBranch,
  comparison,
  onBaseBranchChange,
  onCompareBranchChange,
  onCompare
}: BranchCompareProps) {
  return (
    <div className="bg-[#252526] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#3c3c3c]">
        <h3 className="text-sm font-medium text-white mb-4">Compare Branches</h3>

        {/* Branch Selectors */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Base</label>
            <select
              value={baseBranch}
              onChange={(e) => onBaseBranchChange(e.target.value)}
              className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white focus:outline-none focus:border-[#007acc]"
            >
              {branches.map(branch => (
                <option key={branch.name} value={branch.name}>{branch.name}</option>
              ))}
            </select>
          </div>
          <ArrowLeft className="w-5 h-5 text-gray-500 mt-5" />
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Compare</label>
            <select
              value={compareBranch}
              onChange={(e) => onCompareBranchChange(e.target.value)}
              className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white focus:outline-none focus:border-[#007acc]"
            >
              {branches.map(branch => (
                <option key={branch.name} value={branch.name}>{branch.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={onCompare}
            className="px-4 py-2 mt-5 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-sm font-medium"
          >
            Compare
          </button>
        </div>
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div className="p-4">
          {/* Stats */}
          <div className="flex items-center gap-6 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-green-400" />
              <span className="text-white">{comparison.aheadBy}</span>
              <span className="text-gray-500">commits ahead</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 text-red-400" />
              <span className="text-white">{comparison.behindBy}</span>
              <span className="text-gray-500">commits behind</span>
            </div>
          </div>

          {/* Commits */}
          {comparison.commits.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Commits ({comparison.commits.length})
              </h4>
              <div className="space-y-2 max-h-[200px] overflow-auto">
                {comparison.commits.map(commit => (
                  <div
                    key={commit.sha}
                    className="flex items-center gap-3 p-2 bg-[#1e1e1e] rounded"
                  >
                    <code className="text-xs text-blue-400">{commit.shortSha}</code>
                    <span className="flex-1 text-sm text-gray-300 truncate">{commit.message}</span>
                    <span className="text-xs text-gray-500">{commit.author.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Changed Files */}
          {comparison.files.length > 0 && (
            <div>
              <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Changed Files ({comparison.files.length})
              </h4>
              <div className="space-y-1 max-h-[200px] overflow-auto">
                {comparison.files.map(file => (
                  <div
                    key={file.filename}
                    className="flex items-center gap-2 px-2 py-1 text-sm"
                  >
                    {file.status === 'added' && <Plus className="w-3 h-3 text-green-400" />}
                    {file.status === 'modified' && <Edit3 className="w-3 h-3 text-yellow-400" />}
                    {file.status === 'deleted' && <Minus className="w-3 h-3 text-red-400" />}
                    <span className="flex-1 text-gray-300 truncate">{file.filename}</span>
                    <span className="text-xs text-green-400">+{file.additions}</span>
                    <span className="text-xs text-red-400">-{file.deletions}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {comparison.commits.length === 0 && comparison.files.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-8 h-8 mx-auto mb-2" />
              <p>These branches are identical</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ENHANCEMENT 20: GitHub Webhook Configuration
// ============================================================================

interface WebhookConfigProps {
  webhooks: GitHubWebhook[];
  onAdd: (webhook: Omit<GitHubWebhook, 'id' | 'createdAt'>) => void;
  onEdit: (webhook: GitHubWebhook) => void;
  onDelete: (webhookId: string) => void;
  onTest: (webhookId: string) => void;
}

export function WebhookConfig({
  webhooks,
  onAdd,
  onEdit,
  onDelete,
  onTest
}: WebhookConfigProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWebhook, setNewWebhook] = useState({
    url: '',
    events: ['push'] as string[],
    active: true,
    secret: ''
  });

  const availableEvents = [
    'push', 'pull_request', 'release', 'issues', 'issue_comment',
    'create', 'delete', 'fork', 'deployment', 'workflow_run'
  ];

  const handleAdd = () => {
    onAdd(newWebhook);
    setNewWebhook({ url: '', events: ['push'], active: true, secret: '' });
    setShowAddForm(false);
  };

  return (
    <div className="bg-[#252526] rounded-lg border border-[#3c3c3c] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <Webhook className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-white">Webhooks</h3>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded text-sm font-medium flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add Webhook
        </button>
      </div>

      {/* Webhook List */}
      <div className="divide-y divide-[#3c3c3c]">
        {webhooks.map(webhook => (
          <div key={webhook.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    webhook.active ? 'bg-green-400' : 'bg-gray-500'
                  )} />
                  <span className="text-sm text-white font-mono">{webhook.url}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {webhook.events.map(event => (
                    <span
                      key={event}
                      className="text-xs px-2 py-0.5 bg-[#3c3c3c] rounded text-gray-300"
                    >
                      {event}
                    </span>
                  ))}
                </div>
                {webhook.lastDelivery && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <span>Last delivery: {webhook.lastDelivery.toLocaleString()}</span>
                    {webhook.lastStatus === 'success' ? (
                      <CheckCircle className="w-3 h-3 text-green-400" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-400" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onTest(webhook.id)}
                  className="p-1.5 hover:bg-[#3c3c3c] rounded text-gray-400"
                  title="Test webhook"
                >
                  <Zap className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit(webhook)}
                  className="p-1.5 hover:bg-[#3c3c3c] rounded text-gray-400"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(webhook.id)}
                  className="p-1.5 hover:bg-red-500/10 rounded text-red-400"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {webhooks.length === 0 && !showAddForm && (
          <div className="p-8 text-center text-gray-500">
            <Webhook className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">No webhooks configured</p>
          </div>
        )}
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-[#3c3c3c] overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Payload URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/webhook"
                  value={newWebhook.url}
                  onChange={(e) => setNewWebhook(w => ({ ...w, url: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#007acc]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Secret (optional)</label>
                <input
                  type="password"
                  placeholder="Secret token for signing"
                  value={newWebhook.secret}
                  onChange={(e) => setNewWebhook(w => ({ ...w, secret: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3c3c3c] rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#007acc]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">Events</label>
                <div className="flex flex-wrap gap-2">
                  {availableEvents.map(event => (
                    <button
                      key={event}
                      onClick={() => {
                        setNewWebhook(w => ({
                          ...w,
                          events: w.events.includes(event)
                            ? w.events.filter(e => e !== event)
                            : [...w.events, event]
                        }));
                      }}
                      className={cn(
                        "px-2 py-1 text-xs rounded border",
                        newWebhook.events.includes(event)
                          ? 'bg-[#094771] border-[#007acc] text-white'
                          : 'border-[#3c3c3c] text-gray-400 hover:border-[#007acc]'
                      )}
                    >
                      {event}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="webhook-active"
                  checked={newWebhook.active}
                  onChange={(e) => setNewWebhook(w => ({ ...w, active: e.target.checked }))}
                  className="rounded bg-[#1e1e1e] border-[#3c3c3c]"
                />
                <label htmlFor="webhook-active" className="text-sm text-gray-300">Active</label>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={!newWebhook.url || newWebhook.events.length === 0}
                  className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white rounded text-sm font-medium"
                >
                  Add Webhook
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

export const sampleRepositories: GitHubRepository[] = [
  {
    id: '1',
    owner: 'rust-press',
    name: 'rustpress',
    fullName: 'rust-press/rustpress',
    description: 'A modern, high-performance CMS built with Rust',
    url: 'https://github.com/rust-press/rustpress',
    defaultBranch: 'main',
    isPrivate: false,
    stars: 1234,
    forks: 89,
    lastPush: new Date()
  },
  {
    id: '2',
    owner: 'rust-press',
    name: 'rustpress-themes',
    fullName: 'rust-press/rustpress-themes',
    description: 'Official themes for RustPress',
    url: 'https://github.com/rust-press/rustpress-themes',
    defaultBranch: 'main',
    isPrivate: false,
    stars: 256,
    forks: 34,
    lastPush: new Date()
  }
];

export const sampleBranches: GitHubBranch[] = [
  { name: 'main', sha: 'abc123', protected: true, isDefault: true },
  { name: 'develop', sha: 'def456', protected: false, isDefault: false, aheadBy: 5, behindBy: 0 },
  { name: 'feature/new-editor', sha: 'ghi789', protected: false, isDefault: false, aheadBy: 12, behindBy: 3 },
  { name: 'feature/github-integration', sha: 'jkl012', protected: false, isDefault: false, aheadBy: 8, behindBy: 1 },
  { name: 'hotfix/security-patch', sha: 'mno345', protected: false, isDefault: false, aheadBy: 2, behindBy: 0 }
];

export const sampleCommits: GitHubCommit[] = [
  {
    sha: 'abc123def456',
    shortSha: 'abc123d',
    message: 'feat: Add VS Code-style editor with syntax highlighting',
    author: { name: 'John Developer', email: 'john@example.com' },
    date: new Date(Date.now() - 1000 * 60 * 30),
    parents: ['xyz789'],
    stats: { additions: 450, deletions: 23, total: 473 },
    files: [
      { filename: 'src/editor/MonacoEditor.tsx', status: 'added', additions: 300, deletions: 0 },
      { filename: 'src/editor/FileExplorer.tsx', status: 'added', additions: 150, deletions: 0 },
      { filename: 'package.json', status: 'modified', additions: 0, deletions: 23 }
    ]
  },
  {
    sha: 'def456ghi789',
    shortSha: 'def456g',
    message: 'fix: Resolve memory leak in file watcher',
    author: { name: 'Jane Engineer', email: 'jane@example.com' },
    date: new Date(Date.now() - 1000 * 60 * 60 * 2),
    parents: ['abc123'],
    stats: { additions: 15, deletions: 45, total: 60 }
  },
  {
    sha: 'ghi789jkl012',
    shortSha: 'ghi789j',
    message: 'docs: Update README with new features',
    author: { name: 'John Developer', email: 'john@example.com' },
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    parents: ['def456'],
    stats: { additions: 89, deletions: 12, total: 101 }
  }
];

export const samplePullRequests: GitHubPullRequest[] = [
  {
    id: 1,
    number: 142,
    title: 'Add GitHub integration for function deployments',
    description: 'This PR adds full GitHub integration...',
    state: 'open',
    author: { name: 'john-dev' },
    sourceBranch: 'feature/github-integration',
    targetBranch: 'main',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    updatedAt: new Date(),
    commits: 8,
    additions: 1250,
    deletions: 89,
    changedFiles: 15,
    labels: ['enhancement', 'feature'],
    reviewers: ['jane-eng', 'bob-review'],
    isDraft: false
  },
  {
    id: 2,
    number: 141,
    title: 'WIP: Sandbox environment implementation',
    state: 'open',
    author: { name: 'jane-eng' },
    sourceBranch: 'feature/sandbox',
    targetBranch: 'develop',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    commits: 12,
    additions: 2100,
    deletions: 150,
    changedFiles: 28,
    labels: ['work-in-progress'],
    reviewers: [],
    isDraft: true
  }
];

export const sampleActions: GitHubAction[] = [
  {
    id: '1',
    name: 'Build and Test',
    status: 'completed',
    conclusion: 'success',
    workflowName: 'CI',
    branch: 'main',
    commit: 'abc123d',
    actor: 'john-dev',
    startedAt: new Date(Date.now() - 1000 * 60 * 15),
    completedAt: new Date(Date.now() - 1000 * 60 * 5),
    duration: 600000,
    jobs: [
      { id: '1', name: 'Build', status: 'completed', conclusion: 'success', steps: [] },
      { id: '2', name: 'Test', status: 'completed', conclusion: 'success', steps: [] },
      { id: '3', name: 'Deploy', status: 'completed', conclusion: 'success', steps: [] }
    ]
  },
  {
    id: '2',
    name: 'Deploy to Production',
    status: 'in_progress',
    workflowName: 'Deploy',
    branch: 'main',
    commit: 'def456g',
    actor: 'jane-eng',
    startedAt: new Date(Date.now() - 1000 * 60 * 3),
    jobs: [
      { id: '1', name: 'Build', status: 'completed', conclusion: 'success', steps: [] },
      { id: '2', name: 'Deploy Staging', status: 'completed', conclusion: 'success', steps: [] },
      { id: '3', name: 'Deploy Production', status: 'in_progress', steps: [] }
    ]
  }
];

export const sampleWebhooks: GitHubWebhook[] = [
  {
    id: '1',
    url: 'https://api.rustpress.io/webhooks/github',
    events: ['push', 'pull_request', 'release'],
    active: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
    lastDelivery: new Date(Date.now() - 1000 * 60 * 5),
    lastStatus: 'success'
  },
  {
    id: '2',
    url: 'https://deploy.rustpress.io/trigger',
    events: ['push'],
    active: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    lastDelivery: new Date(Date.now() - 1000 * 60 * 30),
    lastStatus: 'success'
  }
];

export const sampleDiffs: FileDiff[] = [
  {
    filename: 'src/editor/MonacoEditor.tsx',
    status: 'modified',
    additions: 25,
    deletions: 10,
    hunks: [
      {
        oldStart: 10,
        oldLines: 8,
        newStart: 10,
        newLines: 12,
        lines: [
          { type: 'context', content: 'import React from "react";', oldLineNumber: 10, newLineNumber: 10 },
          { type: 'deletion', content: 'import { Editor } from "monaco-editor";', oldLineNumber: 11 },
          { type: 'addition', content: 'import * as monaco from "monaco-editor";', newLineNumber: 11 },
          { type: 'addition', content: 'import { useTheme } from "../hooks/useTheme";', newLineNumber: 12 },
          { type: 'context', content: '', oldLineNumber: 12, newLineNumber: 13 },
          { type: 'context', content: 'export function MonacoEditor() {', oldLineNumber: 13, newLineNumber: 14 }
        ]
      }
    ]
  }
];
