/**
 * PerformanceProfiler - Performance metrics and optimization
 * RustPress-specific performance monitoring functionality
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Gauge, Zap, Clock, HardDrive, Cpu, Globe, Image, Code,
  Database, RefreshCw, TrendingUp, TrendingDown, AlertCircle,
  CheckCircle, Activity, Layers, Network, BarChart2
} from 'lucide-react';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  description: string;
  threshold: { good: number; warning: number };
}

export interface ResourceTiming {
  name: string;
  type: 'document' | 'script' | 'stylesheet' | 'image' | 'font' | 'fetch' | 'other';
  size: number;
  duration: number;
  startTime: number;
}

interface PerformanceProfilerProps {
  url?: string;
  onOptimize?: (suggestion: string) => void;
}

// Mock data
const mockMetrics: PerformanceMetric[] = [
  {
    name: 'First Contentful Paint',
    value: 1.2,
    unit: 's',
    status: 'good',
    description: 'Time until first content renders',
    threshold: { good: 1.8, warning: 3.0 }
  },
  {
    name: 'Largest Contentful Paint',
    value: 2.8,
    unit: 's',
    status: 'warning',
    description: 'Time until largest content renders',
    threshold: { good: 2.5, warning: 4.0 }
  },
  {
    name: 'Time to Interactive',
    value: 3.2,
    unit: 's',
    status: 'warning',
    description: 'Time until page is fully interactive',
    threshold: { good: 3.0, warning: 5.0 }
  },
  {
    name: 'Cumulative Layout Shift',
    value: 0.05,
    unit: '',
    status: 'good',
    description: 'Visual stability score',
    threshold: { good: 0.1, warning: 0.25 }
  },
  {
    name: 'Total Blocking Time',
    value: 180,
    unit: 'ms',
    status: 'warning',
    description: 'Total time blocked by long tasks',
    threshold: { good: 150, warning: 350 }
  },
  {
    name: 'Speed Index',
    value: 2.1,
    unit: 's',
    status: 'good',
    description: 'How quickly content is visually displayed',
    threshold: { good: 3.4, warning: 5.8 }
  }
];

const mockResources: ResourceTiming[] = [
  { name: '/main.js', type: 'script', size: 245000, duration: 320, startTime: 100 },
  { name: '/vendor.js', type: 'script', size: 890000, duration: 580, startTime: 150 },
  { name: '/styles.css', type: 'stylesheet', size: 45000, duration: 80, startTime: 50 },
  { name: '/hero.jpg', type: 'image', size: 156000, duration: 240, startTime: 200 },
  { name: '/logo.svg', type: 'image', size: 2400, duration: 15, startTime: 60 },
  { name: '/api/posts', type: 'fetch', size: 12000, duration: 450, startTime: 500 },
  { name: '/Inter-Regular.woff2', type: 'font', size: 24000, duration: 45, startTime: 80 }
];

const mockOptimizations = [
  {
    title: 'Enable Image Lazy Loading',
    impact: 'high',
    description: 'Defer loading of off-screen images to improve initial load time',
    savings: '~1.2s'
  },
  {
    title: 'Minify JavaScript',
    impact: 'medium',
    description: 'Remove whitespace and comments from JavaScript files',
    savings: '~180KB'
  },
  {
    title: 'Enable Gzip Compression',
    impact: 'high',
    description: 'Compress text-based resources for faster transfer',
    savings: '~65%'
  },
  {
    title: 'Cache Static Assets',
    impact: 'medium',
    description: 'Add cache headers for images, fonts, and scripts',
    savings: 'Repeat visits'
  },
  {
    title: 'Reduce Server Response Time',
    impact: 'high',
    description: 'Optimize database queries and enable caching',
    savings: '~400ms'
  }
];

export const PerformanceProfiler: React.FC<PerformanceProfilerProps> = ({
  url = window.location.href,
  onOptimize
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>(mockMetrics);
  const [resources, setResources] = useState<ResourceTiming[]>(mockResources);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'resources' | 'optimizations'>('overview');
  const [selectedResourceType, setSelectedResourceType] = useState<string | null>(null);

  const overallScore = Math.round(
    metrics.filter(m => m.status === 'good').length / metrics.length * 100
  );

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-400 bg-green-500/10';
      case 'warning': return 'text-yellow-400 bg-yellow-500/10';
      case 'critical': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsAnalyzing(false);
  };

  const resourcesByType = resources.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + r.size;
    return acc;
  }, {} as Record<string, number>);

  const totalSize = resources.reduce((acc, r) => acc + r.size, 0);
  const totalDuration = Math.max(...resources.map(r => r.startTime + r.duration));

  const filteredResources = selectedResourceType
    ? resources.filter(r => r.type === selectedResourceType)
    : resources;

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Gauge className="w-5 h-5 text-blue-400" />
            Performance Profiler
          </h2>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>

        {/* Score Circle */}
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="42"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-800"
              />
              <circle
                cx="48"
                cy="48"
                r="42"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${overallScore * 2.64} 264`}
                className={getScoreColor(overallScore)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}
              </span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-3 gap-3">
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-lg font-semibold">{(totalDuration / 1000).toFixed(2)}s</span>
              </div>
              <div className="text-xs text-gray-500">Load Time</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                <HardDrive className="w-4 h-4" />
                <span className="text-lg font-semibold">{formatBytes(totalSize)}</span>
              </div>
              <div className="text-xs text-gray-500">Total Size</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                <Layers className="w-4 h-4" />
                <span className="text-lg font-semibold">{resources.length}</span>
              </div>
              <div className="text-xs text-gray-500">Requests</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-4">
          {(['overview', 'resources', 'optimizations'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300">Core Web Vitals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.map(metric => (
                <motion.div
                  key={metric.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/50 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">{metric.name}</span>
                    <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(metric.status)}`}>
                      {metric.status}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className={`text-2xl font-bold ${getStatusColor(metric.status).split(' ')[0]}`}>
                      {metric.value}
                    </span>
                    <span className="text-gray-500">{metric.unit}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        metric.status === 'good' ? 'bg-green-500' :
                        metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.min((metric.value / metric.threshold.warning) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{metric.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-4">
            {/* Resource Type Filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedResourceType(null)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  !selectedResourceType ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                All ({resources.length})
              </button>
              {Object.entries(resourcesByType).map(([type, size]) => (
                <button
                  key={type}
                  onClick={() => setSelectedResourceType(type)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedResourceType === type ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {type} ({resources.filter(r => r.type === type).length}) - {formatBytes(size)}
                </button>
              ))}
            </div>

            {/* Waterfall Chart */}
            <div className="space-y-2">
              {filteredResources.map((resource, idx) => (
                <div key={idx} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {resource.type === 'script' && <Code className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
                      {resource.type === 'stylesheet' && <Layers className="w-4 h-4 text-purple-400 flex-shrink-0" />}
                      {resource.type === 'image' && <Image className="w-4 h-4 text-green-400 flex-shrink-0" />}
                      {resource.type === 'font' && <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                      {resource.type === 'fetch' && <Network className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                      <span className="text-sm text-white truncate">{resource.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400 flex-shrink-0">
                      <span>{formatBytes(resource.size)}</span>
                      <span>{resource.duration}ms</span>
                    </div>
                  </div>
                  {/* Waterfall bar */}
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        resource.type === 'script' ? 'bg-yellow-500' :
                        resource.type === 'stylesheet' ? 'bg-purple-500' :
                        resource.type === 'image' ? 'bg-green-500' :
                        resource.type === 'font' ? 'bg-cyan-500' :
                        'bg-blue-500'
                      }`}
                      style={{
                        width: `${(resource.duration / totalDuration) * 100}%`,
                        marginLeft: `${(resource.startTime / totalDuration) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'optimizations' && (
          <div className="space-y-4">
            {mockOptimizations.map((opt, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-800/50 rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs rounded ${
                        opt.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                        opt.impact === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {opt.impact} impact
                      </span>
                      <span className="text-white font-medium">{opt.title}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{opt.description}</p>
                    <div className="flex items-center gap-2 text-xs text-green-400">
                      <TrendingUp className="w-3 h-3" />
                      Estimated savings: {opt.savings}
                    </div>
                  </div>
                  <button
                    onClick={() => onOptimize?.(opt.title)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceProfiler;
