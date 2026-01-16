/**
 * ZenMode - Distraction-free fullscreen editing
 */

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2, Moon, Sun, Type } from 'lucide-react';
import { MonacoWrapper } from './MonacoWrapper';
import type { OpenFile } from './IDE';

interface ZenModeProps {
  isOpen: boolean;
  onClose: () => void;
  file: OpenFile | null;
  onChange: (content: string) => void;
  onSave: () => void;
}

export const ZenMode: React.FC<ZenModeProps> = ({
  isOpen,
  onClose,
  file,
  onChange,
  onSave
}) => {
  const [fontSize, setFontSize] = React.useState(18);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const [lineWidth, setLineWidth] = React.useState<'narrow' | 'normal' | 'wide'>('normal');

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Escape to exit
    if (e.key === 'Escape') {
      onClose();
    }
    // Ctrl+S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      onSave();
    }
    // Ctrl++ to increase font
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
      e.preventDefault();
      setFontSize(prev => Math.min(prev + 2, 32));
    }
    // Ctrl+- to decrease font
    if ((e.ctrlKey || e.metaKey) && e.key === '-') {
      e.preventDefault();
      setFontSize(prev => Math.max(prev - 2, 12));
    }
  }, [onClose, onSave]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const contentWidth = lineWidth === 'narrow' ? '600px' : lineWidth === 'normal' ? '800px' : '1000px';

  return (
    <AnimatePresence>
      {isOpen && file && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 ${isDarkMode ? 'bg-gray-950' : 'bg-gray-100'}`}
        >
          {/* Minimal Header */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4"
          >
            <div className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              {file.name}
              {file.isModified && <span className="ml-2 text-yellow-500">•</span>}
            </div>

            <div className="flex items-center gap-2">
              {/* Line Width */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-800/50">
                {(['narrow', 'normal', 'wide'] as const).map(width => (
                  <button
                    key={width}
                    onClick={() => setLineWidth(width)}
                    className={`px-2 py-0.5 rounded text-xs transition-colors ${
                      lineWidth === width
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {width}
                  </button>
                ))}
              </div>

              {/* Font Size */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-800/50">
                <Type className="w-4 h-4 text-gray-400" />
                <button
                  onClick={() => setFontSize(prev => Math.max(prev - 2, 12))}
                  className="text-gray-400 hover:text-white"
                >
                  -
                </button>
                <span className="text-xs text-gray-300 w-8 text-center">{fontSize}</span>
                <button
                  onClick={() => setFontSize(prev => Math.min(prev + 2, 32))}
                  className="text-gray-400 hover:text-white"
                >
                  +
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Close */}
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                }`}
                title="Exit Zen Mode (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Editor Container */}
          <div className="absolute inset-0 pt-16 pb-8 flex justify-center">
            <div
              style={{ width: contentWidth, maxWidth: '100%' }}
              className="h-full"
            >
              <MonacoWrapper
                path={file.path}
                content={file.content}
                language={file.language}
                onChange={onChange}
                editorOptions={{
                  fontSize,
                  minimap: false,
                  lineNumbers: false,
                  wordWrap: true,
                  fontFamily: "'JetBrains Mono', monospace"
                }}
              />
            </div>
          </div>

          {/* Minimal Footer */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`absolute bottom-0 left-0 right-0 flex items-center justify-center py-4 text-xs ${
              isDarkMode ? 'text-gray-600' : 'text-gray-400'
            }`}
          >
            <span className="opacity-50">
              Press <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">Esc</kbd> to exit
              {' • '}
              <kbd className="px-1.5 py-0.5 bg-gray-800 rounded">Ctrl+S</kbd> to save
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ZenMode;
