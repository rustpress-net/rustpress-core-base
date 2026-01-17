/**
 * TypingIndicator - Shows who is currently typing
 */

import React from 'react';
import type { TypingUser } from '../../../types/chat';

interface TypingIndicatorProps {
  users: TypingUser[];
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users }) => {
  if (users.length === 0) {
    return null;
  }

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].display_name || users[0].username} is typing`;
    } else if (users.length === 2) {
      const names = users.map((u) => u.display_name || u.username);
      return `${names[0]} and ${names[1]} are typing`;
    } else if (users.length === 3) {
      const names = users.map((u) => u.display_name || u.username);
      return `${names[0]}, ${names[1]}, and ${names[2]} are typing`;
    } else {
      return `${users.length} people are typing`;
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-gray-400 text-sm">
      {/* Animated dots */}
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{getTypingText()}</span>
    </div>
  );
};

export default TypingIndicator;
