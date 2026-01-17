/**
 * UserPresenceIndicator - Shows a single user's presence status
 */

import React from 'react';
import { Circle, File, Clock, Coffee, Moon } from 'lucide-react';
import type { UserPresence, UserStatus } from '../../../types/collaboration';

interface UserPresenceIndicatorProps {
  user: UserPresence;
  compact?: boolean;
}

const statusConfig: Record<UserStatus, { color: string; icon: React.ElementType; label: string }> = {
  online: { color: 'text-green-500', icon: Circle, label: 'Online' },
  away: { color: 'text-yellow-500', icon: Clock, label: 'Away' },
  busy: { color: 'text-red-500', icon: Coffee, label: 'Busy' },
  offline: { color: 'text-gray-500', icon: Moon, label: 'Offline' },
};

export const UserPresenceIndicator: React.FC<UserPresenceIndicatorProps> = ({
  user,
  compact = false,
}) => {
  const config = statusConfig[user.status] || statusConfig.offline;
  const StatusIcon = config.icon;

  // Get initials for avatar
  const initials = user.display_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (compact) {
    return (
      <div
        className="relative flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-medium"
        style={{ backgroundColor: user.color }}
        title={`${user.display_name} (${config.label})`}
      >
        {initials}
        <StatusIcon
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${config.color} fill-current`}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-800/50 transition-colors">
      {/* Avatar */}
      <div className="relative">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.display_name}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: user.color }}
          >
            {initials}
          </div>
        )}
        <StatusIcon
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${config.color} fill-current`}
        />
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-200 truncate">
          {user.display_name}
        </div>
        {user.current_file && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <File className="w-3 h-3" />
            <span className="truncate">{user.current_file.split('/').pop()}</span>
          </div>
        )}
      </div>

      {/* Color indicator */}
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: user.color }}
        title="Cursor color"
      />
    </div>
  );
};

export default UserPresenceIndicator;
