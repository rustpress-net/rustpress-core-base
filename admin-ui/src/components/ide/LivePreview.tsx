/**
 * LivePreview - Real-time preview panel for HTML/CSS/JS
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, RefreshCw, Smartphone, Tablet, Monitor, Maximize2, Minimize2,
  ExternalLink, Copy, Check, Settings, Code, X, RotateCcw,
  ZoomIn, ZoomOut, Ruler, Wifi, WifiOff
} from 'lucide-react';

export interface PreviewSettings {
  autoRefresh: boolean;
  refreshDelay: number;
  showDeviceFrame: boolean;
  backgroundColor: string;
  customCSS?: string;
  customJS?: string;
}

export interface DevicePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  type: 'mobile' | 'tablet' | 'desktop';
  userAgent?: string;
}

interface LivePreviewProps {
  content: string;
  contentType: 'html' | 'markdown' | 'component';
  baseUrl?: string;
  settings: PreviewSettings;
  devices: DevicePreset[];
  selectedDevice?: string;
  isConnected?: boolean;
  onSettingsChange: (settings: PreviewSettings) => void;
  onDeviceChange: (deviceId: string) => void;
  onRefresh: () => void;
  onOpenExternal: () => void;
  onCopyContent: () => void;
}

const defaultDevices: DevicePreset[] = [
  { id: 'iphone-14', name: 'iPhone 14', width: 390, height: 844, type: 'mobile' },
  { id: 'iphone-se', name: 'iPhone SE', width: 375, height: 667, type: 'mobile' },
  { id: 'pixel-7', name: 'Pixel 7', width: 412, height: 915, type: 'mobile' },
  { id: 'ipad', name: 'iPad', width: 768, height: 1024, type: 'tablet' },
  { id: 'ipad-pro', name: 'iPad Pro', width: 1024, height: 1366, type: 'tablet' },
  { id: 'desktop-sm', name: 'Desktop SM', width: 1280, height: 800, type: 'desktop' },
  { id: 'desktop-lg', name: 'Desktop LG', width: 1920, height: 1080, type: 'desktop' },
];

const deviceIcons = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
};

export const LivePreview: React.FC<LivePreviewProps> = ({
  content,
  contentType,
  baseUrl,
  settings,
  devices = defaultDevices,
  selectedDevice,
  isConnected = true,
  onSettingsChange,
  onDeviceChange,
  onRefresh,
  onOpenExternal,
  onCopyContent,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showSettings, setShowSettings] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const [showRulers, setShowRulers] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout>();

  const currentDevice = devices.find((d) => d.id === selectedDevice);
  const DeviceIcon = currentDevice ? deviceIcons[currentDevice.type] : Monitor;

  // Auto-refresh on content change
  useEffect(() => {
    if (settings.autoRefresh) {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      refreshTimeoutRef.current = setTimeout(() => {
        handleRefresh();
      }, settings.refreshDelay);
    }
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [content, settings.autoRefresh, settings.refreshDelay]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        const fullContent = wrapContent(content, settings);
        doc.open();
        doc.write(fullContent);
        doc.close();
      }
    }
    setTimeout(() => setIsRefreshing(false), 300);
    onRefresh();
  }, [content, settings, onRefresh]);

  const wrapContent = (html: string, settings: PreviewSettings) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <base href="${baseUrl || '/'}">
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 16px;
              background: ${settings.backgroundColor || '#ffffff'};
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            ${settings.customCSS || ''}
          </style>
        </head>
        <body>
          ${html}
          ${settings.customJS ? `<script>${settings.customJS}</script>` : ''}
        </body>
      </html>
    `;
  };

  const handleCopy = () => {
    onCopyContent();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateSetting = <K extends keyof PreviewSettings>(
    key: K,
    value: PreviewSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const toggleFullscreen = () => {
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'} bg-gray-900`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Preview
          </h3>
          {!isConnected && (
            <span className="flex items-center gap-1 text-xs text-yellow-400">
              <WifiOff className="w-3 h-3" />
              Disconnected
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleCopy}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Copy content"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={onOpenExternal}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1 rounded ${showSettings ? 'text-blue-400 bg-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Device Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-2">
          {/* Quick Device Buttons */}
          <div className="flex items-center gap-1 border-r border-gray-700 pr-2">
            <button
              onClick={() => {
                const mobile = devices.find((d) => d.type === 'mobile');
                if (mobile) onDeviceChange(mobile.id);
              }}
              className={`p-1.5 rounded ${currentDevice?.type === 'mobile' ? 'text-blue-400 bg-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
              title="Mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const tablet = devices.find((d) => d.type === 'tablet');
                if (tablet) onDeviceChange(tablet.id);
              }}
              className={`p-1.5 rounded ${currentDevice?.type === 'tablet' ? 'text-blue-400 bg-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
              title="Tablet"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const desktop = devices.find((d) => d.type === 'desktop');
                if (desktop) onDeviceChange(desktop.id);
              }}
              className={`p-1.5 rounded ${currentDevice?.type === 'desktop' ? 'text-blue-400 bg-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
              title="Desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>

          {/* Device Selector */}
          <div className="relative">
            <button
              onClick={() => setShowDevices(!showDevices)}
              className="flex items-center gap-2 px-2 py-1 text-xs text-gray-300 hover:bg-gray-700 rounded"
            >
              <DeviceIcon className="w-3.5 h-3.5" />
              <span>{currentDevice?.name || 'Responsive'}</span>
              {currentDevice && (
                <span className="text-gray-500">
                  {currentDevice.width}×{currentDevice.height}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showDevices && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10"
                >
                  {devices.map((device) => {
                    const Icon = deviceIcons[device.type];
                    return (
                      <button
                        key={device.id}
                        onClick={() => {
                          onDeviceChange(device.id);
                          setShowDevices(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-700 ${
                          selectedDevice === device.id ? 'text-blue-400' : 'text-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="flex-1">{device.name}</span>
                        <span className="text-gray-500">
                          {device.width}×{device.height}
                        </span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowRulers(!showRulers)}
            className={`p-1 rounded ${showRulers ? 'text-blue-400 bg-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
            title="Toggle rulers"
          >
            <Ruler className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1 border-l border-gray-700 pl-2 ml-1">
            <button
              onClick={() => setZoom(Math.max(25, zoom - 25))}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-400 w-10 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 25))}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title="Reset zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-700 overflow-hidden"
          >
            <div className="p-3 space-y-3 bg-gray-800/50">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoRefresh}
                    onChange={(e) => updateSetting('autoRefresh', e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
                  />
                  Auto-refresh
                </label>
                {settings.autoRefresh && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Delay:</span>
                    <input
                      type="number"
                      value={settings.refreshDelay}
                      onChange={(e) => updateSetting('refreshDelay', parseInt(e.target.value) || 500)}
                      className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white text-center"
                    />
                    <span className="text-xs text-gray-500">ms</span>
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showDeviceFrame}
                  onChange={(e) => updateSetting('showDeviceFrame', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
                />
                Show device frame
              </label>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">Background Color</label>
                <input
                  type="color"
                  value={settings.backgroundColor || '#ffffff'}
                  onChange={(e) => updateSetting('backgroundColor', e.target.value)}
                  className="w-full h-8 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-400">Custom CSS</label>
                <textarea
                  value={settings.customCSS || ''}
                  onChange={(e) => updateSetting('customCSS', e.target.value)}
                  placeholder="body { }"
                  className="w-full h-16 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-white font-mono resize-none"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-[#1a1a2e]">
        <div
          className="relative transition-all duration-300"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Device Frame */}
          {settings.showDeviceFrame && currentDevice && (
            <div className="absolute inset-0 -m-3 bg-gray-800 rounded-[2rem] shadow-2xl" />
          )}

          {/* Iframe Container */}
          <div
            className={`relative bg-white overflow-hidden ${
              settings.showDeviceFrame && currentDevice ? 'rounded-2xl' : 'rounded'
            }`}
            style={{
              width: currentDevice ? currentDevice.width : '100%',
              height: currentDevice ? currentDevice.height : '100%',
            }}
          >
            {/* Rulers */}
            {showRulers && (
              <>
                <div className="absolute top-0 left-0 right-0 h-4 bg-gray-700 text-[8px] text-gray-400 flex items-center justify-between px-2 z-10">
                  <span>0</span>
                  <span>{currentDevice?.width || '100%'}</span>
                </div>
                <div className="absolute top-0 left-0 bottom-0 w-4 bg-gray-700 text-[8px] text-gray-400 flex flex-col items-center justify-between py-2 z-10">
                  <span>0</span>
                  <span>{currentDevice?.height || '100%'}</span>
                </div>
              </>
            )}

            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              title="Preview"
              sandbox="allow-scripts allow-same-origin"
              srcDoc={wrapContent(content, settings)}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-gray-700 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <span className="flex items-center gap-1 text-green-400">
              <Wifi className="w-3 h-3" />
              Live
            </span>
          ) : (
            <span className="flex items-center gap-1 text-yellow-400">
              <WifiOff className="w-3 h-3" />
              Disconnected
            </span>
          )}
        </div>
        <span>
          {contentType.toUpperCase()} • {currentDevice?.name || 'Responsive'}
        </span>
      </div>
    </div>
  );
};

export default LivePreview;
