/**
 * WelcomeTab - Getting started and recent files display
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText, FolderOpen, Clock, Star, BookOpen, Keyboard,
  GitBranch, Palette, Terminal, Search, Settings, Zap,
  ArrowRight, ExternalLink, Play
} from 'lucide-react';

interface RecentFile {
  path: string;
  name: string;
  timestamp: Date;
}

interface WelcomeTabProps {
  recentFiles: RecentFile[];
  onOpenFile: (path: string) => void;
  onOpenFolder: () => void;
  onStartTutorial: () => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
}

const quickActions = [
  { icon: FolderOpen, label: 'Open Folder', shortcut: 'Ctrl+O', action: 'folder' },
  { icon: FileText, label: 'New File', shortcut: 'Ctrl+N', action: 'newFile' },
  { icon: Search, label: 'Search Files', shortcut: 'Ctrl+P', action: 'search' },
  { icon: Terminal, label: 'Open Terminal', shortcut: 'Ctrl+`', action: 'terminal' },
];

const features = [
  {
    icon: Palette,
    title: 'Theme Editor',
    description: 'Edit your RustPress themes with syntax highlighting and live preview'
  },
  {
    icon: GitBranch,
    title: 'Git Integration',
    description: 'Commit, push, and manage your changes without leaving the editor'
  },
  {
    icon: Keyboard,
    title: 'Keyboard Shortcuts',
    description: 'Boost productivity with VS Code-style keyboard shortcuts'
  },
  {
    icon: Zap,
    title: 'IntelliSense',
    description: 'Smart code completion for HTML, CSS, JavaScript, and Jinja2'
  },
];

export const WelcomeTab: React.FC<WelcomeTabProps> = ({
  recentFiles,
  onOpenFile,
  onOpenFolder,
  onStartTutorial,
  onOpenSettings,
  onOpenShortcuts
}) => {
  return (
    <div className="h-full w-full overflow-auto bg-gradient-to-b from-gray-900 to-gray-950 flex items-center justify-center">
      <div className="max-w-4xl w-full mx-auto px-8 py-12 my-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold text-white mb-3">
            Welcome to RustPress IDE
          </h1>
          <p className="text-gray-400 text-lg">
            A powerful code editor for your RustPress themes and plugins
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          {/* Left Column - Start */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
              Start
            </h2>
            <div className="space-y-2">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (action.action === 'folder') onOpenFolder();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg transition-colors group"
                >
                  <action.icon className="w-5 h-5 text-blue-400" />
                  <span className="text-white flex-1 text-left">{action.label}</span>
                  <span className="text-xs text-gray-500 group-hover:text-gray-400">
                    {action.shortcut}
                  </span>
                </button>
              ))}
            </div>

            {/* Tutorial Button */}
            <button
              onClick={onStartTutorial}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white"
            >
              <Play className="w-5 h-5" />
              <span>Start Interactive Tutorial</span>
            </button>
          </motion.div>

          {/* Right Column - Recent */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
              Recent
            </h2>
            {recentFiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent files</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentFiles.slice(0, 6).map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() => onOpenFile(file.path)}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-800 rounded-lg transition-colors group text-left"
                  >
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{file.name}</p>
                      <p className="text-xs text-gray-500 truncate">{file.path}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
            Features
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-4 bg-gray-800/30 rounded-lg"
              >
                <div className="p-2 bg-gray-800 rounded-lg">
                  <feature.icon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">{feature.title}</h3>
                  <p className="text-xs text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-6 mt-12 pt-8 border-t border-gray-800"
        >
          <button
            onClick={onOpenShortcuts}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <Keyboard className="w-4 h-4" />
            Keyboard Shortcuts
          </button>
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <a
            href="https://rustpress.net/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Documentation
            <ExternalLink className="w-3 h-3" />
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomeTab;
