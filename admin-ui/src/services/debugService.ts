/**
 * Debug Service
 * Handles debugging operations: breakpoints, watch expressions, call stack, variables
 */

const API_BASE = '/api/v1';

// ============================================
// TYPES
// ============================================

export interface DebugSession {
  id: string;
  status: 'idle' | 'running' | 'paused' | 'stopped';
  file: string;
  line: number;
  column: number;
  startTime: string;
}

export interface Breakpoint {
  id: string;
  file: string;
  line: number;
  column?: number;
  condition?: string;
  hitCount?: number;
  logMessage?: string;
  enabled: boolean;
  verified: boolean;
}

export interface WatchExpression {
  id: string;
  expression: string;
  value: string;
  type: string;
  error?: string;
  expandable: boolean;
}

export interface StackFrame {
  id: string;
  name: string;
  file: string;
  line: number;
  column: number;
  source?: string;
  isAsync: boolean;
  moduleId?: string;
}

export interface Variable {
  name: string;
  value: string;
  type: string;
  scope: 'local' | 'closure' | 'global' | 'block';
  expandable: boolean;
  children?: Variable[];
  evaluateName?: string;
}

export interface ThreadInfo {
  id: string;
  name: string;
  state: 'running' | 'paused' | 'stopped';
  stackFrames: StackFrame[];
}

export interface ConsoleEntry {
  id: string;
  type: 'log' | 'warn' | 'error' | 'info' | 'debug' | 'input' | 'output';
  message: string;
  timestamp: Date;
  source?: string;
  line?: number;
  stack?: string;
  data?: unknown;
}

// ============================================
// API FUNCTIONS - DEBUG SESSIONS
// ============================================

/**
 * Start a new debug session
 */
export async function startDebugSession(file: string): Promise<DebugSession> {
  try {
    const response = await fetch(`${API_BASE}/debug/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file }),
    });
    if (!response.ok) throw new Error('Failed to start debug session');
    return await response.json();
  } catch (error) {
    console.error('Error starting debug session:', error);
    return getMockDebugSession(file);
  }
}

/**
 * Stop the current debug session
 */
export async function stopDebugSession(sessionId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/debug/${sessionId}/stop`, {
      method: 'POST',
    });
    return response.ok;
  } catch (error) {
    console.error('Error stopping debug session:', error);
    return true;
  }
}

/**
 * Continue execution
 */
export async function continueExecution(sessionId: string): Promise<DebugSession> {
  try {
    const response = await fetch(`${API_BASE}/debug/${sessionId}/continue`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to continue');
    return await response.json();
  } catch (error) {
    console.error('Error continuing execution:', error);
    return getMockDebugSession();
  }
}

/**
 * Step over
 */
export async function stepOver(sessionId: string): Promise<DebugSession> {
  try {
    const response = await fetch(`${API_BASE}/debug/${sessionId}/step-over`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to step over');
    return await response.json();
  } catch (error) {
    console.error('Error stepping over:', error);
    return getMockDebugSession();
  }
}

/**
 * Step into
 */
export async function stepInto(sessionId: string): Promise<DebugSession> {
  try {
    const response = await fetch(`${API_BASE}/debug/${sessionId}/step-into`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to step into');
    return await response.json();
  } catch (error) {
    console.error('Error stepping into:', error);
    return getMockDebugSession();
  }
}

/**
 * Step out
 */
export async function stepOut(sessionId: string): Promise<DebugSession> {
  try {
    const response = await fetch(`${API_BASE}/debug/${sessionId}/step-out`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to step out');
    return await response.json();
  } catch (error) {
    console.error('Error stepping out:', error);
    return getMockDebugSession();
  }
}

/**
 * Restart debug session
 */
export async function restartDebugSession(sessionId: string): Promise<DebugSession> {
  try {
    const response = await fetch(`${API_BASE}/debug/${sessionId}/restart`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to restart');
    return await response.json();
  } catch (error) {
    console.error('Error restarting debug session:', error);
    return getMockDebugSession();
  }
}

// ============================================
// API FUNCTIONS - BREAKPOINTS
// ============================================

/**
 * Get all breakpoints
 */
export async function getBreakpoints(): Promise<Breakpoint[]> {
  try {
    const response = await fetch(`${API_BASE}/debug/breakpoints`);
    if (!response.ok) throw new Error('Failed to get breakpoints');
    return await response.json();
  } catch (error) {
    console.error('Error getting breakpoints:', error);
    return getMockBreakpoints();
  }
}

/**
 * Add a breakpoint
 */
export async function addBreakpoint(
  file: string,
  line: number,
  options?: { condition?: string; logMessage?: string }
): Promise<Breakpoint> {
  try {
    const response = await fetch(`${API_BASE}/debug/breakpoints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, line, ...options }),
    });
    if (!response.ok) throw new Error('Failed to add breakpoint');
    return await response.json();
  } catch (error) {
    console.error('Error adding breakpoint:', error);
    return {
      id: `bp-${Date.now()}`,
      file,
      line,
      enabled: true,
      verified: true,
      ...options,
    };
  }
}

/**
 * Remove a breakpoint
 */
export async function removeBreakpoint(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/debug/breakpoints/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Error removing breakpoint:', error);
    return true;
  }
}

/**
 * Toggle breakpoint enabled/disabled
 */
export async function toggleBreakpoint(id: string, enabled: boolean): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/debug/breakpoints/${id}/toggle`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error toggling breakpoint:', error);
    return true;
  }
}

/**
 * Update breakpoint condition
 */
export async function updateBreakpointCondition(id: string, condition: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/debug/breakpoints/${id}/condition`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ condition }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error updating breakpoint condition:', error);
    return true;
  }
}

// ============================================
// API FUNCTIONS - WATCH EXPRESSIONS
// ============================================

/**
 * Get all watch expressions
 */
export async function getWatchExpressions(sessionId: string): Promise<WatchExpression[]> {
  try {
    const response = await fetch(`${API_BASE}/debug/${sessionId}/watch`);
    if (!response.ok) throw new Error('Failed to get watch expressions');
    return await response.json();
  } catch (error) {
    console.error('Error getting watch expressions:', error);
    return getMockWatchExpressions();
  }
}

/**
 * Add a watch expression
 */
export async function addWatchExpression(sessionId: string, expression: string): Promise<WatchExpression> {
  try {
    const response = await fetch(`${API_BASE}/debug/${sessionId}/watch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression }),
    });
    if (!response.ok) throw new Error('Failed to add watch expression');
    return await response.json();
  } catch (error) {
    console.error('Error adding watch expression:', error);
    return {
      id: `watch-${Date.now()}`,
      expression,
      value: '<not evaluated>',
      type: 'unknown',
      expandable: false,
    };
  }
}

/**
 * Remove a watch expression
 */
export async function removeWatchExpression(sessionId: string, id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/debug/${sessionId}/watch/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Error removing watch expression:', error);
    return true;
  }
}

/**
 * Evaluate an expression
 */
export async function evaluateExpression(sessionId: string, expression: string): Promise<WatchExpression> {
  try {
    const response = await fetch(`${API_BASE}/debug/${sessionId}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expression }),
    });
    if (!response.ok) throw new Error('Failed to evaluate expression');
    return await response.json();
  } catch (error) {
    console.error('Error evaluating expression:', error);
    return {
      id: `eval-${Date.now()}`,
      expression,
      value: 'Error: Unable to evaluate',
      type: 'error',
      expandable: false,
      error: String(error),
    };
  }
}

// ============================================
// API FUNCTIONS - CALL STACK & VARIABLES
// ============================================

/**
 * Get call stack
 */
export async function getCallStack(sessionId: string): Promise<StackFrame[]> {
  try {
    const response = await fetch(`${API_BASE}/debug/${sessionId}/callstack`);
    if (!response.ok) throw new Error('Failed to get call stack');
    return await response.json();
  } catch (error) {
    console.error('Error getting call stack:', error);
    return getMockCallStack();
  }
}

/**
 * Get variables for a scope
 */
export async function getVariables(sessionId: string, frameId: string): Promise<Variable[]> {
  try {
    const response = await fetch(`${API_BASE}/debug/${sessionId}/variables/${frameId}`);
    if (!response.ok) throw new Error('Failed to get variables');
    return await response.json();
  } catch (error) {
    console.error('Error getting variables:', error);
    return getMockVariables();
  }
}

/**
 * Get threads
 */
export async function getThreads(sessionId: string): Promise<ThreadInfo[]> {
  try {
    const response = await fetch(`${API_BASE}/debug/${sessionId}/threads`);
    if (!response.ok) throw new Error('Failed to get threads');
    return await response.json();
  } catch (error) {
    console.error('Error getting threads:', error);
    return getMockThreads();
  }
}

/**
 * Set variable value
 */
export async function setVariableValue(
  sessionId: string,
  frameId: string,
  name: string,
  value: string
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/debug/${sessionId}/variables/${frameId}/set`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, value }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error setting variable value:', error);
    return false;
  }
}

// ============================================
// API FUNCTIONS - CONSOLE
// ============================================

/**
 * Get console entries
 */
export async function getConsoleEntries(sessionId: string): Promise<ConsoleEntry[]> {
  try {
    const response = await fetch(`${API_BASE}/debug/${sessionId}/console`);
    if (!response.ok) throw new Error('Failed to get console entries');
    return await response.json();
  } catch (error) {
    console.error('Error getting console entries:', error);
    return getMockConsoleEntries();
  }
}

/**
 * Execute console command
 */
export async function executeConsoleCommand(sessionId: string, command: string): Promise<ConsoleEntry> {
  try {
    const response = await fetch(`${API_BASE}/debug/${sessionId}/console/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    });
    if (!response.ok) throw new Error('Failed to execute command');
    return await response.json();
  } catch (error) {
    console.error('Error executing console command:', error);
    return {
      id: `console-${Date.now()}`,
      type: 'output',
      message: `> ${command}\nError: Unable to execute command`,
      timestamp: new Date(),
    };
  }
}

/**
 * Clear console
 */
export async function clearConsole(sessionId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/debug/${sessionId}/console/clear`, {
      method: 'POST',
    });
    return response.ok;
  } catch (error) {
    console.error('Error clearing console:', error);
    return true;
  }
}

// ============================================
// MOCK DATA FOR DEVELOPMENT
// ============================================

function getMockDebugSession(file: string = 'src/main.ts'): DebugSession {
  return {
    id: `session-${Date.now()}`,
    status: 'paused',
    file,
    line: 15,
    column: 1,
    startTime: new Date().toISOString(),
  };
}

function getMockBreakpoints(): Breakpoint[] {
  return [
    {
      id: 'bp-1',
      file: 'src/main.ts',
      line: 10,
      enabled: true,
      verified: true,
    },
    {
      id: 'bp-2',
      file: 'src/utils/helper.ts',
      line: 25,
      condition: 'count > 5',
      enabled: true,
      verified: true,
    },
    {
      id: 'bp-3',
      file: 'src/components/App.tsx',
      line: 42,
      enabled: false,
      verified: true,
    },
  ];
}

function getMockWatchExpressions(): WatchExpression[] {
  return [
    { id: 'watch-1', expression: 'user', value: '{ name: "John", age: 30 }', type: 'Object', expandable: true },
    { id: 'watch-2', expression: 'items.length', value: '5', type: 'number', expandable: false },
    { id: 'watch-3', expression: 'isLoading', value: 'false', type: 'boolean', expandable: false },
  ];
}

function getMockCallStack(): StackFrame[] {
  return [
    { id: 'frame-1', name: 'handleClick', file: 'src/components/Button.tsx', line: 15, column: 5, isAsync: false },
    { id: 'frame-2', name: 'processData', file: 'src/utils/data.ts', line: 42, column: 10, isAsync: true },
    { id: 'frame-3', name: 'fetchItems', file: 'src/api/items.ts', line: 28, column: 3, isAsync: true },
    { id: 'frame-4', name: 'main', file: 'src/main.ts', line: 10, column: 1, isAsync: false },
  ];
}

function getMockVariables(): Variable[] {
  return [
    { name: 'this', value: 'Component', type: 'Object', scope: 'local', expandable: true },
    { name: 'props', value: '{ onClick: fn, label: "Submit" }', type: 'Object', scope: 'local', expandable: true },
    { name: 'state', value: '{ count: 5, loading: false }', type: 'Object', scope: 'local', expandable: true },
    { name: 'i', value: '3', type: 'number', scope: 'block', expandable: false },
    { name: 'result', value: 'undefined', type: 'undefined', scope: 'local', expandable: false },
  ];
}

function getMockThreads(): ThreadInfo[] {
  return [
    {
      id: 'thread-1',
      name: 'Main Thread',
      state: 'paused',
      stackFrames: getMockCallStack(),
    },
    {
      id: 'thread-2',
      name: 'Worker 1',
      state: 'running',
      stackFrames: [],
    },
  ];
}

function getMockConsoleEntries(): ConsoleEntry[] {
  return [
    { id: 'console-1', type: 'info', message: 'Debug session started', timestamp: new Date(Date.now() - 60000) },
    { id: 'console-2', type: 'log', message: 'Application initialized', timestamp: new Date(Date.now() - 55000) },
    { id: 'console-3', type: 'warn', message: 'Deprecation warning: Use newMethod instead', timestamp: new Date(Date.now() - 30000) },
    { id: 'console-4', type: 'error', message: 'Failed to load resource', timestamp: new Date(Date.now() - 10000), stack: 'at loadResource (src/loader.ts:42)' },
  ];
}

export default {
  // Sessions
  startDebugSession,
  stopDebugSession,
  continueExecution,
  stepOver,
  stepInto,
  stepOut,
  restartDebugSession,
  // Breakpoints
  getBreakpoints,
  addBreakpoint,
  removeBreakpoint,
  toggleBreakpoint,
  updateBreakpointCondition,
  // Watch
  getWatchExpressions,
  addWatchExpression,
  removeWatchExpression,
  evaluateExpression,
  // Call Stack & Variables
  getCallStack,
  getVariables,
  getThreads,
  setVariableValue,
  // Console
  getConsoleEntries,
  executeConsoleCommand,
  clearConsole,
};
