/**
 * RemoteCursor - Displays remote user cursors in Monaco editor
 * Uses Monaco decoration API
 */

import React, { useEffect, useRef } from 'react';
import type { editor } from 'monaco-editor';
import type { CursorPosition } from '../../../types/collaboration';

interface RemoteCursorProps {
  editor: editor.IStandaloneCodeEditor | null;
  cursors: Map<string, { position: CursorPosition; color: string; username: string }>;
}

// Store decoration IDs for cleanup
const decorationIds: Map<string, string[]> = new Map();

export const useRemoteCursors = (
  editor: editor.IStandaloneCodeEditor | null,
  cursors: Map<string, { position: CursorPosition; color: string; username: string }>
): void => {
  useEffect(() => {
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    // Clear all previous decorations
    decorationIds.forEach((ids, userId) => {
      editor.removeDecorations(ids);
    });
    decorationIds.clear();

    // Create new decorations for each cursor
    cursors.forEach((cursor, userId) => {
      const { position, color, username } = cursor;

      // Create CSS class for this user's cursor
      const cursorClassName = `remote-cursor-${userId.replace(/-/g, '')}`;
      const labelClassName = `remote-cursor-label-${userId.replace(/-/g, '')}`;

      // Inject CSS if not already present
      const styleId = `cursor-style-${userId}`;
      let styleEl = document.getElementById(styleId);
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.textContent = `
          .${cursorClassName} {
            background-color: ${color};
            width: 2px !important;
            margin-left: -1px;
          }
          .${cursorClassName}::after {
            content: '';
            position: absolute;
            top: 0;
            left: -3px;
            width: 8px;
            height: 8px;
            background-color: ${color};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
          }
          .${labelClassName} {
            position: relative;
          }
          .${labelClassName}::before {
            content: '${username}';
            position: absolute;
            top: -20px;
            left: 0;
            background-color: ${color};
            color: white;
            font-size: 10px;
            padding: 1px 4px;
            border-radius: 2px;
            white-space: nowrap;
            z-index: 100;
            pointer-events: none;
          }
        `;
        document.head.appendChild(styleEl);
      }

      // Create decorations
      const decorations: editor.IModelDeltaDecoration[] = [
        {
          range: {
            startLineNumber: position.line,
            startColumn: position.column,
            endLineNumber: position.line,
            endColumn: position.column,
          },
          options: {
            className: cursorClassName,
            beforeContentClassName: labelClassName,
            stickiness: 1, // NeverGrowsWhenTypingAtEdges
          },
        },
      ];

      const ids = editor.deltaDecorations([], decorations);
      decorationIds.set(userId, ids);
    });

    // Cleanup on unmount
    return () => {
      decorationIds.forEach((ids) => {
        editor.removeDecorations(ids);
      });
      decorationIds.clear();
    };
  }, [editor, cursors]);
};

// Component wrapper for class components if needed
export const RemoteCursors: React.FC<RemoteCursorProps> = ({ editor, cursors }) => {
  useRemoteCursors(editor, cursors);
  return null;
};

export default RemoteCursors;
