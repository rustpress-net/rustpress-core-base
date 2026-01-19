/**
 * RemoteCursor - Displays remote user cursors in Monaco editor
 * Uses Monaco decoration API
 */

import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import type { CursorPosition } from '../../../types/collaboration';

// Monaco types
type MonacoEditor = typeof monaco.editor;
type Monaco = typeof monaco;

// Type for cursor data that can be either from Map or Array
interface CursorData {
  userId: string;
  position: CursorPosition;
  color: string;
  username: string;
}

interface RemoteCursorProps {
  editor: monaco.editor.IStandaloneCodeEditor | null;
  cursors: Map<string, { position: CursorPosition; color: string; username: string }> | CursorData[];
}

// Store decoration IDs for cleanup per path
const decorationIdsPerPath: Map<string, Map<string, string[]>> = new Map();

export const useRemoteCursors = (
  editor: monaco.editor.IStandaloneCodeEditor | null,
  monacoInstance: typeof monaco | null,
  path: string,
  cursors: CursorData[] | Map<string, { position: CursorPosition; color: string; username: string }> | undefined
): void => {
  useEffect(() => {
    if (!editor || !monacoInstance) return;

    const model = editor.getModel();
    if (!model) return;

    // Get or create decoration map for this path
    if (!decorationIdsPerPath.has(path)) {
      decorationIdsPerPath.set(path, new Map());
    }
    const decorationIds = decorationIdsPerPath.get(path)!;

    // Clear all previous decorations
    decorationIds.forEach((ids, userId) => {
      editor.removeDecorations(ids);
    });
    decorationIds.clear();

    // Handle empty or undefined cursors
    if (!cursors) return;

    // Normalize cursors to array format
    const cursorArray: CursorData[] = Array.isArray(cursors)
      ? cursors
      : Array.from(cursors.entries()).map(([userId, data]) => ({
          userId,
          ...data,
        }));

    // Create new decorations for each cursor
    cursorArray.forEach((cursor) => {
      const { userId, position, color, username } = cursor;

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
      const decorations: monaco.editor.IModelDeltaDecoration[] = [
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
      if (decorationIdsPerPath.has(path)) {
        const pathDecorationIds = decorationIdsPerPath.get(path)!;
        pathDecorationIds.forEach((ids) => {
          try {
            editor.removeDecorations(ids);
          } catch (e) {
            // Editor might be disposed
          }
        });
        pathDecorationIds.clear();
      }
    };
  }, [editor, monacoInstance, path, cursors]);
};

// Component wrapper for class components if needed
export const RemoteCursors: React.FC<RemoteCursorProps & { monaco?: typeof monaco; path?: string }> = ({ editor, cursors, monaco: monacoParam, path = '' }) => {
  useRemoteCursors(editor, monacoParam || null, path, cursors as CursorData[]);
  return null;
};

export default RemoteCursors;
