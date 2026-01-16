/**
 * CallStackPanel - Display execution call stack during debugging
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Layers, FileCode, RefreshCw, ChevronDown, ChevronRight,
  Play, Pause, SkipForward, CornerDownRight, CornerUpRight,
  Square, AlertCircle
} from 'lucide-react';

export interface StackFrame {
  id: string;
  name: string;
  source: string;
  line: number;
  column: number;
  isAsync?: boolean;
  isNative?: boolean;
  isExternal?: boolean;
  moduleId?: string;
}

export interface Thread {
  id: string;
  name: string;
  status: 'running' | 'paused' | 'stopped';
  frames: StackFrame[];
}

interface CallStackPanelProps {
  threads: Thread[];
  activeThreadId?: string;
  activeFrameId?: string;
  onFrameSelect: (threadId: string, frameId: string) => void;
  onThreadSelect: (threadId: string) => void;
  onStepOver: () => void;
  onStepInto: () => void;
  onStepOut: () => void;
  onContinue: () => void;
  onPause: () => void;
  onRestart: () => void;
  onStop: () => void;
  isDebugging?: boolean;
}

const statusColors = {
  running: 'text-green-400',
  paused: 'text-yellow-400',
  stopped: 'text-gray-400',
};

export const CallStackPanel: React.FC<CallStackPanelProps> = ({
  threads,
  activeThreadId,
  activeFrameId,
  onFrameSelect,
  onThreadSelect,
  onStepOver,
  onStepInto,
  onStepOut,
  onContinue,
  onPause,
  onRestart,
  onStop,
  isDebugging = false,
}) => {
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(
    new Set(threads.map((t) => t.id))
  );

  const toggleThread = (threadId: string) => {
    setExpandedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(threadId)) next.delete(threadId);
      else next.add(threadId);
      return next;
    });
  };

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const isPaused = activeThread?.status === 'paused';

  const getFileName = (source: string) => source.split('/').pop() || source;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Call Stack
        </h3>
      </div>

      {/* Debug Controls */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-700 bg-gray-800/50">
        {isPaused ? (
          <button
            onClick={onContinue}
            disabled={!isDebugging}
            className="p-1.5 text-green-400 hover:bg-gray-700 rounded disabled:opacity-50"
            title="Continue (F5)"
          >
            <Play className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onPause}
            disabled={!isDebugging}
            className="p-1.5 text-yellow-400 hover:bg-gray-700 rounded disabled:opacity-50"
            title="Pause (F6)"
          >
            <Pause className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onStepOver}
          disabled={!isDebugging || !isPaused}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded disabled:opacity-50"
          title="Step Over (F10)"
        >
          <SkipForward className="w-4 h-4" />
        </button>
        <button
          onClick={onStepInto}
          disabled={!isDebugging || !isPaused}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded disabled:opacity-50"
          title="Step Into (F11)"
        >
          <CornerDownRight className="w-4 h-4" />
        </button>
        <button
          onClick={onStepOut}
          disabled={!isDebugging || !isPaused}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded disabled:opacity-50"
          title="Step Out (Shift+F11)"
        >
          <CornerUpRight className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-gray-700 mx-1" />
        <button
          onClick={onRestart}
          disabled={!isDebugging}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded disabled:opacity-50"
          title="Restart (Ctrl+Shift+F5)"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={onStop}
          disabled={!isDebugging}
          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded disabled:opacity-50"
          title="Stop (Shift+F5)"
        >
          <Square className="w-4 h-4" />
        </button>
      </div>

      {/* Threads & Frames */}
      <div className="flex-1 overflow-auto">
        {!isDebugging ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Layers className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">Not debugging</p>
            <p className="text-xs text-gray-600 mt-1">
              Start a debug session to see the call stack
            </p>
          </div>
        ) : threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <AlertCircle className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-sm text-gray-400">No threads</p>
          </div>
        ) : (
          threads.map((thread) => {
            const isExpanded = expandedThreads.has(thread.id);
            const isActive = thread.id === activeThreadId;

            return (
              <div key={thread.id} className="border-b border-gray-800">
                {/* Thread Header */}
                <button
                  onClick={() => {
                    toggleThread(thread.id);
                    onThreadSelect(thread.id);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800/50 text-left ${
                    isActive ? 'bg-blue-500/10' : ''
                  }`}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  <span className={`w-2 h-2 rounded-full ${
                    thread.status === 'running' ? 'bg-green-400' :
                    thread.status === 'paused' ? 'bg-yellow-400' : 'bg-gray-500'
                  }`} />
                  <span className="text-sm text-white flex-1">{thread.name}</span>
                  <span className={`text-xs ${statusColors[thread.status]}`}>
                    {thread.status}
                  </span>
                </button>

                {/* Stack Frames */}
                {isExpanded && thread.frames.length > 0 && (
                  <div className="pb-1">
                    {thread.frames.map((frame, index) => {
                      const isActiveFrame = frame.id === activeFrameId;

                      return (
                        <motion.div
                          key={frame.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          onClick={() => onFrameSelect(thread.id, frame.id)}
                          className={`flex items-start gap-2 px-3 py-1.5 ml-4 cursor-pointer hover:bg-gray-800/50 ${
                            isActiveFrame ? 'bg-blue-500/20 border-l-2 border-blue-500' : ''
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm ${
                                isActiveFrame ? 'text-white' : 'text-gray-300'
                              } ${frame.isNative || frame.isExternal ? 'italic' : ''}`}>
                                {frame.name}
                              </span>
                              {frame.isAsync && (
                                <span className="px-1 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                                  async
                                </span>
                              )}
                              {frame.isNative && (
                                <span className="px-1 py-0.5 bg-gray-700 text-gray-400 text-xs rounded">
                                  native
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <FileCode className="w-3 h-3" />
                              <span className="truncate">{getFileName(frame.source)}</span>
                              <span>:{frame.line}</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {isExpanded && thread.frames.length === 0 && (
                  <div className="px-7 py-2 text-xs text-gray-500 italic">
                    No frames available
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-gray-700 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>
            {threads.length} thread{threads.length !== 1 ? 's' : ''}
          </span>
          {activeThread && (
            <span className={statusColors[activeThread.status]}>
              {activeThread.name}: {activeThread.status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallStackPanel;
