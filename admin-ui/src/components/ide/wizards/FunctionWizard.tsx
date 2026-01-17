/**
 * FunctionWizard - Step-by-step wizard for creating serverless functions
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, ChevronLeft, Check, Zap, Code,
  Globe, Clock, Database, Shield, FileCode, FolderPlus,
  Terminal, Eye, Sparkles, Lock, Webhook, Server,
  Cloud, Timer, Key, RefreshCw
} from 'lucide-react';

interface FunctionConfig {
  name: string;
  slug: string;
  description: string;
  runtime: 'rust' | 'typescript' | 'python';
  trigger: 'http' | 'cron' | 'webhook' | 'event';
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'ANY';
  httpPath?: string;
  cronSchedule?: string;
  eventType?: string;
  timeout: number;
  memory: number;
  environment: { key: string; value: string }[];
  authentication: 'none' | 'api-key' | 'jwt' | 'oauth';
  cors: boolean;
  logging: boolean;
  retries: number;
}

interface FunctionWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (config: FunctionConfig) => void;
}

const runtimes = [
  { id: 'rust', name: 'Rust', description: 'High performance, low latency', icon: '🦀', color: 'orange' },
  { id: 'typescript', name: 'TypeScript', description: 'Modern JavaScript with types', icon: '📘', color: 'blue' },
  { id: 'python', name: 'Python', description: 'Easy scripting & AI/ML', icon: '🐍', color: 'green' },
];

const triggers = [
  { id: 'http', name: 'HTTP Endpoint', description: 'REST API endpoint', icon: Globe },
  { id: 'cron', name: 'Scheduled', description: 'Run on a schedule', icon: Clock },
  { id: 'webhook', name: 'Webhook', description: 'External webhook trigger', icon: Webhook },
  { id: 'event', name: 'Event', description: 'Internal event trigger', icon: Zap },
];

const cronPresets = [
  { value: '0 * * * *', label: 'Every hour' },
  { value: '0 0 * * *', label: 'Daily at midnight' },
  { value: '0 0 * * 0', label: 'Weekly on Sunday' },
  { value: '0 0 1 * *', label: 'Monthly on the 1st' },
  { value: '*/5 * * * *', label: 'Every 5 minutes' },
  { value: '*/15 * * * *', label: 'Every 15 minutes' },
];

const eventTypes = [
  'content.created', 'content.updated', 'content.deleted',
  'user.registered', 'user.login', 'user.logout',
  'order.placed', 'order.completed', 'order.cancelled',
  'comment.posted', 'form.submitted'
];

const authMethods = [
  { id: 'none', name: 'None', description: 'Public access', icon: Globe },
  { id: 'api-key', name: 'API Key', description: 'Simple key authentication', icon: Key },
  { id: 'jwt', name: 'JWT Token', description: 'Bearer token authentication', icon: Lock },
  { id: 'oauth', name: 'OAuth 2.0', description: 'Full OAuth flow', icon: Shield },
];

export const FunctionWizard: React.FC<FunctionWizardProps> = ({ isOpen, onClose, onCreate }) => {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<FunctionConfig>({
    name: '',
    slug: '',
    description: '',
    runtime: 'rust',
    trigger: 'http',
    httpMethod: 'GET',
    httpPath: '/api/my-function',
    cronSchedule: '0 * * * *',
    eventType: 'content.created',
    timeout: 30,
    memory: 128,
    environment: [],
    authentication: 'none',
    cors: true,
    logging: true,
    retries: 3,
  });

  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvValue, setNewEnvValue] = useState('');

  const steps = [
    { id: 'info', title: 'Function Info', icon: Zap },
    { id: 'runtime', title: 'Runtime & Trigger', icon: Code },
    { id: 'config', title: 'Configuration', icon: Server },
    { id: 'security', title: 'Security', icon: Shield },
    { id: 'review', title: 'Review', icon: Eye },
  ];

  const currentStep = steps[step];
  const isFirstStep = step === 0;
  const isLastStep = step === steps.length - 1;

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleNext = () => {
    if (isLastStep) {
      onCreate(config);
      onClose();
    } else {
      setStep(s => s + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setStep(s => s - 1);
    }
  };

  const addEnvVar = () => {
    if (newEnvKey.trim()) {
      setConfig(prev => ({
        ...prev,
        environment: [...prev.environment, { key: newEnvKey.trim(), value: newEnvValue }]
      }));
      setNewEnvKey('');
      setNewEnvValue('');
    }
  };

  const removeEnvVar = (index: number) => {
    setConfig(prev => ({
      ...prev,
      environment: prev.environment.filter((_, i) => i !== index)
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 0: return config.name.trim().length >= 2;
      case 1: return config.runtime && config.trigger;
      case 2: return config.timeout > 0 && config.memory > 0;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0: // Function Info
        return (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Function Name *</label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  name: e.target.value,
                  slug: generateSlug(e.target.value)
                }))}
                placeholder="processOrder"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
              />
              <p className="text-xs text-gray-500 mt-1">Use camelCase for function names</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Slug / Endpoint</label>
              <input
                type="text"
                value={config.slug}
                onChange={(e) => setConfig(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="process-order"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={config.description}
                onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What does this function do?"
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 resize-none"
              />
            </div>
          </div>
        );

      case 1: // Runtime & Trigger
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Runtime</label>
              <div className="grid grid-cols-3 gap-4">
                {runtimes.map(rt => {
                  const isSelected = config.runtime === rt.id;
                  return (
                    <button
                      key={rt.id}
                      onClick={() => setConfig(prev => ({ ...prev, runtime: rt.id as FunctionConfig['runtime'] }))}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        isSelected
                          ? 'border-yellow-500 bg-yellow-500/10'
                          : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                      }`}
                    >
                      <div className="text-3xl mb-2">{rt.icon}</div>
                      <h3 className="text-white font-medium">{rt.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">{rt.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Trigger Type</label>
              <div className="grid grid-cols-2 gap-4">
                {triggers.map(trigger => {
                  const Icon = trigger.icon;
                  const isSelected = config.trigger === trigger.id;
                  return (
                    <button
                      key={trigger.id}
                      onClick={() => setConfig(prev => ({ ...prev, trigger: trigger.id as FunctionConfig['trigger'] }))}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-yellow-500 bg-yellow-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-yellow-400' : 'text-gray-400'}`} />
                      <h3 className="text-white font-medium">{trigger.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">{trigger.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trigger-specific config */}
            {config.trigger === 'http' && (
              <div className="space-y-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">HTTP Method</label>
                  <div className="flex gap-2">
                    {(['GET', 'POST', 'PUT', 'DELETE', 'ANY'] as const).map(method => (
                      <button
                        key={method}
                        onClick={() => setConfig(prev => ({ ...prev, httpMethod: method }))}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          config.httpMethod === method
                            ? 'bg-yellow-500 text-black'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Path</label>
                  <input
                    type="text"
                    value={config.httpPath}
                    onChange={(e) => setConfig(prev => ({ ...prev, httpPath: e.target.value }))}
                    placeholder="/api/my-function"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white font-mono text-sm"
                  />
                </div>
              </div>
            )}

            {config.trigger === 'cron' && (
              <div className="space-y-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Schedule (Cron Expression)</label>
                  <input
                    type="text"
                    value={config.cronSchedule}
                    onChange={(e) => setConfig(prev => ({ ...prev, cronSchedule: e.target.value }))}
                    placeholder="0 * * * *"
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2">Presets</label>
                  <div className="flex flex-wrap gap-2">
                    {cronPresets.map(preset => (
                      <button
                        key={preset.value}
                        onClick={() => setConfig(prev => ({ ...prev, cronSchedule: preset.value }))}
                        className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                          config.cronSchedule === preset.value
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {config.trigger === 'event' && (
              <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                <label className="block text-sm font-medium text-gray-300 mb-2">Event Type</label>
                <select
                  value={config.eventType}
                  onChange={(e) => setConfig(prev => ({ ...prev, eventType: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white"
                >
                  {eventTypes.map(event => (
                    <option key={event} value={event}>{event}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        );

      case 2: // Configuration
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Timeout (seconds)</label>
                <input
                  type="number"
                  value={config.timeout}
                  onChange={(e) => setConfig(prev => ({ ...prev, timeout: parseInt(e.target.value) || 30 }))}
                  min={1}
                  max={900}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
                <p className="text-xs text-gray-500 mt-1">Max: 900 seconds (15 min)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Memory (MB)</label>
                <select
                  value={config.memory}
                  onChange={(e) => setConfig(prev => ({ ...prev, memory: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                  {[128, 256, 512, 1024, 2048].map(mem => (
                    <option key={mem} value={mem}>{mem} MB</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Retry Attempts</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  value={config.retries}
                  onChange={(e) => setConfig(prev => ({ ...prev, retries: parseInt(e.target.value) }))}
                  min={0}
                  max={5}
                  className="flex-1 accent-yellow-500"
                />
                <span className="text-white font-mono w-12 text-center">{config.retries}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Environment Variables</label>
              <div className="space-y-2 mb-3">
                {config.environment.map((env, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg">
                    <span className="text-yellow-400 font-mono text-sm">{env.key}</span>
                    <span className="text-gray-500">=</span>
                    <span className="text-gray-300 font-mono text-sm flex-1 truncate">{env.value || '***'}</span>
                    <button
                      onClick={() => removeEnvVar(idx)}
                      className="p-1 text-gray-500 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newEnvKey}
                  onChange={(e) => setNewEnvKey(e.target.value.toUpperCase())}
                  placeholder="KEY"
                  className="w-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm"
                />
                <input
                  type="text"
                  value={newEnvValue}
                  onChange={(e) => setNewEnvValue(e.target.value)}
                  placeholder="value"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm"
                />
                <button
                  onClick={addEnvVar}
                  disabled={!newEnvKey.trim()}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 rounded-lg text-sm text-white"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.logging}
                  onChange={(e) => setConfig(prev => ({ ...prev, logging: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-yellow-500"
                />
                <div>
                  <span className="text-white font-medium">Enable Logging</span>
                  <p className="text-xs text-gray-400">Log function invocations</p>
                </div>
              </label>
            </div>
          </div>
        );

      case 3: // Security
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Authentication</label>
              <div className="space-y-3">
                {authMethods.map(auth => {
                  const Icon = auth.icon;
                  const isSelected = config.authentication === auth.id;
                  return (
                    <button
                      key={auth.id}
                      onClick={() => setConfig(prev => ({ ...prev, authentication: auth.id as FunctionConfig['authentication'] }))}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                        isSelected
                          ? 'border-yellow-500 bg-yellow-500/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-yellow-500/20' : 'bg-gray-700'
                      }`}>
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-yellow-400' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{auth.name}</h3>
                        <p className="text-sm text-gray-400">{auth.description}</p>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-yellow-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {config.trigger === 'http' && (
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.cors}
                    onChange={(e) => setConfig(prev => ({ ...prev, cors: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-yellow-500"
                  />
                  <div>
                    <span className="text-white font-medium">Enable CORS</span>
                    <p className="text-xs text-gray-400">Allow cross-origin requests</p>
                  </div>
                </label>
              </div>
            )}
          </div>
        );

      case 4: // Review
        const selectedRuntime = runtimes.find(r => r.id === config.runtime);
        const selectedTrigger = triggers.find(t => t.id === config.trigger);
        const TriggerIcon = selectedTrigger?.icon || Zap;

        return (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br from-yellow-500 to-orange-500 text-3xl">
                  {selectedRuntime?.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{config.name || 'Untitled Function'}</h3>
                  <p className="text-gray-400">{selectedRuntime?.name} function</p>
                  {config.description && (
                    <p className="text-sm text-gray-500 mt-1">{config.description}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Trigger</h4>
                <div className="flex items-center gap-2">
                  <TriggerIcon className="w-4 h-4 text-yellow-400" />
                  <span className="text-white">{selectedTrigger?.name}</span>
                </div>
                {config.trigger === 'http' && (
                  <p className="text-xs text-gray-500 mt-1">{config.httpMethod} {config.httpPath}</p>
                )}
                {config.trigger === 'cron' && (
                  <p className="text-xs text-gray-500 mt-1">{config.cronSchedule}</p>
                )}
                {config.trigger === 'event' && (
                  <p className="text-xs text-gray-500 mt-1">{config.eventType}</p>
                )}
              </div>
              <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Resources</h4>
                <p className="text-white">{config.memory} MB / {config.timeout}s timeout</p>
                <p className="text-xs text-gray-500 mt-1">{config.retries} retries</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Security</h4>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">
                  {authMethods.find(a => a.id === config.authentication)?.name}
                </span>
                {config.cors && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                    CORS Enabled
                  </span>
                )}
                {config.logging && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                    Logging
                  </span>
                )}
              </div>
            </div>

            {config.environment.length > 0 && (
              <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Environment Variables ({config.environment.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {config.environment.map((env, idx) => (
                    <span key={idx} className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm font-mono">
                      {env.key}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Files to be created</h4>
              <div className="space-y-1.5 text-sm font-mono">
                <div className="flex items-center gap-2 text-gray-300">
                  <FolderPlus className="w-4 h-4 text-yellow-500" />
                  functions/{config.slug}/
                </div>
                <div className="flex items-center gap-2 text-gray-400 pl-6">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  function.json
                </div>
                {config.runtime === 'rust' && (
                  <>
                    <div className="flex items-center gap-2 text-gray-400 pl-6">
                      <FileCode className="w-4 h-4 text-orange-400" />
                      src/main.rs
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 pl-6">
                      <FileCode className="w-4 h-4 text-orange-400" />
                      Cargo.toml
                    </div>
                  </>
                )}
                {config.runtime === 'typescript' && (
                  <>
                    <div className="flex items-center gap-2 text-gray-400 pl-6">
                      <FileCode className="w-4 h-4 text-blue-400" />
                      src/index.ts
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 pl-6">
                      <FileCode className="w-4 h-4 text-blue-400" />
                      package.json
                    </div>
                  </>
                )}
                {config.runtime === 'python' && (
                  <>
                    <div className="flex items-center gap-2 text-gray-400 pl-6">
                      <FileCode className="w-4 h-4 text-green-400" />
                      main.py
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 pl-6">
                      <FileCode className="w-4 h-4 text-green-400" />
                      requirements.txt
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative z-10 w-full max-w-2xl mx-4"
      >
        <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Create New Function</h2>
                <p className="text-sm text-gray-400">{currentStep.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress */}
          <div className="px-6 py-3 bg-gray-800/50 border-b border-gray-800">
            <div className="flex items-center gap-2">
              {steps.map((s, idx) => (
                <React.Fragment key={s.id}>
                  <div
                    className={`flex items-center gap-2 ${
                      idx === step ? 'text-yellow-400' : idx < step ? 'text-yellow-400' : 'text-gray-500'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                      idx === step
                        ? 'border-yellow-500 bg-yellow-500/20'
                        : idx < step
                        ? 'border-yellow-500 bg-yellow-500/20'
                        : 'border-gray-600'
                    }`}>
                      {idx < step ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <s.icon className="w-4 h-4" />
                      )}
                    </div>
                    <span className={`text-sm hidden md:block ${idx === step ? 'text-white' : ''}`}>
                      {s.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 ${idx < step ? 'bg-yellow-500' : 'bg-gray-700'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800 bg-gray-800/30">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-3">
              {!isFirstStep && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm text-white transition-colors"
              >
                {isLastStep ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Create Function
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FunctionWizard;
