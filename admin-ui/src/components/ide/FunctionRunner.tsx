/**
 * FunctionRunner - Execute functions with custom input and see output
 * Supports manual input, file input, and API calls
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Square, Upload, FileJson, Globe, Terminal, Clock,
  AlertCircle, CheckCircle, XCircle, RefreshCw, Copy, Download,
  ChevronDown, ChevronUp, Trash2, Plus, Code, Braces, List,
  Eye, EyeOff, Settings, Loader2, FileText, Link2
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface FunctionRunnerProps {
  functionCode: string;
  fileName: string;
  language: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

type InputMode = 'manual' | 'file' | 'api';
type OutputFormat = 'auto' | 'json' | 'text' | 'table';

interface ExecutionResult {
  success: boolean;
  output: unknown;
  error?: string;
  executionTime: number;
  timestamp: Date;
}

interface SavedInput {
  id: string;
  name: string;
  data: string;
  mode: InputMode;
}

// ============================================
// MAIN COMPONENT
// ============================================

export const FunctionRunner: React.FC<FunctionRunnerProps> = ({
  functionCode,
  fileName,
  language,
  isVisible,
  onToggleVisibility
}) => {
  // Input state
  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [manualInput, setManualInput] = useState('{\n  "name": "John",\n  "age": 30\n}');
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [apiUrl, setApiUrl] = useState('');
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST'>('GET');
  const [apiHeaders, setApiHeaders] = useState('{\n  "Content-Type": "application/json"\n}');

  // Output state
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('auto');
  const [showRawOutput, setShowRawOutput] = useState(false);

  // History state
  const [executionHistory, setExecutionHistory] = useState<ExecutionResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Saved inputs state
  const [savedInputs, setSavedInputs] = useState<SavedInput[]>([]);
  const [showSavedInputs, setShowSavedInputs] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLPreElement>(null);

  // Get current input data
  const getCurrentInputData = useCallback(async (): Promise<unknown> => {
    switch (inputMode) {
      case 'manual':
        try {
          return JSON.parse(manualInput);
        } catch {
          // If not valid JSON, return as string
          return manualInput;
        }

      case 'file':
        if (!fileInput) throw new Error('No file selected');
        const text = await fileInput.text();
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }

      case 'api':
        if (!apiUrl) throw new Error('No API URL provided');
        const headers = apiHeaders ? JSON.parse(apiHeaders) : {};
        const response = await fetch(apiUrl, {
          method: apiMethod,
          headers
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        return data;

      default:
        return null;
    }
  }, [inputMode, manualInput, fileInput, apiUrl, apiMethod, apiHeaders]);

  // Execute the function
  const executeFunction = useCallback(async () => {
    setIsRunning(true);
    const startTime = performance.now();

    try {
      const inputData = await getCurrentInputData();

      // Create a sandboxed execution environment
      // Note: In production, this should be done server-side for security
      let output: unknown;

      if (language === 'javascript' || language === 'typescript') {
        // For JS/TS, we can evaluate in a sandboxed way
        // WARNING: This is for demo purposes. Production should use a proper sandbox or server-side execution
        try {
          // Extract function name from code
          const funcMatch = functionCode.match(/(?:function\s+(\w+)|const\s+(\w+)\s*=|let\s+(\w+)\s*=|var\s+(\w+)\s*=)/);
          const funcName = funcMatch?.[1] || funcMatch?.[2] || funcMatch?.[3] || funcMatch?.[4] || 'main';

          // Create a safe evaluation context
          const safeEval = new Function('input', `
            "use strict";
            ${functionCode}
            if (typeof ${funcName} === 'function') {
              return ${funcName}(input);
            }
            return "No function found to execute";
          `);

          output = safeEval(inputData);

          // Handle promises
          if (output instanceof Promise) {
            output = await output;
          }
        } catch (evalError) {
          throw new Error(`Execution error: ${evalError instanceof Error ? evalError.message : String(evalError)}`);
        }
      } else {
        // For other languages, show a message about server-side execution
        output = {
          message: `${language} execution requires server-side processing`,
          inputReceived: inputData,
          note: 'Connect to RustPress backend for full execution support'
        };
      }

      const executionTime = performance.now() - startTime;

      const executionResult: ExecutionResult = {
        success: true,
        output,
        executionTime,
        timestamp: new Date()
      };

      setResult(executionResult);
      setExecutionHistory(prev => [executionResult, ...prev].slice(0, 20));

    } catch (error) {
      const executionTime = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      const executionResult: ExecutionResult = {
        success: false,
        output: null,
        error: errorMessage,
        executionTime,
        timestamp: new Date()
      };

      setResult(executionResult);
      setExecutionHistory(prev => [executionResult, ...prev].slice(0, 20));
    } finally {
      setIsRunning(false);
    }
  }, [functionCode, language, getCurrentInputData]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileInput(file);
    }
  };

  // Save current input
  const saveCurrentInput = () => {
    const newInput: SavedInput = {
      id: Date.now().toString(),
      name: `Input ${savedInputs.length + 1}`,
      data: inputMode === 'manual' ? manualInput : inputMode === 'api' ? apiUrl : fileInput?.name || '',
      mode: inputMode
    };
    setSavedInputs(prev => [...prev, newInput]);
  };

  // Load saved input
  const loadSavedInput = (saved: SavedInput) => {
    setInputMode(saved.mode);
    if (saved.mode === 'manual') {
      setManualInput(saved.data);
    } else if (saved.mode === 'api') {
      setApiUrl(saved.data);
    }
    setShowSavedInputs(false);
  };

  // Copy output to clipboard
  const copyOutput = () => {
    if (result?.output) {
      navigator.clipboard.writeText(
        typeof result.output === 'string'
          ? result.output
          : JSON.stringify(result.output, null, 2)
      );
    }
  };

  // Format output based on selected format
  const formatOutput = (output: unknown): string => {
    if (output === null || output === undefined) return 'null';

    switch (outputFormat) {
      case 'json':
        return JSON.stringify(output, null, 2);
      case 'text':
        return String(output);
      case 'table':
        if (Array.isArray(output)) {
          return JSON.stringify(output, null, 2);
        }
        return JSON.stringify(output, null, 2);
      case 'auto':
      default:
        if (typeof output === 'string') return output;
        return JSON.stringify(output, null, 2);
    }
  };

  // Clear result
  const clearResult = () => {
    setResult(null);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex flex-col bg-gray-900 border-l border-gray-700 h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-white">Function Runner</span>
          <span className="text-xs text-gray-500 px-1.5 py-0.5 bg-gray-700 rounded">
            {language}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-1.5 rounded transition-colors ${
              showHistory ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title="Execution history"
          >
            <Clock className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSavedInputs(!showSavedInputs)}
            className={`p-1.5 rounded transition-colors ${
              showSavedInputs ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title="Saved inputs"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleVisibility}
            className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            title="Close runner"
          >
            <EyeOff className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Input Section */}
        <div className="border-b border-gray-700">
          {/* Input Mode Tabs */}
          <div className="flex items-center gap-1 px-3 py-2 bg-gray-850">
            <span className="text-xs text-gray-500 mr-2">Input:</span>
            {[
              { mode: 'manual' as InputMode, icon: Code, label: 'Manual' },
              { mode: 'file' as InputMode, icon: FileJson, label: 'File' },
              { mode: 'api' as InputMode, icon: Globe, label: 'API' }
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setInputMode(mode)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded transition-colors ${
                  inputMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
            <div className="flex-1" />
            <button
              onClick={saveCurrentInput}
              className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              title="Save input"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Input Area */}
          <div className="p-3 max-h-48 overflow-y-auto">
            {inputMode === 'manual' && (
              <textarea
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Enter JSON or plain text input..."
                className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 font-mono resize-none focus:outline-none focus:border-blue-500"
              />
            )}

            {inputMode === 'file' && (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept=".json,.txt,.csv,.xml"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-600 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span>{fileInput ? fileInput.name : 'Click to select file'}</span>
                </button>
                {fileInput && (
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-800 rounded-lg text-xs">
                    <span className="text-gray-300">{fileInput.name}</span>
                    <span className="text-gray-500">{(fileInput.size / 1024).toFixed(1)} KB</span>
                  </div>
                )}
              </div>
            )}

            {inputMode === 'api' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <select
                    value={apiMethod}
                    onChange={(e) => setApiMethod(e.target.value as 'GET' | 'POST')}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                  <input
                    type="url"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://api.example.com/data"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <textarea
                  value={apiHeaders}
                  onChange={(e) => setApiHeaders(e.target.value)}
                  placeholder="Headers (JSON)"
                  className="w-full h-16 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 font-mono resize-none focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* Run Button */}
          <div className="px-3 py-2 bg-gray-850 border-t border-gray-700">
            <button
              onClick={executeFunction}
              disabled={isRunning}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                isRunning
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run Function
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Output Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-gray-850 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Output:</span>
              {result && (
                <span className={`flex items-center gap-1 text-xs ${
                  result.success ? 'text-green-400' : 'text-red-400'
                }`}>
                  {result.success ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  {result.executionTime.toFixed(2)}ms
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                className="px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-gray-300 focus:outline-none"
              >
                <option value="auto">Auto</option>
                <option value="json">JSON</option>
                <option value="text">Text</option>
                <option value="table">Table</option>
              </select>
              {result && (
                <>
                  <button
                    onClick={copyOutput}
                    className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    title="Copy output"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={clearResult}
                    className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    title="Clear output"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Output Content */}
          <div className="flex-1 overflow-auto p-3">
            {!result ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Terminal className="w-12 h-12 text-gray-600 mb-3" />
                <p className="text-gray-400 text-sm">Run the function to see output</p>
                <p className="text-gray-600 text-xs mt-1">
                  Press the Run button or use Ctrl+Enter
                </p>
              </div>
            ) : result.error ? (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-400 mb-1">Error</h4>
                    <pre className="text-xs text-red-300 whitespace-pre-wrap font-mono">
                      {result.error}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <pre
                ref={outputRef}
                className="text-sm text-gray-200 font-mono whitespace-pre-wrap bg-gray-800 rounded-lg p-4 overflow-auto"
              >
                {formatOutput(result.output)}
              </pre>
            )}
          </div>
        </div>

        {/* Saved Inputs Panel */}
        <AnimatePresence>
          {showSavedInputs && savedInputs.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-700 overflow-hidden"
            >
              <div className="p-3 max-h-32 overflow-y-auto">
                <p className="text-xs text-gray-500 mb-2">Saved Inputs</p>
                <div className="space-y-1">
                  {savedInputs.map((saved) => (
                    <button
                      key={saved.id}
                      onClick={() => loadSavedInput(saved)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-gray-800 rounded-lg text-xs text-left hover:bg-gray-700 transition-colors"
                    >
                      <span className="text-gray-300">{saved.name}</span>
                      <span className="text-gray-500 capitalize">{saved.mode}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Panel */}
        <AnimatePresence>
          {showHistory && executionHistory.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-700 overflow-hidden"
            >
              <div className="p-3 max-h-32 overflow-y-auto">
                <p className="text-xs text-gray-500 mb-2">Execution History</p>
                <div className="space-y-1">
                  {executionHistory.map((exec, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${
                        exec.success ? 'bg-green-500/10' : 'bg-red-500/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {exec.success ? (
                          <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-red-400" />
                        )}
                        <span className="text-gray-400">
                          {exec.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <span className="text-gray-500">
                        {exec.executionTime.toFixed(2)}ms
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 border-t border-gray-700 text-xs">
        <div className="flex items-center gap-2 text-gray-400">
          <FileText className="w-3.5 h-3.5" />
          <span>{fileName}</span>
        </div>
        <div className="text-gray-500">
          Ctrl+Enter to run
        </div>
      </div>
    </motion.div>
  );
};

export default FunctionRunner;
