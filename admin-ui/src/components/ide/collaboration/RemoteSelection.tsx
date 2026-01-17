/**
 * RemoteSelection - Displays remote user selections in Monaco editor
 */

import { useEffect } from 'react';
import type { editor } from 'monaco-editor';
import type { Selection } from '../../../types/collaboration';

interface UseRemoteSelectionsParams {
  editor: editor.IStandaloneCodeEditor | null;
  selections: Map<string, { selection: Selection | null; color: string; username: string }>;
}

// Store decoration IDs for cleanup
const selectionDecorationIds: Map<string, string[]> = new Map();

export const useRemoteSelections = (
  editor: editor.IStandaloneCodeEditor | null,
  selections: Map<string, { selection: Selection | null; color: string; username: string }>
): void => {
  useEffect(() => {
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    // Clear all previous selection decorations
    selectionDecorationIds.forEach((ids) => {
      editor.removeDecorations(ids);
    });
    selectionDecorationIds.clear();

    // Create new decorations for each selection
    selections.forEach((data, userId) => {
      const { selection, color, username } = data;

      if (!selection) return;

      // Create CSS class for this user's selection
      const selectionClassName = `remote-selection-${userId.replace(/-/g, '')}`;

      // Inject CSS if not already present
      const styleId = `selection-style-${userId}`;
      let styleEl = document.getElementById(styleId);
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        // Convert hex to rgba with opacity
        const hexToRgba = (hex: string, alpha: number) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };
        styleEl.textContent = `
          .${selectionClassName} {
            background-color: ${hexToRgba(color, 0.3)};
            border-left: 2px solid ${color};
          }
        `;
        document.head.appendChild(styleEl);
      }

      // Create decoration
      const decorations: editor.IModelDeltaDecoration[] = [
        {
          range: {
            startLineNumber: selection.start_line,
            startColumn: selection.start_column,
            endLineNumber: selection.end_line,
            endColumn: selection.end_column,
          },
          options: {
            className: selectionClassName,
            stickiness: 1,
            hoverMessage: { value: `Selected by ${username}` },
          },
        },
      ];

      const ids = editor.deltaDecorations([], decorations);
      selectionDecorationIds.set(userId, ids);
    });

    // Cleanup on unmount
    return () => {
      selectionDecorationIds.forEach((ids) => {
        editor.removeDecorations(ids);
      });
      selectionDecorationIds.clear();
    };
  }, [editor, selections]);
};

export default useRemoteSelections;
