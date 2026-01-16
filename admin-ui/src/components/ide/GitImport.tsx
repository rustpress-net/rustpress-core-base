/**
 * GitImport - Import/clone projects from Git repositories
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, GitBranch, Download, Folder, Lock, Globe, Check,
  AlertCircle, Loader2, Github, ExternalLink, RefreshCw,
  ChevronDown, Copy, Eye, EyeOff
} from 'lucide-react';

interface RecentRepo {
  url: string;
  name: string;
  branch: string;
  lastCloned: Date;
}

interface GitImportProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (url: string, branch: string, path: string, credentials?: { username: string; token: string }) => Promise<void>;
  defaultPath?: string;
  recentRepos?: RecentRepo[];
}

export const GitImport: React.FC<GitImportProps> = ({
  isOpen,
  onClose,
  onImport,
  defaultPath = 'themes',
  recentRepos = []
}) => {
  const [url, setUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [path, setPath] = useState(defaultPath);
  const [isPrivate, setIsPrivate] = useState(false);
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const extractRepoName = (repoUrl: string): string => {
    try {
      const match = repoUrl.match(/\/([^\/]+?)(\.git)?$/);
      return match ? match[1] : 'repository';
    } catch {
      return 'repository';
    }
  };

  const validateUrl = (repoUrl: string): boolean => {
    const patterns = [
      /^https?:\/\/github\.com\/[\w-]+\/[\w.-]+(?:\.git)?$/,
      /^https?:\/\/gitlab\.com\/[\w-]+\/[\w.-]+(?:\.git)?$/,
      /^https?:\/\/bitbucket\.org\/[\w-]+\/[\w.-]+(?:\.git)?$/,
      /^git@[\w.-]+:[\w-]+\/[\w.-]+(?:\.git)?$/,
      /^https?:\/\/[\w.-]+\/[\w/-]+(?:\.git)?$/
    ];
    return patterns.some(pattern => pattern.test(repoUrl));
  };

  const handleImport = useCallback(async () => {
    setError(null);
    setSuccess(false);

    if (!url.trim()) {
      setError('Please enter a repository URL');
      return;
    }

    if (!validateUrl(url)) {
      setError('Invalid repository URL format');
      return;
    }

    setIsLoading(true);

    try {
      const credentials = isPrivate && username && token
        ? { username, token }
        : undefined;

      await onImport(url, branch, path, credentials);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setUrl('');
        setBranch('main');
        setPath(defaultPath);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import repository');
    } finally {
      setIsLoading(false);
    }
  }, [url, branch, path, isPrivate, username, token, onImport, onClose, defaultPath]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (validateUrl(text)) {
        setUrl(text);
      }
    } catch {
      // Clipboard access denied
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
          >
            <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-green-400" />
                  <h3 className="text-sm font-medium text-white">Import from Git</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Repository URL */}
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Repository URL</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => { setUrl(e.target.value); setError(null); }}
                      placeholder="https://github.com/username/repo.git"
                      className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                    <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <button
                      onClick={handlePaste}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                      title="Paste from clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  {url && (
                    <p className="text-xs text-gray-500 mt-1">
                      Will import as: <span className="text-blue-400">{extractRepoName(url)}</span>
                    </p>
                  )}
                </div>

                {/* Quick Links */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">Popular:</span>
                  <button
                    onClick={() => setUrl('https://github.com/rustpress/starter-theme.git')}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                  >
                    <Github className="w-3 h-3" />
                    Starter Theme
                  </button>
                  <button
                    onClick={() => setUrl('https://github.com/rustpress/developer-theme.git')}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                  >
                    <Github className="w-3 h-3" />
                    Developer Theme
                  </button>
                </div>

                {/* Branch & Path */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">Branch</label>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="main"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">Destination Folder</label>
                    <select
                      value={path}
                      onChange={(e) => setPath(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="themes">themes/</option>
                      <option value="plugins">plugins/</option>
                      <option value="functions">functions/</option>
                      <option value="assets">assets/</option>
                      <option value="">Root directory</option>
                    </select>
                  </div>
                </div>

                {/* Full destination path preview */}
                {url && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700">
                    <Folder className="w-4 h-4 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-400">Clone destination:</p>
                      <p className="text-sm text-white font-mono">
                        /{path ? path + '/' : ''}{extractRepoName(url)}/
                      </p>
                    </div>
                  </div>
                )}

                {/* Private Repository Toggle */}
                <button
                  onClick={() => setIsPrivate(!isPrivate)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    isPrivate ? 'bg-yellow-600/20 border border-yellow-500/30' : 'bg-gray-800 border border-gray-700 hover:bg-gray-750'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isPrivate ? (
                      <Lock className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <Globe className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm text-white">
                      {isPrivate ? 'Private repository' : 'Public repository'}
                    </span>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors ${isPrivate ? 'bg-yellow-600' : 'bg-gray-700'}`}>
                    <div className={`w-5 h-5 mt-0.5 rounded-full bg-white shadow transition-transform ${isPrivate ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                  </div>
                </button>

                {/* Credentials (for private repos) */}
                <AnimatePresence>
                  {isPrivate && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-3"
                    >
                      <div>
                        <label className="text-xs text-gray-400 mb-2 block">Username</label>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="GitHub username"
                          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-2 block">Personal Access Token</label>
                        <div className="relative">
                          <input
                            type={showToken ? 'text' : 'password'}
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="ghp_xxxxxxxxxxxx"
                            className="w-full pl-3 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                          />
                          <button
                            onClick={() => setShowToken(!showToken)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white"
                          >
                            {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1">
                          Create a token at GitHub Settings → Developer settings → Personal access tokens
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-xs text-red-400">{error}</p>
                  </motion.div>
                )}

                {/* Success Message */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
                  >
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <p className="text-xs text-green-400">Repository imported successfully!</p>
                  </motion.div>
                )}

                {/* Recent Repositories */}
                {recentRepos.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-400"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                      Recent imports
                    </button>
                    <AnimatePresence>
                      {showAdvanced && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-2 space-y-1 overflow-hidden"
                        >
                          {recentRepos.map((repo, idx) => (
                            <button
                              key={idx}
                              onClick={() => { setUrl(repo.url); setBranch(repo.branch); }}
                              className="w-full flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-750 rounded-lg transition-colors text-left"
                            >
                              <Github className="w-4 h-4 text-gray-400" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-white truncate">{repo.name}</p>
                                <p className="text-[10px] text-gray-500">{repo.branch} • {formatDate(repo.lastCloned)}</p>
                              </div>
                              <RefreshCw className="w-3 h-3 text-gray-500" />
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-gray-700 bg-gray-800/50">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={isLoading || !url.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm text-white transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Import
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GitImport;
