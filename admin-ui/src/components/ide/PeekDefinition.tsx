/**
 * PeekDefinition - Inline definition preview without leaving current file
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Maximize2, ExternalLink, ChevronLeft, ChevronRight,
  FileCode, Copy, Check, ArrowRight
} from 'lucide-react';

export interface Definition {
  id: string;
  name: string;
  kind: 'function' | 'class' | 'variable' | 'type' | 'interface' | 'method' | 'property';
  filePath: string;
  line: number;
  column: number;
  preview: string;
  documentation?: string;
}

interface PeekDefinitionProps {
  isOpen: boolean;
  definitions: Definition[];
  currentIndex: number;
  sourcePosition?: { line: number; column: number };
  onClose: () => void;
  onNavigate: (index: number) => void;
  onOpenFile: (filePath: string, line: number) => void;
  onCopy?: (text: string) => void;
}

const kindColors: Record<Definition['kind'], string> = {
  function: 'text-purple-400',
  class: 'text-yellow-400',
  variable: 'text-blue-400',
  type: 'text-cyan-400',
  interface: 'text-green-400',
  method: 'text-purple-300',
  property: 'text-orange-400',
};

const kindBadgeColors: Record<Definition['kind'], string> = {
  function: 'bg-purple-500/20 text-purple-400',
  class: 'bg-yellow-500/20 text-yellow-400',
  variable: 'bg-blue-500/20 text-blue-400',
  type: 'bg-cyan-500/20 text-cyan-400',
  interface: 'bg-green-500/20 text-green-400',
  method: 'bg-purple-500/20 text-purple-300',
  property: 'bg-orange-500/20 text-orange-400',
};

export const PeekDefinition: React.FC<PeekDefinitionProps> = ({
  isOpen,
  definitions,
  currentIndex,
  sourcePosition,
  onClose,
  onNavigate,
  onOpenFile,
  onCopy,
}) => {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentDef = definitions[currentIndex];
  const hasMultiple = definitions.length > 1;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasMultiple) {
        onNavigate(currentIndex > 0 ? currentIndex - 1 : definitions.length - 1);
      } else if (e.key === 'ArrowRight' && hasMultiple) {
        onNavigate(currentIndex < definitions.length - 1 ? currentIndex + 1 : 0);
      } else if (e.key === 'Enter') {
        if (currentDef) {
          onOpenFile(currentDef.filePath, currentDef.line);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, definitions, hasMultiple, onClose, onNavigate, onOpenFile, currentDef]);

  const handleCopy = async () => {
    if (currentDef && onCopy) {
      onCopy(currentDef.preview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getFileName = (path: string) => path.split('/').pop() || path;

  if (!isOpen || !currentDef) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute z-50 w-full max-w-2xl bg-gray-900 border border-gray-700 rounded-lg shadow-2xl overflow-hidden"
        style={{
          top: sourcePosition ? `${sourcePosition.line * 20 + 40}px` : '100px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <FileCode className={`w-4 h-4 ${kindColors[currentDef.kind]}`} />
            <span className="text-sm text-white font-medium">{currentDef.name}</span>
            <span className={`px-1.5 py-0.5 text-xs rounded ${kindBadgeColors[currentDef.kind]}`}>
              {currentDef.kind}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {hasMultiple && (
              <div className="flex items-center gap-1 mr-2">
                <button
                  onClick={() => onNavigate(currentIndex > 0 ? currentIndex - 1 : definitions.length - 1)}
                  className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-gray-400 min-w-[40px] text-center">
                  {currentIndex + 1} / {definitions.length}
                </span>
                <button
                  onClick={() => onNavigate(currentIndex < definitions.length - 1 ? currentIndex + 1 : 0)}
                  className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              onClick={handleCopy}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                onOpenFile(currentDef.filePath, currentDef.line);
                onClose();
              }}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title="Open in editor"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title="Close (Escape)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* File Path */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 border-b border-gray-700">
          <button
            onClick={() => onOpenFile(currentDef.filePath, currentDef.line)}
            className="flex items-center gap-1 text-xs text-blue-400 hover:underline"
          >
            <span className="truncate max-w-xs">{currentDef.filePath}</span>
            <span className="text-gray-500">:{currentDef.line}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Code Preview */}
        <div className="max-h-64 overflow-auto">
          <pre className="p-3 text-sm font-mono">
            <code className="text-gray-300 whitespace-pre-wrap">{currentDef.preview}</code>
          </pre>
        </div>

        {/* Documentation */}
        {currentDef.documentation && (
          <div className="px-3 py-2 bg-gray-800/30 border-t border-gray-700">
            <p className="text-xs text-gray-400">{currentDef.documentation}</p>
          </div>
        )}

        {/* Navigation Hint */}
        {hasMultiple && (
          <div className="px-3 py-1.5 bg-gray-800/50 border-t border-gray-700 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {definitions.length} definition{definitions.length > 1 ? 's' : ''} found
            </span>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <ArrowRight className="w-3 h-3 rotate-180" />
                <ArrowRight className="w-3 h-3" />
                navigate
              </span>
              <span>•</span>
              <span>Enter to open</span>
              <span>•</span>
              <span>Esc to close</span>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default PeekDefinition;
