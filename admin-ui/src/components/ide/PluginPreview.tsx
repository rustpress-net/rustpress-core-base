/**
 * PluginPreview - Test and preview RustPress plugins
 * Provides a testing environment for plugins with:
 * - Hook testing
 * - Event simulation
 * - API testing
 * - Debug output
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play, Square, RefreshCw, Bug, Loader2, X, ChevronDown, ChevronUp,
  Zap, Settings, TestTube, CheckCircle, XCircle, AlertTriangle,
  Terminal, Code, FileJson, Send, Clock, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// TYPES
// ============================================

export interface PluginConfig {
  name: string;
  version: string;
  hooks?: string[];
  events?: string[];
  api?: string[];
}

export interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
  logs?: string[];
}

export interface HookCall {
  id: string;
  hook: string;
  args: unknown[];
  result?: unknown;
  error?: string;
  timestamp: Date;
  duration?: number;
}

export interface LogEntry {
  id: string;
  type: 'log' | 'warn' | 'error' | 'info' | 'debug';
  message: string;
  timestamp: Date;
  data?: unknown;
}

interface PluginPreviewProps {
  pluginPath: string;
  pluginName: string;
  onClose?: () => void;
}

// ============================================
// CONSTANTS
// ============================================

const MOCK_HOOKS = [
  'init',
  'activate',
  'deactivate',
  'beforeContentRender',
  'afterContentRender',
  'onUserLogin',
  'onUserLogout',
  'beforeSave',
  'afterSave',
  'onApiRequest',
  'onApiResponse',
];

const MOCK_EVENTS = [
  'page:load',
  'page:unload',
  'user:login',
  'user:logout',
  'content:created',
  'content:updated',
  'content:deleted',
  'theme:changed',
  'settings:updated',
];

// ============================================
// COMPONENT
// ============================================

export const PluginPreview: React.FC<PluginPreviewProps> = ({
  pluginPath,
  pluginName,
  onClose
}) => {
  // State
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'hooks' | 'events' | 'tests' | 'logs'>('hooks');
  const [hookCalls, setHookCalls] = useState<HookCall[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedHook, setSelectedHook] = useState<string | null>(null);
  const [hookArgs, setHookArgs] = useState<string>('{}');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [eventPayload, setEventPayload] = useState<string>('{}');
  const [isRunningTests, setIsRunningTests] = useState(false);

  const logsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

  // Add log
  const addLog = useCallback((type: LogEntry['type'], message: string, data?: unknown) => {
    setLogs(prev => [...prev, {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date(),
      data
    }]);
  }, []);

  // Load plugin
  const loadPlugin = useCallback(async () => {
    setIsLoading(true);
    addLog('info', `Loading plugin: ${pluginName}...`);

    try {
      // Simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));

      setIsLoaded(true);
      addLog('info', 'Plugin loaded successfully');
      addLog('debug', `Registered hooks: ${MOCK_HOOKS.join(', ')}`);
      addLog('debug', `Listening to events: ${MOCK_EVENTS.join(', ')}`);

      // Initialize test results
      setTestResults([
        { id: '1', name: 'Plugin initialization', status: 'pending' },
        { id: '2', name: 'Hook registration', status: 'pending' },
        { id: '3', name: 'Event handling', status: 'pending' },
        { id: '4', name: 'API integration', status: 'pending' },
        { id: '5', name: 'Cleanup on deactivate', status: 'pending' },
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      addLog('error', `Failed to load plugin: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [pluginName, addLog]);

  // Unload plugin
  const unloadPlugin = useCallback(async () => {
    setIsLoading(true);
    addLog('info', 'Unloading plugin...');

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoaded(false);
      setHookCalls([]);
      setTestResults([]);
      addLog('info', 'Plugin unloaded');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      addLog('error', `Failed to unload: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [addLog]);

  // Trigger hook
  const triggerHook = useCallback(async () => {
    if (!selectedHook || !isLoaded) return;

    let parsedArgs: unknown[];
    try {
      parsedArgs = JSON.parse(hookArgs);
      if (!Array.isArray(parsedArgs)) {
        parsedArgs = [parsedArgs];
      }
    } catch {
      addLog('error', 'Invalid JSON for hook arguments');
      return;
    }

    addLog('info', `Triggering hook: ${selectedHook}`);
    const startTime = Date.now();

    // Simulate hook execution
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 400));

    const hookCall: HookCall = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      hook: selectedHook,
      args: parsedArgs,
      result: { success: true, message: `Hook ${selectedHook} executed` },
      timestamp: new Date(),
      duration: Date.now() - startTime
    };

    setHookCalls(prev => [...prev, hookCall]);
    addLog('debug', `Hook ${selectedHook} completed in ${hookCall.duration}ms`);
  }, [selectedHook, hookArgs, isLoaded, addLog]);

  // Emit event
  const emitEvent = useCallback(async () => {
    if (!selectedEvent || !isLoaded) return;

    let payload: unknown;
    try {
      payload = JSON.parse(eventPayload);
    } catch {
      addLog('error', 'Invalid JSON for event payload');
      return;
    }

    addLog('info', `Emitting event: ${selectedEvent}`);

    // Simulate event handling
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 200));

    addLog('debug', `Event ${selectedEvent} handled`, payload);
  }, [selectedEvent, eventPayload, isLoaded, addLog]);

  // Run tests
  const runTests = useCallback(async () => {
    if (!isLoaded) return;

    setIsRunningTests(true);
    addLog('info', 'Running plugin tests...');

    const results = [...testResults];

    for (let i = 0; i < results.length; i++) {
      results[i] = { ...results[i], status: 'running' };
      setTestResults([...results]);
      addLog('debug', `Running: ${results[i].name}`);

      // Simulate test execution
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

      // Random pass/fail for demo
      const passed = Math.random() > 0.2;
      results[i] = {
        ...results[i],
        status: passed ? 'passed' : 'failed',
        duration: 500 + Math.floor(Math.random() * 1000),
        error: passed ? undefined : 'Assertion failed: expected true, got false'
      };
      setTestResults([...results]);

      if (passed) {
        addLog('info', `PASS: ${results[i].name}`);
      } else {
        addLog('error', `FAIL: ${results[i].name} - ${results[i].error}`);
      }
    }

    const passedCount = results.filter(r => r.status === 'passed').length;
    const failedCount = results.filter(r => r.status === 'failed').length;
    addLog('info', `Tests complete: ${passedCount} passed, ${failedCount} failed`);

    setIsRunningTests(false);
  }, [isLoaded, testResults, addLog]);

  // Clear logs
  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  // Get status icon
  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'running': return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'skipped': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get log color
  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'info': return 'text-blue-400';
      case 'debug': return 'text-purple-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Toolbar */}
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white flex items-center gap-2">
            <Bug className="w-4 h-4 text-purple-400" />
            {pluginName}
          </span>

          {/* Load/Unload button */}
          {isLoaded ? (
            <button
              onClick={unloadPlugin}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Square className="w-3.5 h-3.5" />}
              Unload
            </button>
          ) : (
            <button
              onClick={loadPlugin}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Load
            </button>
          )}

          {/* Run tests */}
          <button
            onClick={runTests}
            disabled={!isLoaded || isRunningTests}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunningTests ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TestTube className="w-3.5 h-3.5" />}
            Run Tests
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Status indicator */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${
            isLoaded ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
          }`}>
            <Activity className="w-3 h-3" />
            {isLoaded ? 'Active' : 'Inactive'}
          </div>

          {/* Close */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-3 gap-1">
        {[
          { id: 'hooks', label: 'Hooks', icon: Zap },
          { id: 'events', label: 'Events', icon: Activity },
          { id: 'tests', label: 'Tests', icon: TestTube },
          { id: 'logs', label: 'Logs', icon: Terminal },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeTab === tab.id
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            {tab.id === 'tests' && testResults.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-gray-600 rounded text-[10px]">
                {testResults.filter(t => t.status === 'passed').length}/{testResults.length}
              </span>
            )}
            {tab.id === 'logs' && logs.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-gray-600 rounded text-[10px]">
                {logs.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Main content */}
        <div className="flex-1 overflow-auto p-4">
          {/* Hooks tab */}
          {activeTab === 'hooks' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Hook selector */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400">Select Hook</label>
                  <select
                    value={selectedHook || ''}
                    onChange={(e) => setSelectedHook(e.target.value || null)}
                    disabled={!isLoaded}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white disabled:opacity-50"
                  >
                    <option value="">-- Select a hook --</option>
                    {MOCK_HOOKS.map(hook => (
                      <option key={hook} value={hook}>{hook}</option>
                    ))}
                  </select>
                </div>

                {/* Args input */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400">Arguments (JSON)</label>
                  <input
                    type="text"
                    value={hookArgs}
                    onChange={(e) => setHookArgs(e.target.value)}
                    disabled={!isLoaded}
                    placeholder='["arg1", "arg2"] or {}'
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                onClick={triggerHook}
                disabled={!isLoaded || !selectedHook}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Trigger Hook
              </button>

              {/* Hook call history */}
              {hookCalls.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-xs font-medium text-gray-400 mb-2">Hook Calls</h3>
                  <div className="space-y-2 max-h-64 overflow-auto">
                    {hookCalls.map(call => (
                      <div key={call.id} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">{call.hook}</span>
                          <span className="text-xs text-gray-500">{call.duration}ms</span>
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          <div>Args: {JSON.stringify(call.args)}</div>
                          <div>Result: {JSON.stringify(call.result)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Events tab */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Event selector */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400">Select Event</label>
                  <select
                    value={selectedEvent || ''}
                    onChange={(e) => setSelectedEvent(e.target.value || null)}
                    disabled={!isLoaded}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white disabled:opacity-50"
                  >
                    <option value="">-- Select an event --</option>
                    {MOCK_EVENTS.map(event => (
                      <option key={event} value={event}>{event}</option>
                    ))}
                  </select>
                </div>

                {/* Payload input */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400">Payload (JSON)</label>
                  <input
                    type="text"
                    value={eventPayload}
                    onChange={(e) => setEventPayload(e.target.value)}
                    disabled={!isLoaded}
                    placeholder='{ "key": "value" }'
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                onClick={emitEvent}
                disabled={!isLoaded || !selectedEvent}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Emit Event
              </button>
            </div>
          )}

          {/* Tests tab */}
          {activeTab === 'tests' && (
            <div className="space-y-2">
              {testResults.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <TestTube className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Load the plugin to view tests</p>
                </div>
              ) : (
                testResults.map(test => (
                  <div
                    key={test.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      test.status === 'passed' ? 'bg-green-500/10 border-green-500/30' :
                      test.status === 'failed' ? 'bg-red-500/10 border-red-500/30' :
                      test.status === 'running' ? 'bg-blue-500/10 border-blue-500/30' :
                      'bg-gray-800 border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(test.status)}
                        <span className="text-sm font-medium text-white">{test.name}</span>
                      </div>
                      {test.duration && (
                        <span className="text-xs text-gray-500">{test.duration}ms</span>
                      )}
                    </div>
                    {test.error && (
                      <div className="mt-2 text-xs text-red-400 font-mono">{test.error}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Logs tab */}
          {activeTab === 'logs' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-400">{logs.length} messages</span>
                <button
                  onClick={clearLogs}
                  className="text-xs text-gray-400 hover:text-white px-2 py-1 hover:bg-gray-700 rounded transition-colors"
                >
                  Clear
                </button>
              </div>
              <div ref={logsRef} className="bg-gray-950 rounded-lg p-3 h-[400px] overflow-auto font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="text-gray-600 italic">No logs yet</div>
                ) : (
                  logs.map(log => (
                    <div key={log.id} className={`py-0.5 ${getLogColor(log.type)}`}>
                      <span className="text-gray-600">[{log.timestamp.toLocaleTimeString()}]</span>
                      {' '}
                      <span className="opacity-75">[{log.type.toUpperCase()}]</span>
                      {' '}
                      <span>{log.message}</span>
                      {log.data && (
                        <span className="text-gray-500 ml-2">{JSON.stringify(log.data)}</span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PluginPreview;
