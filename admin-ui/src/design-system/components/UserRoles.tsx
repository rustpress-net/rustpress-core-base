import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES
// ============================================================================

export type PermissionCategory = 'content' | 'media' | 'users' | 'settings' | 'plugins' | 'themes' | 'system';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: PermissionCategory;
  dependencies?: string[];
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleFormData {
  name: string;
  slug: string;
  description: string;
  color: string;
  permissions: string[];
  copyFrom?: string;
}

export interface UserRolesConfig {
  allowSystemRoleEdit: boolean;
  maxRoles: number;
  defaultRole: string;
}

// ============================================================================
// DEFAULT PERMISSIONS
// ============================================================================

const defaultPermissions: Permission[] = [
  // Content
  { id: 'content.create', name: 'Create Content', description: 'Create new posts, pages, and other content', category: 'content' },
  { id: 'content.edit_own', name: 'Edit Own Content', description: 'Edit content created by the user', category: 'content' },
  { id: 'content.edit_others', name: 'Edit Others\' Content', description: 'Edit content created by other users', category: 'content', dependencies: ['content.edit_own'] },
  { id: 'content.delete_own', name: 'Delete Own Content', description: 'Delete content created by the user', category: 'content' },
  { id: 'content.delete_others', name: 'Delete Others\' Content', description: 'Delete content created by other users', category: 'content', dependencies: ['content.delete_own'] },
  { id: 'content.publish', name: 'Publish Content', description: 'Publish content without approval', category: 'content' },
  { id: 'content.manage_categories', name: 'Manage Categories', description: 'Create, edit, and delete categories', category: 'content' },
  { id: 'content.manage_tags', name: 'Manage Tags', description: 'Create, edit, and delete tags', category: 'content' },
  // Media
  { id: 'media.upload', name: 'Upload Media', description: 'Upload images, videos, and files', category: 'media' },
  { id: 'media.edit', name: 'Edit Media', description: 'Edit media metadata and files', category: 'media' },
  { id: 'media.delete', name: 'Delete Media', description: 'Delete media files', category: 'media' },
  { id: 'media.manage_library', name: 'Manage Library', description: 'Organize and manage the media library', category: 'media' },
  // Users
  { id: 'users.list', name: 'List Users', description: 'View user list', category: 'users' },
  { id: 'users.create', name: 'Create Users', description: 'Create new user accounts', category: 'users' },
  { id: 'users.edit', name: 'Edit Users', description: 'Edit user profiles and settings', category: 'users' },
  { id: 'users.delete', name: 'Delete Users', description: 'Delete user accounts', category: 'users' },
  { id: 'users.manage_roles', name: 'Manage Roles', description: 'Create, edit, and assign roles', category: 'users' },
  // Settings
  { id: 'settings.view', name: 'View Settings', description: 'View site settings', category: 'settings' },
  { id: 'settings.edit', name: 'Edit Settings', description: 'Modify site settings', category: 'settings', dependencies: ['settings.view'] },
  // Plugins
  { id: 'plugins.view', name: 'View Plugins', description: 'View installed plugins', category: 'plugins' },
  { id: 'plugins.install', name: 'Install Plugins', description: 'Install new plugins', category: 'plugins', dependencies: ['plugins.view'] },
  { id: 'plugins.activate', name: 'Activate Plugins', description: 'Activate and deactivate plugins', category: 'plugins', dependencies: ['plugins.view'] },
  { id: 'plugins.delete', name: 'Delete Plugins', description: 'Remove plugins', category: 'plugins', dependencies: ['plugins.view'] },
  // Themes
  { id: 'themes.view', name: 'View Themes', description: 'View installed themes', category: 'themes' },
  { id: 'themes.install', name: 'Install Themes', description: 'Install new themes', category: 'themes', dependencies: ['themes.view'] },
  { id: 'themes.activate', name: 'Activate Themes', description: 'Activate themes', category: 'themes', dependencies: ['themes.view'] },
  { id: 'themes.customize', name: 'Customize Themes', description: 'Customize theme settings', category: 'themes', dependencies: ['themes.view'] },
  // System
  { id: 'system.view_logs', name: 'View Logs', description: 'View system logs', category: 'system' },
  { id: 'system.manage_backups', name: 'Manage Backups', description: 'Create and restore backups', category: 'system' },
  { id: 'system.manage_cache', name: 'Manage Cache', description: 'Clear and manage cache', category: 'system' },
  { id: 'system.update', name: 'System Updates', description: 'Perform system updates', category: 'system' },
];

// ============================================================================
// CONTEXT
// ============================================================================

interface UserRolesContextValue {
  roles: Role[];
  permissions: Permission[];
  selectedRole: Role | null;
  isEditing: boolean;
  searchQuery: string;
  setSelectedRole: (role: Role | null) => void;
  setIsEditing: (editing: boolean) => void;
  setSearchQuery: (query: string) => void;
  createRole: (data: RoleFormData) => void;
  updateRole: (id: string, data: Partial<RoleFormData>) => void;
  deleteRole: (id: string) => void;
  duplicateRole: (id: string, newName: string) => void;
  togglePermission: (roleId: string, permissionId: string) => void;
  getPermissionsByCategory: (category: PermissionCategory) => Permission[];
  hasPermission: (roleId: string, permissionId: string) => boolean;
  config: UserRolesConfig;
}

const UserRolesContext = createContext<UserRolesContextValue | null>(null);

export const useUserRoles = () => {
  const context = useContext(UserRolesContext);
  if (!context) {
    throw new Error('useUserRoles must be used within a UserRolesProvider');
  }
  return context;
};

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: '1.5rem',
    minHeight: '600px',
  },
  sidebar: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  sidebarHeader: {
    padding: '1rem',
    borderBottom: '1px solid #e2e8f0',
  },
  searchInput: {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.875rem',
    outline: 'none',
    marginBottom: '0.75rem',
  },
  addButton: {
    width: '100%',
    padding: '0.625rem',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  roleList: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '0.5rem',
  },
  roleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '0.25rem',
    transition: 'all 0.15s',
  },
  roleItemActive: {
    backgroundColor: '#eff6ff',
  },
  roleColor: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  roleInfo: {
    flex: 1,
    minWidth: 0,
  },
  roleName: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#1e293b',
    marginBottom: '0.125rem',
  },
  roleUserCount: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  systemBadge: {
    padding: '0.125rem 0.5rem',
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    borderRadius: '4px',
    fontSize: '0.625rem',
    fontWeight: 500,
    textTransform: 'uppercase' as const,
  },
  mainContent: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  contentHeader: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contentTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  headerActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  iconButton: {
    padding: '0.5rem',
    backgroundColor: 'transparent',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentBody: {
    padding: '1.5rem',
    overflowY: 'auto' as const,
    maxHeight: 'calc(600px - 70px)',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1e293b',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  permissionCount: {
    fontSize: '0.75rem',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
  },
  permissionGrid: {
    display: 'grid',
    gap: '0.5rem',
  },
  permissionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid transparent',
    transition: 'all 0.15s',
  },
  permissionItemActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    border: '2px solid #cbd5e1',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.15s',
  },
  checkboxChecked: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  permissionInfo: {
    flex: 1,
    minWidth: 0,
  },
  permissionName: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#1e293b',
    marginBottom: '0.125rem',
  },
  permissionDesc: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  dependencyBadge: {
    padding: '0.125rem 0.5rem',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '4px',
    fontSize: '0.625rem',
    fontWeight: 500,
  },
  formContainer: {
    padding: '1.5rem',
  },
  formGroup: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '0.5rem',
  },
  input: {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.875rem',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '0.625rem 0.875rem',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.875rem',
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: '80px',
    fontFamily: 'inherit',
  },
  colorPicker: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const,
  },
  colorOption: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    cursor: 'pointer',
    border: '2px solid transparent',
    transition: 'all 0.15s',
  },
  colorOptionSelected: {
    borderColor: '#1e293b',
    transform: 'scale(1.1)',
  },
  formActions: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
    paddingTop: '1rem',
    borderTop: '1px solid #e2e8f0',
  },
  cancelButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: '#ffffff',
    color: '#374151',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  saveButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '3rem',
    color: '#64748b',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  selectAllButton: {
    padding: '0.25rem 0.5rem',
    backgroundColor: 'transparent',
    border: '1px solid #e2e8f0',
    borderRadius: '4px',
    fontSize: '0.75rem',
    color: '#64748b',
    cursor: 'pointer',
  },
  roleStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statCard: {
    padding: '1rem',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    textAlign: 'center' as const,
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
};

const roleColors = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
];

// ============================================================================
// PROVIDER
// ============================================================================

interface UserRolesProviderProps {
  children: React.ReactNode;
  initialRoles?: Role[];
  permissions?: Permission[];
  config?: Partial<UserRolesConfig>;
  onRoleCreate?: (role: Role) => void;
  onRoleUpdate?: (role: Role) => void;
  onRoleDelete?: (id: string) => void;
}

export const UserRolesProvider: React.FC<UserRolesProviderProps> = ({
  children,
  initialRoles = [],
  permissions = defaultPermissions,
  config: configOverrides = {},
  onRoleCreate,
  onRoleUpdate,
  onRoleDelete,
}) => {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [selectedRole, setSelectedRole] = useState<Role | null>(initialRoles[0] || null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const config: UserRolesConfig = {
    allowSystemRoleEdit: false,
    maxRoles: 20,
    defaultRole: 'subscriber',
    ...configOverrides,
  };

  const getPermissionsByCategory = useCallback((category: PermissionCategory) => {
    return permissions.filter(p => p.category === category);
  }, [permissions]);

  const hasPermission = useCallback((roleId: string, permissionId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.permissions.includes(permissionId) || false;
  }, [roles]);

  const createRole = useCallback((data: RoleFormData) => {
    const newRole: Role = {
      id: `role-${Date.now()}`,
      name: data.name,
      slug: data.slug,
      description: data.description,
      color: data.color,
      permissions: data.copyFrom
        ? roles.find(r => r.id === data.copyFrom)?.permissions || data.permissions
        : data.permissions,
      userCount: 0,
      isSystem: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setRoles(prev => [...prev, newRole]);
    setSelectedRole(newRole);
    setIsEditing(false);
    onRoleCreate?.(newRole);
  }, [roles, onRoleCreate]);

  const updateRole = useCallback((id: string, data: Partial<RoleFormData>) => {
    setRoles(prev => prev.map(role => {
      if (role.id === id) {
        const updated = {
          ...role,
          ...data,
          updatedAt: new Date(),
        };
        onRoleUpdate?.(updated);
        if (selectedRole?.id === id) {
          setSelectedRole(updated);
        }
        return updated;
      }
      return role;
    }));
  }, [selectedRole, onRoleUpdate]);

  const deleteRole = useCallback((id: string) => {
    const role = roles.find(r => r.id === id);
    if (role?.isSystem && !config.allowSystemRoleEdit) return;

    setRoles(prev => prev.filter(r => r.id !== id));
    if (selectedRole?.id === id) {
      setSelectedRole(roles.find(r => r.id !== id) || null);
    }
    onRoleDelete?.(id);
  }, [roles, selectedRole, config.allowSystemRoleEdit, onRoleDelete]);

  const duplicateRole = useCallback((id: string, newName: string) => {
    const sourceRole = roles.find(r => r.id === id);
    if (!sourceRole) return;

    createRole({
      name: newName,
      slug: newName.toLowerCase().replace(/\s+/g, '-'),
      description: `Copy of ${sourceRole.name}`,
      color: sourceRole.color,
      permissions: [...sourceRole.permissions],
    });
  }, [roles, createRole]);

  const togglePermission = useCallback((roleId: string, permissionId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role || (role.isSystem && !config.allowSystemRoleEdit)) return;

    const permission = permissions.find(p => p.id === permissionId);
    const hasIt = role.permissions.includes(permissionId);

    let newPermissions: string[];
    if (hasIt) {
      // Remove permission and any that depend on it
      const dependentPermissions = permissions
        .filter(p => p.dependencies?.includes(permissionId))
        .map(p => p.id);
      newPermissions = role.permissions.filter(
        p => p !== permissionId && !dependentPermissions.includes(p)
      );
    } else {
      // Add permission and its dependencies
      newPermissions = [...role.permissions, permissionId];
      if (permission?.dependencies) {
        permission.dependencies.forEach(dep => {
          if (!newPermissions.includes(dep)) {
            newPermissions.push(dep);
          }
        });
      }
    }

    updateRole(roleId, { permissions: newPermissions });
  }, [roles, permissions, config.allowSystemRoleEdit, updateRole]);

  const value: UserRolesContextValue = {
    roles,
    permissions,
    selectedRole,
    isEditing,
    searchQuery,
    setSelectedRole,
    setIsEditing,
    setSearchQuery,
    createRole,
    updateRole,
    deleteRole,
    duplicateRole,
    togglePermission,
    getPermissionsByCategory,
    hasPermission,
    config,
  };

  return (
    <UserRolesContext.Provider value={value}>
      {children}
    </UserRolesContext.Provider>
  );
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

export const RoleListItem: React.FC<{
  role: Role;
  isSelected: boolean;
  onClick: () => void;
}> = ({ role, isSelected, onClick }) => (
  <motion.div
    style={{
      ...styles.roleItem,
      ...(isSelected ? styles.roleItemActive : {}),
    }}
    onClick={onClick}
    whileHover={{ backgroundColor: '#f1f5f9' }}
    whileTap={{ scale: 0.98 }}
  >
    <div style={{ ...styles.roleColor, backgroundColor: role.color }} />
    <div style={styles.roleInfo}>
      <div style={styles.roleName}>{role.name}</div>
      <div style={styles.roleUserCount}>{role.userCount} users</div>
    </div>
    {role.isSystem && <span style={styles.systemBadge}>System</span>}
  </motion.div>
);

export const RoleList: React.FC = () => {
  const { roles, selectedRole, setSelectedRole, setIsEditing, searchQuery, setSearchQuery } = useUserRoles();

  const filteredRoles = useMemo(() => {
    if (!searchQuery) return roles;
    const query = searchQuery.toLowerCase();
    return roles.filter(r =>
      r.name.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query)
    );
  }, [roles, searchQuery]);

  return (
    <div style={styles.sidebar}>
      <div style={styles.sidebarHeader}>
        <input
          type="text"
          placeholder="Search roles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <button
          style={styles.addButton}
          onClick={() => {
            setSelectedRole(null);
            setIsEditing(true);
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Role
        </button>
      </div>
      <div style={styles.roleList}>
        {filteredRoles.map(role => (
          <RoleListItem
            key={role.id}
            role={role}
            isSelected={selectedRole?.id === role.id}
            onClick={() => {
              setSelectedRole(role);
              setIsEditing(false);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const PermissionCheckbox: React.FC<{
  permission: Permission;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}> = ({ permission, checked, disabled, onChange }) => (
  <motion.div
    style={{
      ...styles.permissionItem,
      ...(checked ? styles.permissionItemActive : {}),
      opacity: disabled ? 0.5 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
    }}
    onClick={disabled ? undefined : onChange}
    whileHover={disabled ? {} : { backgroundColor: checked ? '#dbeafe' : '#f1f5f9' }}
  >
    <div
      style={{
        ...styles.checkbox,
        ...(checked ? styles.checkboxChecked : {}),
      }}
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
    <div style={styles.permissionInfo}>
      <div style={styles.permissionName}>{permission.name}</div>
      <div style={styles.permissionDesc}>{permission.description}</div>
    </div>
    {permission.dependencies && permission.dependencies.length > 0 && (
      <span style={styles.dependencyBadge}>
        Requires: {permission.dependencies.length}
      </span>
    )}
  </motion.div>
);

export const PermissionCategory: React.FC<{
  category: PermissionCategory;
  roleId: string;
  disabled?: boolean;
}> = ({ category, roleId, disabled }) => {
  const { getPermissionsByCategory, hasPermission, togglePermission } = useUserRoles();
  const permissions = getPermissionsByCategory(category);
  const checkedCount = permissions.filter(p => hasPermission(roleId, p.id)).length;

  const categoryLabels: Record<PermissionCategory, string> = {
    content: 'Content Management',
    media: 'Media Library',
    users: 'User Management',
    settings: 'Site Settings',
    plugins: 'Plugin Management',
    themes: 'Theme Management',
    system: 'System Administration',
  };

  const handleSelectAll = () => {
    if (disabled) return;
    const allChecked = checkedCount === permissions.length;
    permissions.forEach(p => {
      const isChecked = hasPermission(roleId, p.id);
      if (allChecked ? isChecked : !isChecked) {
        togglePermission(roleId, p.id);
      }
    });
  };

  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h4 style={styles.sectionTitle}>{categoryLabels[category]}</h4>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={styles.permissionCount}>
            {checkedCount}/{permissions.length}
          </span>
          {!disabled && (
            <button style={styles.selectAllButton} onClick={handleSelectAll}>
              {checkedCount === permissions.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>
      </div>
      <div style={styles.permissionGrid}>
        {permissions.map(permission => (
          <PermissionCheckbox
            key={permission.id}
            permission={permission}
            checked={hasPermission(roleId, permission.id)}
            disabled={disabled}
            onChange={() => togglePermission(roleId, permission.id)}
          />
        ))}
      </div>
    </div>
  );
};

export const RoleForm: React.FC<{
  initialData?: Partial<RoleFormData>;
  onSubmit: (data: RoleFormData) => void;
  onCancel: () => void;
}> = ({ initialData, onSubmit, onCancel }) => {
  const { roles } = useUserRoles();
  const [formData, setFormData] = useState<RoleFormData>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    color: initialData?.color || roleColors[0],
    permissions: initialData?.permissions || [],
    copyFrom: undefined,
  });

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
  };

  return (
    <form style={styles.formContainer} onSubmit={handleSubmit}>
      <div style={styles.formGroup}>
        <label style={styles.label}>Role Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          style={styles.input}
          placeholder="e.g., Content Editor"
          required
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Slug</label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
          style={styles.input}
          placeholder="content-editor"
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          style={styles.textarea}
          placeholder="Describe this role's purpose..."
        />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Color</label>
        <div style={styles.colorPicker}>
          {roleColors.map(color => (
            <div
              key={color}
              style={{
                ...styles.colorOption,
                backgroundColor: color,
                ...(formData.color === color ? styles.colorOptionSelected : {}),
              }}
              onClick={() => setFormData(prev => ({ ...prev, color }))}
            />
          ))}
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>Copy Permissions From</label>
        <select
          value={formData.copyFrom || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, copyFrom: e.target.value || undefined }))}
          style={styles.input}
        >
          <option value="">-- Start Fresh --</option>
          {roles.map(role => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>
      </div>

      <div style={styles.formActions}>
        <button type="button" style={styles.cancelButton} onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" style={styles.saveButton}>
          Create Role
        </button>
      </div>
    </form>
  );
};

export const RoleDetails: React.FC = () => {
  const { selectedRole, isEditing, setIsEditing, deleteRole, duplicateRole, config } = useUserRoles();
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateName, setDuplicateName] = useState('');

  if (!selectedRole) {
    return (
      <div style={styles.mainContent}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>👤</div>
          <p>Select a role to view and edit permissions</p>
        </div>
      </div>
    );
  }

  const isEditable = !selectedRole.isSystem || config.allowSystemRoleEdit;
  const categories: PermissionCategory[] = ['content', 'media', 'users', 'settings', 'plugins', 'themes', 'system'];

  return (
    <div style={styles.mainContent}>
      <div style={styles.contentHeader}>
        <div style={styles.contentTitle}>
          <div style={{ ...styles.roleColor, width: '12px', height: '12px', backgroundColor: selectedRole.color }} />
          {selectedRole.name}
          {selectedRole.isSystem && <span style={styles.systemBadge}>System Role</span>}
        </div>
        <div style={styles.headerActions}>
          <button
            style={styles.iconButton}
            onClick={() => {
              setDuplicateName(`${selectedRole.name} Copy`);
              setShowDuplicateDialog(true);
            }}
            title="Duplicate"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          </button>
          {isEditable && (
            <button
              style={{ ...styles.iconButton, color: '#ef4444' }}
              onClick={() => {
                if (window.confirm(`Delete role "${selectedRole.name}"?`)) {
                  deleteRole(selectedRole.id);
                }
              }}
              title="Delete"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div style={styles.contentBody}>
        <div style={styles.roleStats}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{selectedRole.userCount}</div>
            <div style={styles.statLabel}>Users</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{selectedRole.permissions.length}</div>
            <div style={styles.statLabel}>Permissions</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>
              {categories.length}
            </div>
            <div style={styles.statLabel}>Categories</div>
          </div>
        </div>

        {selectedRole.description && (
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            {selectedRole.description}
          </p>
        )}

        {categories.map(category => (
          <PermissionCategory
            key={category}
            category={category}
            roleId={selectedRole.id}
            disabled={!isEditable}
          />
        ))}
      </div>

      {/* Duplicate Dialog */}
      <AnimatePresence>
        {showDuplicateDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowDuplicateDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '1.5rem',
                width: '400px',
                maxWidth: '90%',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
                Duplicate Role
              </h3>
              <input
                type="text"
                value={duplicateName}
                onChange={(e) => setDuplicateName(e.target.value)}
                style={{ ...styles.input, marginBottom: '1rem' }}
                placeholder="New role name"
                autoFocus
              />
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  style={styles.cancelButton}
                  onClick={() => setShowDuplicateDialog(false)}
                >
                  Cancel
                </button>
                <button
                  style={styles.saveButton}
                  onClick={() => {
                    if (duplicateName.trim()) {
                      duplicateRole(selectedRole.id, duplicateName);
                      setShowDuplicateDialog(false);
                    }
                  }}
                >
                  Duplicate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const UserRoles: React.FC = () => {
  const { isEditing, setIsEditing, createRole, selectedRole } = useUserRoles();

  return (
    <div style={styles.container}>
      <RoleList />
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={styles.mainContent}
          >
            <div style={styles.contentHeader}>
              <div style={styles.contentTitle}>
                {selectedRole ? 'Edit Role' : 'Create New Role'}
              </div>
            </div>
            <RoleForm
              initialData={selectedRole ? {
                name: selectedRole.name,
                slug: selectedRole.slug,
                description: selectedRole.description,
                color: selectedRole.color,
                permissions: selectedRole.permissions,
              } : undefined}
              onSubmit={createRole}
              onCancel={() => setIsEditing(false)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <RoleDetails />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserRoles;
