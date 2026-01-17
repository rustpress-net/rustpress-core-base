/**
 * UserRoleEditor - User role and permission management
 * RustPress-specific access control functionality
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Shield, Key, Lock, Unlock, Plus, Trash2, Edit2,
  Check, X, ChevronDown, ChevronRight, Eye, Settings,
  UserPlus, UserMinus, Copy, Save, AlertTriangle
} from 'lucide-react';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'users' | 'settings' | 'media' | 'plugins' | 'themes' | 'system';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roleId: string;
  lastActive?: string;
}

interface UserRoleEditorProps {
  onSave?: (roles: Role[]) => void;
  onUserUpdate?: (user: User) => void;
}

const mockPermissions: Permission[] = [
  // Content
  { id: 'content.view', name: 'View Content', description: 'View posts and pages', category: 'content' },
  { id: 'content.create', name: 'Create Content', description: 'Create new posts and pages', category: 'content' },
  { id: 'content.edit', name: 'Edit Content', description: 'Edit existing content', category: 'content' },
  { id: 'content.delete', name: 'Delete Content', description: 'Delete posts and pages', category: 'content' },
  { id: 'content.publish', name: 'Publish Content', description: 'Publish content live', category: 'content' },
  // Users
  { id: 'users.view', name: 'View Users', description: 'View user list', category: 'users' },
  { id: 'users.create', name: 'Create Users', description: 'Create new users', category: 'users' },
  { id: 'users.edit', name: 'Edit Users', description: 'Edit user details', category: 'users' },
  { id: 'users.delete', name: 'Delete Users', description: 'Delete users', category: 'users' },
  { id: 'users.roles', name: 'Manage Roles', description: 'Manage user roles', category: 'users' },
  // Media
  { id: 'media.view', name: 'View Media', description: 'View media library', category: 'media' },
  { id: 'media.upload', name: 'Upload Media', description: 'Upload files', category: 'media' },
  { id: 'media.delete', name: 'Delete Media', description: 'Delete media files', category: 'media' },
  // Settings
  { id: 'settings.view', name: 'View Settings', description: 'View site settings', category: 'settings' },
  { id: 'settings.edit', name: 'Edit Settings', description: 'Modify settings', category: 'settings' },
  // Plugins
  { id: 'plugins.view', name: 'View Plugins', description: 'View installed plugins', category: 'plugins' },
  { id: 'plugins.install', name: 'Install Plugins', description: 'Install new plugins', category: 'plugins' },
  { id: 'plugins.activate', name: 'Activate Plugins', description: 'Enable/disable plugins', category: 'plugins' },
  // Themes
  { id: 'themes.view', name: 'View Themes', description: 'View themes', category: 'themes' },
  { id: 'themes.install', name: 'Install Themes', description: 'Install new themes', category: 'themes' },
  { id: 'themes.customize', name: 'Customize Themes', description: 'Customize theme settings', category: 'themes' },
  // System
  { id: 'system.backup', name: 'Manage Backups', description: 'Create and restore backups', category: 'system' },
  { id: 'system.logs', name: 'View Logs', description: 'Access system logs', category: 'system' },
  { id: 'system.updates', name: 'System Updates', description: 'Update system', category: 'system' },
];

const mockRoles: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to all features',
    color: '#EF4444',
    permissions: mockPermissions.map(p => p.id),
    userCount: 2,
    isSystem: true
  },
  {
    id: 'editor',
    name: 'Editor',
    description: 'Can manage content and media',
    color: '#8B5CF6',
    permissions: ['content.view', 'content.create', 'content.edit', 'content.delete', 'content.publish', 'media.view', 'media.upload'],
    userCount: 5,
    isSystem: true
  },
  {
    id: 'author',
    name: 'Author',
    description: 'Can create and edit own content',
    color: '#06B6D4',
    permissions: ['content.view', 'content.create', 'content.edit', 'media.view', 'media.upload'],
    userCount: 12,
    isSystem: true
  },
  {
    id: 'contributor',
    name: 'Contributor',
    description: 'Can create content drafts',
    color: '#10B981',
    permissions: ['content.view', 'content.create', 'media.view'],
    userCount: 8,
    isSystem: false
  },
  {
    id: 'subscriber',
    name: 'Subscriber',
    description: 'Can only view content',
    color: '#6B7280',
    permissions: ['content.view'],
    userCount: 156,
    isSystem: true
  }
];

const mockUsers: User[] = [
  { id: '1', name: 'John Admin', email: 'john@example.com', roleId: 'admin', lastActive: '2 minutes ago' },
  { id: '2', name: 'Jane Editor', email: 'jane@example.com', roleId: 'editor', lastActive: '1 hour ago' },
  { id: '3', name: 'Bob Author', email: 'bob@example.com', roleId: 'author', lastActive: '3 hours ago' },
  { id: '4', name: 'Alice Writer', email: 'alice@example.com', roleId: 'author', lastActive: '1 day ago' },
  { id: '5', name: 'Charlie Contrib', email: 'charlie@example.com', roleId: 'contributor', lastActive: '2 days ago' },
];

export const UserRoleEditor: React.FC<UserRoleEditorProps> = ({
  onSave,
  onUserUpdate
}) => {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [activeTab, setActiveTab] = useState<'roles' | 'users'>('roles');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['content', 'users']);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const permissionsByCategory = mockPermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const togglePermission = (permId: string) => {
    if (!selectedRole) return;
    setRoles(prev => prev.map(role => {
      if (role.id === selectedRole.id) {
        const newPerms = role.permissions.includes(permId)
          ? role.permissions.filter(p => p !== permId)
          : [...role.permissions, permId];
        return { ...role, permissions: newPerms };
      }
      return role;
    }));
    setSelectedRole(prev => prev ? {
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    } : null);
  };

  const toggleCategoryPermissions = (category: string) => {
    if (!selectedRole) return;
    const categoryPerms = permissionsByCategory[category]?.map(p => p.id) || [];
    const allSelected = categoryPerms.every(p => selectedRole.permissions.includes(p));

    setRoles(prev => prev.map(role => {
      if (role.id === selectedRole.id) {
        const newPerms = allSelected
          ? role.permissions.filter(p => !categoryPerms.includes(p))
          : [...new Set([...role.permissions, ...categoryPerms])];
        return { ...role, permissions: newPerms };
      }
      return role;
    }));
    setSelectedRole(prev => prev ? {
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(p => !categoryPerms.includes(p))
        : [...new Set([...prev.permissions, ...categoryPerms])]
    } : null);
  };

  const createRole = () => {
    if (!newRoleName.trim()) return;
    const newRole: Role = {
      id: newRoleName.toLowerCase().replace(/\s+/g, '-'),
      name: newRoleName,
      description: '',
      color: '#' + Math.floor(Math.random()*16777215).toString(16),
      permissions: [],
      userCount: 0,
      isSystem: false
    };
    setRoles([...roles, newRole]);
    setSelectedRole(newRole);
    setNewRoleName('');
    setIsCreatingRole(false);
  };

  const deleteRole = (roleId: string) => {
    setRoles(roles.filter(r => r.id !== roleId));
    if (selectedRole?.id === roleId) setSelectedRole(null);
  };

  const duplicateRole = (role: Role) => {
    const newRole: Role = {
      ...role,
      id: `${role.id}-copy`,
      name: `${role.name} (Copy)`,
      isSystem: false,
      userCount: 0
    };
    setRoles([...roles, newRole]);
    setSelectedRole(newRole);
  };

  const changeUserRole = (userId: string, roleId: string) => {
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, roleId } : u
    ));
    const user = users.find(u => u.id === userId);
    if (user) onUserUpdate?.({ ...user, roleId });
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryLabel = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="flex">
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'roles'
                ? 'text-purple-400 border-purple-400'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4 inline-block mr-2" />
            Roles & Permissions
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'text-purple-400 border-purple-400'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 inline-block mr-2" />
            User Assignments
          </button>
        </div>
      </div>

      {activeTab === 'roles' ? (
        <div className="flex-1 flex overflow-hidden">
          {/* Roles List */}
          <div className="w-64 border-r border-gray-800 flex flex-col">
            <div className="p-3 border-b border-gray-800">
              <button
                onClick={() => setIsCreatingRole(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Role
              </button>
            </div>

            {isCreatingRole && (
              <div className="p-3 border-b border-gray-800 bg-gray-800/50">
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Role name..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white mb-2"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={createRole}
                    className="flex-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => { setIsCreatingRole(false); setNewRoleName(''); }}
                    className="flex-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-auto">
              {roles.map(role => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full p-3 flex items-center gap-3 text-left hover:bg-gray-800/50 ${
                    selectedRole?.id === role.id ? 'bg-gray-800' : ''
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: role.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium truncate">{role.name}</span>
                      {role.isSystem && (
                        <Lock className="w-3 h-3 text-gray-500" />
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{role.userCount} users</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Permissions Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedRole ? (
              <>
                <div className="p-4 border-b border-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: selectedRole.color }}
                      />
                      <h3 className="text-lg font-semibold text-white">{selectedRole.name}</h3>
                      {selectedRole.isSystem && (
                        <span className="px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded">System Role</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => duplicateRole(selectedRole)}
                        className="p-2 hover:bg-gray-800 rounded"
                        title="Duplicate Role"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                      {!selectedRole.isSystem && (
                        <button
                          onClick={() => deleteRole(selectedRole.id)}
                          className="p-2 hover:bg-gray-800 rounded text-red-400"
                          title="Delete Role"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onSave?.(roles)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{selectedRole.description}</p>
                </div>

                <div className="flex-1 overflow-auto p-4">
                  <div className="space-y-2">
                    {Object.entries(permissionsByCategory).map(([category, perms]) => {
                      const allSelected = perms.every(p => selectedRole.permissions.includes(p.id));
                      const someSelected = perms.some(p => selectedRole.permissions.includes(p.id));

                      return (
                        <div key={category} className="bg-gray-800/50 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleCategory(category)}
                            className="w-full p-3 flex items-center gap-2 hover:bg-gray-800"
                          >
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleCategoryPermissions(category); }}
                              className={`w-5 h-5 rounded flex items-center justify-center ${
                                allSelected ? 'bg-purple-600' : someSelected ? 'bg-purple-600/50' : 'bg-gray-700'
                              }`}
                            >
                              {allSelected && <Check className="w-3 h-3 text-white" />}
                              {someSelected && !allSelected && <div className="w-2 h-0.5 bg-white" />}
                            </button>
                            {expandedCategories.includes(category) ? (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            )}
                            <span className="text-white font-medium">{getCategoryLabel(category)}</span>
                            <span className="ml-auto text-xs text-gray-500">
                              {perms.filter(p => selectedRole.permissions.includes(p.id)).length}/{perms.length}
                            </span>
                          </button>

                          <AnimatePresence>
                            {expandedCategories.includes(category) && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-3 pt-0 space-y-2">
                                  {perms.map(perm => (
                                    <label
                                      key={perm.id}
                                      className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={selectedRole.permissions.includes(perm.id)}
                                        onChange={() => togglePermission(perm.id)}
                                        className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-purple-600"
                                      />
                                      <div>
                                        <div className="text-sm text-white">{perm.name}</div>
                                        <div className="text-xs text-gray-500">{perm.description}</div>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a role to edit permissions</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Users Tab */
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            />
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Last Active</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredUsers.map(user => {
                  const role = roles.find(r => r.id === user.roleId);
                  return (
                    <tr key={user.id} className="hover:bg-gray-800/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white font-medium">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-white font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={user.roleId}
                          onChange={(e) => changeUserRole(user.id, e.target.value)}
                          className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white"
                          style={{ borderLeftColor: role?.color, borderLeftWidth: 3 }}
                        >
                          {roles.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {user.lastActive}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="p-1.5 hover:bg-gray-800 rounded">
                          <Settings className="w-4 h-4 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoleEditor;
