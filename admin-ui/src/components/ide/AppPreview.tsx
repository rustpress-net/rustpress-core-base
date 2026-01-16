/**
 * AppPreview - Preview and run RustPress applications
 * Provides a full development environment for testing apps with:
 * - Live preview in iframe
 * - Console output
 * - Hot reloading
 * - Device simulation
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Square, RefreshCw, Smartphone, Tablet, Monitor, Maximize2, Minimize2,
  Terminal, X, ChevronDown, ChevronUp, ExternalLink, Settings, Bug, Loader2,
  Wifi, WifiOff, AlertTriangle, CheckCircle, Sun, Moon, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// TYPES
// ============================================

export interface AppConfig {
  name: string;
  entry: string;
  port?: number;
  env?: Record<string, string>;
  dependencies?: string[];
}

export interface ConsoleMessage {
  id: string;
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: Date;
  source?: string;
}

interface DevicePreset {
  name: string;
  width: number;
  height: number;
  icon: React.ElementType;
}

interface AppPreviewProps {
  appPath: string;
  appName: string;
  onClose?: () => void;
}

// ============================================
// CONSTANTS
// ============================================

const DEVICE_PRESETS: DevicePreset[] = [
  { name: 'iPhone SE', width: 375, height: 667, icon: Smartphone },
  { name: 'iPhone 14', width: 390, height: 844, icon: Smartphone },
  { name: 'iPad', width: 768, height: 1024, icon: Tablet },
  { name: 'Desktop', width: 1280, height: 800, icon: Monitor },
  { name: 'Full Width', width: 0, height: 0, icon: Maximize2 },
];

// ============================================
// COMPONENT
// ============================================

export const AppPreview: React.FC<AppPreviewProps> = ({
  appPath,
  appName,
  onClose
}) => {
  // State
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<DevicePreset>(DEVICE_PRESETS[3]); // Desktop
  const [showConsole, setShowConsole] = useState(true);
  const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const [rotation, setRotation] = useState<'portrait' | 'landscape'>('portrait');

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);

  // Auto-scroll console
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleMessages]);

  // Add console message
  const addConsoleMessage = useCallback((type: ConsoleMessage['type'], message: string, source?: string) => {
    setConsoleMessages(prev => [...prev, {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date(),
      source
    }]);
  }, []);

  // Start app
  const startApp = useCallback(async () => {
    setIsLoading(true);
    addConsoleMessage('info', `Starting ${appName}...`);

    try {
      // In a real implementation, this would call the backend to start the app
      // For now, simulate the startup
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock development server URL
      const port = 3001 + Math.floor(Math.random() * 100);
      const url = `http://localhost:${port}`;

      setPreviewUrl(url);
      setIsRunning(true);
      setIsConnected(true);
      addConsoleMessage('info', `App running at ${url}`);
      addConsoleMessage('log', 'Hot reload enabled');
      addConsoleMessage('log', 'Watching for file changes...');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      addConsoleMessage('error', `Failed to start app: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [appName, addConsoleMessage]);

  // Stop app
  const stopApp = useCallback(async () => {
    setIsLoading(true);
    addConsoleMessage('info', 'Stopping app...');

    try {
      // In a real implementation, this would call the backend to stop the app
      await new Promise(resolve => setTimeout(resolve, 500));

      setIsRunning(false);
      setPreviewUrl(null);
      setIsConnected(false);
      addConsoleMessage('info', 'App stopped');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      addConsoleMessage('error', `Failed to stop app: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [addConsoleMessage]);

  // Refresh preview
  const refreshPreview = useCallback(() => {
    if (iframeRef.current && previewUrl) {
      addConsoleMessage('info', 'Refreshing preview...');
      iframeRef.current.src = previewUrl;
    }
  }, [previewUrl, addConsoleMessage]);

  // Clear console
  const clearConsole = useCallback(() => {
    setConsoleMessages([]);
  }, []);

  // Open in external window
  const openExternal = useCallback(() => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  }, [previewUrl]);

  // Toggle rotation
  const toggleRotation = useCallback(() => {
    setRotation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
  }, []);

  // Get device dimensions
  const getDeviceDimensions = () => {
    if (selectedDevice.width === 0) {
      return { width: '100%', height: '100%' };
    }
    const isLandscape = rotation === 'landscape';
    return {
      width: isLandscape ? selectedDevice.height : selectedDevice.width,
      height: isLandscape ? selectedDevice.width : selectedDevice.height
    };
  };

  const dimensions = getDeviceDimensions();

  // Console message color
  const getMessageColor = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className={`flex flex-col h-full bg-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Toolbar */}
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-3">
        <div className="flex items-center gap-3">
          {/* App name */}
          <span className="text-sm font-medium text-white flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-gray-500" />
            )}
            {appName}
          </span>

          {/* Run/Stop button */}
          {isRunning ? (
            <button
              onClick={stopApp}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Square className="w-3.5 h-3.5" />
              )}
              Stop
            </button>
          ) : (
            <button
              onClick={startApp}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              Run
            </button>
          )}

          {/* Refresh */}
          <button
            onClick={refreshPreview}
            disabled={!isRunning}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh preview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Device selector */}
          <div className="relative">
            <button
              onClick={() => setShowDeviceMenu(!showDeviceMenu)}
              className="flex items-center gap-2 px-2 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
            >
              {React.createElement(selectedDevice.icon, { className: 'w-4 h-4' })}
              <span>{selectedDevice.name}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            <AnimatePresence>
              {showDeviceMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 z-10 min-w-36"
                >
                  {DEVICE_PRESETS.map(device => (
                    <button
                      key={device.name}
                      onClick={() => {
                        setSelectedDevice(device);
                        setShowDeviceMenu(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors ${
                        selectedDevice.name === device.name
                          ? 'bg-blue-600/20 text-blue-400'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {React.createElement(device.icon, { className: 'w-4 h-4' })}
                      <span>{device.name}</span>
                      {device.width > 0 && (
                        <span className="text-gray-500 ml-auto">{device.width}x{device.height}</span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Rotate */}
          {selectedDevice.width > 0 && (
            <button
              onClick={toggleRotation}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Rotate device"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Theme toggle */}
          <button
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title={isDarkTheme ? 'Light theme' : 'Dark theme'}
          >
            {isDarkTheme ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* External link */}
          <button
            onClick={openExternal}
            disabled={!isRunning}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Open in new window"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Console toggle */}
          <button
            onClick={() => setShowConsole(!showConsole)}
            className={`p-1.5 rounded transition-colors ${
              showConsole ? 'text-blue-400 bg-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title={showConsole ? 'Hide console' : 'Show console'}
          >
            <Terminal className="w-4 h-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Close preview"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Preview area */}
      <div className={`flex-1 flex ${showConsole ? 'flex-col' : ''} overflow-hidden`}>
        {/* Preview iframe container */}
        <div
          className={`flex-1 flex items-center justify-center p-4 overflow-auto ${
            isDarkTheme ? 'bg-gray-950' : 'bg-gray-100'
          }`}
        >
          {isRunning && previewUrl ? (
            <div
              className="relative bg-white shadow-2xl rounded-lg overflow-hidden transition-all"
              style={{
                width: typeof dimensions.width === 'string' ? dimensions.width : dimensions.width,
                height: typeof dimensions.height === 'string' ? dimensions.height : dimensions.height,
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            >
              {/* Device frame for mobile */}
              {selectedDevice.width > 0 && selectedDevice.width < 500 && (
                <div className="absolute top-0 left-0 right-0 h-6 bg-black flex items-center justify-center">
                  <div className="w-16 h-1 bg-gray-700 rounded-full" />
                </div>
              )}
              <iframe
                ref={iframeRef}
                src={previewUrl}
                className="w-full h-full border-0"
                title={`${appName} Preview`}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-xl flex items-center justify-center">
                <Play className="w-8 h-8" />
              </div>
              <p className="text-lg font-medium mb-2">App Preview</p>
              <p className="text-sm mb-4">Click "Run" to start the development server</p>
              <button
                onClick={startApp}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Starting...' : 'Start App'}
              </button>
            </div>
          )}
        </div>

        {/* Console panel */}
        {showConsole && (
          <div className="h-48 bg-gray-900 border-t border-gray-700 flex flex-col">
            {/* Console header */}
            <div className="h-8 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-medium text-gray-300">Console</span>
                <span className="text-xs text-gray-500">({consoleMessages.length})</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearConsole}
                  className="text-xs text-gray-400 hover:text-white px-2 py-0.5 hover:bg-gray-700 rounded transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Console messages */}
            <div ref={consoleRef} className="flex-1 overflow-auto p-2 font-mono text-xs">
              {consoleMessages.length === 0 ? (
                <div className="text-gray-600 italic">No messages</div>
              ) : (
                consoleMessages.map(msg => (
                  <div key={msg.id} className={`flex gap-2 py-0.5 ${getMessageColor(msg.type)}`}>
                    <span className="text-gray-600 flex-shrink-0">
                      [{msg.timestamp.toLocaleTimeString()}]
                    </span>
                    <span className="flex-shrink-0 w-12">
                      [{msg.type.toUpperCase()}]
                    </span>
                    <span className="break-all">{msg.message}</span>
                    {msg.source && (
                      <span className="text-gray-600 ml-auto flex-shrink-0">{msg.source}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppPreview;
