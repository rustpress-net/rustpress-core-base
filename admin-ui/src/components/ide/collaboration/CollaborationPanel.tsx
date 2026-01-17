/**
 * CollaborationPanel - Shows online users and their activity
 */

import React from 'react';
import { Users, Circle, File, Wifi, WifiOff } from 'lucide-react';
import { useCollaborationStore } from '../../../store/collaborationStore';
import { UserPresenceIndicator } from './UserPresenceIndicator';

interface CollaborationPanelProps {
  onClose?: () => void;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ onClose }) => {
  const { isConnected, onlineUsers } = useCollaborationStore();

  const users = Array.from(onlineUsers.values());

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-200">Collaborators</span>
        </div>
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-1 text-green-400">
              <Wifi className="w-3 h-3" />
              <span className="text-xs">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-400">
              <WifiOff className="w-3 h-3" />
              <span className="text-xs">Disconnected</span>
            </div>
          )}
        </div>
      </div>

      {/* Online Users List */}
      <div className="flex-1 overflow-y-auto">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <Users className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No collaborators online</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {users.map((user) => (
              <UserPresenceIndicator key={user.user_id} user={user} />
            ))}
          </div>
        )}
      </div>

      {/* Footer with count */}
      <div className="px-4 py-2 border-t border-gray-800">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Circle className="w-2 h-2 fill-green-500 text-green-500" />
          <span>{users.length} online</span>
        </div>
      </div>
    </div>
  );
};

export default CollaborationPanel;
