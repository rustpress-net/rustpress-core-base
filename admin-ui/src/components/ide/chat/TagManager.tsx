/**
 * TagManager - Manage conversation tags
 */

import React, { useState } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { useChatStore } from '../../../store/chatStore';
import type { ConversationTag } from '../../../types/chat';

interface TagManagerProps {
  conversationId: string;
  tags: ConversationTag[];
}

// Predefined tag colors
const TAG_COLORS = [
  '#EF4444', // red
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#14B8A6', // teal
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
];

export const TagManager: React.FC<TagManagerProps> = ({
  conversationId,
  tags,
}) => {
  const { addTag, removeTag } = useChatStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);

  const handleAddTag = async () => {
    const trimmedName = newTagName.trim();
    if (!trimmedName) return;

    try {
      await addTag(conversationId, trimmedName, selectedColor);
      setNewTagName('');
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to add tag:', error);
    }
  };

  const handleRemoveTag = async (tag: string) => {
    try {
      await removeTag(conversationId, tag);
    } catch (error) {
      console.error('Failed to remove tag:', error);
    }
  };

  return (
    <div className="space-y-2">
      {/* Existing tags */}
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: tag.color || '#6B7280' }}
          >
            {tag.tag}
            <button
              onClick={() => handleRemoveTag(tag.tag)}
              className="p-0.5 hover:bg-black/20 rounded-full transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* Add tag button */}
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-gray-400 bg-gray-800 hover:bg-gray-700 border border-dashed border-gray-600 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add tag
          </button>
        )}
      </div>

      {/* Add tag form */}
      {isAdding && (
        <div className="p-3 bg-gray-800 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              className="flex-1 bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>

          {/* Color picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Color:</span>
            <div className="flex gap-1">
              {TAG_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    selectedColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsAdding(false);
                setNewTagName('');
              }}
              className="px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddTag}
              disabled={!newTagName.trim()}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded text-sm font-medium text-white transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManager;
