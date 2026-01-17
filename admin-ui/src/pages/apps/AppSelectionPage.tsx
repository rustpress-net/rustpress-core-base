/**
 * AppSelectionPage - Middle layer page for selecting apps in App mode
 *
 * Displayed when:
 * - Site is in 'app' mode
 * - User has access to multiple apps
 * - No default app is set, or user navigates here manually
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Search, Star, Clock, ArrowRight,
  LayoutGrid, List, Sparkles
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import type { InstalledApp } from '../../types/app';

// Dynamically import icons from lucide-react
import * as LucideIcons from 'lucide-react';

const getIconComponent = (iconName: string): React.ElementType => {
  const icons = LucideIcons as Record<string, React.ElementType>;
  return icons[iconName] || Package;
};

interface AppCardProps {
  app: InstalledApp;
  onLaunch: (app: InstalledApp) => void;
  viewMode: 'grid' | 'list';
  isDefault?: boolean;
}

const AppCard: React.FC<AppCardProps> = ({ app, onLaunch, viewMode, isDefault }) => {
  const Icon = getIconComponent(app.icon);

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ scale: 1.01, x: 4 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => onLaunch(app)}
        className="flex items-center gap-4 p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-xl cursor-pointer transition-all group"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white truncate">{app.name}</h3>
            {isDefault && (
              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
                <Star className="w-3 h-3" />
                Default
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 truncate">
            {app.shortDescription || app.description}
          </p>
        </div>

        <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onLaunch(app)}
      className="relative p-6 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-purple-500/50 rounded-2xl cursor-pointer transition-all group"
    >
      {isDefault && (
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" />
            Default
          </span>
        </div>
      )}

      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-shadow">
        <Icon className="w-8 h-8 text-white" />
      </div>

      <h3 className="font-semibold text-white text-lg mb-1">{app.name}</h3>
      <p className="text-sm text-gray-400 line-clamp-2 mb-4">
        {app.shortDescription || app.description}
      </p>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>v{app.version}</span>
        <span className="flex items-center gap-1 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
          Launch
          <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </motion.div>
  );
};

const AppSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    siteModeSettings,
    getActiveApps,
    getUserApps,
    launchApp,
    userAppAccess,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(
    siteModeSettings.appSelectorStyle || 'grid'
  );

  // Get user's apps (using demo user-1 for now)
  const currentUserId = 'user-1'; // In real app, get from auth
  const userApps = getUserApps(currentUserId);
  const defaultAppId = userAppAccess[currentUserId]?.defaultAppId || siteModeSettings.defaultAppId;

  // Filter apps by search
  const filteredApps = userApps.filter(
    (app) =>
      searchQuery === '' ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-launch if only one app
  useEffect(() => {
    if (userApps.length === 1 && siteModeSettings.mode === 'app') {
      handleLaunchApp(userApps[0]);
    }
  }, [userApps, siteModeSettings.mode]);

  const handleLaunchApp = (app: InstalledApp) => {
    launchApp(app.id);
    navigate(`/app/${app.slug}`);
  };

  // If no apps, show empty state
  if (userApps.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/20 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-gray-600" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">No Apps Available</h1>
          <p className="text-gray-400 max-w-md">
            You don't have access to any applications yet. Please contact your administrator
            to get access to applications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          {siteModeSettings.showAppSelectorLogo && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
          )}

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-white mb-3"
          >
            {siteModeSettings.appSelectorTitle || 'Select an Application'}
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-lg mx-auto"
          >
            {siteModeSettings.appSelectorDescription ||
              'Choose an application to get started'}
          </motion.p>
        </div>

        {/* Search and View Toggle */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search applications..."
              className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl transition-all ${
                viewMode === 'grid'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl transition-all ${
                viewMode === 'list'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700 hover:border-gray-600'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Apps Grid/List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-3'
            }
          >
            {filteredApps.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AppCard
                  app={app}
                  onLaunch={handleLaunchApp}
                  viewMode={viewMode}
                  isDefault={app.id === defaultAppId}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* No Results */}
        {filteredApps.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No apps found</h3>
            <p className="text-gray-400">
              No applications match "{searchQuery}"
            </p>
          </div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 text-gray-500 text-sm"
        >
          <p>
            {userApps.length} application{userApps.length !== 1 ? 's' : ''} available
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AppSelectionPage;
