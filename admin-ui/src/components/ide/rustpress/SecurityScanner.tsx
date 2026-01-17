/**
 * SecurityScanner - Security vulnerability scanning
 * RustPress-specific security analysis functionality
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, ShieldAlert, ShieldCheck, RefreshCw, AlertTriangle,
  Lock, Unlock, Key, Eye, EyeOff, CheckCircle, XCircle,
  AlertCircle, FileWarning, Globe, Database, Code, Server
} from 'lucide-react';

export interface SecurityIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'vulnerability' | 'configuration' | 'permission' | 'dependency' | 'code';
  title: string;
  description: string;
  location?: string;
  recommendation: string;
  cweId?: string;
  fixed?: boolean;
}

export interface SecurityScore {
  overall: number;
  vulnerabilities: number;
  configuration: number;
  permissions: number;
  dependencies: number;
}

interface SecurityScannerProps {
  onFix?: (issue: SecurityIssue) => void;
  onScan?: () => void;
}

// Mock data
const mockIssues: SecurityIssue[] = [
  {
    id: '1',
    severity: 'critical',
    category: 'vulnerability',
    title: 'SQL Injection Vulnerability',
    description: 'Unsanitized user input in database query detected',
    location: 'src/api/posts.rs:45',
    recommendation: 'Use parameterized queries or ORM methods instead of string concatenation',
    cweId: 'CWE-89'
  },
  {
    id: '2',
    severity: 'high',
    category: 'configuration',
    title: 'Debug Mode Enabled in Production',
    description: 'Debug mode is currently enabled which exposes sensitive information',
    location: 'config/app.toml',
    recommendation: 'Set DEBUG=false in production environment'
  },
  {
    id: '3',
    severity: 'high',
    category: 'dependency',
    title: 'Outdated Dependency with Known Vulnerability',
    description: 'Package "serde" version 1.0.0 has a known security vulnerability',
    location: 'Cargo.toml',
    recommendation: 'Update serde to version 1.0.193 or later',
    cweId: 'CVE-2023-xxxxx'
  },
  {
    id: '4',
    severity: 'medium',
    category: 'permission',
    title: 'Overly Permissive File Permissions',
    description: 'Configuration files have world-readable permissions',
    location: '/config/*',
    recommendation: 'Set file permissions to 600 (owner read/write only)'
  },
  {
    id: '5',
    severity: 'medium',
    category: 'code',
    title: 'Hardcoded Credentials Detected',
    description: 'Hardcoded password found in source code',
    location: 'src/config.rs:12',
    recommendation: 'Use environment variables or a secrets manager',
    cweId: 'CWE-798'
  },
  {
    id: '6',
    severity: 'low',
    category: 'configuration',
    title: 'Missing Security Headers',
    description: 'HTTP security headers X-Frame-Options and X-Content-Type-Options are not set',
    recommendation: 'Add security headers to server configuration'
  },
  {
    id: '7',
    severity: 'info',
    category: 'configuration',
    title: 'HTTPS Not Enforced',
    description: 'Site accessible over HTTP without automatic redirect to HTTPS',
    recommendation: 'Enable HSTS and redirect all HTTP traffic to HTTPS'
  }
];

const mockScores: SecurityScore = {
  overall: 72,
  vulnerabilities: 60,
  configuration: 75,
  permissions: 80,
  dependencies: 70
};

export const SecurityScanner: React.FC<SecurityScannerProps> = ({
  onFix,
  onScan
}) => {
  const [issues, setIssues] = useState<SecurityIssue[]>(mockIssues);
  const [scores] = useState<SecurityScore>(mockScores);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [showFixed, setShowFixed] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsScanning(false);
    onScan?.();
  };

  const handleFix = (issue: SecurityIssue) => {
    setIssues(issues.map(i =>
      i.id === issue.id ? { ...i, fixed: true } : i
    ));
    onFix?.(issue);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'info': return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <ShieldAlert className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <AlertCircle className="w-4 h-4" />;
      case 'low': return <AlertCircle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vulnerability': return <ShieldAlert className="w-4 h-4" />;
      case 'configuration': return <Server className="w-4 h-4" />;
      case 'permission': return <Lock className="w-4 h-4" />;
      case 'dependency': return <Code className="w-4 h-4" />;
      case 'code': return <FileWarning className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const filteredIssues = issues.filter(issue => {
    if (!showFixed && issue.fixed) return false;
    if (selectedSeverity && issue.severity !== selectedSeverity) return false;
    if (selectedCategory && issue.category !== selectedCategory) return false;
    return true;
  });

  const severityCounts = issues.reduce((acc, issue) => {
    if (!issue.fixed) {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            Security Scanner
          </h2>
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Run Scan'}
          </button>
        </div>

        {/* Security Score */}
        <div className="flex items-center gap-6 mb-4">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="none" className="text-gray-800" />
              <circle
                cx="48" cy="48" r="42"
                stroke="currentColor" strokeWidth="8" fill="none"
                strokeDasharray={`${scores.overall * 2.64} 264`}
                className={getScoreColor(scores.overall)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${getScoreColor(scores.overall)}`}>{scores.overall}</span>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-4 gap-2">
            {[
              { label: 'Vulnerabilities', value: scores.vulnerabilities },
              { label: 'Configuration', value: scores.configuration },
              { label: 'Permissions', value: scores.permissions },
              { label: 'Dependencies', value: scores.dependencies }
            ].map(item => (
              <div key={item.label} className="bg-gray-800/50 rounded-lg p-2 text-center">
                <div className={`text-lg font-semibold ${getScoreColor(item.value)}`}>{item.value}</div>
                <div className="text-xs text-gray-500">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Severity Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedSeverity(null)}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              !selectedSeverity ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            All ({issues.filter(i => !i.fixed).length})
          </button>
          {(['critical', 'high', 'medium', 'low', 'info'] as const).map(severity => (
            <button
              key={severity}
              onClick={() => setSelectedSeverity(selectedSeverity === severity ? null : severity)}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                selectedSeverity === severity
                  ? getSeverityColor(severity)
                  : 'bg-gray-800 text-gray-400 border-transparent hover:text-white'
              }`}
            >
              {severity} ({severityCounts[severity] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Scanning Progress */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-3 bg-purple-900/20 border-b border-purple-800/30"
          >
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
              <div className="flex-1">
                <div className="text-sm text-purple-400 mb-1">Scanning for vulnerabilities...</div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3 }}
                    className="h-full bg-purple-500 rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Issues List */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-3">
          {filteredIssues.map(issue => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-gray-800/50 rounded-lg overflow-hidden ${issue.fixed ? 'opacity-60' : ''}`}
            >
              <button
                onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                className="w-full p-4 flex items-start gap-3 text-left"
              >
                <span className={`p-1.5 rounded ${getSeverityColor(issue.severity)}`}>
                  {getSeverityIcon(issue.severity)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">{issue.title}</span>
                    {issue.fixed && (
                      <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">Fixed</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2">{issue.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      {getCategoryIcon(issue.category)}
                      {issue.category}
                    </span>
                    {issue.location && (
                      <span className="font-mono">{issue.location}</span>
                    )}
                    {issue.cweId && (
                      <span className="text-purple-400">{issue.cweId}</span>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded border ${getSeverityColor(issue.severity)}`}>
                  {issue.severity}
                </span>
              </button>

              <AnimatePresence>
                {expandedIssue === issue.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t border-gray-700"
                  >
                    <div className="p-4 space-y-3">
                      <div>
                        <h4 className="text-xs text-gray-500 uppercase mb-1">Recommendation</h4>
                        <p className="text-sm text-gray-300">{issue.recommendation}</p>
                      </div>
                      {!issue.fixed && (
                        <button
                          onClick={() => handleFix(issue)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600/20 text-green-400 text-sm rounded-lg hover:bg-green-600/30"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark as Fixed
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {filteredIssues.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <ShieldCheck className="w-16 h-16 mb-4 text-green-400 opacity-50" />
            <p className="text-lg font-medium">No issues found</p>
            <p className="text-sm">Your site is secure!</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-gray-400">
          <input
            type="checkbox"
            checked={showFixed}
            onChange={(e) => setShowFixed(e.target.checked)}
            className="rounded border-gray-600 bg-gray-800 text-purple-600"
          />
          Show fixed issues
        </label>
        <span className="text-xs text-gray-500">
          Last scan: {new Date().toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default SecurityScanner;
