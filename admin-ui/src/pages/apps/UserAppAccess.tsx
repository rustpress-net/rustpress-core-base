/**
 * UserAppAccess - Manage which users can access which apps
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, UserPlus, Check, X, Package,
  ChevronDown, ChevronRight, Star, Save, Shield
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import type { InstalledApp, UserAppAccess as UserAppAccessType } from '../../types/app';

// Mock users data (in real app, this would come from user store)
const mockUsers = [
  { id: 'user-1', name: 'John Doe', email: 'john@example.com', role: 'Admin', avatar: null },
  { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', avatar: null },
  { id: 'user-3', name: 'Bob Johnson', email: 'bob@example.com', role: 'User', avatar: null },
  { id: 'user-4', name: 'Alice Brown', email: 'alice@example.com', role: 'User', avatar: null },
  { id: 'user-5', name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Editor', avatar: null },
];

const UserAppAccessPage: React.FC = () => {
  const {
    installedApps,
    userAppAccess,
    setUserAccess,
    getActiveApps,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [pendingChanges, setPendingChanges] = useState<Record<string, string[]>>({});
  const [pendingDefaults, setPendingDefaults] = useState<Record<string, string | null>>({});

  const activeApps = getActiveApps();

  // Filter users by search
  const filteredUsers = mockUsers.filter(
    (user) =>
      searchQuery === '' ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUserAccess = (userId: string): string[] => {
    if (pendingChanges[userId]) return pendingChanges[userId];
    return userAppAccess[userId]?.appIds || [];
  };

  const getUserDefaultApp = (userId: string): string | null => {
    if (pendingDefaults[userId] !== undefined) return pendingDefaults[userId];
    return userAppAccess[userId]?.defaultAppId || null;
  };

  const toggleUserApp = (userId: string, appId: string) => {
    const current = getUserAccess(userId);
    const updated = current.includes(appId)
      ? current.filter((id) => id !== appId)
      : [...current, appId];
    setPendingChanges({ ...pendingChanges, [userId]: updated });

    // If removing the default app, clear the default
    const defaultApp = getUserDefaultApp(userId);
    if (defaultApp === appId && !updated.includes(appId)) {
      setPendingDefaults({ ...pendingDefaults, [userId]: null });
    }
  };

  const setDefaultApp = (userId: string, appId: string | null) => {
    setPendingDefaults({ ...pendingDefaults, [userId]: appId });
  };

  const saveUserAccess = (userId: string) => {
    const appIds = pendingChanges[userId] || userAppAccess[userId]?.appIds || [];
    const defaultAppId = pendingDefaults[userId] !== undefined
      ? pendingDefaults[userId]
      : userAppAccess[userId]?.defaultAppId;

    setUserAccess(userId, {
      userId,
      appIds,
      defaultAppId: defaultAppId || undefined,
    });

    // Clear pending changes
    const { [userId]: _, ...restChanges } = pendingChanges;
    const { [userId]: __, ...restDefaults } = pendingDefaults;
    setPendingChanges(restChanges);
    setPendingDefaults(restDefaults);
  };

  const toggleExpanded = (userId: string) => {
    const next = new Set(expandedUsers);
    if (next.has(userId)) next.delete(userId);
    else next.add(userId);
    setExpandedUsers(next);
  };

  const hasChanges = (userId: string) => {
    return pendingChanges[userId] !== undefined || pendingDefaults[userId] !== undefined;
  };

  const grantAllApps = (userId: string) => {
    setPendingChanges({
      ...pendingChanges,
      [userId]: activeApps.map((app) => app.id),
    });
  };

  const revokeAllApps = (userId: string) => {
    setPendingChanges({ ...pendingChanges, [userId]: [] });
    setPendingDefaults({ ...pendingDefaults, [userId]: null });
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-green-400" />
              User App Access
            </h1>
            <p className="text-gray-400 mt-1">
              Control which apps users can access after login
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3">
          <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-blue-300">How App Access Works</div>
            <p className="text-sm text-blue-300/80 mt-1">
              When a user logs in, they will see only the apps you've assigned to them.
              If only one app is assigned, it will launch automatically.
              You can also set a default app that opens first when multiple apps are available.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Active Apps Summary */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <div className="text-sm text-gray-400 mb-3">Available Apps ({activeApps.length})</div>
          <div className="flex flex-wrap gap-2">
            {activeApps.map((app) => (
              <span
                key={app.id}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm flex items-center gap-2"
              >
                <Package className="w-3.5 h-3.5" />
                {app.name}
              </span>
            ))}
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {filteredUsers.map((user) => {
            const userApps = getUserAccess(user.id);
            const defaultApp = getUserDefaultApp(user.id);
            const isExpanded = expandedUsers.has(user.id);
            const changed = hasChanges(user.id);

            return (
              <motion.div
                key={user.id}
                layout
                className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden"
              >
                {/* User Row */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-750"
                  onClick={() => toggleExpanded(user.id)}
                >
                  <button className="text-gray-500">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                    {user.name.charAt(0)}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="font-medium text-white">{user.name}</div>
                    <div className="text-sm text-gray-400">{user.email}</div>
                  </div>

                  {/* Role */}
                  <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                    {user.role}
                  </span>

                  {/* Apps Count */}
                  <div className="text-sm text-gray-400">
                    {userApps.length} app{userApps.length !== 1 ? 's' : ''} assigned
                  </div>

                  {/* Change Indicator */}
                  {changed && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                      Unsaved
                    </span>
                  )}
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-700"
                    >
                      <div className="p-4 space-y-4">
                        {/* Quick Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); grantAllApps(user.id); }}
                            className="px-3 py-1.5 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 text-sm"
                          >
                            Grant All Apps
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); revokeAllApps(user.id); }}
                            className="px-3 py-1.5 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 text-sm"
                          >
                            Revoke All Apps
                          </button>
                        </div>

                        {/* Apps Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {activeApps.map((app) => {
                            const hasAccess = userApps.includes(app.id);
                            const isDefault = defaultApp === app.id;
                            return (
                              <div
                                key={app.id}
                                onClick={(e) => { e.stopPropagation(); toggleUserApp(user.id, app.id); }}
                                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                  hasAccess
                                    ? 'bg-blue-500/10 border-blue-500/50'
                                    : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <Package className={`w-5 h-5 ${hasAccess ? 'text-blue-400' : 'text-gray-500'}`} />
                                  <div className="flex items-center gap-1">
                                    {isDefault && (
                                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    )}
                                    {hasAccess ? (
                                      <Check className="w-4 h-4 text-green-400" />
                                    ) : (
                                      <X className="w-4 h-4 text-gray-600" />
                                    )}
                                  </div>
                                </div>
                                <div className={`font-medium ${hasAccess ? 'text-white' : 'text-gray-500'}`}>
                                  {app.name}
                                </div>
                                {hasAccess && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDefaultApp(user.id, isDefault ? null : app.id);
                                    }}
                                    className={`mt-2 text-xs ${
                                      isDefault
                                        ? 'text-yellow-400'
                                        : 'text-gray-500 hover:text-gray-300'
                                    }`}
                                  >
                                    {isDefault ? 'Default App' : 'Set as Default'}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Save Button */}
                        {changed && (
                          <div className="flex justify-end pt-2 border-t border-gray-700">
                            <button
                              onClick={(e) => { e.stopPropagation(); saveUserAccess(user.id); }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
                            >
                              <Save className="w-4 h-4" />
                              Save Changes
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-gray-800 border border-gray-700 rounded-xl">
            <Users className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No users found</h3>
            <p className="text-gray-400">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAppAccessPage;
