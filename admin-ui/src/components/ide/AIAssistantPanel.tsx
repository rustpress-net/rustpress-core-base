/**
 * AIAssistantPanel - AI-powered coding assistant
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, Copy, Check, ThumbsUp, ThumbsDown, RefreshCw,
  Code, MessageSquare, FileCode, Lightbulb, Bug, Wand2,
  ChevronDown, X, Settings, Trash2, Plus, Zap
} from 'lucide-react';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  codeBlocks?: { language: string; code: string }[];
  feedback?: 'positive' | 'negative';
  isStreaming?: boolean;
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  context?: {
    file?: string;
    selection?: string;
    language?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AISettings {
  model: string;
  temperature: number;
  maxTokens: number;
  contextWindow: number;
  autoComplete: boolean;
  suggestFixes: boolean;
}

interface AIAssistantPanelProps {
  conversations: AIConversation[];
  activeConversation?: string;
  settings: AISettings;
  isConnected?: boolean;
  isProcessing?: boolean;
  currentFile?: string;
  selectedCode?: string;
  onSendMessage: (message: string, context?: AIMessage['codeBlocks']) => void;
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onFeedback: (messageId: string, feedback: 'positive' | 'negative') => void;
  onCopyCode: (code: string) => void;
  onInsertCode: (code: string) => void;
  onSettingsChange: (settings: AISettings) => void;
  onRegenerateResponse: (messageId: string) => void;
}

const quickActions = [
  { id: 'explain', icon: MessageSquare, label: 'Explain', prompt: 'Explain this code:' },
  { id: 'improve', icon: Wand2, label: 'Improve', prompt: 'Improve this code:' },
  { id: 'fix', icon: Bug, label: 'Fix Bug', prompt: 'Find and fix bugs in this code:' },
  { id: 'document', icon: FileCode, label: 'Document', prompt: 'Add documentation to this code:' },
  { id: 'optimize', icon: Zap, label: 'Optimize', prompt: 'Optimize this code for performance:' },
  { id: 'test', icon: Lightbulb, label: 'Write Tests', prompt: 'Write unit tests for this code:' },
];

const models = [
  { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
  { id: 'claude-3', name: 'Claude 3', description: 'Anthropic\'s latest' },
  { id: 'codellama', name: 'Code Llama', description: 'Open source, code-focused' },
];

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  conversations,
  activeConversation,
  settings,
  isConnected = true,
  isProcessing = false,
  currentFile,
  selectedCode,
  onSendMessage,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  onFeedback,
  onCopyCode,
  onInsertCode,
  onSettingsChange,
  onRegenerateResponse,
}) => {
  const [message, setMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const currentConvo = conversations.find((c) => c.id === activeConversation);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConvo?.messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !isProcessing) {
      const codeContext = selectedCode
        ? [{ language: currentConvo?.context?.language || 'plaintext', code: selectedCode }]
        : undefined;
      onSendMessage(message.trim(), codeContext);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action: (typeof quickActions)[0]) => {
    const prompt = selectedCode
      ? `${action.prompt}\n\n\`\`\`\n${selectedCode}\n\`\`\``
      : action.prompt;
    setMessage(prompt);
    inputRef.current?.focus();
  };

  const handleCopyCode = (code: string) => {
    onCopyCode(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const updateSetting = <K extends keyof AISettings>(key: K, value: AISettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            AI Assistant
          </h3>
          {!isConnected && (
            <span className="px-1.5 py-0.5 bg-red-500/20 rounded text-xs text-red-400">
              Offline
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-1 rounded ${showHistory ? 'text-blue-400 bg-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
            title="Conversation history"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={onNewConversation}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
            title="New conversation"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1 rounded ${showSettings ? 'text-blue-400 bg-blue-500/20' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Conversation History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 200, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="absolute left-0 top-0 bottom-0 bg-gray-800 border-r border-gray-700 z-10 overflow-hidden"
          >
            <div className="p-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-400">History</span>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-1 text-gray-400 hover:text-white rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1">
                {conversations.map((convo) => (
                  <div
                    key={convo.id}
                    className={`group flex items-center gap-2 p-2 rounded cursor-pointer ${
                      activeConversation === convo.id
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'hover:bg-gray-700 text-gray-300'
                    }`}
                    onClick={() => onSelectConversation(convo.id)}
                  >
                    <MessageSquare className="w-3 h-3 flex-shrink-0" />
                    <span className="flex-1 text-xs truncate">{convo.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(convo.id);
                      }}
                      className="p-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Model</label>
                <select
                  value={settings.model}
                  onChange={(e) => updateSetting('model', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white"
                >
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <label className="text-xs text-gray-400">Temperature</label>
                  <span className="text-xs text-gray-500">{settings.temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => updateSetting('temperature', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoComplete}
                  onChange={(e) => updateSetting('autoComplete', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-500"
                />
                Enable auto-complete suggestions
              </label>

              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.suggestFixes}
                  onChange={(e) => updateSetting('suggestFixes', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-purple-500"
                />
                Auto-suggest fixes for errors
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      {selectedCode && (
        <div className="px-3 py-2 border-b border-gray-700 bg-purple-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs text-purple-400">Code selected</span>
            <span className="text-xs text-gray-500">
              ({selectedCode.split('\n').length} lines)
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300"
              >
                <action.icon className="w-3 h-3" />
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-auto p-3 space-y-4">
        {currentConvo?.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user'
                  ? 'bg-blue-600'
                  : msg.role === 'assistant'
                  ? 'bg-purple-600'
                  : 'bg-gray-600'
              }`}
            >
              {msg.role === 'user' ? (
                <span className="text-xs font-medium text-white">You</span>
              ) : (
                <Sparkles className="w-4 h-4 text-white" />
              )}
            </div>

            {/* Message Content */}
            <div
              className={`flex-1 ${msg.role === 'user' ? 'text-right' : ''}`}
            >
              <div
                className={`inline-block max-w-[85%] p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-800 text-gray-200 rounded-bl-none'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                {/* Code Blocks */}
                {msg.codeBlocks?.map((block, i) => (
                  <div key={i} className="mt-3 relative">
                    <div className="flex items-center justify-between px-3 py-1 bg-gray-900 rounded-t text-xs text-gray-400">
                      <span>{block.language}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyCode(block.code)}
                          className="p-1 hover:text-white"
                          title="Copy"
                        >
                          {copiedCode === block.code ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <button
                          onClick={() => onInsertCode(block.code)}
                          className="p-1 hover:text-white"
                          title="Insert at cursor"
                        >
                          <Code className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <pre className="p-3 bg-gray-900 rounded-b text-xs font-mono overflow-x-auto">
                      <code>{block.code}</code>
                    </pre>
                  </div>
                ))}

                {/* Streaming indicator */}
                {msg.isStreaming && (
                  <span className="inline-flex items-center gap-1 mt-2 text-xs text-gray-400">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Generating...
                  </span>
                )}
              </div>

              {/* Message Actions */}
              {msg.role === 'assistant' && !msg.isStreaming && (
                <div className="flex items-center gap-2 mt-1 ml-1">
                  <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                  <button
                    onClick={() => onFeedback(msg.id, 'positive')}
                    className={`p-1 rounded ${
                      msg.feedback === 'positive'
                        ? 'text-green-400'
                        : 'text-gray-500 hover:text-green-400'
                    }`}
                    title="Good response"
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onFeedback(msg.id, 'negative')}
                    className={`p-1 rounded ${
                      msg.feedback === 'negative'
                        ? 'text-red-400'
                        : 'text-gray-500 hover:text-red-400'
                    }`}
                    title="Poor response"
                  >
                    <ThumbsDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onRegenerateResponse(msg.id)}
                    className="p-1 text-gray-500 hover:text-white rounded"
                    title="Regenerate"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {(!currentConvo || currentConvo.messages.length === 0) && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Sparkles className="w-12 h-12 mb-3 text-purple-400/50" />
            <h4 className="text-sm font-medium text-gray-400 mb-1">AI Assistant</h4>
            <p className="text-xs text-center max-w-[200px]">
              Ask questions about your code, get suggestions, or let me help you write better code.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {quickActions.slice(0, 3).map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300"
                >
                  <action.icon className="w-3 h-3" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-3 py-2 border-t border-gray-700">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the AI assistant..."
            rows={1}
            className="w-full px-3 py-2 pr-12 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim() || isProcessing}
            className="absolute right-2 bottom-2 p-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 rounded-lg transition-colors"
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
        <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {settings.model}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPanel;
