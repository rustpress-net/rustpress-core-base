/**
 * Terminal - Embedded terminal panel with admin authentication
 * Supports standard Linux commands and rustpress-cli
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, X, Plus, Trash2, Lock, Unlock, Shield, ExternalLink, Minimize2 } from 'lucide-react';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'info' | 'success' | 'warning';
  content: string;
  timestamp: Date;
}

interface TerminalSession {
  id: string;
  name: string;
  lines: TerminalLine[];
  cwd: string;
  env: Record<string, string>;
}

interface FileSystemNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileSystemNode[];
  permissions?: string;
  owner?: string;
  size?: number;
  modified?: Date;
}

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  height?: number;
  onHeightChange?: (height: number) => void;
  isDetached?: boolean;
  onDetach?: () => void;
  onAttach?: () => void;
  // IDE lock state sync - when provided, syncs terminal auth with IDE unlock
  isIDEUnlocked?: boolean;
  unlockEmail?: string | null;
  onRequestUnlock?: () => void;
}

// Simulated file system with realistic metadata
const createFileSystem = (): FileSystemNode => ({
  name: '/',
  type: 'directory',
  permissions: 'rwxr-xr-x',
  owner: 'root',
  modified: new Date('2025-01-10T08:00:00'),
  children: [
    {
      name: 'rustpress',
      type: 'directory',
      permissions: 'rwxr-xr-x',
      owner: 'admin',
      modified: new Date('2025-01-15T10:30:00'),
      children: [
        {
          name: 'themes',
          type: 'directory',
          permissions: 'rwxr-xr-x',
          owner: 'admin',
          modified: new Date('2025-01-14T16:45:00'),
          children: [
            { name: 'default', type: 'directory', permissions: 'rwxr-xr-x', owner: 'admin', modified: new Date('2025-01-12T09:15:00'), children: [
              { name: 'index.html', type: 'file', content: '<!DOCTYPE html>...', size: 2048, permissions: 'rw-r--r--', owner: 'admin', modified: new Date('2025-01-12T09:10:00') },
              { name: 'style.css', type: 'file', content: '/* styles */', size: 8192, permissions: 'rw-r--r--', owner: 'admin', modified: new Date('2025-01-11T14:22:00') },
              { name: 'script.js', type: 'file', content: '// scripts', size: 1536, permissions: 'rw-r--r--', owner: 'admin', modified: new Date('2025-01-10T11:30:00') },
            ]},
            { name: 'developer', type: 'directory', permissions: 'rwxr-xr-x', owner: 'admin', modified: new Date('2025-01-08T08:00:00'), children: [] },
          ]
        },
        {
          name: 'functions',
          type: 'directory',
          permissions: 'rwxr-xr-x',
          owner: 'admin',
          modified: new Date('2025-01-15T11:00:00'),
          children: [
            { name: 'auth.rs', type: 'file', content: '// auth module\nuse std::collections::HashMap;', size: 3584, permissions: 'rw-r--r--', owner: 'admin', modified: new Date('2025-01-15T10:55:00') },
            { name: 'api.rs', type: 'file', content: '// api handlers', size: 5120, permissions: 'rw-r--r--', owner: 'admin', modified: new Date('2025-01-14T09:30:00') },
            { name: 'database.rs', type: 'file', content: '// db connection', size: 2048, permissions: 'rw-r--r--', owner: 'admin', modified: new Date('2025-01-13T15:20:00') },
            { name: 'middleware.rs', type: 'file', content: '// middleware', size: 1024, permissions: 'rw-r--r--', owner: 'admin', modified: new Date('2025-01-12T08:45:00') },
          ]
        },
        {
          name: 'plugins',
          type: 'directory',
          permissions: 'rwxr-xr-x',
          owner: 'admin',
          modified: new Date('2025-01-13T12:00:00'),
          children: [
            { name: 'seo', type: 'directory', permissions: 'rwxr-xr-x', owner: 'admin', modified: new Date('2025-01-13T11:45:00'), children: [
              { name: 'plugin.json', type: 'file', content: '{"name": "SEO"}', size: 256, permissions: 'rw-r--r--', owner: 'admin', modified: new Date('2025-01-13T11:40:00') },
            ]},
            { name: 'analytics', type: 'directory', permissions: 'rwxr-xr-x', owner: 'admin', modified: new Date('2025-01-10T14:30:00'), children: [
              { name: 'plugin.json', type: 'file', content: '{"name": "Analytics"}', size: 512, permissions: 'rw-r--r--', owner: 'admin', modified: new Date('2025-01-10T14:25:00') },
            ]},
          ]
        },
        {
          name: 'apps',
          type: 'directory',
          permissions: 'rwxr-xr-x',
          owner: 'admin',
          modified: new Date('2025-01-15T09:00:00'),
          children: [
            { name: 'analytics-pro', type: 'directory', permissions: 'rwxr-xr-x', owner: 'admin', modified: new Date('2025-01-15T08:55:00'), children: [
              { name: 'app.json', type: 'file', content: '{"name": "Analytics Pro"}', size: 384, permissions: 'rw-r--r--', owner: 'admin', modified: new Date('2025-01-15T08:50:00') },
              { name: 'main.tsx', type: 'file', content: '// React app', size: 4096, permissions: 'rw-r--r--', owner: 'admin', modified: new Date('2025-01-15T08:45:00') },
            ]},
          ]
        },
        {
          name: 'assets',
          type: 'directory',
          permissions: 'rwxr-xr-x',
          owner: 'admin',
          modified: new Date('2025-01-09T10:00:00'),
          children: [
            { name: 'images', type: 'directory', permissions: 'rwxr-xr-x', owner: 'admin', modified: new Date('2025-01-09T09:50:00'), children: [
              { name: 'logo.svg', type: 'file', content: '<svg>...</svg>', size: 2048, permissions: 'rw-r--r--', owner: 'admin', modified: new Date('2025-01-09T09:45:00') },
              { name: 'banner.png', type: 'file', content: '', size: 102400, permissions: 'rw-r--r--', owner: 'admin', modified: new Date('2025-01-08T15:30:00') },
            ]},
            { name: 'fonts', type: 'directory', permissions: 'rwxr-xr-x', owner: 'admin', modified: new Date('2025-01-07T11:00:00'), children: [
              { name: 'inter.woff2', type: 'file', content: '', size: 45056, permissions: 'rw-r--r--', owner: 'admin', modified: new Date('2025-01-07T10:55:00') },
            ]},
          ]
        },
        { name: '.env', type: 'file', content: 'DATABASE_URL=postgres://...', size: 256, permissions: 'rw-------', owner: 'admin', modified: new Date('2025-01-05T08:00:00') },
        { name: '.gitignore', type: 'file', content: 'node_modules/\n.env', size: 128, permissions: 'rw-r--r--', owner: 'admin', modified: new Date('2025-01-03T10:00:00') },
        { name: 'config.toml', type: 'file', content: '[server]\nport = 3080', size: 512, permissions: 'rw-r--r--', owner: 'admin', modified: new Date('2025-01-14T08:00:00') },
        { name: 'README.md', type: 'file', content: '# RustPress\n\nA modern CMS built with Rust and React.', size: 1024, permissions: 'rw-r--r--', owner: 'admin', modified: new Date('2025-01-10T12:00:00') },
        { name: 'Cargo.toml', type: 'file', content: '[package]\nname = "rustpress"', size: 768, permissions: 'rw-r--r--', owner: 'admin', modified: new Date('2025-01-15T07:30:00') },
      ]
    },
    {
      name: 'home',
      type: 'directory',
      permissions: 'rwxr-xr-x',
      owner: 'root',
      modified: new Date('2025-01-01T00:00:00'),
      children: [
        { name: 'admin', type: 'directory', permissions: 'rwx------', owner: 'admin', modified: new Date('2025-01-14T20:00:00'), children: [
          { name: '.bashrc', type: 'file', content: '# bash config', size: 256, permissions: 'rw-r--r--', owner: 'admin', modified: new Date('2025-01-01T00:00:00') },
          { name: '.profile', type: 'file', content: '# profile', size: 128, permissions: 'rw-r--r--', owner: 'admin', modified: new Date('2025-01-01T00:00:00') },
        ]},
      ]
    },
    {
      name: 'tmp',
      type: 'directory',
      permissions: 'rwxrwxrwt',
      owner: 'root',
      modified: new Date('2025-01-15T12:00:00'),
      children: [
        { name: 'cache-12345.tmp', type: 'file', content: '', size: 16384, permissions: 'rw-------', owner: 'admin', modified: new Date('2025-01-15T11:58:00') },
      ]
    }
  ]
});

export const Terminal: React.FC<TerminalProps> = ({
  isOpen,
  onClose,
  onToggle,
  height = 200,
  onHeightChange,
  isDetached = false,
  onDetach,
  onAttach,
  isIDEUnlocked,
  unlockEmail,
  onRequestUnlock
}) => {
  // Authentication state - synced with IDE if props provided
  const [localAuth, setLocalAuth] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(true);

  // Use IDE unlock state if provided, otherwise use local auth
  const isAuthenticated = isIDEUnlocked !== undefined ? isIDEUnlocked : localAuth;

  // Sync local auth with IDE unlock state
  useEffect(() => {
    if (isIDEUnlocked !== undefined) {
      setLocalAuth(isIDEUnlocked);
      if (isIDEUnlocked) {
        setShowAuthModal(false);
      } else {
        setShowAuthModal(true);
      }
    }
  }, [isIDEUnlocked]);

  // File system state
  const [fileSystem] = useState<FileSystemNode>(createFileSystem);

  const [sessions, setSessions] = useState<TerminalSession[]>([
    {
      id: '1',
      name: 'bash',
      lines: [],
      cwd: '/rustpress',
      env: {
        USER: 'admin',
        HOME: '/home/admin',
        PATH: '/usr/local/bin:/usr/bin:/bin',
        SHELL: '/bin/bash',
        RUSTPRESS_VERSION: '1.0.0'
      }
    }
  ]);
  const [activeSession, setActiveSession] = useState('1');
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  const currentSession = sessions.find(s => s.id === activeSession);

  // Initialize terminal with welcome message after authentication
  useEffect(() => {
    if (isAuthenticated && currentSession && currentSession.lines.length === 0) {
      const welcomeLines: TerminalLine[] = [
        { id: '1', type: 'info', content: '╔════════════════════════════════════════════════════════════╗', timestamp: new Date() },
        { id: '2', type: 'info', content: '║        RustPress Terminal v1.0.0 - Secure Shell            ║', timestamp: new Date() },
        { id: '3', type: 'info', content: '║                                                              ║', timestamp: new Date() },
        { id: '4', type: 'info', content: '║  Type "help" for available commands                         ║', timestamp: new Date() },
        { id: '5', type: 'info', content: '║  Type "rustpress-cli --help" for RustPress CLI commands     ║', timestamp: new Date() },
        { id: '6', type: 'info', content: '╚════════════════════════════════════════════════════════════╝', timestamp: new Date() },
        { id: '7', type: 'output', content: '', timestamp: new Date() },
      ];
      setSessions(prev => prev.map(s =>
        s.id === activeSession ? { ...s, lines: welcomeLines } : s
      ));
    }
  }, [isAuthenticated, activeSession, currentSession]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentSession?.lines]);

  // Handle admin authentication
  const handleAuthenticate = () => {
    // If IDE unlock is managed externally, request unlock through parent
    if (onRequestUnlock) {
      onRequestUnlock();
      return;
    }

    // In production, this would verify against the backend
    // For demo, accept "admin" or any non-empty password
    if (authPassword.trim().length >= 3) {
      setLocalAuth(true);
      setShowAuthModal(false);
      setAuthError(null);
    } else {
      setAuthError('Invalid password. Minimum 3 characters required.');
    }
  };

  // Define allowed paths when locked (only rustpress root folder contents)
  const ALLOWED_LOCKED_PATHS = ['/rustpress', '/rustpress/themes', '/rustpress/functions', '/rustpress/plugins', '/rustpress/apps', '/rustpress/assets'];

  // Check if navigation is allowed based on lock state
  const isNavigationAllowed = (targetPath: string): boolean => {
    // Always allow when authenticated/unlocked
    if (isAuthenticated) return true;

    // When locked, only allow specific paths
    const normalizedPath = targetPath.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
    return ALLOWED_LOCKED_PATHS.some(allowed =>
      normalizedPath === allowed || normalizedPath.startsWith(allowed + '/')
    );
  };

  // Navigate file system
  const navigatePath = (path: string, currentDir: string): FileSystemNode | null => {
    let targetPath = path;
    if (!path.startsWith('/')) {
      targetPath = `${currentDir}/${path}`.replace(/\/+/g, '/');
    }

    const parts = targetPath.split('/').filter(Boolean);
    let current: FileSystemNode | null = fileSystem;

    for (const part of parts) {
      if (part === '..') {
        // Go up one level (simplified)
        continue;
      }
      if (part === '.') continue;

      if (current?.type === 'directory' && current.children) {
        current = current.children.find(c => c.name === part) || null;
      } else {
        return null;
      }
    }

    return current;
  };

  // Parse combined ls flags like -ltra, -laS, etc.
  const parseLsFlags = (flagArgs: string[]): {
    showAll: boolean;
    longFormat: boolean;
    sortByTime: boolean;
    sortBySize: boolean;
    reverse: boolean;
    humanReadable: boolean;
    recursive: boolean;
    onePerLine: boolean;
  } => {
    const result = {
      showAll: false,
      longFormat: false,
      sortByTime: false,
      sortBySize: false,
      reverse: false,
      humanReadable: false,
      recursive: false,
      onePerLine: false,
    };

    for (const arg of flagArgs) {
      if (!arg.startsWith('-')) continue;
      const chars = arg.slice(1);
      for (const char of chars) {
        switch (char) {
          case 'a': result.showAll = true; break;
          case 'l': result.longFormat = true; break;
          case 't': result.sortByTime = true; break;
          case 'r': result.reverse = true; break;
          case 'S': result.sortBySize = true; break;
          case 'h': result.humanReadable = true; break;
          case 'R': result.recursive = true; break;
          case '1': result.onePerLine = true; break;
        }
      }
    }
    return result;
  };

  // Format file size for human readable output
  const formatSize = (bytes: number, humanReadable: boolean): string => {
    if (!humanReadable) {
      return bytes.toString().padStart(8);
    }
    if (bytes < 1024) return bytes.toString().padStart(6);
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`.padStart(6);
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}M`.padStart(6);
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}G`.padStart(6);
  };

  // Format date for ls -l output
  const formatDate = (date?: Date): string => {
    if (!date) date = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate().toString().padStart(2);
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    return `${month} ${day} ${hours}:${mins}`;
  };

  // List directory contents with enhanced options
  const listDirectory = (
    node: FileSystemNode,
    options: {
      showAll: boolean;
      longFormat: boolean;
      sortByTime: boolean;
      sortBySize: boolean;
      reverse: boolean;
      humanReadable: boolean;
      onePerLine: boolean;
    }
  ): string[] => {
    if (node.type !== 'directory' || !node.children) {
      return ['Not a directory'];
    }

    let items = node.children.filter(c => options.showAll || !c.name.startsWith('.'));

    // Apply sorting
    if (options.sortBySize) {
      items = [...items].sort((a, b) => (b.size || 0) - (a.size || 0));
    } else if (options.sortByTime) {
      items = [...items].sort((a, b) => {
        const timeA = a.modified?.getTime() || 0;
        const timeB = b.modified?.getTime() || 0;
        return timeB - timeA;
      });
    } else {
      // Default: sort alphabetically
      items = [...items].sort((a, b) => a.name.localeCompare(b.name));
    }

    // Apply reverse
    if (options.reverse) {
      items = items.reverse();
    }

    if (options.longFormat) {
      const total = items.reduce((sum, item) => sum + (item.size || 4096), 0);
      const results: string[] = [`total ${Math.ceil(total / 1024)}`];

      for (const item of items) {
        const type = item.type === 'directory' ? 'd' : '-';
        const perms = item.permissions || 'rwxr-xr-x';
        const links = item.type === 'directory' ? '2' : '1';
        const owner = item.owner || 'admin';
        const group = 'admin';
        const size = formatSize(item.size || 4096, options.humanReadable);
        const date = formatDate(item.modified);
        const name = item.name + (item.type === 'directory' ? '/' : '');
        results.push(`${type}${perms} ${links.padStart(2)} ${owner.padEnd(8)} ${group.padEnd(8)} ${size} ${date} ${name}`);
      }
      return results;
    }

    // One per line (-1 flag)
    if (options.onePerLine) {
      return items.map(item => item.type === 'directory' ? `${item.name}/` : item.name);
    }

    // Default: space-separated on single line
    return [items.map(item =>
      item.type === 'directory' ? `${item.name}/` : item.name
    ).join('  ')];
  };

  const handleCommand = useCallback((command: string) => {
    if (!command.trim()) return;

    const newLine: TerminalLine = {
      id: Date.now().toString(),
      type: 'input',
      content: `${currentSession?.env.USER || 'admin'}@rustpress:${currentSession?.cwd || '/'}$ ${command}`,
      timestamp: new Date()
    };

    setCommandHistory(prev => [...prev, command]);
    setHistoryIndex(-1);

    const args = command.trim().split(/\s+/);
    const cmd = args[0].toLowerCase();
    const cmdArgs = args.slice(1);

    let outputLines: TerminalLine[] = [];
    let newCwd = currentSession?.cwd || '/rustpress';

    // Parse flags
    const flags = cmdArgs.filter(a => a.startsWith('-'));
    const params = cmdArgs.filter(a => !a.startsWith('-'));

    switch (cmd) {
      // ===============================
      // HELP COMMANDS
      // ===============================
      case 'help':
        outputLines = [
          { id: `${Date.now()}-1`, type: 'info', content: '', timestamp: new Date() },
          { id: `${Date.now()}-2`, type: 'info', content: '═══════════════════════════════════════════════════════════════', timestamp: new Date() },
          { id: `${Date.now()}-3`, type: 'info', content: '                    AVAILABLE COMMANDS', timestamp: new Date() },
          { id: `${Date.now()}-4`, type: 'info', content: '═══════════════════════════════════════════════════════════════', timestamp: new Date() },
          { id: `${Date.now()}-5`, type: 'output', content: '', timestamp: new Date() },
          { id: `${Date.now()}-6`, type: 'success', content: '  FILE SYSTEM:', timestamp: new Date() },
          { id: `${Date.now()}-7`, type: 'output', content: '    ls [flags] [path]  List directory contents', timestamp: new Date() },
          { id: `${Date.now()}-7a`, type: 'output', content: '       -l  long format    -a  show hidden   -t  sort by time', timestamp: new Date() },
          { id: `${Date.now()}-7b`, type: 'output', content: '       -r  reverse order  -S  sort by size  -h  human sizes', timestamp: new Date() },
          { id: `${Date.now()}-7c`, type: 'output', content: '       -1  one per line   (combine: -ltra, -lahS, etc.)', timestamp: new Date() },
          { id: `${Date.now()}-8`, type: 'output', content: '    cd <dir>           Change directory', timestamp: new Date() },
          { id: `${Date.now()}-9`, type: 'output', content: '    pwd                Print working directory', timestamp: new Date() },
          { id: `${Date.now()}-10`, type: 'output', content: '    cat <file>         Display file contents', timestamp: new Date() },
          { id: `${Date.now()}-11`, type: 'output', content: '    mkdir <dir>        Create directory', timestamp: new Date() },
          { id: `${Date.now()}-12`, type: 'output', content: '    touch <file>       Create empty file', timestamp: new Date() },
          { id: `${Date.now()}-13`, type: 'output', content: '    rm [-rf] <path>    Remove file/directory', timestamp: new Date() },
          { id: `${Date.now()}-14`, type: 'output', content: '    cp <src> <dest>    Copy file', timestamp: new Date() },
          { id: `${Date.now()}-15`, type: 'output', content: '    mv <src> <dest>    Move/rename file', timestamp: new Date() },
          { id: `${Date.now()}-16`, type: 'output', content: '    find <pattern>     Find files', timestamp: new Date() },
          { id: `${Date.now()}-17`, type: 'output', content: '    tree               Display directory tree', timestamp: new Date() },
          { id: `${Date.now()}-18`, type: 'output', content: '', timestamp: new Date() },
          { id: `${Date.now()}-19`, type: 'success', content: '  TEXT PROCESSING:', timestamp: new Date() },
          { id: `${Date.now()}-20`, type: 'output', content: '    echo <text>        Print text', timestamp: new Date() },
          { id: `${Date.now()}-21`, type: 'output', content: '    grep <pattern>     Search for pattern', timestamp: new Date() },
          { id: `${Date.now()}-22`, type: 'output', content: '    head <file>        Display first lines', timestamp: new Date() },
          { id: `${Date.now()}-23`, type: 'output', content: '    tail <file>        Display last lines', timestamp: new Date() },
          { id: `${Date.now()}-24`, type: 'output', content: '    wc <file>          Count lines/words/chars', timestamp: new Date() },
          { id: `${Date.now()}-25`, type: 'output', content: '', timestamp: new Date() },
          { id: `${Date.now()}-26`, type: 'success', content: '  SYSTEM:', timestamp: new Date() },
          { id: `${Date.now()}-27`, type: 'output', content: '    whoami             Current user', timestamp: new Date() },
          { id: `${Date.now()}-28`, type: 'output', content: '    date               Current date/time', timestamp: new Date() },
          { id: `${Date.now()}-29`, type: 'output', content: '    uptime             System uptime', timestamp: new Date() },
          { id: `${Date.now()}-30`, type: 'output', content: '    uname [-a]         System information', timestamp: new Date() },
          { id: `${Date.now()}-31`, type: 'output', content: '    env                Environment variables', timestamp: new Date() },
          { id: `${Date.now()}-32`, type: 'output', content: '    export VAR=val     Set environment variable', timestamp: new Date() },
          { id: `${Date.now()}-33`, type: 'output', content: '    hostname           Display hostname', timestamp: new Date() },
          { id: `${Date.now()}-34`, type: 'output', content: '    df                 Disk space usage', timestamp: new Date() },
          { id: `${Date.now()}-35`, type: 'output', content: '    free               Memory usage', timestamp: new Date() },
          { id: `${Date.now()}-36`, type: 'output', content: '    ps                 Process list', timestamp: new Date() },
          { id: `${Date.now()}-37`, type: 'output', content: '', timestamp: new Date() },
          { id: `${Date.now()}-38`, type: 'success', content: '  TERMINAL:', timestamp: new Date() },
          { id: `${Date.now()}-39`, type: 'output', content: '    clear              Clear terminal', timestamp: new Date() },
          { id: `${Date.now()}-40`, type: 'output', content: '    history            Command history', timestamp: new Date() },
          { id: `${Date.now()}-41`, type: 'output', content: '    exit               Close terminal session', timestamp: new Date() },
          { id: `${Date.now()}-42`, type: 'output', content: '', timestamp: new Date() },
          { id: `${Date.now()}-43`, type: 'warning', content: '  RUSTPRESS CLI:', timestamp: new Date() },
          { id: `${Date.now()}-44`, type: 'output', content: '    rustpress-cli      RustPress command line tool', timestamp: new Date() },
          { id: `${Date.now()}-45`, type: 'output', content: '    (use --help for full command list)', timestamp: new Date() },
          { id: `${Date.now()}-46`, type: 'output', content: '', timestamp: new Date() },
          { id: `${Date.now()}-47`, type: 'info', content: '═══════════════════════════════════════════════════════════════', timestamp: new Date() },
        ];
        break;

      // ===============================
      // RUSTPRESS CLI
      // ===============================
      case 'rustpress-cli':
      case 'rustpress':
        if (cmdArgs.includes('--help') || cmdArgs.includes('-h') || cmdArgs.length === 0) {
          outputLines = [
            { id: `${Date.now()}-1`, type: 'info', content: '', timestamp: new Date() },
            { id: `${Date.now()}-2`, type: 'info', content: '╔══════════════════════════════════════════════════════════════╗', timestamp: new Date() },
            { id: `${Date.now()}-3`, type: 'info', content: '║           RustPress CLI v1.0.0 - Command Reference          ║', timestamp: new Date() },
            { id: `${Date.now()}-4`, type: 'info', content: '╚══════════════════════════════════════════════════════════════╝', timestamp: new Date() },
            { id: `${Date.now()}-5`, type: 'output', content: '', timestamp: new Date() },
            { id: `${Date.now()}-6`, type: 'success', content: 'USAGE:', timestamp: new Date() },
            { id: `${Date.now()}-7`, type: 'output', content: '    rustpress-cli <COMMAND> [OPTIONS]', timestamp: new Date() },
            { id: `${Date.now()}-8`, type: 'output', content: '', timestamp: new Date() },
            { id: `${Date.now()}-9`, type: 'success', content: 'SERVER COMMANDS:', timestamp: new Date() },
            { id: `${Date.now()}-10`, type: 'output', content: '    start              Start RustPress server', timestamp: new Date() },
            { id: `${Date.now()}-11`, type: 'output', content: '    stop               Stop RustPress server', timestamp: new Date() },
            { id: `${Date.now()}-12`, type: 'output', content: '    restart            Restart RustPress server', timestamp: new Date() },
            { id: `${Date.now()}-13`, type: 'output', content: '    status             Check server status', timestamp: new Date() },
            { id: `${Date.now()}-14`, type: 'output', content: '    logs [-f]          View server logs', timestamp: new Date() },
            { id: `${Date.now()}-15`, type: 'output', content: '', timestamp: new Date() },
            { id: `${Date.now()}-16`, type: 'success', content: 'CONTENT COMMANDS:', timestamp: new Date() },
            { id: `${Date.now()}-17`, type: 'output', content: '    post list          List all posts', timestamp: new Date() },
            { id: `${Date.now()}-18`, type: 'output', content: '    post create        Create new post', timestamp: new Date() },
            { id: `${Date.now()}-19`, type: 'output', content: '    post publish <id>  Publish a post', timestamp: new Date() },
            { id: `${Date.now()}-20`, type: 'output', content: '    page list          List all pages', timestamp: new Date() },
            { id: `${Date.now()}-21`, type: 'output', content: '    media list         List media files', timestamp: new Date() },
            { id: `${Date.now()}-22`, type: 'output', content: '', timestamp: new Date() },
            { id: `${Date.now()}-23`, type: 'success', content: 'THEME COMMANDS:', timestamp: new Date() },
            { id: `${Date.now()}-24`, type: 'output', content: '    theme list         List installed themes', timestamp: new Date() },
            { id: `${Date.now()}-25`, type: 'output', content: '    theme active       Show active theme', timestamp: new Date() },
            { id: `${Date.now()}-26`, type: 'output', content: '    theme set <name>   Activate a theme', timestamp: new Date() },
            { id: `${Date.now()}-27`, type: 'output', content: '    theme create       Create new theme', timestamp: new Date() },
            { id: `${Date.now()}-28`, type: 'output', content: '', timestamp: new Date() },
            { id: `${Date.now()}-29`, type: 'success', content: 'PLUGIN COMMANDS:', timestamp: new Date() },
            { id: `${Date.now()}-30`, type: 'output', content: '    plugin list        List installed plugins', timestamp: new Date() },
            { id: `${Date.now()}-31`, type: 'output', content: '    plugin enable      Enable a plugin', timestamp: new Date() },
            { id: `${Date.now()}-32`, type: 'output', content: '    plugin disable     Disable a plugin', timestamp: new Date() },
            { id: `${Date.now()}-33`, type: 'output', content: '    plugin install     Install a plugin', timestamp: new Date() },
            { id: `${Date.now()}-34`, type: 'output', content: '', timestamp: new Date() },
            { id: `${Date.now()}-35`, type: 'success', content: 'APP COMMANDS:', timestamp: new Date() },
            { id: `${Date.now()}-36`, type: 'output', content: '    app list           List installed apps', timestamp: new Date() },
            { id: `${Date.now()}-37`, type: 'output', content: '    app start <name>   Start an app', timestamp: new Date() },
            { id: `${Date.now()}-38`, type: 'output', content: '    app stop <name>    Stop an app', timestamp: new Date() },
            { id: `${Date.now()}-39`, type: 'output', content: '    app logs <name>    View app logs', timestamp: new Date() },
            { id: `${Date.now()}-40`, type: 'output', content: '', timestamp: new Date() },
            { id: `${Date.now()}-41`, type: 'success', content: 'DATABASE COMMANDS:', timestamp: new Date() },
            { id: `${Date.now()}-42`, type: 'output', content: '    db status          Database status', timestamp: new Date() },
            { id: `${Date.now()}-43`, type: 'output', content: '    db backup          Create backup', timestamp: new Date() },
            { id: `${Date.now()}-44`, type: 'output', content: '    db restore <file>  Restore from backup', timestamp: new Date() },
            { id: `${Date.now()}-45`, type: 'output', content: '    db migrate         Run migrations', timestamp: new Date() },
            { id: `${Date.now()}-46`, type: 'output', content: '', timestamp: new Date() },
            { id: `${Date.now()}-47`, type: 'success', content: 'USER COMMANDS:', timestamp: new Date() },
            { id: `${Date.now()}-48`, type: 'output', content: '    user list          List all users', timestamp: new Date() },
            { id: `${Date.now()}-49`, type: 'output', content: '    user create        Create new user', timestamp: new Date() },
            { id: `${Date.now()}-50`, type: 'output', content: '    user role <email>  Change user role', timestamp: new Date() },
            { id: `${Date.now()}-51`, type: 'output', content: '', timestamp: new Date() },
            { id: `${Date.now()}-52`, type: 'success', content: 'CACHE COMMANDS:', timestamp: new Date() },
            { id: `${Date.now()}-53`, type: 'output', content: '    cache clear        Clear all caches', timestamp: new Date() },
            { id: `${Date.now()}-54`, type: 'output', content: '    cache status       Cache statistics', timestamp: new Date() },
            { id: `${Date.now()}-55`, type: 'output', content: '', timestamp: new Date() },
            { id: `${Date.now()}-56`, type: 'success', content: 'CONFIG COMMANDS:', timestamp: new Date() },
            { id: `${Date.now()}-57`, type: 'output', content: '    config show        Show configuration', timestamp: new Date() },
            { id: `${Date.now()}-58`, type: 'output', content: '    config set <k> <v> Set config value', timestamp: new Date() },
            { id: `${Date.now()}-59`, type: 'output', content: '    config reload      Reload configuration', timestamp: new Date() },
            { id: `${Date.now()}-60`, type: 'output', content: '', timestamp: new Date() },
            { id: `${Date.now()}-61`, type: 'info', content: 'Run "rustpress-cli <command> --help" for command-specific help', timestamp: new Date() },
          ];
        } else if (cmdArgs[0] === 'status') {
          outputLines = [
            { id: `${Date.now()}-1`, type: 'success', content: '● RustPress Server Status', timestamp: new Date() },
            { id: `${Date.now()}-2`, type: 'output', content: '  Status:    Running', timestamp: new Date() },
            { id: `${Date.now()}-3`, type: 'output', content: '  Port:      3080', timestamp: new Date() },
            { id: `${Date.now()}-4`, type: 'output', content: '  Uptime:    2 days, 14 hours', timestamp: new Date() },
            { id: `${Date.now()}-5`, type: 'output', content: '  Memory:    124 MB / 512 MB', timestamp: new Date() },
            { id: `${Date.now()}-6`, type: 'output', content: '  CPU:       2.3%', timestamp: new Date() },
            { id: `${Date.now()}-7`, type: 'output', content: '  Database:  Connected', timestamp: new Date() },
            { id: `${Date.now()}-8`, type: 'output', content: '  Cache:     Redis (Connected)', timestamp: new Date() },
          ];
        } else if (cmdArgs[0] === 'theme' && cmdArgs[1] === 'list') {
          outputLines = [
            { id: `${Date.now()}-1`, type: 'output', content: 'Installed Themes:', timestamp: new Date() },
            { id: `${Date.now()}-2`, type: 'success', content: '  * default      (active)', timestamp: new Date() },
            { id: `${Date.now()}-3`, type: 'output', content: '    developer    v1.2.0', timestamp: new Date() },
            { id: `${Date.now()}-4`, type: 'output', content: '    minimal      v1.0.0', timestamp: new Date() },
          ];
        } else if (cmdArgs[0] === 'plugin' && cmdArgs[1] === 'list') {
          outputLines = [
            { id: `${Date.now()}-1`, type: 'output', content: 'Installed Plugins:', timestamp: new Date() },
            { id: `${Date.now()}-2`, type: 'success', content: '  ● seo           Enabled   v2.1.0', timestamp: new Date() },
            { id: `${Date.now()}-3`, type: 'success', content: '  ● analytics     Enabled   v1.5.0', timestamp: new Date() },
            { id: `${Date.now()}-4`, type: 'warning', content: '  ○ comments      Disabled  v1.0.0', timestamp: new Date() },
          ];
        } else if (cmdArgs[0] === 'cache' && cmdArgs[1] === 'clear') {
          outputLines = [
            { id: `${Date.now()}-1`, type: 'info', content: 'Clearing caches...', timestamp: new Date() },
            { id: `${Date.now()}-2`, type: 'output', content: '  ✓ Page cache cleared (245 items)', timestamp: new Date() },
            { id: `${Date.now()}-3`, type: 'output', content: '  ✓ Asset cache cleared (89 items)', timestamp: new Date() },
            { id: `${Date.now()}-4`, type: 'output', content: '  ✓ Database cache cleared', timestamp: new Date() },
            { id: `${Date.now()}-5`, type: 'success', content: 'All caches cleared successfully!', timestamp: new Date() },
          ];
        } else {
          outputLines = [
            { id: `${Date.now()}-1`, type: 'output', content: `Executing: rustpress-cli ${cmdArgs.join(' ')}`, timestamp: new Date() },
            { id: `${Date.now()}-2`, type: 'success', content: 'Command completed successfully.', timestamp: new Date() },
          ];
        }
        break;

      // ===============================
      // FILE SYSTEM COMMANDS
      // ===============================
      case 'clear':
        setSessions(prev => prev.map(s =>
          s.id === activeSession ? { ...s, lines: [] } : s
        ));
        return;

      case 'ls':
        const lsPath = params[0] || '.';
        const lsOptions = parseLsFlags(flags);

        const targetNode = lsPath === '.' ? navigatePath(currentSession?.cwd || '/', '/') : navigatePath(lsPath, currentSession?.cwd || '/');

        if (targetNode) {
          const listings = listDirectory(targetNode, lsOptions);
          outputLines = listings.map((line, i) => ({
            id: `${Date.now()}-${i}`,
            type: 'output' as const,
            content: line,
            timestamp: new Date()
          }));
        } else {
          outputLines = [{ id: `${Date.now()}-1`, type: 'error', content: `ls: cannot access '${lsPath}': No such file or directory`, timestamp: new Date() }];
        }
        break;

      case 'cd':
        const cdPath = params[0] || '~';
        let targetPath = cdPath;

        if (cdPath === '~' || cdPath === '$HOME') {
          targetPath = '/home/admin';
        } else if (cdPath === '-') {
          // Go to previous directory (simplified)
          targetPath = '/rustpress';
        } else if (!cdPath.startsWith('/')) {
          targetPath = `${currentSession?.cwd}/${cdPath}`.replace(/\/+/g, '/');
        }

        // Handle .. navigation
        if (targetPath.includes('..')) {
          const parts = targetPath.split('/').filter(Boolean);
          const resolved: string[] = [];
          for (const part of parts) {
            if (part === '..') {
              resolved.pop();
            } else if (part !== '.') {
              resolved.push(part);
            }
          }
          targetPath = '/' + resolved.join('/');
        }

        // Check if navigation is allowed based on lock state
        if (!isNavigationAllowed(targetPath)) {
          outputLines = [{
            id: `${Date.now()}-1`,
            type: 'error',
            content: `cd: ${cdPath}: Access denied - IDE is locked. Unlock to access restricted directories.`,
            timestamp: new Date()
          }];
          break;
        }

        const cdNode = navigatePath(targetPath, '/');
        if (cdNode && cdNode.type === 'directory') {
          newCwd = targetPath || '/';
          outputLines = [];
        } else {
          outputLines = [{ id: `${Date.now()}-1`, type: 'error', content: `cd: ${cdPath}: No such directory`, timestamp: new Date() }];
        }
        break;

      case 'pwd':
        outputLines = [{ id: `${Date.now()}-1`, type: 'output', content: currentSession?.cwd || '/', timestamp: new Date() }];
        break;

      case 'cat':
        if (params.length === 0) {
          outputLines = [{ id: `${Date.now()}-1`, type: 'error', content: 'cat: missing operand', timestamp: new Date() }];
        } else {
          const catNode = navigatePath(params[0], currentSession?.cwd || '/');
          if (catNode && catNode.type === 'file') {
            outputLines = [{ id: `${Date.now()}-1`, type: 'output', content: catNode.content || '', timestamp: new Date() }];
          } else {
            outputLines = [{ id: `${Date.now()}-1`, type: 'error', content: `cat: ${params[0]}: No such file`, timestamp: new Date() }];
          }
        }
        break;

      case 'mkdir':
        if (params.length === 0) {
          outputLines = [{ id: `${Date.now()}-1`, type: 'error', content: 'mkdir: missing operand', timestamp: new Date() }];
        } else {
          outputLines = [{ id: `${Date.now()}-1`, type: 'success', content: `mkdir: created directory '${params[0]}'`, timestamp: new Date() }];
        }
        break;

      case 'touch':
        if (params.length === 0) {
          outputLines = [{ id: `${Date.now()}-1`, type: 'error', content: 'touch: missing file operand', timestamp: new Date() }];
        } else {
          outputLines = [{ id: `${Date.now()}-1`, type: 'success', content: `touch: created '${params[0]}'`, timestamp: new Date() }];
        }
        break;

      case 'rm':
        if (params.length === 0) {
          outputLines = [{ id: `${Date.now()}-1`, type: 'error', content: 'rm: missing operand', timestamp: new Date() }];
        } else {
          outputLines = [{ id: `${Date.now()}-1`, type: 'success', content: `rm: removed '${params[0]}'`, timestamp: new Date() }];
        }
        break;

      case 'cp':
        if (params.length < 2) {
          outputLines = [{ id: `${Date.now()}-1`, type: 'error', content: 'cp: missing destination operand', timestamp: new Date() }];
        } else {
          outputLines = [{ id: `${Date.now()}-1`, type: 'success', content: `cp: '${params[0]}' -> '${params[1]}'`, timestamp: new Date() }];
        }
        break;

      case 'mv':
        if (params.length < 2) {
          outputLines = [{ id: `${Date.now()}-1`, type: 'error', content: 'mv: missing destination operand', timestamp: new Date() }];
        } else {
          outputLines = [{ id: `${Date.now()}-1`, type: 'success', content: `mv: '${params[0]}' -> '${params[1]}'`, timestamp: new Date() }];
        }
        break;

      case 'find':
        outputLines = [
          { id: `${Date.now()}-1`, type: 'output', content: './themes/default/index.html', timestamp: new Date() },
          { id: `${Date.now()}-2`, type: 'output', content: './themes/default/style.css', timestamp: new Date() },
          { id: `${Date.now()}-3`, type: 'output', content: './functions/auth.rs', timestamp: new Date() },
        ];
        break;

      case 'tree':
        outputLines = [
          { id: `${Date.now()}-1`, type: 'output', content: '.', timestamp: new Date() },
          { id: `${Date.now()}-2`, type: 'output', content: '├── themes/', timestamp: new Date() },
          { id: `${Date.now()}-3`, type: 'output', content: '│   ├── default/', timestamp: new Date() },
          { id: `${Date.now()}-4`, type: 'output', content: '│   │   ├── index.html', timestamp: new Date() },
          { id: `${Date.now()}-5`, type: 'output', content: '│   │   ├── style.css', timestamp: new Date() },
          { id: `${Date.now()}-6`, type: 'output', content: '│   │   └── script.js', timestamp: new Date() },
          { id: `${Date.now()}-7`, type: 'output', content: '│   └── developer/', timestamp: new Date() },
          { id: `${Date.now()}-8`, type: 'output', content: '├── functions/', timestamp: new Date() },
          { id: `${Date.now()}-9`, type: 'output', content: '│   ├── auth.rs', timestamp: new Date() },
          { id: `${Date.now()}-10`, type: 'output', content: '│   └── api.rs', timestamp: new Date() },
          { id: `${Date.now()}-11`, type: 'output', content: '├── plugins/', timestamp: new Date() },
          { id: `${Date.now()}-12`, type: 'output', content: '├── apps/', timestamp: new Date() },
          { id: `${Date.now()}-13`, type: 'output', content: '├── assets/', timestamp: new Date() },
          { id: `${Date.now()}-14`, type: 'output', content: '├── config.toml', timestamp: new Date() },
          { id: `${Date.now()}-15`, type: 'output', content: '└── README.md', timestamp: new Date() },
        ];
        break;

      // ===============================
      // TEXT PROCESSING
      // ===============================
      case 'echo':
        const echoText = command.slice(5).replace(/^\$(\w+)/, (_, varName) =>
          currentSession?.env[varName] || ''
        );
        outputLines = [{ id: `${Date.now()}-1`, type: 'output', content: echoText, timestamp: new Date() }];
        break;

      case 'grep':
        outputLines = [
          { id: `${Date.now()}-1`, type: 'output', content: `Searching for: ${params[0] || '(pattern)'}`, timestamp: new Date() },
          { id: `${Date.now()}-2`, type: 'output', content: 'themes/default/style.css:12: .container { max-width: 1200px; }', timestamp: new Date() },
        ];
        break;

      case 'head':
      case 'tail':
        if (params.length === 0) {
          outputLines = [{ id: `${Date.now()}-1`, type: 'error', content: `${cmd}: missing file operand`, timestamp: new Date() }];
        } else {
          outputLines = [
            { id: `${Date.now()}-1`, type: 'output', content: `==> ${params[0]} <==`, timestamp: new Date() },
            { id: `${Date.now()}-2`, type: 'output', content: '(file contents...)', timestamp: new Date() },
          ];
        }
        break;

      case 'wc':
        outputLines = [{ id: `${Date.now()}-1`, type: 'output', content: '  42  156 1024 file.txt', timestamp: new Date() }];
        break;

      // ===============================
      // SYSTEM COMMANDS
      // ===============================
      case 'whoami':
        outputLines = [{ id: `${Date.now()}-1`, type: 'output', content: currentSession?.env.USER || 'admin', timestamp: new Date() }];
        break;

      case 'date':
        outputLines = [{ id: `${Date.now()}-1`, type: 'output', content: new Date().toString(), timestamp: new Date() }];
        break;

      case 'uptime':
        outputLines = [{ id: `${Date.now()}-1`, type: 'output', content: ' 14:32:15 up 2 days, 14:23,  1 user,  load average: 0.12, 0.15, 0.10', timestamp: new Date() }];
        break;

      case 'uname':
        if (flags.includes('-a')) {
          outputLines = [{ id: `${Date.now()}-1`, type: 'output', content: 'RustPress 1.0.0 rustpress-server x86_64 GNU/Linux', timestamp: new Date() }];
        } else {
          outputLines = [{ id: `${Date.now()}-1`, type: 'output', content: 'RustPress', timestamp: new Date() }];
        }
        break;

      case 'env':
        outputLines = Object.entries(currentSession?.env || {}).map(([ key, value ], i) => ({
          id: `${Date.now()}-${i}`,
          type: 'output' as const,
          content: `${key}=${value}`,
          timestamp: new Date()
        }));
        break;

      case 'export':
        if (params.length > 0 && params[0].includes('=')) {
          const [key, value] = params[0].split('=');
          setSessions(prev => prev.map(s =>
            s.id === activeSession
              ? { ...s, env: { ...s.env, [key]: value } }
              : s
          ));
          outputLines = [{ id: `${Date.now()}-1`, type: 'success', content: `export: ${key}=${value}`, timestamp: new Date() }];
        } else {
          outputLines = [{ id: `${Date.now()}-1`, type: 'error', content: 'export: usage: export VAR=value', timestamp: new Date() }];
        }
        break;

      case 'hostname':
        outputLines = [{ id: `${Date.now()}-1`, type: 'output', content: 'rustpress-server', timestamp: new Date() }];
        break;

      case 'df':
        outputLines = [
          { id: `${Date.now()}-1`, type: 'output', content: 'Filesystem     1K-blocks    Used Available Use% Mounted on', timestamp: new Date() },
          { id: `${Date.now()}-2`, type: 'output', content: '/dev/sda1      51200000 12800000  38400000  25% /', timestamp: new Date() },
          { id: `${Date.now()}-3`, type: 'output', content: 'tmpfs           1024000       0   1024000   0% /tmp', timestamp: new Date() },
        ];
        break;

      case 'free':
        outputLines = [
          { id: `${Date.now()}-1`, type: 'output', content: '              total        used        free      shared  buff/cache   available', timestamp: new Date() },
          { id: `${Date.now()}-2`, type: 'output', content: 'Mem:        8192000     2048000     4096000      128000     2048000     5632000', timestamp: new Date() },
          { id: `${Date.now()}-3`, type: 'output', content: 'Swap:       2048000           0     2048000', timestamp: new Date() },
        ];
        break;

      case 'ps':
        outputLines = [
          { id: `${Date.now()}-1`, type: 'output', content: '  PID TTY          TIME CMD', timestamp: new Date() },
          { id: `${Date.now()}-2`, type: 'output', content: '    1 pts/0    00:00:00 bash', timestamp: new Date() },
          { id: `${Date.now()}-3`, type: 'output', content: '   42 pts/0    00:12:34 rustpress', timestamp: new Date() },
          { id: `${Date.now()}-4`, type: 'output', content: '  123 pts/0    00:00:00 ps', timestamp: new Date() },
        ];
        break;

      case 'history':
        outputLines = commandHistory.map((cmd, i) => ({
          id: `${Date.now()}-${i}`,
          type: 'output' as const,
          content: `  ${i + 1}  ${cmd}`,
          timestamp: new Date()
        }));
        break;

      case 'exit':
        if (sessions.length === 1) {
          onClose();
        } else {
          closeSession(activeSession);
        }
        return;

      default:
        outputLines = [{ id: `${Date.now()}-1`, type: 'error', content: `bash: ${cmd}: command not found`, timestamp: new Date() }];
    }

    setSessions(prev => prev.map(s =>
      s.id === activeSession
        ? { ...s, lines: [...s.lines, newLine, ...outputLines], cwd: newCwd }
        : s
    ));

    setInput('');
  }, [activeSession, currentSession, commandHistory, fileSystem, sessions.length, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple tab completion (could be enhanced)
      const commands = ['help', 'clear', 'ls', 'cd', 'pwd', 'cat', 'mkdir', 'touch', 'rm', 'cp', 'mv', 'echo', 'grep', 'rustpress-cli'];
      const match = commands.find(c => c.startsWith(input));
      if (match) setInput(match);
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      setInput('');
      const cancelLine: TerminalLine = {
        id: Date.now().toString(),
        type: 'info',
        content: '^C',
        timestamp: new Date()
      };
      setSessions(prev => prev.map(s =>
        s.id === activeSession
          ? { ...s, lines: [...s.lines, cancelLine] }
          : s
      ));
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setSessions(prev => prev.map(s =>
        s.id === activeSession ? { ...s, lines: [] } : s
      ));
    }
  };

  const addSession = () => {
    const newId = Date.now().toString();
    setSessions(prev => [...prev, {
      id: newId,
      name: `bash ${sessions.length + 1}`,
      lines: [
        { id: '1', type: 'info', content: 'New terminal session started.', timestamp: new Date() }
      ],
      cwd: '/rustpress',
      env: {
        USER: 'admin',
        HOME: '/home/admin',
        PATH: '/usr/local/bin:/usr/bin:/bin',
        SHELL: '/bin/bash',
        RUSTPRESS_VERSION: '1.0.0'
      }
    }]);
    setActiveSession(newId);
  };

  const closeSession = (id: string) => {
    if (sessions.length === 1) return;
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSession === id) {
      setActiveSession(sessions[0].id === id ? sessions[1]?.id : sessions[0].id);
    }
  };

  // Resize handling
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newHeight = window.innerHeight - e.clientY;
      if (onHeightChange) {
        onHeightChange(Math.max(100, Math.min(500, newHeight)));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, onHeightChange]);

  // Authentication Modal - Centered on screen
  if (!isAuthenticated && showAuthModal && isOpen) {
    return (
      <>
        {/* Full screen overlay centered modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-6 w-[420px] max-w-[90vw]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Shield className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Terminal Access</h3>
                <p className="text-sm text-gray-400">Admin authentication required</p>
              </div>
            </div>

            <p className="text-sm text-gray-400 mb-6">
              Enter your admin password to access the terminal. This is a secure environment for system administration.
            </p>

            <form onSubmit={(e) => { e.preventDefault(); handleAuthenticate(); }}>
              <div className="mb-6">
                <label className="block text-sm text-gray-300 mb-2">Admin Password</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => {
                    setAuthPassword(e.target.value);
                    setAuthError(null);
                  }}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
                {authError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400 mt-2"
                  >
                    {authError}
                  </motion.p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Unlock className="w-4 h-4" />
                  Unlock Terminal
                </button>
              </div>
            </form>

            <p className="text-xs text-gray-500 mt-6 text-center">
              This action is logged for security purposes.
            </p>
          </motion.div>
        </div>

        {/* Empty terminal placeholder */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-gray-900 border-t border-gray-700"
        />
      </>
    );
  }

  // Detached floating window state
  const [detachedPosition, setDetachedPosition] = useState({ x: 100, y: 100 });
  const [detachedSize, setDetachedSize] = useState({ width: 700, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizingDetached, setIsResizingDetached] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Dragging logic for detached window
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setDetachedPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    };

    const handleMouseUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Resize logic for detached window
  useEffect(() => {
    if (!isResizingDetached) return;

    const handleMouseMove = (e: MouseEvent) => {
      setDetachedSize({
        width: Math.max(400, e.clientX - detachedPosition.x),
        height: Math.max(200, e.clientY - detachedPosition.y)
      });
    };

    const handleMouseUp = () => setIsResizingDetached(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingDetached, detachedPosition]);

  const handleDetachedDragStart = (e: React.MouseEvent) => {
    dragStartRef.current = {
      x: e.clientX - detachedPosition.x,
      y: e.clientY - detachedPosition.y
    };
    setIsDragging(true);
  };

  // Render detached floating terminal
  if (isDetached && isOpen) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-50 bg-gray-900 border border-gray-600 rounded-lg shadow-2xl flex flex-col overflow-hidden"
        style={{
          left: detachedPosition.x,
          top: detachedPosition.y,
          width: detachedSize.width,
          height: detachedSize.height
        }}
      >
        {/* Draggable Header */}
        <div
          onMouseDown={handleDetachedDragStart}
          className="flex items-center bg-gray-800 border-b border-gray-700 cursor-move select-none"
        >
          <div className="flex-1 flex items-center overflow-x-auto">
            {sessions.map(session => (
              <button
                key={session.id}
                onClick={() => setActiveSession(session.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs border-r border-gray-700 ${
                  session.id === activeSession
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <TerminalIcon className="w-3.5 h-3.5" />
                <span>{session.name}</span>
                {sessions.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); closeSession(session.id); }}
                    className="p-0.5 hover:bg-gray-600 rounded"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </button>
            ))}
            <button
              onClick={addSession}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700"
              title="New Terminal"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-1 px-2">
            <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Authenticated
            </span>
            <button
              onClick={() => setSessions(prev => prev.map(s =>
                s.id === activeSession ? { ...s, lines: [] } : s
              ))}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title="Clear"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onAttach}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title="Attach to IDE"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Terminal Content */}
        <div
          ref={scrollRef}
          onClick={() => inputRef.current?.focus()}
          className="flex-1 overflow-auto p-2 font-mono text-xs cursor-text scrollbar-auto-hide"
        >
          {currentSession?.lines.map(line => (
            <div
              key={line.id}
              className={`py-0.5 whitespace-pre-wrap ${
                line.type === 'error' ? 'text-red-400' :
                line.type === 'info' ? 'text-blue-400' :
                line.type === 'success' ? 'text-green-400' :
                line.type === 'warning' ? 'text-yellow-400' :
                line.type === 'input' ? 'text-emerald-400' : 'text-gray-300'
              }`}
            >
              {line.content}
            </div>
          ))}
          <div className="flex items-center text-emerald-400">
            <span className="mr-2">{currentSession?.env.USER || 'admin'}@rustpress:{currentSession?.cwd || '/'}$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none text-white"
              spellCheck={false}
              autoFocus
            />
          </div>
        </div>

        {/* Resize Handle */}
        <div
          onMouseDown={() => setIsResizingDetached(true)}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          style={{
            background: 'linear-gradient(135deg, transparent 50%, #4a4a5a 50%)'
          }}
        />
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-gray-900 border-t border-gray-700 flex flex-col"
        >
          {/* Resize Handle */}
          <div
            ref={resizeRef}
            onMouseDown={handleResizeStart}
            className={`h-1 cursor-row-resize hover:bg-blue-500 transition-colors ${isResizing ? 'bg-blue-500' : 'bg-gray-700'}`}
          />

          {/* Tab Bar */}
          <div className="flex items-center bg-gray-800 border-b border-gray-700">
            <div className="flex-1 flex items-center overflow-x-auto">
              {sessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => setActiveSession(session.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs border-r border-gray-700 ${
                    session.id === activeSession
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <TerminalIcon className="w-3.5 h-3.5" />
                  <span>{session.name}</span>
                  {sessions.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); closeSession(session.id); }}
                      className="p-0.5 hover:bg-gray-600 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </button>
              ))}
              <button
                onClick={addSession}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700"
                title="New Terminal"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-1 px-2">
              <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Authenticated
              </span>
              <button
                onClick={() => setSessions(prev => prev.map(s =>
                  s.id === activeSession ? { ...s, lines: [] } : s
                ))}
                className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                title="Clear"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              {isDetached ? (
                <button
                  onClick={onAttach}
                  className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                  title="Attach to IDE"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onDetach}
                  className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                  title="Detach Terminal"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Terminal Content */}
          <div
            ref={scrollRef}
            onClick={() => inputRef.current?.focus()}
            className="flex-1 overflow-auto p-2 font-mono text-xs cursor-text scrollbar-auto-hide"
          >
            {currentSession?.lines.map(line => (
              <div
                key={line.id}
                className={`py-0.5 whitespace-pre-wrap ${
                  line.type === 'error' ? 'text-red-400' :
                  line.type === 'info' ? 'text-blue-400' :
                  line.type === 'success' ? 'text-green-400' :
                  line.type === 'warning' ? 'text-yellow-400' :
                  line.type === 'input' ? 'text-emerald-400' : 'text-gray-300'
                }`}
              >
                {line.content}
              </div>
            ))}
            <div className="flex items-center text-emerald-400">
              <span className="mr-2">{currentSession?.env.USER || 'admin'}@rustpress:{currentSession?.cwd || '/'}$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none text-white"
                spellCheck={false}
                autoFocus
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Terminal;
