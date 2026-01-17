/**
 * Task Manager App - Simple task/todo management application
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Circle, Plus, Trash2, Calendar,
  Clock, Flag, Search, Filter, LayoutGrid, List,
  ArrowLeft, MoreVertical, Edit2, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  starred: boolean;
  createdAt: string;
}

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Review project proposal',
    description: 'Go through the Q1 project proposal and provide feedback',
    completed: false,
    priority: 'high',
    dueDate: '2024-01-20',
    starred: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Update documentation',
    description: 'Update API documentation with new endpoints',
    completed: false,
    priority: 'medium',
    dueDate: '2024-01-22',
    starred: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Fix login bug',
    description: 'Investigate and fix the login timeout issue',
    completed: true,
    priority: 'high',
    starred: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Team meeting preparation',
    completed: false,
    priority: 'low',
    dueDate: '2024-01-19',
    starred: false,
    createdAt: new Date().toISOString(),
  },
];

const priorityColors = {
  low: 'text-gray-400 bg-gray-400/10',
  medium: 'text-yellow-400 bg-yellow-400/10',
  high: 'text-red-400 bg-red-400/10',
};

const TaskManagerApp: React.FC = () => {
  const navigate = useNavigate();
  const { closeLaunchedApp, siteModeSettings } = useAppStore();

  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      priority: 'medium',
      starred: false,
      createdAt: new Date().toISOString(),
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const toggleStar = (id: string) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, starred: !task.starred } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleBack = () => {
    closeLaunchedApp();
    if (siteModeSettings.mode === 'app') {
      navigate('/app-selector');
    } else {
      navigate('/dashboard');
    }
  };

  const filteredTasks = tasks
    .filter(task => {
      if (filter === 'active') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    })
    .filter(task =>
      searchQuery === '' ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    active: tasks.filter(t => !t.completed).length,
    starred: tasks.filter(t => t.starred).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900/20">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">Task Manager</h1>
                <p className="text-sm text-gray-400">Manage your tasks efficiently</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'text-white' },
            { label: 'Active', value: stats.active, color: 'text-blue-400' },
            { label: 'Completed', value: stats.completed, color: 'text-green-400' },
            { label: 'Starred', value: stats.starred, color: 'text-yellow-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Add Task */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleAddTask}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Task
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  filter === f
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                    : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <AnimatePresence mode="popLayout">
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-3'}>
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`bg-gray-800/50 border border-gray-700 rounded-xl p-4 group ${
                  task.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 flex-shrink-0"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-500 hover:text-blue-400 transition-colors" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                        {task.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-xs ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                    )}
                    {task.dueDate && (
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {task.dueDate}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleStar(task.id)}
                      className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                    >
                      <Star className={`w-4 h-4 ${task.starred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 hover:bg-red-500/20 rounded transition-colors text-gray-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No tasks found</h3>
            <p className="text-gray-400">
              {filter === 'all' ? 'Add a task to get started' : `No ${filter} tasks`}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default TaskManagerApp;
