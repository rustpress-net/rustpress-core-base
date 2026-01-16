/**
 * CreateFileModal - Dialog for creating new files and folders
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, File, Folder, AlertCircle } from 'lucide-react';

interface CreateFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, type: 'file' | 'folder') => void;
  type: 'file' | 'folder';
  parentPath: string;
  existingNames?: string[];
}

export const CreateFileModal: React.FC<CreateFileModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  type,
  parentPath,
  existingNames = []
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(type === 'file' ? 'untitled.txt' : 'new-folder');
      setError(null);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen, type]);

  const validateName = (value: string): string | null => {
    if (!value.trim()) {
      return 'Name cannot be empty';
    }
    if (existingNames.includes(value)) {
      return `A ${type} with this name already exists`;
    }
    if (/[<>:"/\\|?*]/.test(value)) {
      return 'Name contains invalid characters';
    }
    if (value.startsWith('.') && value.length === 1) {
      return 'Name cannot be just a dot';
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }
    onCreate(name.trim(), type);
    onClose();
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
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <form
              onSubmit={handleSubmit}
              onKeyDown={handleKeyDown}
              className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  {type === 'file' ? (
                    <File className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Folder className="w-5 h-5 text-yellow-400" />
                  )}
                  <h3 className="text-sm font-medium text-white">
                    New {type === 'file' ? 'File' : 'Folder'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-4">
                <div className="mb-2 text-xs text-gray-400">
                  Creating in: <span className="text-gray-300">{parentPath || 'root'}</span>
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                  }}
                  placeholder={type === 'file' ? 'filename.ext' : 'folder-name'}
                  className={`w-full px-3 py-2 bg-gray-900 border rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                    error
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500/50'
                  }`}
                />

                {error && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-red-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {error}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-700 bg-gray-850">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateFileModal;
