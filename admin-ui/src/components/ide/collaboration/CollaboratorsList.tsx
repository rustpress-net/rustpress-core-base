/**
 * CollaboratorsList - Shows collaborators for the current file
 * Displayed in the editor header/tab area
 */

import React from 'react';
import { useCollaborationStore } from '../../../store/collaborationStore';
import type { FileCollaborator } from '../../../types/collaboration';

interface CollaboratorsListProps {
  filePath: string;
  maxVisible?: number;
}

export const CollaboratorsList: React.FC<CollaboratorsListProps> = ({
  filePath,
  maxVisible = 3,
}) => {
  const { fileCollaborators, userId } = useCollaborationStore();

  const collaborators = (fileCollaborators.get(filePath) || []).filter(
    (c) => c.user_id !== userId
  );

  if (collaborators.length === 0) {
    return null;
  }

  const visible = collaborators.slice(0, maxVisible);
  const overflow = collaborators.length - maxVisible;

  return (
    <div className="flex items-center -space-x-1.5">
      {visible.map((collaborator) => (
        <CollaboratorAvatar key={collaborator.user_id} collaborator={collaborator} />
      ))}
      {overflow > 0 && (
        <div
          className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-700 text-white text-xs font-medium border-2 border-gray-900"
          title={`+${overflow} more`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
};

interface CollaboratorAvatarProps {
  collaborator: FileCollaborator;
}

const CollaboratorAvatar: React.FC<CollaboratorAvatarProps> = ({ collaborator }) => {
  const initials = (collaborator.display_name || collaborator.username)
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-medium border-2 border-gray-900"
      style={{ backgroundColor: collaborator.color }}
      title={`${collaborator.display_name || collaborator.username} is editing`}
    >
      {initials}
    </div>
  );
};

export default CollaboratorsList;
