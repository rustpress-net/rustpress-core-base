/**
 * CodeScreenshot - Generate beautiful code screenshots
 */

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Camera, Download, Copy, Check, Image, Palette,
  Type, Maximize2, Monitor, Smartphone
} from 'lucide-react';

export interface ScreenshotSettings {
  theme: 'dark' | 'light' | 'custom';
  backgroundColor: string;
  padding: number;
  borderRadius: number;
  showWindowControls: boolean;
  showLineNumbers: boolean;
  fontSize: number;
  fontFamily: string;
  shadowEnabled: boolean;
  shadowColor: string;
  shadowBlur: number;
  watermark?: string;
}

interface CodeScreenshotProps {
  code: string;
  language?: string;
  filename?: string;
  settings: ScreenshotSettings;
  onSettingsChange: (settings: ScreenshotSettings) => void;
  onDownload: (format: 'png' | 'svg' | 'jpeg') => void;
  onCopyToClipboard: () => void;
}

const themes = {
  dark: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    windowBg: '#1a1a2e',
    text: '#e2e8f0',
  },
  light: {
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    windowBg: '#ffffff',
    text: '#1a202c',
  },
  custom: {
    background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    windowBg: '#0d1117',
    text: '#c9d1d9',
  },
};

const presetBackgrounds = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
  'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
];

const fontOptions = [
  { value: 'JetBrains Mono', label: 'JetBrains Mono' },
  { value: 'Fira Code', label: 'Fira Code' },
  { value: 'Source Code Pro', label: 'Source Code Pro' },
  { value: 'Cascadia Code', label: 'Cascadia Code' },
  { value: 'Monaco', label: 'Monaco' },
];

export const CodeScreenshot: React.FC<CodeScreenshotProps> = ({
  code,
  language = 'javascript',
  filename,
  settings,
  onSettingsChange,
  onDownload,
  onCopyToClipboard,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'settings'>('preview');
  const previewRef = useRef<HTMLDivElement>(null);

  const updateSetting = <K extends keyof ScreenshotSettings>(
    key: K,
    value: ScreenshotSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleCopy = () => {
    onCopyToClipboard();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTheme = themes[settings.theme];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Camera className="w-4 h-4" />
          Code Screenshot
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onDownload('png')}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Download PNG"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex-1 px-4 py-2 text-xs transition-colors ${
            activeTab === 'preview'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 px-4 py-2 text-xs transition-colors ${
            activeTab === 'settings'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Settings
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'preview' ? (
          <div className="p-4 flex items-center justify-center min-h-full">
            {/* Screenshot Preview */}
            <div
              ref={previewRef}
              className="relative transition-all"
              style={{
                background: settings.backgroundColor || currentTheme.background,
                padding: settings.padding,
                borderRadius: settings.borderRadius,
                boxShadow: settings.shadowEnabled
                  ? `0 ${settings.shadowBlur / 2}px ${settings.shadowBlur}px ${settings.shadowColor}`
                  : 'none',
              }}
            >
              {/* Code Window */}
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  backgroundColor: currentTheme.windowBg,
                  borderRadius: Math.max(0, settings.borderRadius - settings.padding / 2),
                }}
              >
                {/* Window Title Bar */}
                {settings.showWindowControls && (
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700/50">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    {filename && (
                      <span className="ml-4 text-xs text-gray-400">{filename}</span>
                    )}
                  </div>
                )}

                {/* Code Content */}
                <pre
                  className="p-4 overflow-auto"
                  style={{
                    fontSize: settings.fontSize,
                    fontFamily: `${settings.fontFamily}, monospace`,
                    color: currentTheme.text,
                    lineHeight: 1.6,
                  }}
                >
                  {settings.showLineNumbers ? (
                    <div className="flex">
                      <div className="pr-4 text-gray-600 select-none text-right">
                        {code.split('\n').map((_, i) => (
                          <div key={i}>{i + 1}</div>
                        ))}
                      </div>
                      <code>{code}</code>
                    </div>
                  ) : (
                    <code>{code}</code>
                  )}
                </pre>

                {/* Watermark */}
                {settings.watermark && (
                  <div className="px-4 pb-2 text-right">
                    <span className="text-xs text-gray-600">{settings.watermark}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 space-y-4">
            {/* Theme */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Theme</label>
              <div className="flex gap-2">
                {(['dark', 'light', 'custom'] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => updateSetting('theme', theme)}
                    className={`flex-1 px-3 py-2 rounded text-xs transition-colors ${
                      settings.theme === theme
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Background */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Background</label>
              <div className="grid grid-cols-4 gap-2">
                {presetBackgrounds.map((bg, i) => (
                  <button
                    key={i}
                    onClick={() => updateSetting('backgroundColor', bg)}
                    className={`h-10 rounded-lg border-2 transition-all ${
                      settings.backgroundColor === bg
                        ? 'border-white scale-105'
                        : 'border-transparent'
                    }`}
                    style={{ background: bg }}
                  />
                ))}
              </div>
            </div>

            {/* Padding */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-medium text-gray-400">Padding</label>
                <span className="text-xs text-gray-500">{settings.padding}px</span>
              </div>
              <input
                type="range"
                min="16"
                max="128"
                value={settings.padding}
                onChange={(e) => updateSetting('padding', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Border Radius */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-medium text-gray-400">Border Radius</label>
                <span className="text-xs text-gray-500">{settings.borderRadius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="32"
                value={settings.borderRadius}
                onChange={(e) => updateSetting('borderRadius', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-medium text-gray-400">Font Size</label>
                <span className="text-xs text-gray-500">{settings.fontSize}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="20"
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Font Family */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Font Family</label>
              <select
                value={settings.fontFamily}
                onChange={(e) => updateSetting('fontFamily', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white"
              >
                {fontOptions.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Options</label>

              <label className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
                <span className="text-sm text-gray-300">Window Controls</span>
                <input
                  type="checkbox"
                  checked={settings.showWindowControls}
                  onChange={(e) => updateSetting('showWindowControls', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
                <span className="text-sm text-gray-300">Line Numbers</span>
                <input
                  type="checkbox"
                  checked={settings.showLineNumbers}
                  onChange={(e) => updateSetting('showLineNumbers', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-2 bg-gray-800/50 rounded cursor-pointer hover:bg-gray-800">
                <span className="text-sm text-gray-300">Shadow</span>
                <input
                  type="checkbox"
                  checked={settings.shadowEnabled}
                  onChange={(e) => updateSetting('shadowEnabled', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
                />
              </label>
            </div>

            {/* Watermark */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-400">Watermark</label>
              <input
                type="text"
                value={settings.watermark || ''}
                onChange={(e) => updateSetting('watermark', e.target.value)}
                placeholder="@username"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer - Export Options */}
      <div className="px-3 py-2 border-t border-gray-700">
        <div className="flex gap-2">
          <button
            onClick={() => onDownload('png')}
            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white flex items-center justify-center gap-1"
          >
            <Image className="w-3.5 h-3.5" />
            PNG
          </button>
          <button
            onClick={() => onDownload('svg')}
            className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white flex items-center justify-center gap-1"
          >
            <Image className="w-3.5 h-3.5" />
            SVG
          </button>
          <button
            onClick={() => onDownload('jpeg')}
            className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white flex items-center justify-center gap-1"
          >
            <Image className="w-3.5 h-3.5" />
            JPEG
          </button>
        </div>
      </div>
    </div>
  );
};

export default CodeScreenshot;
