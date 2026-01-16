/**
 * GoToLineModal - Go to line dialog (Ctrl+G)
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Hash } from 'lucide-react';

interface GoToLineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToLine: (line: number, column?: number) => void;
  currentLine?: number;
  totalLines?: number;
}

export const GoToLineModal: React.FC<GoToLineModalProps> = ({
  isOpen,
  onClose,
  onGoToLine,
  currentLine = 1,
  totalLines = 1
}) => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(currentLine.toString());
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen, currentLine]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parts = value.split(':');
    const line = parseInt(parts[0], 10);
    const column = parts[1] ? parseInt(parts[1], 10) : undefined;

    if (!isNaN(line) && line > 0) {
      onGoToLine(Math.min(line, totalLines), column);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-full max-w-sm"
          >
            <form
              onSubmit={handleSubmit}
              onKeyDown={handleKeyDown}
              className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
            >
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Go to line:column"
                  className="w-full px-4 py-3 pl-12 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm"
                />
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-4 py-2 border-t border-gray-700 text-xs text-gray-500 flex items-center justify-between">
                <span>Current: Line {currentLine} of {totalLines}</span>
                <span>Format: line or line:column</span>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GoToLineModal;
