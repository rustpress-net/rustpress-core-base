/**
 * FormatDocument - Code formatting options and preview
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wand2, Settings, Check, RefreshCw, AlertCircle,
  FileCode, Clock, Download, Upload
} from 'lucide-react';

export interface FormatOptions {
  tabSize: number;
  useTabs: boolean;
  printWidth: number;
  singleQuote: boolean;
  trailingComma: 'none' | 'es5' | 'all';
  bracketSpacing: boolean;
  bracketSameLine: boolean;
  arrowParens: 'avoid' | 'always';
  semi: boolean;
  endOfLine: 'lf' | 'crlf' | 'cr' | 'auto';
  proseWrap: 'always' | 'never' | 'preserve';
}

interface FormatterConfig {
  id: string;
  name: string;
  icon: string;
  supported: string[];
}

interface FormatDocumentProps {
  code: string;
  language: string;
  options: FormatOptions;
  availableFormatters: FormatterConfig[];
  selectedFormatter?: string;
  isFormatting?: boolean;
  lastFormatted?: string;
  onFormat: () => void;
  onOptionsChange: (options: FormatOptions) => void;
  onFormatterChange: (formatterId: string) => void;
  onImportConfig: (config: string) => void;
  onExportConfig: () => string;
}

const presets = {
  prettier: {
    name: 'Prettier Default',
    options: {
      tabSize: 2,
      useTabs: false,
      printWidth: 80,
      singleQuote: false,
      trailingComma: 'es5' as const,
      bracketSpacing: true,
      bracketSameLine: false,
      arrowParens: 'always' as const,
      semi: true,
      endOfLine: 'lf' as const,
      proseWrap: 'preserve' as const,
    },
  },
  airbnb: {
    name: 'Airbnb Style',
    options: {
      tabSize: 2,
      useTabs: false,
      printWidth: 100,
      singleQuote: true,
      trailingComma: 'all' as const,
      bracketSpacing: true,
      bracketSameLine: false,
      arrowParens: 'always' as const,
      semi: true,
      endOfLine: 'lf' as const,
      proseWrap: 'preserve' as const,
    },
  },
  standard: {
    name: 'Standard JS',
    options: {
      tabSize: 2,
      useTabs: false,
      printWidth: 80,
      singleQuote: true,
      trailingComma: 'none' as const,
      bracketSpacing: true,
      bracketSameLine: false,
      arrowParens: 'avoid' as const,
      semi: false,
      endOfLine: 'lf' as const,
      proseWrap: 'preserve' as const,
    },
  },
};

export const FormatDocument: React.FC<FormatDocumentProps> = ({
  code,
  language,
  options,
  availableFormatters,
  selectedFormatter,
  isFormatting = false,
  lastFormatted,
  onFormat,
  onOptionsChange,
  onFormatterChange,
  onImportConfig,
  onExportConfig,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const updateOption = <K extends keyof FormatOptions>(
    key: K,
    value: FormatOptions[K]
  ) => {
    onOptionsChange({ ...options, [key]: value });
    setActivePreset(null);
  };

  const applyPreset = (presetKey: keyof typeof presets) => {
    onOptionsChange(presets[presetKey].options);
    setActivePreset(presetKey);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onImportConfig(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Wand2 className="w-4 h-4" />
          Format Document
        </h3>
        <div className="flex items-center gap-1">
          <label className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded cursor-pointer">
            <Upload className="w-4 h-4" />
            <input
              type="file"
              accept=".json,.prettierrc"
              className="hidden"
              onChange={handleImport}
            />
          </label>
          <button
            onClick={() => {
              const config = onExportConfig();
              const blob = new Blob([config], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = '.prettierrc';
              a.click();
            }}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Export config"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Current File Info */}
      <div className="px-3 py-2 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <FileCode className="w-3.5 h-3.5" />
            <span>{language}</span>
          </div>
          {lastFormatted && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Last formatted: {lastFormatted}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 space-y-4">
        {/* Formatter Selection */}
        {availableFormatters.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400">Formatter</label>
            <div className="flex gap-2">
              {availableFormatters.map((formatter) => (
                <button
                  key={formatter.id}
                  onClick={() => onFormatterChange(formatter.id)}
                  className={`flex-1 px-3 py-2 rounded text-xs transition-colors ${
                    selectedFormatter === formatter.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {formatter.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Presets */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400">Presets</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(presets).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => applyPreset(key as keyof typeof presets)}
                className={`px-3 py-2 rounded text-xs transition-colors ${
                  activePreset === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Basic Options */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-400">Basic Options</label>

          {/* Tab Size */}
          <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
            <span className="text-sm text-gray-300">Tab Size</span>
            <div className="flex gap-1">
              {[2, 4, 8].map((size) => (
                <button
                  key={size}
                  onClick={() => updateOption('tabSize', size)}
                  className={`px-3 py-1 rounded text-xs ${
                    options.tabSize === size
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Use Tabs */}
          <label className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
            <span className="text-sm text-gray-300">Use Tabs</span>
            <input
              type="checkbox"
              checked={options.useTabs}
              onChange={(e) => updateOption('useTabs', e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
            />
          </label>

          {/* Print Width */}
          <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
            <span className="text-sm text-gray-300">Print Width</span>
            <input
              type="number"
              value={options.printWidth}
              onChange={(e) => updateOption('printWidth', parseInt(e.target.value) || 80)}
              className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white text-center"
            />
          </div>

          {/* Semicolons */}
          <label className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
            <span className="text-sm text-gray-300">Semicolons</span>
            <input
              type="checkbox"
              checked={options.semi}
              onChange={(e) => updateOption('semi', e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
            />
          </label>

          {/* Single Quote */}
          <label className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
            <span className="text-sm text-gray-300">Single Quotes</span>
            <input
              type="checkbox"
              checked={options.singleQuote}
              onChange={(e) => updateOption('singleQuote', e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
            />
          </label>
        </div>

        {/* Advanced Options Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 rounded text-sm text-gray-400 hover:bg-gray-700"
        >
          <span className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Advanced Options
          </span>
          <motion.span
            animate={{ rotate: showAdvanced ? 180 : 0 }}
            className="text-gray-500"
          >
            ▼
          </motion.span>
        </button>

        {/* Advanced Options */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-2 overflow-hidden"
            >
              {/* Trailing Comma */}
              <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                <span className="text-sm text-gray-300">Trailing Comma</span>
                <select
                  value={options.trailingComma}
                  onChange={(e) => updateOption('trailingComma', e.target.value as FormatOptions['trailingComma'])}
                  className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                >
                  <option value="none">None</option>
                  <option value="es5">ES5</option>
                  <option value="all">All</option>
                </select>
              </div>

              {/* Bracket Spacing */}
              <label className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
                <span className="text-sm text-gray-300">Bracket Spacing</span>
                <input
                  type="checkbox"
                  checked={options.bracketSpacing}
                  onChange={(e) => updateOption('bracketSpacing', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
                />
              </label>

              {/* Bracket Same Line */}
              <label className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
                <span className="text-sm text-gray-300">Bracket Same Line</span>
                <input
                  type="checkbox"
                  checked={options.bracketSameLine}
                  onChange={(e) => updateOption('bracketSameLine', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
                />
              </label>

              {/* Arrow Parens */}
              <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                <span className="text-sm text-gray-300">Arrow Parens</span>
                <select
                  value={options.arrowParens}
                  onChange={(e) => updateOption('arrowParens', e.target.value as FormatOptions['arrowParens'])}
                  className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                >
                  <option value="always">Always</option>
                  <option value="avoid">Avoid</option>
                </select>
              </div>

              {/* End of Line */}
              <div className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                <span className="text-sm text-gray-300">End of Line</span>
                <select
                  value={options.endOfLine}
                  onChange={(e) => updateOption('endOfLine', e.target.value as FormatOptions['endOfLine'])}
                  className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
                >
                  <option value="lf">LF</option>
                  <option value="crlf">CRLF</option>
                  <option value="cr">CR</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer - Format Button */}
      <div className="px-3 py-2 border-t border-gray-700">
        <button
          onClick={onFormat}
          disabled={isFormatting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded text-sm text-white transition-colors"
        >
          {isFormatting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Formatting...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Format Document
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FormatDocument;
