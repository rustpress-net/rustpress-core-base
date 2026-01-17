/**
 * ActivityBar - Quick access sidebar icons (VS Code style)
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Files, Search, GitBranch, Bug, Puzzle, Settings,
  User, Bell, Keyboard, Layout, Terminal, Palette,
  Bot, Bookmark, Clock, List, Sliders, FileText,
  Image, Tags, Menu, MessageSquare, Layers, Database,
  Globe, Gauge, Shield, HardDrive, ScrollText, Users,
  FormInput, LayoutGrid, BarChart3, Mail, ArrowRightLeft,
  Zap, Webhook
} from 'lucide-react';

export type ActivityView =
  | 'files'
  | 'search'
  | 'git'
  | 'debug'
  | 'extensions'
  | 'ai-assistant'
  | 'bookmarks'
  | 'timeline'
  | 'outline'
  | 'editor-settings'
  | 'collaboration';

interface ActivityItem {
  id: ActivityView;
  icon: React.ElementType;
  label: string;
  badge?: number;
}

interface ActivityBarProps {
  activeView: ActivityView;
  onViewChange: (view: ActivityView) => void;
  gitChanges?: number;
  problems?: number;
  notifications?: number;
  collaborators?: number;
  onOpenSettings?: () => void;
  onOpenShortcuts?: () => void;
  onToggleTerminal?: () => void;
}

// Core IDE Items
const coreItems: ActivityItem[] = [
  { id: 'files', icon: Files, label: 'Explorer' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'git', icon: GitBranch, label: 'Source Control' },
  { id: 'debug', icon: Bug, label: 'Debug' },
  { id: 'extensions', icon: Puzzle, label: 'Extensions' },
  { id: 'ai-assistant', icon: Bot, label: 'AI Assistant' },
  { id: 'collaboration', icon: Users, label: 'Collaborators' },
];

// Secondary IDE Items
const secondaryItems: ActivityItem[] = [
  { id: 'outline', icon: List, label: 'Outline' },
  { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { id: 'timeline', icon: Clock, label: 'Timeline' },
  { id: 'editor-settings', icon: Sliders, label: 'Editor Settings' },
];

const topItems: ActivityItem[] = [...coreItems, ...secondaryItems];

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeView,
  onViewChange,
  gitChanges = 0,
  problems = 0,
  notifications = 0,
  collaborators = 0,
  onOpenSettings,
  onOpenShortcuts,
  onToggleTerminal
}) => {
  return (
    <div className="w-12 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-2">
      {/* Top Items */}
      <div className="flex flex-col items-center gap-1">
        {topItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const badge = item.id === 'git' ? gitChanges : item.id === 'collaboration' ? collaborators : undefined;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`relative w-10 h-10 flex items-center justify-center rounded-lg transition-colors group ${
                isActive
                  ? 'text-white bg-gray-800'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
              title={item.label}
            >
              {isActive && (
                <motion.div
                  layoutId="activityIndicator"
                  className="absolute left-0 w-0.5 h-6 bg-white rounded-r"
                />
              )}
              <Icon className="w-5 h-5" />
              {badge !== undefined && badge > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-blue-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom Items */}
      <div className="flex flex-col items-center gap-1">
        {/* Problems */}
        {problems > 0 && (
          <button
            className="relative w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-colors"
            title={`${problems} problem${problems !== 1 ? 's' : ''}`}
          >
            <Bug className="w-5 h-5" />
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
              {problems > 99 ? '99+' : problems}
            </span>
          </button>
        )}

        {/* Terminal */}
        {onToggleTerminal && (
          <button
            onClick={onToggleTerminal}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-colors"
            title="Terminal"
          >
            <Terminal className="w-5 h-5" />
          </button>
        )}

        {/* Notifications */}
        {notifications > 0 && (
          <button
            className="relative w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-colors"
            title={`${notifications} notification${notifications !== 1 ? 's' : ''}`}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-blue-500 rounded-full text-[10px] text-white flex items-center justify-center">
              {notifications > 99 ? '99+' : notifications}
            </span>
          </button>
        )}

        {/* Keyboard Shortcuts */}
        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-colors"
            title="Keyboard Shortcuts"
          >
            <Keyboard className="w-5 h-5" />
          </button>
        )}

        {/* Settings */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}

        {/* User */}
        <button
          className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800/50 transition-colors"
          title="Account"
        >
          <User className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ActivityBar;
