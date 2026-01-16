/**
 * AppSelectorModal - Modal for selecting which app to launch
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Play, X, Search, Star, ChevronRight,
  Briefcase, BarChart3, ShoppingCart, MessageSquare,
  Workflow, Shield, Wrench
} from 'lucide-react';
import type { InstalledApp, AppCategory } from '../../types/app';

// Category icons mapping
const categoryIcons: Record<AppCategory, React.ElementType> = {
  productivity: Briefcase,
  analytics: BarChart3,
  ecommerce: ShoppingCart,
  communication: MessageSquare,
  automation: Workflow,
  security: Shield,
  utilities: Wrench,
};

// Icon mapping for app icons
const iconMap: Record<string, React.ElementType> = {
  Package,
  Briefcase,
  BarChart3,
  ShoppingCart,
  MessageSquare,
  Workflow,
  Shield,
  Wrench,
  Users: Package,
  FolderKanban: Briefcase,
  Mail: MessageSquare,
  CreditCard: ShoppingCart,
  HardDrive: Shield,
  FolderOpen: Wrench,
};

interface AppSelectorModalProps {
  apps: InstalledApp[];
  onSelect: (app: InstalledApp) => void;
  onSkip?: () => void;
  title?: string;
  subtitle?: string;
}

export const AppSelectorModal: React.FC<AppSelectorModalProps> = ({
  apps,
  onSelect,
  onSkip,
  title = 'Choose an App',
  subtitle = 'Select an application to launch',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  const filteredApps = apps.filter(
    (app) =>
      searchQuery === '' ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLaunch = () => {
    const app = apps.find((a) => a.id === selectedAppId);
    if (app) {
      onSelect(app);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{title}</h2>
                <p className="text-sm text-gray-400">{subtitle}</p>
              </div>
            </div>
            {onSkip && (
              <button
                onClick={onSkip}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Search */}
          {apps.length > 4 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search apps..."
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
        </div>

        {/* Apps List */}
        <div className="flex-1 overflow-auto p-4">
          {filteredApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-gray-400">No apps found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredApps.map((app) => {
                const IconComponent = iconMap[app.icon] || Package;
                const CategoryIcon = categoryIcons[app.category];
                const isSelected = selectedAppId === app.id;

                return (
                  <motion.button
                    key={app.id}
                    onClick={() => setSelectedAppId(app.id)}
                    onDoubleClick={() => onSelect(app)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                      isSelected
                        ? 'bg-blue-500/20 border-blue-500'
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {/* App Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-blue-500/30'
                        : 'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
                    }`}>
                      <IconComponent className={`w-6 h-6 ${isSelected ? 'text-blue-400' : 'text-blue-400'}`} />
                    </div>

                    {/* App Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white truncate">{app.name}</h3>
                        {app.verified && (
                          <Shield className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate">
                        {app.shortDescription || app.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <CategoryIcon className="w-3 h-3" />
                          <span className="capitalize">{app.category}</span>
                        </span>
                        {app.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            {app.rating.toFixed(1)}
                          </span>
                        )}
                        <span>v{app.version}</span>
                      </div>
                    </div>

                    {/* Selection indicator */}
                    <ChevronRight className={`w-5 h-5 flex-shrink-0 ${
                      isSelected ? 'text-blue-400' : 'text-gray-600'
                    }`} />
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {apps.length} app{apps.length !== 1 ? 's' : ''} available
          </p>
          <div className="flex items-center gap-3">
            {onSkip && (
              <button
                onClick={onSkip}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Skip to Dashboard
              </button>
            )}
            <button
              onClick={handleLaunch}
              disabled={!selectedAppId}
              className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                selectedAppId
                  ? 'bg-blue-600 text-white hover:bg-blue-500'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Play className="w-4 h-4" />
              Launch App
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AppSelectorModal;
