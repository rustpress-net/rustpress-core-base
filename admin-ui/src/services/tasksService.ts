/**
 * Tasks Service
 * Handles task execution: build, test, dev server, custom scripts
 */

const API_BASE = '/api/v1';

// ============================================
// TYPES
// ============================================

export interface TaskConfig {
  id: string;
  name: string;
  type: 'build' | 'test' | 'dev' | 'lint' | 'format' | 'custom';
  command: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  group?: 'build' | 'test' | 'none';
  problemMatcher?: string;
  isDefault?: boolean;
  presentation?: {
    reveal: 'always' | 'silent' | 'never';
    panel: 'shared' | 'dedicated' | 'new';
    showReuseMessage: boolean;
    clear: boolean;
  };
  runOptions?: {
    runOn?: 'default' | 'folderOpen';
    instanceLimit?: number;
  };
}

export interface TaskExecution {
  id: string;
  taskId: string;
  taskName: string;
  status: 'queued' | 'running' | 'success' | 'error' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  exitCode?: number;
  output: TaskOutput[];
  pid?: number;
}

export interface TaskOutput {
  id: string;
  type: 'stdout' | 'stderr' | 'info' | 'error';
  content: string;
  timestamp: Date;
  line?: number;
}

export interface TaskProblem {
  id: string;
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  source: string;
  code?: string;
}

export interface TaskTerminal {
  id: string;
  name: string;
  cwd: string;
  isActive: boolean;
  executions: TaskExecution[];
}

// ============================================
// API FUNCTIONS - TASKS CONFIG
// ============================================

/**
 * Get all configured tasks
 */
export async function getTasks(): Promise<TaskConfig[]> {
  try {
    const response = await fetch(`${API_BASE}/tasks`);
    if (!response.ok) throw new Error('Failed to get tasks');
    return await response.json();
  } catch (error) {
    console.error('Error getting tasks:', error);
    return getMockTasks();
  }
}

/**
 * Get a specific task
 */
export async function getTask(id: string): Promise<TaskConfig | null> {
  try {
    const response = await fetch(`${API_BASE}/tasks/${id}`);
    if (!response.ok) throw new Error('Failed to get task');
    return await response.json();
  } catch (error) {
    console.error('Error getting task:', error);
    return null;
  }
}

/**
 * Create a new task
 */
export async function createTask(task: Omit<TaskConfig, 'id'>): Promise<TaskConfig> {
  try {
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!response.ok) throw new Error('Failed to create task');
    return await response.json();
  } catch (error) {
    console.error('Error creating task:', error);
    return {
      id: `task-${Date.now()}`,
      ...task,
    };
  }
}

/**
 * Update a task
 */
export async function updateTask(id: string, updates: Partial<TaskConfig>): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return response.ok;
  } catch (error) {
    console.error('Error updating task:', error);
    return true;
  }
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting task:', error);
    return true;
  }
}

// ============================================
// API FUNCTIONS - TASK EXECUTION
// ============================================

/**
 * Run a task
 */
export async function runTask(taskId: string): Promise<TaskExecution> {
  try {
    const response = await fetch(`${API_BASE}/tasks/${taskId}/run`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to run task');
    return await response.json();
  } catch (error) {
    console.error('Error running task:', error);
    return getMockTaskExecution(taskId);
  }
}

/**
 * Run a task with custom arguments
 */
export async function runTaskWithArgs(taskId: string, args: string[]): Promise<TaskExecution> {
  try {
    const response = await fetch(`${API_BASE}/tasks/${taskId}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ args }),
    });
    if (!response.ok) throw new Error('Failed to run task');
    return await response.json();
  } catch (error) {
    console.error('Error running task with args:', error);
    return getMockTaskExecution(taskId);
  }
}

/**
 * Run a command directly
 */
export async function runCommand(command: string, cwd?: string): Promise<TaskExecution> {
  try {
    const response = await fetch(`${API_BASE}/tasks/run-command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, cwd }),
    });
    if (!response.ok) throw new Error('Failed to run command');
    return await response.json();
  } catch (error) {
    console.error('Error running command:', error);
    return getMockTaskExecution('custom', command);
  }
}

/**
 * Stop a running task
 */
export async function stopTask(executionId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/tasks/executions/${executionId}/stop`, {
      method: 'POST',
    });
    return response.ok;
  } catch (error) {
    console.error('Error stopping task:', error);
    return true;
  }
}

/**
 * Restart a task
 */
export async function restartTask(executionId: string): Promise<TaskExecution> {
  try {
    const response = await fetch(`${API_BASE}/tasks/executions/${executionId}/restart`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to restart task');
    return await response.json();
  } catch (error) {
    console.error('Error restarting task:', error);
    return getMockTaskExecution('restart');
  }
}

/**
 * Get task execution status
 */
export async function getExecutionStatus(executionId: string): Promise<TaskExecution> {
  try {
    const response = await fetch(`${API_BASE}/tasks/executions/${executionId}`);
    if (!response.ok) throw new Error('Failed to get execution status');
    return await response.json();
  } catch (error) {
    console.error('Error getting execution status:', error);
    return getMockTaskExecution('unknown');
  }
}

/**
 * Get all running executions
 */
export async function getRunningExecutions(): Promise<TaskExecution[]> {
  try {
    const response = await fetch(`${API_BASE}/tasks/executions?status=running`);
    if (!response.ok) throw new Error('Failed to get running executions');
    return await response.json();
  } catch (error) {
    console.error('Error getting running executions:', error);
    return [];
  }
}

/**
 * Get execution history
 */
export async function getExecutionHistory(limit: number = 20): Promise<TaskExecution[]> {
  try {
    const response = await fetch(`${API_BASE}/tasks/executions/history?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to get execution history');
    return await response.json();
  } catch (error) {
    console.error('Error getting execution history:', error);
    return getMockExecutionHistory();
  }
}

/**
 * Clear execution history
 */
export async function clearExecutionHistory(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/tasks/executions/history`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Error clearing execution history:', error);
    return true;
  }
}

// ============================================
// API FUNCTIONS - OUTPUT & PROBLEMS
// ============================================

/**
 * Get task output
 */
export async function getTaskOutput(executionId: string): Promise<TaskOutput[]> {
  try {
    const response = await fetch(`${API_BASE}/tasks/executions/${executionId}/output`);
    if (!response.ok) throw new Error('Failed to get task output');
    return await response.json();
  } catch (error) {
    console.error('Error getting task output:', error);
    return getMockTaskOutput();
  }
}

/**
 * Stream task output (for real-time updates)
 */
export function streamTaskOutput(
  executionId: string,
  onOutput: (output: TaskOutput) => void
): () => void {
  // Create EventSource for SSE
  try {
    const eventSource = new EventSource(`${API_BASE}/tasks/executions/${executionId}/stream`);

    eventSource.onmessage = (event) => {
      try {
        const output = JSON.parse(event.data) as TaskOutput;
        onOutput(output);
      } catch (e) {
        console.error('Error parsing task output:', e);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    // Return cleanup function
    return () => eventSource.close();
  } catch (error) {
    console.error('Error streaming task output:', error);
    // Simulate output for development
    const interval = setInterval(() => {
      onOutput({
        id: `output-${Date.now()}`,
        type: 'stdout',
        content: `[${new Date().toISOString()}] Task running...`,
        timestamp: new Date(),
      });
    }, 1000);

    return () => clearInterval(interval);
  }
}

/**
 * Get problems detected from task output
 */
export async function getTaskProblems(executionId: string): Promise<TaskProblem[]> {
  try {
    const response = await fetch(`${API_BASE}/tasks/executions/${executionId}/problems`);
    if (!response.ok) throw new Error('Failed to get task problems');
    return await response.json();
  } catch (error) {
    console.error('Error getting task problems:', error);
    return getMockTaskProblems();
  }
}

// ============================================
// API FUNCTIONS - TERMINALS
// ============================================

/**
 * Get all task terminals
 */
export async function getTerminals(): Promise<TaskTerminal[]> {
  try {
    const response = await fetch(`${API_BASE}/tasks/terminals`);
    if (!response.ok) throw new Error('Failed to get terminals');
    return await response.json();
  } catch (error) {
    console.error('Error getting terminals:', error);
    return getMockTerminals();
  }
}

/**
 * Create a new terminal
 */
export async function createTerminal(name?: string, cwd?: string): Promise<TaskTerminal> {
  try {
    const response = await fetch(`${API_BASE}/tasks/terminals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, cwd }),
    });
    if (!response.ok) throw new Error('Failed to create terminal');
    return await response.json();
  } catch (error) {
    console.error('Error creating terminal:', error);
    return {
      id: `term-${Date.now()}`,
      name: name || 'Terminal',
      cwd: cwd || '/',
      isActive: true,
      executions: [],
    };
  }
}

/**
 * Close a terminal
 */
export async function closeTerminal(terminalId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/tasks/terminals/${terminalId}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Error closing terminal:', error);
    return true;
  }
}

// ============================================
// MOCK DATA FOR DEVELOPMENT
// ============================================

function getMockTasks(): TaskConfig[] {
  return [
    {
      id: 'task-build',
      name: 'Build',
      type: 'build',
      command: 'npm run build',
      group: 'build',
      isDefault: true,
      presentation: {
        reveal: 'always',
        panel: 'dedicated',
        showReuseMessage: true,
        clear: false,
      },
    },
    {
      id: 'task-test',
      name: 'Test',
      type: 'test',
      command: 'npm test',
      group: 'test',
      problemMatcher: '$tsc',
    },
    {
      id: 'task-dev',
      name: 'Dev Server',
      type: 'dev',
      command: 'npm run dev',
      group: 'build',
      presentation: {
        reveal: 'always',
        panel: 'dedicated',
        showReuseMessage: false,
        clear: true,
      },
    },
    {
      id: 'task-lint',
      name: 'Lint',
      type: 'lint',
      command: 'npm run lint',
      group: 'none',
    },
    {
      id: 'task-format',
      name: 'Format',
      type: 'format',
      command: 'npm run format',
      group: 'none',
    },
    {
      id: 'task-cargo-build',
      name: 'Cargo Build',
      type: 'build',
      command: 'cargo build --release',
      cwd: '.',
      group: 'build',
    },
    {
      id: 'task-cargo-test',
      name: 'Cargo Test',
      type: 'test',
      command: 'cargo test',
      cwd: '.',
      group: 'test',
    },
  ];
}

function getMockTaskExecution(taskId: string, taskName?: string): TaskExecution {
  return {
    id: `exec-${Date.now()}`,
    taskId,
    taskName: taskName || 'Task',
    status: 'running',
    startTime: new Date(),
    output: [
      {
        id: `out-1`,
        type: 'info',
        content: `Starting task: ${taskName || taskId}`,
        timestamp: new Date(),
      },
    ],
  };
}

function getMockExecutionHistory(): TaskExecution[] {
  return [
    {
      id: 'exec-1',
      taskId: 'task-build',
      taskName: 'Build',
      status: 'success',
      startTime: new Date(Date.now() - 3600000),
      endTime: new Date(Date.now() - 3590000),
      exitCode: 0,
      output: [],
    },
    {
      id: 'exec-2',
      taskId: 'task-test',
      taskName: 'Test',
      status: 'error',
      startTime: new Date(Date.now() - 7200000),
      endTime: new Date(Date.now() - 7180000),
      exitCode: 1,
      output: [],
    },
    {
      id: 'exec-3',
      taskId: 'task-lint',
      taskName: 'Lint',
      status: 'success',
      startTime: new Date(Date.now() - 86400000),
      endTime: new Date(Date.now() - 86395000),
      exitCode: 0,
      output: [],
    },
  ];
}

function getMockTaskOutput(): TaskOutput[] {
  return [
    { id: 'out-1', type: 'info', content: '> npm run build', timestamp: new Date(Date.now() - 10000) },
    { id: 'out-2', type: 'stdout', content: 'Building project...', timestamp: new Date(Date.now() - 9000) },
    { id: 'out-3', type: 'stdout', content: 'Compiling TypeScript...', timestamp: new Date(Date.now() - 8000) },
    { id: 'out-4', type: 'stdout', content: 'Bundling with Vite...', timestamp: new Date(Date.now() - 5000) },
    { id: 'out-5', type: 'stdout', content: 'Build complete!', timestamp: new Date(Date.now() - 1000) },
  ];
}

function getMockTaskProblems(): TaskProblem[] {
  return [
    {
      id: 'prob-1',
      file: 'src/components/App.tsx',
      line: 42,
      column: 15,
      severity: 'error',
      message: "Property 'name' does not exist on type '{}'",
      source: 'typescript',
      code: 'TS2339',
    },
    {
      id: 'prob-2',
      file: 'src/utils/helper.ts',
      line: 18,
      column: 10,
      severity: 'warning',
      message: "Variable 'unused' is declared but never used",
      source: 'typescript',
      code: 'TS6133',
    },
  ];
}

function getMockTerminals(): TaskTerminal[] {
  return [
    {
      id: 'term-1',
      name: 'Build',
      cwd: '/project',
      isActive: true,
      executions: [],
    },
    {
      id: 'term-2',
      name: 'Dev Server',
      cwd: '/project',
      isActive: false,
      executions: [],
    },
  ];
}

export default {
  // Tasks Config
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  // Task Execution
  runTask,
  runTaskWithArgs,
  runCommand,
  stopTask,
  restartTask,
  getExecutionStatus,
  getRunningExecutions,
  getExecutionHistory,
  clearExecutionHistory,
  // Output & Problems
  getTaskOutput,
  streamTaskOutput,
  getTaskProblems,
  // Terminals
  getTerminals,
  createTerminal,
  closeTerminal,
};
