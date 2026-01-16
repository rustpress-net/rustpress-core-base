/**
 * Breadcrumbs - Enhanced file path navigation with symbol support
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronRight, File, Folder, FolderOpen, Code, FileCode,
  FileJson, FileText, Image, Package, ChevronDown, Hash
} from 'lucide-react';

interface Symbol {
  name: string;
  kind: 'function' | 'class' | 'variable' | 'method' | 'property' | 'interface';
  line: number;
}

interface SiblingFile {
  name: string;
  path: string;
  isDirectory: boolean;
}

interface BreadcrumbsProps {
  path: string;
  symbols?: Symbol[];
  currentSymbol?: string;
  siblingFiles?: SiblingFile[];
  onNavigate?: (path: string) => void;
  onSymbolSelect?: (symbol: string, line: number) => void;
}

const fileIcons: Record<string, React.ElementType> = {
  ts: FileCode, tsx: FileCode, js: FileCode, jsx: FileCode,
  json: FileJson, html: Code, css: FileText, md: FileText,
  png: Image, jpg: Image, jpeg: Image, gif: Image, svg: Image,
  default: File,
};

const symbolColors: Record<string, string> = {
  function: 'text-purple-400',
  class: 'text-yellow-400',
  variable: 'text-blue-400',
  method: 'text-purple-300',
  property: 'text-green-400',
  interface: 'text-cyan-400',
};

const getFileIcon = (filename: string): React.ElementType => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return fileIcons[ext] || fileIcons.default;
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  path,
  symbols = [],
  currentSymbol,
  siblingFiles = [],
  onNavigate,
  onSymbolSelect,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!path) return null;

  const parts = path.split('/').filter(Boolean);
  const isFile = parts.length > 0 && parts[parts.length - 1].includes('.');

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const buildPath = (index: number) => parts.slice(0, index + 1).join('/');

  const toggleDropdown = (index: number) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-1 px-3 py-1.5 bg-gray-900/50 border-b border-gray-700/50 text-xs overflow-x-auto"
    >
      {/* Root */}
      <button
        onClick={() => onNavigate?.('')}
        className="flex items-center gap-1 px-1 py-0.5 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded"
      >
        <Package className="w-3.5 h-3.5" />
      </button>

      {parts.map((part, index) => {
        const isLast = index === parts.length - 1;
        const fullPath = buildPath(index);
        const isFolder = !isLast || !isFile;
        const Icon = isFolder ? (activeDropdown === index ? FolderOpen : Folder) : getFileIcon(part);

        return (
          <React.Fragment key={fullPath}>
            <ChevronRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
            <div className="relative">
              <button
                onClick={() => toggleDropdown(index)}
                className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded transition-colors ${
                  isLast ? 'text-gray-300' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isFolder ? 'text-yellow-500' : 'text-blue-400'}`} />
                <span className="truncate max-w-[120px]">{part}</span>
                {siblingFiles.length > 0 && <ChevronDown className="w-3 h-3 text-gray-500" />}
              </button>

              {activeDropdown === index && siblingFiles.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-64 overflow-auto">
                  {siblingFiles.map((file) => {
                    const FileIcon = file.isDirectory ? Folder : getFileIcon(file.name);
                    return (
                      <button
                        key={file.path}
                        onClick={() => {
                          onNavigate?.(file.path);
                          setActiveDropdown(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-700"
                      >
                        <FileIcon className={`w-4 h-4 ${file.isDirectory ? 'text-yellow-400' : 'text-blue-400'}`} />
                        <span className="text-sm text-gray-300 truncate">{file.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </React.Fragment>
        );
      })}

      {/* Symbol navigation */}
      {symbols.length > 0 && (
        <>
          <ChevronRight className="w-3 h-3 text-gray-600 flex-shrink-0" />
          <div className="relative">
            <button
              onClick={() => toggleDropdown(-1)}
              className="flex items-center gap-1.5 px-1.5 py-0.5 text-purple-400 hover:bg-gray-800 rounded"
            >
              <Hash className="w-3.5 h-3.5" />
              <span>{currentSymbol || 'Symbol'}</span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </button>

            {activeDropdown === -1 && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-64 overflow-auto">
                {symbols.map((symbol) => (
                  <button
                    key={`${symbol.name}-${symbol.line}`}
                    onClick={() => {
                      onSymbolSelect?.(symbol.name, symbol.line);
                      setActiveDropdown(null);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-gray-700 ${
                      symbol.name === currentSymbol ? 'bg-gray-700' : ''
                    }`}
                  >
                    <Code className={`w-4 h-4 ${symbolColors[symbol.kind] || 'text-gray-400'}`} />
                    <span className="text-sm text-gray-300 truncate flex-1">{symbol.name}</span>
                    <span className="text-xs text-gray-500 px-1 bg-gray-700 rounded">{symbol.kind}</span>
                    <span className="text-xs text-gray-500">:{symbol.line}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Breadcrumbs;
