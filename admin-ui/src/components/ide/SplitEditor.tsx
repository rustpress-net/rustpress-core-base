/**
 * SplitEditor - Split view for side-by-side editing
 */

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Columns, Rows, X, Maximize2 } from 'lucide-react';
import { MonacoWrapper } from './MonacoWrapper';
import type { OpenFile } from './IDE';

interface SplitEditorProps {
  files: OpenFile[];
  leftFile: OpenFile;
  rightFile: OpenFile | null;
  onChangeLeft: (content: string) => void;
  onChangeRight: (content: string) => void;
  onCursorChange: (line: number, column: number) => void;
  onCloseSplit: () => void;
  splitDirection: 'horizontal' | 'vertical';
  onChangeSplitDirection: (direction: 'horizontal' | 'vertical') => void;
  editorOptions?: Record<string, unknown>;
}

export const SplitEditor: React.FC<SplitEditorProps> = ({
  files,
  leftFile,
  rightFile,
  onChangeLeft,
  onChangeRight,
  onCursorChange,
  onCloseSplit,
  splitDirection,
  onChangeSplitDirection,
  editorOptions
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [splitRatio, setSplitRatio] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let ratio: number;

    if (splitDirection === 'vertical') {
      ratio = (e.clientX - rect.left) / rect.width;
    } else {
      ratio = (e.clientY - rect.top) / rect.height;
    }

    setSplitRatio(Math.max(0.2, Math.min(0.8, ratio)));
  }, [isDragging, splitDirection]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const leftStyle = splitDirection === 'vertical'
    ? { width: `${splitRatio * 100}%` }
    : { height: `${splitRatio * 100}%` };

  const rightStyle = splitDirection === 'vertical'
    ? { width: `${(1 - splitRatio) * 100}%` }
    : { height: `${(1 - splitRatio) * 100}%` };

  return (
    <div
      ref={containerRef}
      className={`flex-1 flex ${splitDirection === 'vertical' ? 'flex-row' : 'flex-col'} relative`}
    >
      {/* Left/Top Pane */}
      <div style={leftStyle} className="relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-8 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-2 z-10">
          <span className="text-xs text-gray-400 truncate">{leftFile.name}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onChangeSplitDirection(splitDirection === 'vertical' ? 'horizontal' : 'vertical')}
              className="p-1 hover:bg-gray-700 rounded"
              title="Toggle split direction"
            >
              {splitDirection === 'vertical' ? (
                <Rows className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <Columns className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
        <div className="h-full pt-8">
          <MonacoWrapper
            path={leftFile.path}
            content={leftFile.content}
            language={leftFile.language}
            onChange={onChangeLeft}
            onCursorChange={onCursorChange}
            editorOptions={editorOptions as any}
          />
        </div>
      </div>

      {/* Resizer */}
      <div
        onMouseDown={handleMouseDown}
        className={`${
          splitDirection === 'vertical'
            ? 'w-1 cursor-col-resize hover:bg-blue-500'
            : 'h-1 cursor-row-resize hover:bg-blue-500'
        } bg-gray-700 transition-colors ${isDragging ? 'bg-blue-500' : ''}`}
      />

      {/* Right/Bottom Pane */}
      {rightFile && (
        <div style={rightStyle} className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-8 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-2 z-10">
            <span className="text-xs text-gray-400 truncate">{rightFile.name}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={onCloseSplit}
                className="p-1 hover:bg-gray-700 rounded"
                title="Close split"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </div>
          <div className="h-full pt-8">
            <MonacoWrapper
              path={rightFile.path}
              content={rightFile.content}
              language={rightFile.language}
              onChange={onChangeRight}
              onCursorChange={onCursorChange}
              editorOptions={editorOptions as any}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SplitEditor;
