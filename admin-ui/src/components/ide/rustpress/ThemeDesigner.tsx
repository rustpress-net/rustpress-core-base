/**
 * ThemeDesigner - Visual theme customization
 * RustPress-specific theme building functionality
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette, Layout, Type, Image, Monitor, Smartphone, Tablet,
  Eye, Save, Undo, Redo, RefreshCw, Copy, Download, Upload,
  ChevronDown, ChevronRight, Settings, Sliders, Grid, Layers
} from 'lucide-react';

export interface ThemeVariable {
  id: string;
  name: string;
  category: 'colors' | 'typography' | 'spacing' | 'borders' | 'shadows' | 'animations';
  value: string;
  type: 'color' | 'size' | 'font' | 'number' | 'select';
  options?: string[];
  description?: string;
}

export interface ThemeSection {
  id: string;
  name: string;
  icon: React.ReactNode;
  variables: ThemeVariable[];
}

interface ThemeDesignerProps {
  onSave?: (variables: ThemeVariable[]) => void;
  onPreview?: () => void;
}

const mockSections: ThemeSection[] = [
  {
    id: 'colors',
    name: 'Colors',
    icon: <Palette className="w-4 h-4" />,
    variables: [
      { id: 'primary', name: 'Primary Color', category: 'colors', value: '#8B5CF6', type: 'color', description: 'Main brand color' },
      { id: 'secondary', name: 'Secondary Color', category: 'colors', value: '#06B6D4', type: 'color', description: 'Accent color' },
      { id: 'background', name: 'Background', category: 'colors', value: '#111827', type: 'color', description: 'Page background' },
      { id: 'surface', name: 'Surface', category: 'colors', value: '#1F2937', type: 'color', description: 'Card/panel background' },
      { id: 'text-primary', name: 'Text Primary', category: 'colors', value: '#F9FAFB', type: 'color', description: 'Main text color' },
      { id: 'text-secondary', name: 'Text Secondary', category: 'colors', value: '#9CA3AF', type: 'color', description: 'Muted text color' },
      { id: 'success', name: 'Success', category: 'colors', value: '#10B981', type: 'color' },
      { id: 'warning', name: 'Warning', category: 'colors', value: '#F59E0B', type: 'color' },
      { id: 'error', name: 'Error', category: 'colors', value: '#EF4444', type: 'color' },
    ]
  },
  {
    id: 'typography',
    name: 'Typography',
    icon: <Type className="w-4 h-4" />,
    variables: [
      { id: 'font-family', name: 'Font Family', category: 'typography', value: 'Inter', type: 'select', options: ['Inter', 'Roboto', 'Open Sans', 'Poppins', 'Montserrat'] },
      { id: 'font-size-base', name: 'Base Font Size', category: 'typography', value: '16px', type: 'size' },
      { id: 'font-size-sm', name: 'Small Font Size', category: 'typography', value: '14px', type: 'size' },
      { id: 'font-size-lg', name: 'Large Font Size', category: 'typography', value: '18px', type: 'size' },
      { id: 'font-size-xl', name: 'XL Font Size', category: 'typography', value: '24px', type: 'size' },
      { id: 'line-height', name: 'Line Height', category: 'typography', value: '1.5', type: 'number' },
      { id: 'heading-font', name: 'Heading Font', category: 'typography', value: 'Inter', type: 'select', options: ['Inter', 'Roboto', 'Playfair Display', 'Montserrat'] },
    ]
  },
  {
    id: 'spacing',
    name: 'Spacing',
    icon: <Grid className="w-4 h-4" />,
    variables: [
      { id: 'spacing-xs', name: 'Extra Small', category: 'spacing', value: '4px', type: 'size' },
      { id: 'spacing-sm', name: 'Small', category: 'spacing', value: '8px', type: 'size' },
      { id: 'spacing-md', name: 'Medium', category: 'spacing', value: '16px', type: 'size' },
      { id: 'spacing-lg', name: 'Large', category: 'spacing', value: '24px', type: 'size' },
      { id: 'spacing-xl', name: 'Extra Large', category: 'spacing', value: '32px', type: 'size' },
      { id: 'container-width', name: 'Container Width', category: 'spacing', value: '1280px', type: 'size' },
    ]
  },
  {
    id: 'borders',
    name: 'Borders',
    icon: <Layers className="w-4 h-4" />,
    variables: [
      { id: 'border-radius-sm', name: 'Small Radius', category: 'borders', value: '4px', type: 'size' },
      { id: 'border-radius-md', name: 'Medium Radius', category: 'borders', value: '8px', type: 'size' },
      { id: 'border-radius-lg', name: 'Large Radius', category: 'borders', value: '12px', type: 'size' },
      { id: 'border-radius-full', name: 'Full Radius', category: 'borders', value: '9999px', type: 'size' },
      { id: 'border-width', name: 'Border Width', category: 'borders', value: '1px', type: 'size' },
      { id: 'border-color', name: 'Border Color', category: 'borders', value: '#374151', type: 'color' },
    ]
  },
  {
    id: 'shadows',
    name: 'Shadows',
    icon: <Sliders className="w-4 h-4" />,
    variables: [
      { id: 'shadow-sm', name: 'Small Shadow', category: 'shadows', value: '0 1px 2px rgba(0,0,0,0.1)', type: 'font' },
      { id: 'shadow-md', name: 'Medium Shadow', category: 'shadows', value: '0 4px 6px rgba(0,0,0,0.1)', type: 'font' },
      { id: 'shadow-lg', name: 'Large Shadow', category: 'shadows', value: '0 10px 15px rgba(0,0,0,0.2)', type: 'font' },
      { id: 'shadow-xl', name: 'XL Shadow', category: 'shadows', value: '0 20px 25px rgba(0,0,0,0.25)', type: 'font' },
    ]
  }
];

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

export const ThemeDesigner: React.FC<ThemeDesignerProps> = ({
  onSave,
  onPreview
}) => {
  const [sections, setSections] = useState<ThemeSection[]>(mockSections);
  const [expandedSections, setExpandedSections] = useState<string[]>(['colors']);
  const [selectedVariable, setSelectedVariable] = useState<ThemeVariable | null>(null);
  const [viewportSize, setViewportSize] = useState<ViewportSize>('desktop');
  const [hasChanges, setHasChanges] = useState(false);
  const [history, setHistory] = useState<ThemeSection[][]>([mockSections]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const updateVariable = (sectionId: string, variableId: string, value: string) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          variables: section.variables.map(v =>
            v.id === variableId ? { ...v, value } : v
          )
        };
      }
      return section;
    }));
    setHasChanges(true);

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(sections);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setSections(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setSections(history[historyIndex + 1]);
    }
  };

  const handleSave = () => {
    const allVariables = sections.flatMap(s => s.variables);
    onSave?.(allVariables);
    setHasChanges(false);
  };

  const handleReset = () => {
    setSections(mockSections);
    setHasChanges(false);
    setHistory([mockSections]);
    setHistoryIndex(0);
  };

  const exportTheme = () => {
    const allVariables = sections.flatMap(s => s.variables);
    const cssVars = allVariables.map(v => `  --${v.id}: ${v.value};`).join('\n');
    const css = `:root {\n${cssVars}\n}`;

    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme-variables.css';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getViewportWidth = () => {
    switch (viewportSize) {
      case 'mobile': return 375;
      case 'tablet': return 768;
      default: return 1280;
    }
  };

  const generatePreviewStyles = () => {
    const vars = sections.flatMap(s => s.variables);
    return vars.reduce((acc, v) => {
      acc[`--${v.id}`] = v.value;
      return acc;
    }, {} as Record<string, string>);
  };

  return (
    <div className="h-full flex bg-gray-900">
      {/* Left Panel - Variables */}
      <div className="w-80 border-r border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
            <Palette className="w-5 h-5 text-purple-400" />
            Theme Designer
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={historyIndex === 0}
              className="p-1.5 hover:bg-gray-800 rounded disabled:opacity-30"
              title="Undo"
            >
              <Undo className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 hover:bg-gray-800 rounded disabled:opacity-30"
              title="Redo"
            >
              <Redo className="w-4 h-4 text-gray-400" />
            </button>
            <div className="flex-1" />
            <button
              onClick={handleReset}
              className="p-1.5 hover:bg-gray-800 rounded"
              title="Reset"
            >
              <RefreshCw className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={exportTheme}
              className="p-1.5 hover:bg-gray-800 rounded"
              title="Export CSS"
            >
              <Download className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm rounded-lg"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>

        {/* Sections */}
        <div className="flex-1 overflow-auto">
          {sections.map(section => (
            <div key={section.id} className="border-b border-gray-800">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-3 flex items-center gap-2 hover:bg-gray-800/50 text-left"
              >
                {expandedSections.includes(section.id) ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <span className="text-purple-400">{section.icon}</span>
                <span className="text-white font-medium">{section.name}</span>
                <span className="ml-auto text-xs text-gray-500">{section.variables.length}</span>
              </button>

              <AnimatePresence>
                {expandedSections.includes(section.id) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 pt-0 space-y-3">
                      {section.variables.map(variable => (
                        <div key={variable.id} className="space-y-1">
                          <label className="text-xs text-gray-400">{variable.name}</label>
                          {variable.type === 'color' ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={variable.value}
                                onChange={(e) => updateVariable(section.id, variable.id, e.target.value)}
                                className="w-8 h-8 rounded cursor-pointer bg-transparent border border-gray-700"
                              />
                              <input
                                type="text"
                                value={variable.value}
                                onChange={(e) => updateVariable(section.id, variable.id, e.target.value)}
                                className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white font-mono"
                              />
                            </div>
                          ) : variable.type === 'select' ? (
                            <select
                              value={variable.value}
                              onChange={(e) => updateVariable(section.id, variable.id, e.target.value)}
                              className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white"
                            >
                              {variable.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={variable.value}
                              onChange={(e) => updateVariable(section.id, variable.id, e.target.value)}
                              className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white"
                            />
                          )}
                          {variable.description && (
                            <p className="text-xs text-gray-600">{variable.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 flex flex-col">
        {/* Preview Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-400" />
            <span className="text-white font-medium">Preview</span>
          </div>
          <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewportSize('desktop')}
              className={`p-1.5 rounded ${viewportSize === 'desktop' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewportSize('tablet')}
              className={`p-1.5 rounded ${viewportSize === 'tablet' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewportSize('mobile')}
              className={`p-1.5 rounded ${viewportSize === 'mobile' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto p-8 bg-gray-950 flex justify-center">
          <div
            className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300"
            style={{
              width: getViewportWidth(),
              minHeight: 600,
              ...generatePreviewStyles()
            }}
          >
            {/* Preview Header */}
            <div
              className="p-4 border-b"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-color)' }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="text-xl font-bold"
                  style={{ color: 'var(--primary)', fontFamily: 'var(--heading-font)' }}
                >
                  RustPress
                </div>
                <nav className="flex gap-4">
                  {['Home', 'Blog', 'About', 'Contact'].map(item => (
                    <a
                      key={item}
                      href="#"
                      className="text-sm hover:opacity-80"
                      style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-family)' }}
                    >
                      {item}
                    </a>
                  ))}
                </nav>
              </div>
            </div>

            {/* Preview Content */}
            <div style={{ backgroundColor: 'var(--background)', padding: 'var(--spacing-lg)' }}>
              <h1
                className="text-3xl font-bold mb-4"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--heading-font)' }}
              >
                Welcome to Your Site
              </h1>
              <p
                className="mb-6"
                style={{
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-family)',
                  fontSize: 'var(--font-size-base)',
                  lineHeight: 'var(--line-height)'
                }}
              >
                This is a preview of your theme settings. Adjust the variables on the left to see changes in real-time.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {[1, 2].map(i => (
                  <div
                    key={i}
                    className="p-4"
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderRadius: 'var(--border-radius-md)',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  >
                    <h3
                      className="font-semibold mb-2"
                      style={{ color: 'var(--text-primary)', fontFamily: 'var(--heading-font)' }}
                    >
                      Card Title {i}
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-family)' }}
                    >
                      Card content goes here with styled text.
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  className="px-4 py-2 text-white font-medium"
                  style={{
                    backgroundColor: 'var(--primary)',
                    borderRadius: 'var(--border-radius-md)',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  Primary Button
                </button>
                <button
                  className="px-4 py-2 font-medium"
                  style={{
                    backgroundColor: 'var(--secondary)',
                    color: 'white',
                    borderRadius: 'var(--border-radius-md)',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  Secondary Button
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeDesigner;
