/**
 * TasksRunner - Build, test, and development task execution
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Square, RefreshCw, Terminal, CheckCircle, XCircle,
  Clock, Trash2, Plus, Settings, ChevronDown, ChevronRight,
  FileCode, Zap, Package, TestTube, Hammer, Eye, MoreVertical
} from 'lucide-react';

export interface TaskConfig {
  id: string;
  name: string;
  command: string;
  cwd?: string;
  type: 'build' | 'test' | 'dev' | 'script' | 'custom';
  icon?: React.ElementType;
  isDefault?: boolean;
  autoRun?: boolean;
  problemMatcher?: string;
  env?: Record<string, string>;
}

export interface TaskExecution {
  id: string;
  taskId: string;
  taskName: string;
  status: 'running' | 'success' | 'error' | 'cancelled';
  startTime: string;
  endTime?: string;
  duration?: number;
  exitCode?: number;
  output: string[];
}

interface TasksRunnerProps {
  tasks: TaskConfig[];
  executions: TaskExecution[];
  activeExecution?: string;
  onRunTask: (taskId: string) => void;
  onStopTask: (executionId: string) => void;
  onRestartTask: (executionId: string) => void;
  onClearOutput: (executionId: string) => void;
  onCreateTask: (task: Omit<TaskConfig, 'id'>) => void;
  onDeleteTask: (taskId: string) => void;
  onSelectExecution: (executionId: string) => void;
}

const taskTypeIcons: Record<TaskConfig['type'], React.ElementType> = {
  build: Hammer,
  test: TestTube,
  dev: Zap,
  script: FileCode,
  custom: Terminal,
};

const taskTypeColors: Record<TaskConfig['type'], string> = {
  build: 'text-orange-400',
  test: 'text-green-400',
  dev: 'text-blue-400',
  script: 'text-purple-400',
  custom: 'text-gray-400',
};

const statusColors = {
  running: 'text-blue-400',
  success: 'text-green-400',
  error: 'text-red-400',
  cancelled: 'text-yellow-400',
};

const statusIcons = {
  running: RefreshCw,
  success: CheckCircle,
  error: XCircle,
  cancelled: Square,
};

export const TasksRunner: React.FC<TasksRunnerProps> = ({
  tasks,
  executions,
  activeExecution,
  onRunTask,
  onStopTask,
  onRestartTask,
  onClearOutput,
  onCreateTask,
  onDeleteTask,
  onSelectExecution,
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'output'>('tasks');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(
    new Set(['build', 'test', 'dev', 'script', 'custom'])
  );
  const [newTask, setNewTask] = useState<Omit<TaskConfig, 'id'>>({
    name: '',
    command: '',
    type: 'custom',
  });
  const outputRef = useRef<HTMLDivElement>(null);

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [executions, activeExecution]);

  // Group tasks by type
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.type]) acc[task.type] = [];
    acc[task.type].push(task);
    return acc;
  }, {} as Record<string, TaskConfig[]>);

  const toggleType = (type: string) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const handleCreateTask = () => {
    if (newTask.name && newTask.command) {
      onCreateTask(newTask);
      setNewTask({ name: '', command: '', type: 'custom' });
      setShowTaskForm(false);
    }
  };

  const currentExecution = executions.find((e) => e.id === activeExecution);

  const formatDuration = (ms?: number) => {
    if (!ms) return '0s';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  };

  const recentExecutions = [...executions].reverse().slice(0, 10);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4" />
          Tasks
        </h3>
        <button
          onClick={() => setShowTaskForm(!showTaskForm)}
          className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
          title="Add task"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 px-4 py-2 text-xs transition-colors ${
            activeTab === 'tasks'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('output')}
          className={`flex-1 px-4 py-2 text-xs transition-colors ${
            activeTab === 'output'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Output
        </button>
      </div>

      {/* New Task Form */}
      <AnimatePresence>
        {showTaskForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-gray-700 overflow-hidden"
          >
            <div className="p-3 space-y-2 bg-gray-800/50">
              <input
                type="text"
                value={newTask.name}
                onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                placeholder="Task name"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500"
              />
              <input
                type="text"
                value={newTask.command}
                onChange={(e) => setNewTask({ ...newTask, command: e.target.value })}
                placeholder="Command (e.g., npm run build)"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white font-mono placeholder-gray-500"
              />
              <div className="flex items-center gap-2">
                <select
                  value={newTask.type}
                  onChange={(e) => setNewTask({ ...newTask, type: e.target.value as TaskConfig['type'] })}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white"
                >
                  <option value="build">Build</option>
                  <option value="test">Test</option>
                  <option value="dev">Dev</option>
                  <option value="script">Script</option>
                  <option value="custom">Custom</option>
                </select>
                <button
                  onClick={handleCreateTask}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white"
                >
                  Create
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'tasks' ? (
          <div>
            {Object.entries(groupedTasks).map(([type, typeTasks]) => {
              const Icon = taskTypeIcons[type as TaskConfig['type']];
              const isExpanded = expandedTypes.has(type);

              return (
                <div key={type} className="border-b border-gray-800">
                  {/* Type Header */}
                  <button
                    onClick={() => toggleType(type)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800/50 text-left"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                    <Icon className={`w-4 h-4 ${taskTypeColors[type as TaskConfig['type']]}`} />
                    <span className="text-sm text-gray-300 capitalize flex-1">{type}</span>
                    <span className="text-xs text-gray-500">{typeTasks.length}</span>
                  </button>

                  {/* Tasks */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        {typeTasks.map((task) => {
                          const runningExecution = executions.find(
                            (e) => e.taskId === task.id && e.status === 'running'
                          );

                          return (
                            <div
                              key={task.id}
                              className="group flex items-center gap-2 px-3 py-2 pl-10 hover:bg-gray-800/50"
                            >
                              <span className="flex-1 text-sm text-gray-300">{task.name}</span>
                              <code className="hidden group-hover:block text-xs text-gray-500 font-mono truncate max-w-[150px]">
                                {task.command}
                              </code>
                              <div className="flex items-center gap-1">
                                {runningExecution ? (
                                  <button
                                    onClick={() => onStopTask(runningExecution.id)}
                                    className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                                    title="Stop"
                                  >
                                    <Square className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => onRunTask(task.id)}
                                    className="p-1 text-green-400 hover:bg-green-500/20 rounded"
                                    title="Run"
                                  >
                                    <Play className="w-4 h-4" />
                                  </button>
                                )}
                                {!task.isDefault && (
                                  <button
                                    onClick={() => onDeleteTask(task.id)}
                                    className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded opacity-0 group-hover:opacity-100"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <Terminal className="w-8 h-8 mb-2" />
                <span className="text-sm">No tasks configured</span>
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="mt-2 text-xs text-blue-400 hover:underline"
                >
                  Add a task
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Execution List */}
            <div className="border-b border-gray-700">
              <div className="flex overflow-x-auto">
                {recentExecutions.map((execution) => {
                  const StatusIcon = statusIcons[execution.status];
                  return (
                    <button
                      key={execution.id}
                      onClick={() => onSelectExecution(execution.id)}
                      className={`flex items-center gap-2 px-3 py-2 border-r border-gray-700 whitespace-nowrap ${
                        activeExecution === execution.id ? 'bg-gray-800' : 'hover:bg-gray-800/50'
                      }`}
                    >
                      <StatusIcon
                        className={`w-3.5 h-3.5 ${statusColors[execution.status]} ${
                          execution.status === 'running' ? 'animate-spin' : ''
                        }`}
                      />
                      <span className="text-xs text-gray-300">{execution.taskName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Output Area */}
            <div className="flex-1 flex flex-col">
              {currentExecution ? (
                <>
                  {/* Execution Header */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700 bg-gray-800/50">
                    <div className="flex items-center gap-2">
                      {React.createElement(statusIcons[currentExecution.status], {
                        className: `w-4 h-4 ${statusColors[currentExecution.status]} ${
                          currentExecution.status === 'running' ? 'animate-spin' : ''
                        }`,
                      })}
                      <span className="text-sm text-white">{currentExecution.taskName}</span>
                      {currentExecution.exitCode !== undefined && (
                        <span className="text-xs text-gray-500">
                          Exit code: {currentExecution.exitCode}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatDuration(currentExecution.duration)}
                      </span>
                      {currentExecution.status === 'running' ? (
                        <button
                          onClick={() => onStopTask(currentExecution.id)}
                          className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                          title="Stop"
                        >
                          <Square className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onRestartTask(currentExecution.id)}
                          className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                          title="Restart"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onClearOutput(currentExecution.id)}
                        className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                        title="Clear output"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Output Content */}
                  <div
                    ref={outputRef}
                    className="flex-1 overflow-auto p-3 bg-gray-900 font-mono text-xs"
                  >
                    {currentExecution.output.map((line, i) => (
                      <div
                        key={i}
                        className={`whitespace-pre-wrap ${
                          line.startsWith('error') || line.includes('Error')
                            ? 'text-red-400'
                            : line.startsWith('warning') || line.includes('Warning')
                            ? 'text-yellow-400'
                            : line.startsWith('✓') || line.includes('success')
                            ? 'text-green-400'
                            : 'text-gray-300'
                        }`}
                      >
                        {line}
                      </div>
                    ))}
                    {currentExecution.status === 'running' && (
                      <div className="flex items-center gap-2 text-gray-500 mt-2">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        Running...
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Terminal className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <span className="text-sm">No task output</span>
                    <p className="text-xs mt-1">Run a task to see output here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer - Quick Run */}
      <div className="px-3 py-2 border-t border-gray-700">
        <div className="flex gap-2">
          {tasks.filter((t) => t.isDefault).slice(0, 3).map((task) => {
            const Icon = taskTypeIcons[task.type];
            const isRunning = executions.some(
              (e) => e.taskId === task.id && e.status === 'running'
            );
            return (
              <button
                key={task.id}
                onClick={() => (isRunning ? undefined : onRunTask(task.id))}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded text-xs transition-colors ${
                  isRunning
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-600/50'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {isRunning ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
                {task.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TasksRunner;
