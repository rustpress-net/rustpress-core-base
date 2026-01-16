/**
 * AppCard - Reusable app card component for displaying apps in grid/list views
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Package, Star, Download, Check, Play, Settings, Trash2,
  Crown, Shield, ExternalLink, MoreVertical,
  Briefcase, BarChart3, ShoppingCart, MessageSquare,
  Workflow, Wrench
} from 'lucide-react';
import type { App, InstalledApp, AppCategory } from '../../types/app';

// Icon mapping for categories
const categoryIcons: Record<AppCategory, React.ElementType> = {
  productivity: Briefcase,
  analytics: BarChart3,
  ecommerce: ShoppingCart,
  communication: MessageSquare,
  automation: Workflow,
  security: Shield,
  utilities: Wrench,
};

// Icon mapping for app icons (string to component)
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

interface AppCardProps {
  app: App | InstalledApp;
  variant?: 'grid' | 'list';
  showActions?: boolean;
  isInstalled?: boolean;
  onInstall?: () => void;
  onUninstall?: () => void;
  onLaunch?: () => void;
  onConfigure?: () => void;
  onActivate?: () => void;
  onDeactivate?: () => void;
  onClick?: () => void;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  variant = 'grid',
  showActions = true,
  isInstalled = false,
  onInstall,
  onUninstall,
  onLaunch,
  onConfigure,
  onActivate,
  onDeactivate,
  onClick,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const IconComponent = iconMap[app.icon] || Package;
  const CategoryIcon = categoryIcons[app.category];
  const installedApp = app as InstalledApp;
  const isActive = installedApp.status === 'active';

  const formatPrice = () => {
    if (app.pricing.type === 'free') return 'Free';
    if (app.pricing.type === 'membership') {
      return `$${app.pricing.price}/${app.pricing.billingPeriod === 'yearly' ? 'yr' : 'mo'}`;
    }
    return `$${app.pricing.price}`;
  };

  const getPriceBadgeColor = () => {
    if (app.pricing.type === 'free') return 'bg-green-500/20 text-green-400';
    if (app.pricing.type === 'membership') return 'bg-purple-500/20 text-purple-400';
    return 'bg-blue-500/20 text-blue-400';
  };

  if (variant === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 p-4 bg-gray-800 border border-gray-700 rounded-lg hover:border-gray-600 transition-colors cursor-pointer"
        onClick={onClick}
      >
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
          <IconComponent className="w-6 h-6 text-blue-400" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white truncate">{app.name}</h3>
            {app.verified && <Shield className="w-4 h-4 text-blue-400" />}
            {app.featured && <Crown className="w-4 h-4 text-yellow-400" />}
          </div>
          <p className="text-sm text-gray-400 truncate">{app.shortDescription || app.description}</p>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {app.rating && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-gray-300">{app.rating.toFixed(1)}</span>
            </div>
          )}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriceBadgeColor()}`}>
            {formatPrice()}
          </span>
          {isInstalled && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-600 text-gray-400'
            }`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2">
            {isInstalled ? (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onLaunch?.(); }}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                  title="Launch"
                >
                  <Play className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onConfigure?.(); }}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  title="Configure"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onInstall?.(); }}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 transition-colors"
              >
                Install
              </button>
            )}
          </div>
        )}
      </motion.div>
    );
  }

  // Grid variant
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative group bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-gray-600 transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Header with gradient */}
      <div className="relative h-24 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20">
        {/* Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          {app.featured && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
              <Crown className="w-3 h-3" /> Featured
            </span>
          )}
          {app.verified && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
              <Shield className="w-3 h-3" /> Verified
            </span>
          )}
        </div>

        {/* Price badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriceBadgeColor()}`}>
            {formatPrice()}
          </span>
        </div>

        {/* Icon */}
        <div className="absolute -bottom-6 left-4">
          <div className="w-14 h-14 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center shadow-lg">
            <IconComponent className="w-7 h-7 text-blue-400" />
          </div>
        </div>

        {/* Menu button */}
        {showActions && isInstalled && (
          <div className="absolute top-2 right-2" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-10 py-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onConfigure?.(); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" /> Configure
                </button>
                {isActive ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeactivate?.(); setShowMenu(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-yellow-400 hover:bg-gray-800 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Deactivate
                  </button>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); onActivate?.(); setShowMenu(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-green-400 hover:bg-gray-800 flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Activate
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); onUninstall?.(); setShowMenu(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Uninstall
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 pt-8">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-white">{app.name}</h3>
            <p className="text-xs text-gray-500">by {app.author}</p>
          </div>
          {isInstalled && (
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-600 text-gray-400'
            }`}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-400 line-clamp-2 mb-3">
          {app.shortDescription || app.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <CategoryIcon className="w-3.5 h-3.5" />
            <span className="capitalize">{app.category}</span>
          </div>
          {app.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span>{app.rating.toFixed(1)}</span>
            </div>
          )}
          {app.downloadCount && (
            <div className="flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              <span>{app.downloadCount.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2">
            {isInstalled ? (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onLaunch?.(); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 transition-colors"
                  disabled={!isActive}
                >
                  <Play className="w-4 h-4" /> Launch
                </button>
              </>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onInstall?.(); }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 transition-colors"
              >
                <Download className="w-4 h-4" /> Install
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AppCard;
