/**
 * GitWarningBanner - Displays a warning when project doesn't have git initialized
 * Provides options to initialize git or dismiss the warning
 */

import React, { useState } from 'react';
import { AlertTriangle, GitBranch, X, ExternalLink, HardDrive, Info } from 'lucide-react';

interface GitWarningBannerProps {
  projectPath: string;
  projectName: string;
  onInitGit: () => void;
  onDismiss: () => void;
  isInitializing?: boolean;
}

export const GitWarningBanner: React.FC<GitWarningBannerProps> = ({
  projectPath,
  projectName,
  onInitGit,
  onDismiss,
  isInitializing = false
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-amber-900/30 border border-amber-600/50 rounded-lg mx-2 mb-2 overflow-hidden">
      {/* Main warning */}
      <div className="flex items-start gap-3 p-3">
        <div className="flex-shrink-0 p-1.5 bg-amber-500/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-amber-300">No Git Repository Detected</h4>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-amber-400/70 hover:text-amber-300 transition-colors"
              title="More information"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-amber-200/70 mb-2">
            <span className="font-medium text-amber-200">{projectName}</span> doesn't have version control.
            Changes will be saved locally without history tracking.
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onInitGit}
              disabled={isInitializing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-600 hover:bg-amber-500 disabled:bg-amber-700 disabled:cursor-not-allowed text-white rounded transition-colors"
            >
              {isInitializing ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <GitBranch className="w-3.5 h-3.5" />
                  Initialize Git
                </>
              )}
            </button>

            <button
              onClick={onDismiss}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 hover:text-white hover:bg-amber-700/50 rounded transition-colors"
            >
              <HardDrive className="w-3.5 h-3.5" />
              Continue Without Git
            </button>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 text-amber-400/50 hover:text-amber-300 hover:bg-amber-700/30 rounded transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Expandable details */}
      {showDetails && (
        <div className="px-3 pb-3 pt-0 border-t border-amber-700/30 mt-0">
          <div className="bg-amber-950/50 rounded-lg p-3 mt-3">
            <h5 className="text-xs font-medium text-amber-300 mb-2 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Why use Git?
            </h5>
            <ul className="text-xs text-amber-200/70 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span><strong>Version History:</strong> Track all changes and easily revert to previous versions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span><strong>Collaboration:</strong> Work with others without overwriting each other's changes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span><strong>Backup:</strong> Push to remote repositories like GitHub for safe backup</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span><strong>Branching:</strong> Experiment safely with new features in isolated branches</span>
              </li>
            </ul>

            <div className="mt-3 pt-2 border-t border-amber-700/30">
              <p className="text-xs text-amber-200/50 flex items-center gap-1.5">
                <HardDrive className="w-3 h-3" />
                Without Git, your code is saved directly to: <code className="bg-amber-900/50 px-1.5 py-0.5 rounded">{projectPath}</code>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Compact inline version for the status bar or file tree header
 */
export const GitWarningInline: React.FC<{
  onClick: () => void;
}> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2 py-1 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-900/30 rounded transition-colors"
      title="No git repository - click to initialize"
    >
      <AlertTriangle className="w-3.5 h-3.5" />
      <span>No Git</span>
    </button>
  );
};

export default GitWarningBanner;
