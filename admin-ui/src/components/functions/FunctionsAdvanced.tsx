'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Bot,
  Sparkles,
  Send,
  MessageSquare,
  Code,
  Lightbulb,
  Wand2,
  Copy,
  Check,
  Star,
  StarOff,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Users,
  UserCircle,
  Circle,
  Eye,
  EyeOff,
  Layout,
  LayoutGrid,
  FileCode,
  FileText,
  Download,
  Upload,
  Package,
  FolderOpen,
  Folder,
  ChevronRight,
  ChevronDown,
  Play,
  Pause,
  Square,
  Clock,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Target,
  Crosshair,
  Bug,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Keyboard,
  Command,
  Option,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CornerDownLeft,
  Palette,
  Sun,
  Moon,
  Monitor,
  Columns,
  Rows,
  Maximize2,
  Minimize2,
  Settings,
  Sliders,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  Link,
  Unlink,
  Share2,
  Archive,
  BookOpen,
  Hash,
  Tag,
  Bookmark,
  BookmarkPlus,
  History,
  GitBranch,
  Cpu,
  MemoryStick,
  HardDrive,
  Network,
  Timer,
  Flame,
  Layers,
  Box,
  Boxes,
  Component,
  Puzzle,
  Braces,
  Terminal,
  FileJson,
  FileCode2,
  Workflow,
  MousePointer,
  Hand,
  Type,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Table,
  Image,
  Video,
  Music,
  Database,
  Server,
  Cloud,
  CloudUpload,
  CloudDownload,
  Lock,
  Unlock,
  Key,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Globe,
  Map,
  Navigation,
  Compass,
  Home,
  Building,
  Store,
  Briefcase,
  Wallet,
  CreditCard,
  DollarSign,
  Percent,
  Calculator,
  Calendar,
  CalendarDays,
  Bell,
  BellRing,
  Mail,
  Phone,
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Headphones,
  Speaker,
  Mic,
  Camera,
  Aperture,
  Focus,
  Scan,
  QrCode,
  Fingerprint,
  Eye as EyeIcon,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  MessagesSquare,
  AtSign,
  Smile,
  Meh,
  Frown,
  Angry,
  Laugh,
  Award,
  Trophy,
  Medal,
  Crown,
  Gem,
  Gift,
  Cake,
  PartyPopper,
  Rocket,
  Plane,
  Car,
  Train,
  Bus,
  Bike,
  Footprints,
  TreePine,
  Flower,
  Leaf,
  Droplet,
  Wind,
  Snowflake,
  CloudRain,
  CloudSun,
  Sunrise,
  Sunset,
  Umbrella,
  Thermometer,
  Flame as FlameIcon,
  Waves,
  Mountain,
  Tent,
  Anchor,
  Sailboat,
  Fish,
  Bird,
  Cat,
  Dog,
  Rabbit,
  Turtle,
  Bug as BugIcon,
  Rat,
  Squirrel,
  PawPrint,
  Bone
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

// AI Code Assistant Types
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  codeBlocks?: AICodeBlock[];
  suggestions?: AISuggestion[];
  isLoading?: boolean;
}

export interface AICodeBlock {
  id: string;
  language: string;
  code: string;
  filename?: string;
  explanation?: string;
}

export interface AISuggestion {
  id: string;
  type: 'fix' | 'optimization' | 'refactor' | 'documentation' | 'test';
  title: string;
  description: string;
  code?: string;
  confidence: number;
}

export interface AIContext {
  currentFile?: string;
  selectedCode?: string;
  errorContext?: string;
  functionContext?: string;
}

// Code Snippets Types
export interface CodeSnippet {
  id: string;
  name: string;
  description: string;
  language: string;
  code: string;
  tags: string[];
  category: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  isFavorite: boolean;
  isPublic: boolean;
  variables?: SnippetVariable[];
}

export interface SnippetVariable {
  name: string;
  defaultValue: string;
  description: string;
}

export interface SnippetCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

// Collaborative Editing Types
export interface CollaboratorCursor {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  userAvatar?: string;
  line: number;
  column: number;
  selection?: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
  lastActive: Date;
  isTyping: boolean;
}

export interface CollaboratorUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  status: 'online' | 'away' | 'offline';
  role: 'owner' | 'editor' | 'viewer';
  currentFile?: string;
  joinedAt: Date;
}

export interface CollaborativeSession {
  id: string;
  name: string;
  createdAt: Date;
  owner: CollaboratorUser;
  participants: CollaboratorUser[];
  activeFile?: string;
  isLocked: boolean;
}

// Function Templates Types
export interface FunctionTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  language: string;
  code: string;
  thumbnail?: string;
  author: string;
  downloads: number;
  rating: number;
  ratingCount: number;
  tags: string[];
  dependencies: string[];
  createdAt: Date;
  updatedAt: Date;
  isOfficial: boolean;
  isPremium: boolean;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
}

// API Documentation Types
export interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  summary: string;
  description: string;
  parameters: APIParameter[];
  requestBody?: APIRequestBody;
  responses: APIResponse[];
  tags: string[];
  deprecated: boolean;
  security?: string[];
}

export interface APIParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required: boolean;
  type: string;
  description: string;
  example?: string;
}

export interface APIRequestBody {
  contentType: string;
  schema: string;
  example: string;
  required: boolean;
}

export interface APIResponse {
  statusCode: number;
  description: string;
  schema?: string;
  example?: string;
}

// Performance Profiler Types
export interface ProfilerData {
  id: string;
  functionName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  memory: {
    used: number;
    peak: number;
    allocated: number;
  };
  cpu: {
    user: number;
    system: number;
    total: number;
  };
  calls: ProfilerCall[];
  hotspots: ProfilerHotspot[];
  flamegraph?: ProfilerFlameNode;
}

export interface ProfilerCall {
  id: string;
  name: string;
  file: string;
  line: number;
  duration: number;
  selfTime: number;
  calls: number;
  percentage: number;
}

export interface ProfilerHotspot {
  file: string;
  line: number;
  function: string;
  selfTime: number;
  totalTime: number;
  percentage: number;
  suggestion?: string;
}

export interface ProfilerFlameNode {
  name: string;
  value: number;
  children?: ProfilerFlameNode[];
}

// Debugging Breakpoints Types
export interface Breakpoint {
  id: string;
  file: string;
  line: number;
  column?: number;
  enabled: boolean;
  condition?: string;
  hitCount?: number;
  logMessage?: string;
  type: 'line' | 'conditional' | 'logpoint' | 'exception';
  verified: boolean;
}

export interface DebugVariable {
  name: string;
  value: string;
  type: string;
  expandable: boolean;
  children?: DebugVariable[];
}

export interface DebugCallStack {
  id: string;
  name: string;
  file: string;
  line: number;
  column: number;
  isCurrentFrame: boolean;
}

export interface DebugSession {
  id: string;
  status: 'running' | 'paused' | 'stopped';
  currentFile?: string;
  currentLine?: number;
  breakpoints: Breakpoint[];
  callStack: DebugCallStack[];
  variables: DebugVariable[];
}

// Import/Export Types
export interface ExportConfig {
  format: 'json' | 'yaml' | 'zip' | 'tar';
  includeCode: boolean;
  includeDependencies: boolean;
  includeConfig: boolean;
  includeEnvVariables: boolean;
  includeSecrets: boolean;
  includeLogs: boolean;
  compression: 'none' | 'gzip' | 'bzip2';
}

export interface ImportResult {
  success: boolean;
  functionsImported: number;
  errors: string[];
  warnings: string[];
  skipped: string[];
}

export interface ExportableFunction {
  id: string;
  name: string;
  description: string;
  size: number;
  lastModified: Date;
  selected: boolean;
}

// Keyboard Shortcuts Types
export interface KeyboardShortcut {
  id: string;
  action: string;
  description: string;
  category: string;
  keys: string[];
  customKeys?: string[];
  isCustomized: boolean;
  isEnabled: boolean;
}

export interface ShortcutCategory {
  id: string;
  name: string;
  shortcuts: KeyboardShortcut[];
}

// Theme & Layout Types
export interface EditorTheme {
  id: string;
  name: string;
  type: 'dark' | 'light' | 'high-contrast';
  colors: ThemeColors;
  isBuiltIn: boolean;
  isActive: boolean;
}

export interface ThemeColors {
  background: string;
  foreground: string;
  accent: string;
  border: string;
  sidebar: string;
  editor: string;
  terminal: string;
  selection: string;
  lineHighlight: string;
  cursor: string;
}

export interface LayoutConfig {
  sidebarPosition: 'left' | 'right';
  sidebarWidth: number;
  sidebarVisible: boolean;
  panelPosition: 'bottom' | 'right';
  panelHeight: number;
  panelVisible: boolean;
  minimap: boolean;
  breadcrumbs: boolean;
  lineNumbers: boolean;
  wordWrap: boolean;
  fontSize: number;
  fontFamily: string;
  tabSize: number;
}

// ============================================================================
// SAMPLE DATA
// ============================================================================

export const sampleAIMessages: AIMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'How can I optimize this database query?',
    timestamp: new Date(Date.now() - 300000),
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: 'I can see a few optimization opportunities in your query. Here are my suggestions:',
    timestamp: new Date(Date.now() - 290000),
    suggestions: [
      {
        id: 'sug-1',
        type: 'optimization',
        title: 'Add Index',
        description: 'Add an index on the user_id column for faster lookups',
        confidence: 0.95,
      },
      {
        id: 'sug-2',
        type: 'optimization',
        title: 'Use LIMIT',
        description: 'Add LIMIT clause to prevent fetching all records',
        confidence: 0.88,
      },
    ],
    codeBlocks: [
      {
        id: 'code-1',
        language: 'sql',
        code: 'CREATE INDEX idx_user_id ON orders(user_id);\n\nSELECT * FROM orders\nWHERE user_id = ?\nORDER BY created_at DESC\nLIMIT 100;',
        explanation: 'Optimized query with index and limit',
      },
    ],
  },
];

export const sampleSnippets: CodeSnippet[] = [
  {
    id: 'snip-1',
    name: 'API Error Handler',
    description: 'Standard error handling middleware for API endpoints',
    language: 'typescript',
    code: `export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(error.stack);

  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};`,
    tags: ['api', 'error', 'middleware', 'express'],
    category: 'API',
    author: 'System',
    createdAt: new Date(Date.now() - 86400000 * 30),
    updatedAt: new Date(Date.now() - 86400000 * 5),
    usageCount: 156,
    isFavorite: true,
    isPublic: true,
    variables: [
      { name: 'HttpError', defaultValue: 'HttpError', description: 'Custom HTTP error class' },
    ],
  },
  {
    id: 'snip-2',
    name: 'Database Connection Pool',
    description: 'PostgreSQL connection pool configuration',
    language: 'typescript',
    code: `import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;`,
    tags: ['database', 'postgresql', 'pool', 'connection'],
    category: 'Database',
    author: 'System',
    createdAt: new Date(Date.now() - 86400000 * 60),
    updatedAt: new Date(Date.now() - 86400000 * 10),
    usageCount: 89,
    isFavorite: false,
    isPublic: true,
  },
  {
    id: 'snip-3',
    name: 'JWT Authentication',
    description: 'JWT token verification middleware',
    language: 'typescript',
    code: `import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};`,
    tags: ['auth', 'jwt', 'middleware', 'security'],
    category: 'Authentication',
    author: 'System',
    createdAt: new Date(Date.now() - 86400000 * 45),
    updatedAt: new Date(Date.now() - 86400000 * 2),
    usageCount: 234,
    isFavorite: true,
    isPublic: true,
  },
];

export const sampleCollaborators: CollaboratorUser[] = [
  {
    id: 'user-1',
    name: 'John Developer',
    email: 'john@example.com',
    avatar: undefined,
    color: '#3b82f6',
    status: 'online',
    role: 'owner',
    currentFile: 'index.ts',
    joinedAt: new Date(Date.now() - 3600000),
  },
  {
    id: 'user-2',
    name: 'Sarah Engineer',
    email: 'sarah@example.com',
    avatar: undefined,
    color: '#10b981',
    status: 'online',
    role: 'editor',
    currentFile: 'utils.ts',
    joinedAt: new Date(Date.now() - 1800000),
  },
  {
    id: 'user-3',
    name: 'Mike Designer',
    email: 'mike@example.com',
    avatar: undefined,
    color: '#f59e0b',
    status: 'away',
    role: 'viewer',
    currentFile: 'styles.css',
    joinedAt: new Date(Date.now() - 7200000),
  },
];

export const sampleCursors: CollaboratorCursor[] = [
  {
    id: 'cursor-1',
    userId: 'user-2',
    userName: 'Sarah',
    userColor: '#10b981',
    line: 45,
    column: 12,
    lastActive: new Date(),
    isTyping: true,
    selection: {
      startLine: 45,
      startColumn: 12,
      endLine: 45,
      endColumn: 28,
    },
  },
  {
    id: 'cursor-2',
    userId: 'user-3',
    userName: 'Mike',
    userColor: '#f59e0b',
    line: 78,
    column: 5,
    lastActive: new Date(Date.now() - 30000),
    isTyping: false,
  },
];

export const sampleTemplates: FunctionTemplate[] = [
  {
    id: 'tpl-1',
    name: 'REST API Endpoint',
    description: 'Complete REST API endpoint with CRUD operations and validation',
    category: 'API',
    language: 'typescript',
    code: `import { Router } from 'express';
import { body, param, validationResult } from 'express-validator';

const router = Router();

// GET all items
router.get('/', async (req, res) => {
  const items = await Item.findAll();
  res.json(items);
});

// GET single item
router.get('/:id', param('id').isInt(), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const item = await Item.findByPk(req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  res.json(item);
});

export default router;`,
    author: 'RustPress Team',
    downloads: 1250,
    rating: 4.8,
    ratingCount: 156,
    tags: ['api', 'rest', 'crud', 'express'],
    dependencies: ['express', 'express-validator'],
    createdAt: new Date(Date.now() - 86400000 * 90),
    updatedAt: new Date(Date.now() - 86400000 * 7),
    isOfficial: true,
    isPremium: false,
  },
  {
    id: 'tpl-2',
    name: 'WebSocket Handler',
    description: 'Real-time WebSocket connection handler with rooms support',
    category: 'Real-time',
    language: 'typescript',
    code: `import { Server, Socket } from 'socket.io';

export const setupWebSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      socket.to(roomId).emit('user-joined', socket.id);
    });

    socket.on('message', (data: { room: string; message: string }) => {
      io.to(data.room).emit('message', {
        from: socket.id,
        message: data.message,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};`,
    author: 'RustPress Team',
    downloads: 890,
    rating: 4.6,
    ratingCount: 98,
    tags: ['websocket', 'realtime', 'socket.io'],
    dependencies: ['socket.io'],
    createdAt: new Date(Date.now() - 86400000 * 60),
    updatedAt: new Date(Date.now() - 86400000 * 14),
    isOfficial: true,
    isPremium: false,
  },
  {
    id: 'tpl-3',
    name: 'Background Job Worker',
    description: 'Queue-based background job processor with retry logic',
    category: 'Jobs',
    language: 'typescript',
    code: `import Bull from 'bull';

const jobQueue = new Bull('jobs', process.env.REDIS_URL!);

interface JobData {
  type: string;
  payload: any;
}

jobQueue.process(async (job) => {
  const { type, payload } = job.data as JobData;

  switch (type) {
    case 'email':
      await sendEmail(payload);
      break;
    case 'notification':
      await sendNotification(payload);
      break;
    default:
      throw new Error(\`Unknown job type: \${type}\`);
  }
});

jobQueue.on('failed', (job, err) => {
  console.error(\`Job \${job.id} failed:\`, err);
});

export const addJob = (data: JobData) => {
  return jobQueue.add(data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 }
  });
};`,
    author: 'Community',
    downloads: 567,
    rating: 4.5,
    ratingCount: 67,
    tags: ['queue', 'jobs', 'background', 'bull'],
    dependencies: ['bull'],
    createdAt: new Date(Date.now() - 86400000 * 45),
    updatedAt: new Date(Date.now() - 86400000 * 21),
    isOfficial: false,
    isPremium: false,
  },
];

export const sampleAPIEndpoints: APIEndpoint[] = [
  {
    id: 'api-1',
    method: 'GET',
    path: '/api/v1/users',
    summary: 'List all users',
    description: 'Returns a paginated list of all users in the system',
    parameters: [
      { name: 'page', in: 'query', required: false, type: 'integer', description: 'Page number', example: '1' },
      { name: 'limit', in: 'query', required: false, type: 'integer', description: 'Items per page', example: '20' },
      { name: 'search', in: 'query', required: false, type: 'string', description: 'Search query', example: 'john' },
    ],
    responses: [
      { statusCode: 200, description: 'Successful response', schema: 'UserListResponse', example: '{"users": [], "total": 0}' },
      { statusCode: 401, description: 'Unauthorized', schema: 'ErrorResponse' },
    ],
    tags: ['Users'],
    deprecated: false,
    security: ['bearerAuth'],
  },
  {
    id: 'api-2',
    method: 'POST',
    path: '/api/v1/users',
    summary: 'Create a new user',
    description: 'Creates a new user account with the provided information',
    parameters: [],
    requestBody: {
      contentType: 'application/json',
      schema: 'CreateUserRequest',
      example: '{"email": "user@example.com", "name": "John Doe", "password": "secure123"}',
      required: true,
    },
    responses: [
      { statusCode: 201, description: 'User created', schema: 'User' },
      { statusCode: 400, description: 'Validation error', schema: 'ValidationError' },
      { statusCode: 409, description: 'Email already exists', schema: 'ErrorResponse' },
    ],
    tags: ['Users'],
    deprecated: false,
    security: ['bearerAuth'],
  },
];

export const sampleProfilerData: ProfilerData = {
  id: 'profile-1',
  functionName: 'processOrders',
  startTime: new Date(Date.now() - 5000),
  endTime: new Date(),
  duration: 5000,
  memory: {
    used: 128 * 1024 * 1024,
    peak: 256 * 1024 * 1024,
    allocated: 512 * 1024 * 1024,
  },
  cpu: {
    user: 3200,
    system: 800,
    total: 4000,
  },
  calls: [
    { id: 'call-1', name: 'fetchOrders', file: 'orders.ts', line: 45, duration: 2500, selfTime: 500, calls: 1, percentage: 50 },
    { id: 'call-2', name: 'processPayment', file: 'payment.ts', line: 120, duration: 1500, selfTime: 1500, calls: 1, percentage: 30 },
    { id: 'call-3', name: 'sendNotification', file: 'notify.ts', line: 30, duration: 800, selfTime: 800, calls: 3, percentage: 16 },
    { id: 'call-4', name: 'logActivity', file: 'logger.ts', line: 15, duration: 200, selfTime: 200, calls: 5, percentage: 4 },
  ],
  hotspots: [
    { file: 'orders.ts', line: 52, function: 'fetchOrders', selfTime: 2000, totalTime: 2500, percentage: 50, suggestion: 'Consider caching order data' },
    { file: 'payment.ts', line: 125, function: 'processPayment', selfTime: 1500, totalTime: 1500, percentage: 30, suggestion: 'Use async payment processing' },
  ],
};

export const sampleBreakpoints: Breakpoint[] = [
  { id: 'bp-1', file: 'index.ts', line: 25, enabled: true, type: 'line', verified: true },
  { id: 'bp-2', file: 'utils.ts', line: 48, enabled: true, type: 'conditional', condition: 'count > 10', verified: true },
  { id: 'bp-3', file: 'api.ts', line: 102, enabled: false, type: 'logpoint', logMessage: 'Request received: {req.url}', verified: true },
  { id: 'bp-4', file: 'error.ts', line: 15, enabled: true, type: 'exception', verified: false },
];

export const sampleShortcuts: KeyboardShortcut[] = [
  { id: 'short-1', action: 'save', description: 'Save current file', category: 'File', keys: ['Ctrl', 'S'], isCustomized: false, isEnabled: true },
  { id: 'short-2', action: 'saveAll', description: 'Save all files', category: 'File', keys: ['Ctrl', 'Shift', 'S'], isCustomized: false, isEnabled: true },
  { id: 'short-3', action: 'find', description: 'Find in file', category: 'Edit', keys: ['Ctrl', 'F'], isCustomized: false, isEnabled: true },
  { id: 'short-4', action: 'replace', description: 'Find and replace', category: 'Edit', keys: ['Ctrl', 'H'], isCustomized: false, isEnabled: true },
  { id: 'short-5', action: 'commandPalette', description: 'Open command palette', category: 'View', keys: ['Ctrl', 'Shift', 'P'], isCustomized: false, isEnabled: true },
  { id: 'short-6', action: 'terminal', description: 'Toggle terminal', category: 'View', keys: ['Ctrl', '`'], isCustomized: false, isEnabled: true },
  { id: 'short-7', action: 'run', description: 'Run function', category: 'Debug', keys: ['F5'], isCustomized: false, isEnabled: true },
  { id: 'short-8', action: 'debug', description: 'Start debugging', category: 'Debug', keys: ['F9'], isCustomized: false, isEnabled: true },
];

export const sampleThemes: EditorTheme[] = [
  {
    id: 'theme-1',
    name: 'VS Code Dark+',
    type: 'dark',
    colors: {
      background: '#1e1e1e',
      foreground: '#d4d4d4',
      accent: '#007acc',
      border: '#3c3c3c',
      sidebar: '#252526',
      editor: '#1e1e1e',
      terminal: '#1e1e1e',
      selection: '#264f78',
      lineHighlight: '#2a2d2e',
      cursor: '#aeafad',
    },
    isBuiltIn: true,
    isActive: true,
  },
  {
    id: 'theme-2',
    name: 'GitHub Dark',
    type: 'dark',
    colors: {
      background: '#0d1117',
      foreground: '#c9d1d9',
      accent: '#58a6ff',
      border: '#30363d',
      sidebar: '#161b22',
      editor: '#0d1117',
      terminal: '#0d1117',
      selection: '#388bfd66',
      lineHighlight: '#161b22',
      cursor: '#c9d1d9',
    },
    isBuiltIn: true,
    isActive: false,
  },
  {
    id: 'theme-3',
    name: 'Monokai Pro',
    type: 'dark',
    colors: {
      background: '#2d2a2e',
      foreground: '#fcfcfa',
      accent: '#ffd866',
      border: '#403e41',
      sidebar: '#221f22',
      editor: '#2d2a2e',
      terminal: '#2d2a2e',
      selection: '#5b595c',
      lineHighlight: '#363437',
      cursor: '#fcfcfa',
    },
    isBuiltIn: true,
    isActive: false,
  },
  {
    id: 'theme-4',
    name: 'Light+',
    type: 'light',
    colors: {
      background: '#ffffff',
      foreground: '#333333',
      accent: '#0066b8',
      border: '#e5e5e5',
      sidebar: '#f3f3f3',
      editor: '#ffffff',
      terminal: '#ffffff',
      selection: '#add6ff',
      lineHighlight: '#f5f5f5',
      cursor: '#000000',
    },
    isBuiltIn: true,
    isActive: false,
  },
];

// ============================================================================
// 41. AI CODE ASSISTANT PANEL
// ============================================================================

interface AICodeAssistantProps {
  context?: AIContext;
  onInsertCode?: (code: string) => void;
  onApplySuggestion?: (suggestion: AISuggestion) => void;
}

export const AICodeAssistant: React.FC<AICodeAssistantProps> = ({
  context,
  onInsertCode,
  onApplySuggestion,
}) => {
  const [messages, setMessages] = useState<AIMessage[]>(sampleAIMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: AIMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: 'I understand your question. Let me analyze the code and provide some suggestions.',
        timestamp: new Date(),
        suggestions: [
          {
            id: 'sug-new',
            type: 'optimization',
            title: 'Performance Improvement',
            description: 'Consider memoizing this computation for better performance',
            confidence: 0.85,
          },
        ],
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleCopyCode = (code: string, blockId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(blockId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickActions = [
    { icon: Bug, label: 'Explain Error', prompt: 'Explain this error and how to fix it' },
    { icon: Wand2, label: 'Optimize', prompt: 'How can I optimize this code?' },
    { icon: FileText, label: 'Document', prompt: 'Generate documentation for this code' },
    { icon: Lightbulb, label: 'Suggest', prompt: 'Suggest improvements for this code' },
  ];

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#1e1e1e' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: '#3c3c3c', backgroundColor: '#252526' }}
      >
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-400" />
          <span className="font-medium text-white">AI Assistant</span>
          <span className="px-2 py-0.5 text-xs rounded bg-purple-500/20 text-purple-400">
            Beta
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Context Banner */}
      {context?.currentFile && (
        <div
          className="px-4 py-2 text-xs border-b flex items-center gap-2"
          style={{ borderColor: '#3c3c3c', backgroundColor: '#252526' }}
        >
          <FileCode className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-gray-400">Context:</span>
          <span className="text-white">{context.currentFile}</span>
          {context.selectedCode && (
            <span className="text-gray-500">
              ({context.selectedCode.split('\n').length} lines selected)
            </span>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[80%] rounded-lg p-3',
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#2d2d2d] text-gray-200'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {/* Code Blocks */}
                {message.codeBlocks?.map((block) => (
                  <div
                    key={block.id}
                    className="mt-3 rounded overflow-hidden"
                    style={{ backgroundColor: '#1e1e1e' }}
                  >
                    <div
                      className="flex items-center justify-between px-3 py-1.5 text-xs"
                      style={{ backgroundColor: '#3c3c3c' }}
                    >
                      <span className="text-gray-400">{block.language}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyCode(block.code, block.id)}
                          className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                        >
                          {copiedId === block.id ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {onInsertCode && (
                          <button
                            onClick={() => onInsertCode(block.code)}
                            className="px-2 py-0.5 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                          >
                            Insert
                          </button>
                        )}
                      </div>
                    </div>
                    <pre className="p-3 text-xs overflow-x-auto">
                      <code className="text-gray-300">{block.code}</code>
                    </pre>
                    {block.explanation && (
                      <div
                        className="px-3 py-2 text-xs text-gray-400 border-t"
                        style={{ borderColor: '#3c3c3c' }}
                      >
                        {block.explanation}
                      </div>
                    )}
                  </div>
                ))}

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.suggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="p-2 rounded border cursor-pointer hover:border-blue-500/50 transition-colors"
                        style={{ borderColor: '#3c3c3c', backgroundColor: '#252526' }}
                        onClick={() => onApplySuggestion?.(suggestion)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                            <span className="text-sm font-medium text-white">
                              {suggestion.title}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.round(suggestion.confidence * 100)}% confidence
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{suggestion.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <UserCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div
        className="px-4 py-2 border-t flex items-center gap-2 overflow-x-auto"
        style={{ borderColor: '#3c3c3c' }}
      >
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => setInput(action.prompt)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-full border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 transition-colors whitespace-nowrap"
          >
            <action.icon className="w-3.5 h-3.5" />
            {action.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div
        className="p-4 border-t"
        style={{ borderColor: '#3c3c3c', backgroundColor: '#252526' }}
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your code..."
            className="flex-1 px-3 py-2 rounded text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500"
            style={{ backgroundColor: '#3c3c3c' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 42. CODE SNIPPETS LIBRARY
// ============================================================================

interface SnippetsLibraryProps {
  onInsertSnippet?: (snippet: CodeSnippet) => void;
}

export const SnippetsLibrary: React.FC<SnippetsLibraryProps> = ({ onInsertSnippet }) => {
  const [snippets, setSnippets] = useState<CodeSnippet[]>(sampleSnippets);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSnippet, setSelectedSnippet] = useState<CodeSnippet | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const categories: SnippetCategory[] = [
    { id: 'all', name: 'All Snippets', icon: 'code', count: snippets.length },
    { id: 'favorites', name: 'Favorites', icon: 'star', count: snippets.filter((s) => s.isFavorite).length },
    { id: 'API', name: 'API', icon: 'globe', count: snippets.filter((s) => s.category === 'API').length },
    { id: 'Database', name: 'Database', icon: 'database', count: snippets.filter((s) => s.category === 'Database').length },
    { id: 'Authentication', name: 'Authentication', icon: 'lock', count: snippets.filter((s) => s.category === 'Authentication').length },
  ];

  const filteredSnippets = snippets.filter((snippet) => {
    const matchesSearch =
      searchQuery === '' ||
      snippet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      !selectedCategory ||
      selectedCategory === 'all' ||
      (selectedCategory === 'favorites' && snippet.isFavorite) ||
      snippet.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCopy = (snippet: CodeSnippet) => {
    navigator.clipboard.writeText(snippet.code);
    setCopiedId(snippet.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleFavorite = (snippetId: string) => {
    setSnippets((prev) =>
      prev.map((s) => (s.id === snippetId ? { ...s, isFavorite: !s.isFavorite } : s))
    );
  };

  return (
    <div className="flex h-full" style={{ backgroundColor: '#1e1e1e' }}>
      {/* Sidebar */}
      <div
        className="w-56 border-r flex flex-col"
        style={{ borderColor: '#3c3c3c', backgroundColor: '#252526' }}
      >
        <div className="p-3 border-b" style={{ borderColor: '#3c3c3c' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Snippets</span>
            <button
              onClick={() => setIsCreating(true)}
              className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search snippets..."
              className="w-full pl-7 pr-3 py-1.5 text-xs rounded text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500"
              style={{ backgroundColor: '#3c3c3c' }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors',
                selectedCategory === category.id
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <div className="flex items-center gap-2">
                {category.id === 'favorites' ? (
                  <Star className="w-4 h-4" />
                ) : category.id === 'Database' ? (
                  <Database className="w-4 h-4" />
                ) : category.id === 'Authentication' ? (
                  <Lock className="w-4 h-4" />
                ) : category.id === 'API' ? (
                  <Globe className="w-4 h-4" />
                ) : (
                  <Code className="w-4 h-4" />
                )}
                <span>{category.name}</span>
              </div>
              <span className="text-xs text-gray-500">{category.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Snippets List */}
      <div className="flex-1 flex flex-col">
        <div
          className="p-3 border-b flex items-center justify-between"
          style={{ borderColor: '#3c3c3c' }}
        >
          <span className="text-sm text-gray-400">
            {filteredSnippets.length} snippet{filteredSnippets.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredSnippets.map((snippet) => (
            <motion.div
              key={snippet.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'p-3 rounded border cursor-pointer transition-colors',
                selectedSnippet?.id === snippet.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-transparent hover:border-gray-700'
              )}
              style={{ backgroundColor: '#252526' }}
              onClick={() => setSelectedSnippet(snippet)}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-medium text-white">{snippet.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{snippet.description}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(snippet.id);
                  }}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                >
                  {snippet.isFavorite ? (
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ) : (
                    <StarOff className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="px-1.5 py-0.5 text-xs rounded"
                  style={{ backgroundColor: '#3c3c3c', color: '#9cdcfe' }}
                >
                  {snippet.language}
                </span>
                {snippet.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs text-gray-500">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t" style={{ borderColor: '#3c3c3c' }}>
                <span className="text-xs text-gray-500">
                  Used {snippet.usageCount} times
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(snippet);
                    }}
                    className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    {copiedId === snippet.id ? (
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {onInsertSnippet && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onInsertSnippet(snippet);
                      }}
                      className="px-2 py-0.5 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                    >
                      Insert
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Snippet Preview */}
      {selectedSnippet && (
        <div
          className="w-80 border-l flex flex-col"
          style={{ borderColor: '#3c3c3c', backgroundColor: '#252526' }}
        >
          <div className="p-3 border-b" style={{ borderColor: '#3c3c3c' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">{selectedSnippet.name}</h3>
              <button
                onClick={() => setSelectedSnippet(null)}
                className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">{selectedSnippet.description}</p>
          </div>

          <div className="flex-1 overflow-y-auto">
            <pre
              className="p-3 text-xs overflow-x-auto"
              style={{ backgroundColor: '#1e1e1e' }}
            >
              <code className="text-gray-300">{selectedSnippet.code}</code>
            </pre>
          </div>

          <div className="p-3 border-t space-y-2" style={{ borderColor: '#3c3c3c' }}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Author</span>
              <span className="text-gray-300">{selectedSnippet.author}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Updated</span>
              <span className="text-gray-300">
                {selectedSnippet.updatedAt.toLocaleDateString()}
              </span>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleCopy(selectedSnippet)}
                className="flex-1 px-3 py-1.5 text-xs rounded border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 transition-colors flex items-center justify-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy
              </button>
              {onInsertSnippet && (
                <button
                  onClick={() => onInsertSnippet(selectedSnippet)}
                  className="flex-1 px-3 py-1.5 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Insert
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 43. COLLABORATIVE EDITING (LIVE CURSORS)
// ============================================================================

interface CollaborativeEditorProps {
  sessionId?: string;
  currentUser?: CollaboratorUser;
}

export const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  sessionId,
  currentUser,
}) => {
  const [collaborators] = useState<CollaboratorUser[]>(sampleCollaborators);
  const [cursors] = useState<CollaboratorCursor[]>(sampleCursors);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const getStatusColor = (status: CollaboratorUser['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
    }
  };

  const getRoleIcon = (role: CollaboratorUser['role']) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-3 h-3 text-yellow-400" />;
      case 'editor':
        return <Edit3 className="w-3 h-3 text-blue-400" />;
      case 'viewer':
        return <Eye className="w-3 h-3 text-gray-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#1e1e1e' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: '#3c3c3c', backgroundColor: '#252526' }}
      >
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-blue-400" />
          <span className="font-medium text-white">Collaboration</span>
          <span className="px-2 py-0.5 text-xs rounded bg-green-500/20 text-green-400">
            {collaborators.filter((c) => c.status === 'online').length} online
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInvite(true)}
            className="px-3 py-1.5 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Invite
          </button>
        </div>
      </div>

      {/* Collaborators List */}
      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">
          Participants ({collaborators.length})
        </h4>
        <div className="space-y-2">
          {collaborators.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 rounded"
              style={{ backgroundColor: '#252526' }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div
                    className={cn(
                      'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2',
                      getStatusColor(user.status)
                    )}
                    style={{ borderColor: '#252526' }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white">{user.name}</span>
                    {getRoleIcon(user.role)}
                  </div>
                  <span className="text-xs text-gray-500">
                    {user.currentFile ? `Editing ${user.currentFile}` : 'No file open'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Live Cursors Preview */}
        <h4 className="text-xs font-medium text-gray-500 uppercase mt-6 mb-3">
          Live Cursors
        </h4>
        <div className="space-y-2">
          {cursors.map((cursor) => {
            const user = collaborators.find((c) => c.id === cursor.userId);
            return (
              <div
                key={cursor.id}
                className="flex items-center gap-3 p-2 rounded"
                style={{ backgroundColor: '#252526' }}
              >
                <div
                  className="w-1 h-6 rounded-full"
                  style={{ backgroundColor: cursor.userColor }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white">{cursor.userName}</span>
                    {cursor.isTyping && (
                      <span className="text-xs text-gray-500 animate-pulse">typing...</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    Line {cursor.line}, Col {cursor.column}
                    {cursor.selection && ' (selecting)'}
                  </span>
                </div>
                <MousePointer className="w-4 h-4" style={{ color: cursor.userColor }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInvite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowInvite(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-lg"
              style={{ backgroundColor: '#252526' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium text-white mb-4">Invite Collaborator</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="w-full px-3 py-2 rounded text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500"
                    style={{ backgroundColor: '#3c3c3c' }}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Role</label>
                  <select
                    className="w-full px-3 py-2 rounded text-sm text-white outline-none focus:ring-1 focus:ring-blue-500"
                    style={{ backgroundColor: '#3c3c3c' }}
                  >
                    <option value="editor">Editor - Can edit files</option>
                    <option value="viewer">Viewer - Read only</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowInvite(false)}
                    className="flex-1 px-4 py-2 text-sm rounded border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Handle invite
                      setShowInvite(false);
                      setInviteEmail('');
                    }}
                    className="flex-1 px-4 py-2 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                  >
                    Send Invite
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// 44. FUNCTION TEMPLATES GALLERY
// ============================================================================

interface TemplatesGalleryProps {
  onUseTemplate?: (template: FunctionTemplate) => void;
}

export const TemplatesGallery: React.FC<TemplatesGalleryProps> = ({ onUseTemplate }) => {
  const [templates] = useState<FunctionTemplate[]>(sampleTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<FunctionTemplate | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories: TemplateCategory[] = [
    { id: 'all', name: 'All Templates', description: 'Browse all templates', icon: 'box', count: templates.length },
    { id: 'API', name: 'API', description: 'REST & GraphQL endpoints', icon: 'globe', count: templates.filter((t) => t.category === 'API').length },
    { id: 'Real-time', name: 'Real-time', description: 'WebSocket & SSE', icon: 'zap', count: templates.filter((t) => t.category === 'Real-time').length },
    { id: 'Jobs', name: 'Background Jobs', description: 'Queues & workers', icon: 'clock', count: templates.filter((t) => t.category === 'Jobs').length },
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      searchQuery === '' ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !selectedCategory || selectedCategory === 'all' || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={cn(
            'w-3 h-3',
            i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
          )}
        />
      );
    }
    return stars;
  };

  return (
    <div className="flex h-full" style={{ backgroundColor: '#1e1e1e' }}>
      {/* Sidebar */}
      <div
        className="w-56 border-r flex flex-col"
        style={{ borderColor: '#3c3c3c', backgroundColor: '#252526' }}
      >
        <div className="p-3 border-b" style={{ borderColor: '#3c3c3c' }}>
          <h3 className="text-sm font-medium text-white mb-2">Templates</h3>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-7 pr-3 py-1.5 text-xs rounded text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500"
              style={{ backgroundColor: '#3c3c3c' }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors',
                selectedCategory === category.id
                  ? 'bg-blue-600/20 text-blue-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <div className="flex items-center gap-2">
                {category.id === 'API' ? (
                  <Globe className="w-4 h-4" />
                ) : category.id === 'Real-time' ? (
                  <Zap className="w-4 h-4" />
                ) : category.id === 'Jobs' ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <Box className="w-4 h-4" />
                )}
                <span>{category.name}</span>
              </div>
              <span className="text-xs text-gray-500">{category.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid/List */}
      <div className="flex-1 flex flex-col">
        <div
          className="p-3 border-b flex items-center justify-between"
          style={{ borderColor: '#3c3c3c' }}
        >
          <span className="text-sm text-gray-400">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded transition-colors',
                viewMode === 'grid'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded transition-colors',
                viewMode === 'list'
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className={cn(
          'flex-1 overflow-y-auto p-3',
          viewMode === 'grid' ? 'grid grid-cols-2 gap-3 auto-rows-max' : 'space-y-2'
        )}>
          {filteredTemplates.map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'rounded border cursor-pointer transition-colors',
                selectedTemplate?.id === template.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-transparent hover:border-gray-700'
              )}
              style={{ backgroundColor: '#252526' }}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-5 h-5 text-blue-400" />
                    <div>
                      <h4 className="text-sm font-medium text-white">{template.name}</h4>
                      {template.isOfficial && (
                        <span className="text-xs text-blue-400">Official</span>
                      )}
                    </div>
                  </div>
                  {template.isPremium && (
                    <span className="px-1.5 py-0.5 text-xs rounded bg-yellow-500/20 text-yellow-400">
                      Premium
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                  {template.description}
                </p>

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    {renderStars(Math.round(template.rating))}
                    <span className="text-gray-500 ml-1">({template.ratingCount})</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Download className="w-3 h-3" />
                    {template.downloads.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-1 mt-2 flex-wrap">
                  {template.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 text-xs rounded"
                      style={{ backgroundColor: '#3c3c3c', color: '#9cdcfe' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Template Preview */}
      {selectedTemplate && (
        <div
          className="w-96 border-l flex flex-col"
          style={{ borderColor: '#3c3c3c', backgroundColor: '#252526' }}
        >
          <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: '#3c3c3c' }}>
            <h3 className="text-sm font-medium text-white">{selectedTemplate.name}</h3>
            <button
              onClick={() => setSelectedTemplate(null)}
              className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-3 border-b" style={{ borderColor: '#3c3c3c' }}>
              <p className="text-sm text-gray-400">{selectedTemplate.description}</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1">
                  {renderStars(Math.round(selectedTemplate.rating))}
                  <span className="text-sm text-gray-300 ml-1">
                    {selectedTemplate.rating.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <Download className="w-4 h-4" />
                  {selectedTemplate.downloads.toLocaleString()} downloads
                </div>
              </div>
            </div>

            <div className="p-3 border-b" style={{ borderColor: '#3c3c3c' }}>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Dependencies</h4>
              <div className="flex flex-wrap gap-1">
                {selectedTemplate.dependencies.map((dep) => (
                  <span
                    key={dep}
                    className="px-2 py-1 text-xs rounded"
                    style={{ backgroundColor: '#3c3c3c', color: '#d4d4d4' }}
                  >
                    {dep}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-0">
              <div
                className="px-3 py-2 text-xs font-medium text-gray-500 uppercase"
                style={{ backgroundColor: '#3c3c3c' }}
              >
                Code Preview
              </div>
              <pre
                className="p-3 text-xs overflow-x-auto max-h-64"
                style={{ backgroundColor: '#1e1e1e' }}
              >
                <code className="text-gray-300">{selectedTemplate.code}</code>
              </pre>
            </div>
          </div>

          <div className="p-3 border-t" style={{ borderColor: '#3c3c3c' }}>
            <button
              onClick={() => onUseTemplate?.(selectedTemplate)}
              className="w-full px-4 py-2 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center justify-center gap-2"
            >
              <FileCode className="w-4 h-4" />
              Use Template
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 45. API DOCUMENTATION GENERATOR
// ============================================================================

interface APIDocGeneratorProps {
  functionCode?: string;
  onGenerateComplete?: (docs: APIEndpoint[]) => void;
}

export const APIDocGenerator: React.FC<APIDocGeneratorProps> = ({
  functionCode,
  onGenerateComplete,
}) => {
  const [endpoints] = useState<APIEndpoint[]>(sampleAPIEndpoints);
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['parameters', 'responses']));
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleSection = (section: string) => {
    const newSections = new Set(expandedSections);
    if (newSections.has(section)) {
      newSections.delete(section);
    } else {
      newSections.add(section);
    }
    setExpandedSections(newSections);
  };

  const getMethodColor = (method: APIEndpoint['method']) => {
    switch (method) {
      case 'GET':
        return 'bg-green-500/20 text-green-400';
      case 'POST':
        return 'bg-blue-500/20 text-blue-400';
      case 'PUT':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'DELETE':
        return 'bg-red-500/20 text-red-400';
      case 'PATCH':
        return 'bg-purple-500/20 text-purple-400';
    }
  };

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return 'text-green-400';
    if (code >= 400 && code < 500) return 'text-yellow-400';
    if (code >= 500) return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="flex h-full" style={{ backgroundColor: '#1e1e1e' }}>
      {/* Endpoints List */}
      <div
        className="w-72 border-r flex flex-col"
        style={{ borderColor: '#3c3c3c', backgroundColor: '#252526' }}
      >
        <div className="p-3 border-b" style={{ borderColor: '#3c3c3c' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-white">API Docs</span>
            </div>
            <button
              onClick={() => {
                setIsGenerating(true);
                setTimeout(() => {
                  setIsGenerating(false);
                  onGenerateComplete?.(endpoints);
                }, 2000);
              }}
              disabled={isGenerating}
              className="px-2 py-1 text-xs rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors flex items-center gap-1"
            >
              {isGenerating ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Wand2 className="w-3 h-3" />
              )}
              Generate
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search endpoints..."
              className="w-full pl-7 pr-3 py-1.5 text-xs rounded text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500"
              style={{ backgroundColor: '#3c3c3c' }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {endpoints.map((endpoint) => (
            <button
              key={endpoint.id}
              onClick={() => setSelectedEndpoint(endpoint)}
              className={cn(
                'w-full p-2 rounded text-left transition-colors',
                selectedEndpoint?.id === endpoint.id
                  ? 'bg-blue-600/20'
                  : 'hover:bg-white/5'
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn('px-1.5 py-0.5 text-xs font-mono rounded', getMethodColor(endpoint.method))}>
                  {endpoint.method}
                </span>
                <span className="text-sm text-white font-mono truncate">{endpoint.path}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 truncate">{endpoint.summary}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Endpoint Details */}
      {selectedEndpoint ? (
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b" style={{ borderColor: '#3c3c3c' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn('px-2 py-1 text-sm font-mono rounded', getMethodColor(selectedEndpoint.method))}>
                {selectedEndpoint.method}
              </span>
              <span className="text-lg text-white font-mono">{selectedEndpoint.path}</span>
              {selectedEndpoint.deprecated && (
                <span className="px-2 py-0.5 text-xs rounded bg-red-500/20 text-red-400">
                  Deprecated
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400">{selectedEndpoint.description}</p>
            {selectedEndpoint.tags.length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                {selectedEndpoint.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-xs rounded"
                    style={{ backgroundColor: '#3c3c3c', color: '#9cdcfe' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Parameters Section */}
          {selectedEndpoint.parameters.length > 0 && (
            <div className="border-b" style={{ borderColor: '#3c3c3c' }}>
              <button
                onClick={() => toggleSection('parameters')}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <span className="text-sm font-medium text-white">Parameters</span>
                {expandedSections.has('parameters') ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>
              <AnimatePresence>
                {expandedSections.has('parameters') && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2">
                      {selectedEndpoint.parameters.map((param, index) => (
                        <div
                          key={index}
                          className="p-3 rounded"
                          style={{ backgroundColor: '#252526' }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-mono text-white">{param.name}</span>
                            <span className="px-1.5 py-0.5 text-xs rounded bg-gray-700 text-gray-300">
                              {param.in}
                            </span>
                            <span className="text-xs text-gray-500">{param.type}</span>
                            {param.required && (
                              <span className="text-xs text-red-400">required</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">{param.description}</p>
                          {param.example && (
                            <p className="text-xs text-gray-500 mt-1">
                              Example: <code className="text-blue-400">{param.example}</code>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Request Body Section */}
          {selectedEndpoint.requestBody && (
            <div className="border-b" style={{ borderColor: '#3c3c3c' }}>
              <button
                onClick={() => toggleSection('requestBody')}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <span className="text-sm font-medium text-white">Request Body</span>
                {expandedSections.has('requestBody') ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>
              <AnimatePresence>
                {expandedSections.has('requestBody') && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      <div className="p-3 rounded" style={{ backgroundColor: '#252526' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-gray-500">Content-Type:</span>
                          <span className="text-xs text-white">{selectedEndpoint.requestBody.contentType}</span>
                          {selectedEndpoint.requestBody.required && (
                            <span className="text-xs text-red-400">required</span>
                          )}
                        </div>
                        <pre
                          className="p-2 rounded text-xs overflow-x-auto"
                          style={{ backgroundColor: '#1e1e1e' }}
                        >
                          <code className="text-gray-300">{selectedEndpoint.requestBody.example}</code>
                        </pre>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Responses Section */}
          <div className="border-b" style={{ borderColor: '#3c3c3c' }}>
            <button
              onClick={() => toggleSection('responses')}
              className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <span className="text-sm font-medium text-white">Responses</span>
              {expandedSections.has('responses') ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <AnimatePresence>
              {expandedSections.has('responses') && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-2">
                    {selectedEndpoint.responses.map((response, index) => (
                      <div
                        key={index}
                        className="p-3 rounded"
                        style={{ backgroundColor: '#252526' }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn('text-sm font-mono', getStatusColor(response.statusCode))}>
                            {response.statusCode}
                          </span>
                          <span className="text-sm text-white">{response.description}</span>
                        </div>
                        {response.example && (
                          <pre
                            className="p-2 rounded text-xs overflow-x-auto mt-2"
                            style={{ backgroundColor: '#1e1e1e' }}
                          >
                            <code className="text-gray-300">{response.example}</code>
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Select an endpoint to view documentation</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 46. PERFORMANCE PROFILER
// ============================================================================

interface PerformanceProfilerProps {
  functionId?: string;
  onProfileComplete?: (data: ProfilerData) => void;
}

export const PerformanceProfiler: React.FC<PerformanceProfilerProps> = ({
  functionId,
  onProfileComplete,
}) => {
  const [profilerData] = useState<ProfilerData>(sampleProfilerData);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'calls' | 'hotspots' | 'flame'>('calls');

  const formatDuration = (ms: number) => {
    if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#1e1e1e' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: '#3c3c3c', backgroundColor: '#252526' }}
      >
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-orange-400" />
          <span className="font-medium text-white">Performance Profiler</span>
          {isRunning && (
            <span className="px-2 py-0.5 text-xs rounded bg-orange-500/20 text-orange-400 animate-pulse">
              Recording...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isRunning ? (
            <button
              onClick={() => {
                setIsRunning(false);
                onProfileComplete?.(profilerData);
              }}
              className="px-3 py-1.5 text-xs rounded bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center gap-1"
            >
              <Square className="w-3.5 h-3.5" />
              Stop
            </button>
          ) : (
            <button
              onClick={() => setIsRunning(true)}
              className="px-3 py-1.5 text-xs rounded bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center gap-1"
            >
              <Play className="w-3.5 h-3.5" />
              Start Profiling
            </button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4 p-4 border-b" style={{ borderColor: '#3c3c3c' }}>
        <div className="p-3 rounded" style={{ backgroundColor: '#252526' }}>
          <div className="flex items-center gap-2 mb-1">
            <Timer className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-500">Duration</span>
          </div>
          <span className="text-lg font-medium text-white">
            {profilerData.duration ? formatDuration(profilerData.duration) : '-'}
          </span>
        </div>
        <div className="p-3 rounded" style={{ backgroundColor: '#252526' }}>
          <div className="flex items-center gap-2 mb-1">
            <MemoryStick className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-500">Memory Used</span>
          </div>
          <span className="text-lg font-medium text-white">
            {formatBytes(profilerData.memory.used)}
          </span>
        </div>
        <div className="p-3 rounded" style={{ backgroundColor: '#252526' }}>
          <div className="flex items-center gap-2 mb-1">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-500">CPU Time</span>
          </div>
          <span className="text-lg font-medium text-white">
            {formatDuration(profilerData.cpu.total)}
          </span>
        </div>
        <div className="p-3 rounded" style={{ backgroundColor: '#252526' }}>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-red-400" />
            <span className="text-xs text-gray-500">Hotspots</span>
          </div>
          <span className="text-lg font-medium text-white">
            {profilerData.hotspots.length}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: '#3c3c3c' }}>
        {(['calls', 'hotspots', 'flame'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={cn(
              'px-4 py-2 text-sm transition-colors border-b-2',
              selectedTab === tab
                ? 'text-blue-400 border-blue-400'
                : 'text-gray-400 border-transparent hover:text-white'
            )}
          >
            {tab === 'calls' && 'Function Calls'}
            {tab === 'hotspots' && 'Hotspots'}
            {tab === 'flame' && 'Flame Graph'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedTab === 'calls' && (
          <div className="space-y-2">
            {profilerData.calls.map((call) => (
              <div
                key={call.id}
                className="p-3 rounded"
                style={{ backgroundColor: '#252526' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-white">{call.name}</span>
                    <span className="text-xs text-gray-500">
                      {call.file}:{call.line}
                    </span>
                  </div>
                  <span className="text-sm text-white">{formatDuration(call.duration)}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>Self: {formatDuration(call.selfTime)}</span>
                  <span>Calls: {call.calls}</span>
                  <span>{call.percentage}% of total</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#3c3c3c' }}>
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${call.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'hotspots' && (
          <div className="space-y-2">
            {profilerData.hotspots.map((hotspot, index) => (
              <div
                key={index}
                className="p-3 rounded border-l-4 border-red-500"
                style={{ backgroundColor: '#252526' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-mono text-white">{hotspot.function}</span>
                  </div>
                  <span className="text-sm text-red-400">{hotspot.percentage}%</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  {hotspot.file}:{hotspot.line}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-2">
                  <span>Self: {formatDuration(hotspot.selfTime)}</span>
                  <span>Total: {formatDuration(hotspot.totalTime)}</span>
                </div>
                {hotspot.suggestion && (
                  <div className="p-2 rounded flex items-start gap-2" style={{ backgroundColor: '#1e1e1e' }}>
                    <Lightbulb className="w-4 h-4 text-yellow-400 mt-0.5" />
                    <p className="text-xs text-gray-300">{hotspot.suggestion}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedTab === 'flame' && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Flame graph visualization</p>
              <p className="text-xs text-gray-500 mt-1">Start profiling to generate flame graph</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 47. DEBUGGING BREAKPOINTS PANEL
// ============================================================================

interface BreakpointsPanelProps {
  onBreakpointChange?: (breakpoints: Breakpoint[]) => void;
  onGoToBreakpoint?: (breakpoint: Breakpoint) => void;
}

export const BreakpointsPanel: React.FC<BreakpointsPanelProps> = ({
  onBreakpointChange,
  onGoToBreakpoint,
}) => {
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>(sampleBreakpoints);
  const [debugSession, setDebugSession] = useState<DebugSession | null>(null);
  const [expandedSection, setExpandedSection] = useState<'breakpoints' | 'callstack' | 'variables'>('breakpoints');

  const toggleBreakpoint = (id: string) => {
    const updated = breakpoints.map((bp) =>
      bp.id === id ? { ...bp, enabled: !bp.enabled } : bp
    );
    setBreakpoints(updated);
    onBreakpointChange?.(updated);
  };

  const removeBreakpoint = (id: string) => {
    const updated = breakpoints.filter((bp) => bp.id !== id);
    setBreakpoints(updated);
    onBreakpointChange?.(updated);
  };

  const getBreakpointIcon = (type: Breakpoint['type']) => {
    switch (type) {
      case 'line':
        return <Circle className="w-3 h-3 fill-current" />;
      case 'conditional':
        return <Circle className="w-3 h-3" />;
      case 'logpoint':
        return <MessageSquare className="w-3 h-3" />;
      case 'exception':
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#1e1e1e' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: '#3c3c3c', backgroundColor: '#252526' }}
      >
        <div className="flex items-center gap-3">
          <Bug className="w-5 h-5 text-red-400" />
          <span className="font-medium text-white">Debug</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-green-400 transition-colors"
            title="Continue"
          >
            <Play className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Step Over"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Step Into"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Step Out"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
            title="Stop"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Breakpoints Section */}
      <div className="flex-1 overflow-y-auto">
        <button
          onClick={() => setExpandedSection(expandedSection === 'breakpoints' ? 'callstack' : 'breakpoints')}
          className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors border-b"
          style={{ borderColor: '#3c3c3c' }}
        >
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-white">Breakpoints</span>
            <span className="text-xs text-gray-500">({breakpoints.length})</span>
          </div>
          {expandedSection === 'breakpoints' ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>

        <AnimatePresence>
          {expandedSection === 'breakpoints' && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-2 space-y-1">
                {breakpoints.map((bp) => (
                  <div
                    key={bp.id}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded group cursor-pointer hover:bg-white/5 transition-colors',
                      !bp.enabled && 'opacity-50'
                    )}
                    onClick={() => onGoToBreakpoint?.(bp)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBreakpoint(bp.id);
                      }}
                      className={cn(
                        'transition-colors',
                        bp.enabled ? 'text-red-400' : 'text-gray-600'
                      )}
                    >
                      {getBreakpointIcon(bp.type)}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white truncate">{bp.file}</span>
                        <span className="text-xs text-gray-500">:{bp.line}</span>
                      </div>
                      {bp.condition && (
                        <p className="text-xs text-yellow-400 truncate">if: {bp.condition}</p>
                      )}
                      {bp.logMessage && (
                        <p className="text-xs text-blue-400 truncate">log: {bp.logMessage}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeBreakpoint(bp.id);
                      }}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 text-gray-400 hover:text-red-400 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {breakpoints.length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-4">
                    No breakpoints set
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Call Stack Section */}
        <button
          onClick={() => setExpandedSection(expandedSection === 'callstack' ? 'variables' : 'callstack')}
          className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors border-b"
          style={{ borderColor: '#3c3c3c' }}
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Call Stack</span>
          </div>
          {expandedSection === 'callstack' ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>

        <AnimatePresence>
          {expandedSection === 'callstack' && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-2">
                <p className="text-xs text-gray-500 text-center py-4">
                  Start debugging to see call stack
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Variables Section */}
        <button
          onClick={() => setExpandedSection(expandedSection === 'variables' ? 'breakpoints' : 'variables')}
          className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors border-b"
          style={{ borderColor: '#3c3c3c' }}
        >
          <div className="flex items-center gap-2">
            <Braces className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-white">Variables</span>
          </div>
          {expandedSection === 'variables' ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>

        <AnimatePresence>
          {expandedSection === 'variables' && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-2">
                <p className="text-xs text-gray-500 text-center py-4">
                  Start debugging to see variables
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ============================================================================
// 48. FUNCTION IMPORT/EXPORT MANAGER
// ============================================================================

interface ImportExportManagerProps {
  functions?: ExportableFunction[];
  onImport?: (result: ImportResult) => void;
  onExport?: (functions: ExportableFunction[], config: ExportConfig) => void;
}

export const ImportExportManager: React.FC<ImportExportManagerProps> = ({
  functions = [],
  onImport,
  onExport,
}) => {
  const [mode, setMode] = useState<'import' | 'export'>('export');
  const [selectedFunctions, setSelectedFunctions] = useState<Set<string>>(new Set());
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'json',
    includeCode: true,
    includeDependencies: true,
    includeConfig: true,
    includeEnvVariables: false,
    includeSecrets: false,
    includeLogs: false,
    compression: 'none',
  });
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const sampleFunctions: ExportableFunction[] = [
    { id: 'fn-1', name: 'processOrders', description: 'Order processing function', size: 12500, lastModified: new Date(), selected: false },
    { id: 'fn-2', name: 'sendNotification', description: 'Push notification sender', size: 8200, lastModified: new Date(), selected: false },
    { id: 'fn-3', name: 'generateReport', description: 'Report generation function', size: 25600, lastModified: new Date(), selected: false },
    { id: 'fn-4', name: 'syncData', description: 'Data synchronization job', size: 15800, lastModified: new Date(), selected: false },
  ];

  const displayFunctions = functions.length > 0 ? functions : sampleFunctions;

  const toggleFunction = (id: string) => {
    const newSelected = new Set(selectedFunctions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedFunctions(newSelected);
  };

  const selectAll = () => {
    if (selectedFunctions.size === displayFunctions.length) {
      setSelectedFunctions(new Set());
    } else {
      setSelectedFunctions(new Set(displayFunctions.map((f) => f.id)));
    }
  };

  const handleExport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const selected = displayFunctions.filter((f) => selectedFunctions.has(f.id));
      onExport?.(selected, exportConfig);
      setIsProcessing(false);
    }, 1500);
  };

  const handleImport = () => {
    if (!importFile) return;
    setIsProcessing(true);
    setTimeout(() => {
      const result: ImportResult = {
        success: true,
        functionsImported: 3,
        errors: [],
        warnings: ['One function has conflicting dependencies'],
        skipped: ['existingFunction'],
      };
      onImport?.(result);
      setIsProcessing(false);
    }, 2000);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#1e1e1e' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: '#3c3c3c', backgroundColor: '#252526' }}
      >
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-blue-400" />
          <span className="font-medium text-white">Import / Export</span>
        </div>
        <div className="flex items-center gap-1 p-1 rounded" style={{ backgroundColor: '#3c3c3c' }}>
          <button
            onClick={() => setMode('export')}
            className={cn(
              'px-3 py-1 text-xs rounded transition-colors',
              mode === 'export'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            )}
          >
            Export
          </button>
          <button
            onClick={() => setMode('import')}
            className={cn(
              'px-3 py-1 text-xs rounded transition-colors',
              mode === 'import'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            )}
          >
            Import
          </button>
        </div>
      </div>

      {mode === 'export' ? (
        <>
          {/* Function Selection */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">
                Select functions to export
              </span>
              <button
                onClick={selectAll}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                {selectedFunctions.size === displayFunctions.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="space-y-2">
              {displayFunctions.map((fn) => (
                <div
                  key={fn.id}
                  onClick={() => toggleFunction(fn.id)}
                  className={cn(
                    'p-3 rounded border cursor-pointer transition-colors',
                    selectedFunctions.has(fn.id)
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-transparent hover:border-gray-700'
                  )}
                  style={{ backgroundColor: '#252526' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                          selectedFunctions.has(fn.id)
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-gray-600'
                        )}
                      >
                        {selectedFunctions.has(fn.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-white">{fn.name}</span>
                        <p className="text-xs text-gray-500">{fn.description}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{formatSize(fn.size)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="p-4 border-t" style={{ borderColor: '#3c3c3c', backgroundColor: '#252526' }}>
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Export Options</h4>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Format</label>
                <select
                  value={exportConfig.format}
                  onChange={(e) => setExportConfig({ ...exportConfig, format: e.target.value as ExportConfig['format'] })}
                  className="w-full px-2 py-1.5 text-xs rounded text-white outline-none"
                  style={{ backgroundColor: '#3c3c3c' }}
                >
                  <option value="json">JSON</option>
                  <option value="yaml">YAML</option>
                  <option value="zip">ZIP Archive</option>
                  <option value="tar">TAR Archive</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Compression</label>
                <select
                  value={exportConfig.compression}
                  onChange={(e) => setExportConfig({ ...exportConfig, compression: e.target.value as ExportConfig['compression'] })}
                  className="w-full px-2 py-1.5 text-xs rounded text-white outline-none"
                  style={{ backgroundColor: '#3c3c3c' }}
                >
                  <option value="none">None</option>
                  <option value="gzip">GZIP</option>
                  <option value="bzip2">BZIP2</option>
                </select>
              </div>
            </div>
            <div className="space-y-2 mb-4">
              {[
                { key: 'includeCode', label: 'Include Source Code' },
                { key: 'includeDependencies', label: 'Include Dependencies' },
                { key: 'includeConfig', label: 'Include Configuration' },
                { key: 'includeEnvVariables', label: 'Include Environment Variables' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportConfig[key as keyof ExportConfig] as boolean}
                    onChange={(e) => setExportConfig({ ...exportConfig, [key]: e.target.checked })}
                    className="rounded border-gray-600"
                  />
                  <span className="text-xs text-gray-300">{label}</span>
                </label>
              ))}
            </div>
            <button
              onClick={handleExport}
              disabled={selectedFunctions.size === 0 || isProcessing}
              className="w-full px-4 py-2 text-sm rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export {selectedFunctions.size} Function{selectedFunctions.size !== 1 ? 's' : ''}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Import Area */}
          <div className="flex-1 p-4">
            <div
              className="h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 transition-colors"
              style={{ borderColor: '#3c3c3c' }}
              onClick={() => document.getElementById('import-file-input')?.click()}
            >
              <input
                id="import-file-input"
                type="file"
                accept=".json,.yaml,.yml,.zip,.tar,.tar.gz"
                className="hidden"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
              {importFile ? (
                <>
                  <FileJson className="w-12 h-12 text-blue-400 mb-3" />
                  <p className="text-white font-medium">{importFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatSize(importFile.size)}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setImportFile(null);
                    }}
                    className="mt-3 text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-gray-600 mb-3" />
                  <p className="text-white font-medium">Drop file here or click to browse</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports JSON, YAML, ZIP, TAR formats
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Import Button */}
          <div className="p-4 border-t" style={{ borderColor: '#3c3c3c', backgroundColor: '#252526' }}>
            <button
              onClick={handleImport}
              disabled={!importFile || isProcessing}
              className="w-full px-4 py-2 text-sm rounded bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Import Functions
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ============================================================================
// 49. KEYBOARD SHORTCUTS MANAGER
// ============================================================================

interface KeyboardShortcutsManagerProps {
  onShortcutChange?: (shortcuts: KeyboardShortcut[]) => void;
}

export const KeyboardShortcutsManager: React.FC<KeyboardShortcutsManagerProps> = ({
  onShortcutChange,
}) => {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>(sampleShortcuts);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [recordingKeys, setRecordingKeys] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(shortcuts.map((s) => s.category)));

  const filteredShortcuts = shortcuts.filter((shortcut) => {
    const matchesSearch =
      searchQuery === '' ||
      shortcut.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shortcut.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !selectedCategory || shortcut.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const groupedShortcuts = filteredShortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  const handleKeyDown = (e: React.KeyboardEvent, shortcutId: string) => {
    if (editingId !== shortcutId) return;

    e.preventDefault();
    const key = e.key;
    const newKeys: string[] = [];

    if (e.ctrlKey) newKeys.push('Ctrl');
    if (e.shiftKey) newKeys.push('Shift');
    if (e.altKey) newKeys.push('Alt');
    if (e.metaKey) newKeys.push('Cmd');

    if (!['Control', 'Shift', 'Alt', 'Meta'].includes(key)) {
      newKeys.push(key.length === 1 ? key.toUpperCase() : key);
    }

    setRecordingKeys(newKeys);
  };

  const saveShortcut = (id: string) => {
    if (recordingKeys.length === 0) {
      setEditingId(null);
      return;
    }

    const updated = shortcuts.map((s) =>
      s.id === id ? { ...s, customKeys: recordingKeys, isCustomized: true } : s
    );
    setShortcuts(updated);
    onShortcutChange?.(updated);
    setEditingId(null);
    setRecordingKeys([]);
  };

  const resetShortcut = (id: string) => {
    const updated = shortcuts.map((s) =>
      s.id === id ? { ...s, customKeys: undefined, isCustomized: false } : s
    );
    setShortcuts(updated);
    onShortcutChange?.(updated);
  };

  const renderKey = (key: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      Ctrl: <span className="text-xs">Ctrl</span>,
      Shift: <ArrowUp className="w-3 h-3" />,
      Alt: <Option className="w-3 h-3" />,
      Cmd: <Command className="w-3 h-3" />,
      Enter: <CornerDownLeft className="w-3 h-3" />,
    };

    return (
      <span
        className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded text-xs font-mono"
        style={{ backgroundColor: '#3c3c3c', color: '#d4d4d4' }}
      >
        {iconMap[key] || key}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#1e1e1e' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: '#3c3c3c', backgroundColor: '#252526' }}
      >
        <div className="flex items-center gap-3">
          <Keyboard className="w-5 h-5 text-blue-400" />
          <span className="font-medium text-white">Keyboard Shortcuts</span>
        </div>
        <button
          onClick={() => {
            const reset = shortcuts.map((s) => ({ ...s, customKeys: undefined, isCustomized: false }));
            setShortcuts(reset);
            onShortcutChange?.(reset);
          }}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          Reset All
        </button>
      </div>

      {/* Search & Filter */}
      <div className="p-3 border-b flex gap-2" style={{ borderColor: '#3c3c3c' }}>
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shortcuts..."
            className="w-full pl-7 pr-3 py-1.5 text-xs rounded text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500"
            style={{ backgroundColor: '#3c3c3c' }}
          />
        </div>
        <select
          value={selectedCategory || ''}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="px-2 py-1.5 text-xs rounded text-white outline-none"
          style={{ backgroundColor: '#3c3c3c' }}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Shortcuts List */}
      <div className="flex-1 overflow-y-auto p-3">
        {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
          <div key={category} className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2 px-2">{category}</h4>
            <div className="space-y-1">
              {categoryShortcuts.map((shortcut) => {
                const isEditing = editingId === shortcut.id;
                const displayKeys = isEditing && recordingKeys.length > 0
                  ? recordingKeys
                  : (shortcut.customKeys || shortcut.keys);

                return (
                  <div
                    key={shortcut.id}
                    className={cn(
                      'flex items-center justify-between p-2 rounded transition-colors',
                      isEditing ? 'bg-blue-500/20 ring-1 ring-blue-500' : 'hover:bg-white/5'
                    )}
                    tabIndex={isEditing ? 0 : -1}
                    onKeyDown={(e) => handleKeyDown(e, shortcut.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white">{shortcut.description}</span>
                        {shortcut.isCustomized && (
                          <span className="px-1.5 py-0.5 text-xs rounded bg-yellow-500/20 text-yellow-400">
                            Custom
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{shortcut.action}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {displayKeys.map((key, idx) => (
                          <React.Fragment key={idx}>
                            {renderKey(key)}
                            {idx < displayKeys.length - 1 && (
                              <span className="text-gray-500">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => saveShortcut(shortcut.id)}
                            className="p-1 rounded hover:bg-white/10 text-green-400 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setRecordingKeys([]);
                            }}
                            className="p-1 rounded hover:bg-white/10 text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => setEditingId(shortcut.id)}
                            className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {shortcut.isCustomized && (
                            <button
                              onClick={() => resetShortcut(shortcut.id)}
                              className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Help */}
      <div
        className="p-3 border-t text-center"
        style={{ borderColor: '#3c3c3c', backgroundColor: '#252526' }}
      >
        <p className="text-xs text-gray-500">
          Click edit, then press your desired key combination
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// 50. THEME & LAYOUT CUSTOMIZER
// ============================================================================

interface ThemeLayoutCustomizerProps {
  onThemeChange?: (theme: EditorTheme) => void;
  onLayoutChange?: (layout: LayoutConfig) => void;
}

export const ThemeLayoutCustomizer: React.FC<ThemeLayoutCustomizerProps> = ({
  onThemeChange,
  onLayoutChange,
}) => {
  const [themes] = useState<EditorTheme[]>(sampleThemes);
  const [activeTheme, setActiveTheme] = useState<EditorTheme>(sampleThemes[0]);
  const [layout, setLayout] = useState<LayoutConfig>({
    sidebarPosition: 'left',
    sidebarWidth: 250,
    sidebarVisible: true,
    panelPosition: 'bottom',
    panelHeight: 200,
    panelVisible: true,
    minimap: true,
    breadcrumbs: true,
    lineNumbers: true,
    wordWrap: false,
    fontSize: 14,
    fontFamily: 'Fira Code',
    tabSize: 2,
  });
  const [selectedTab, setSelectedTab] = useState<'themes' | 'layout' | 'editor'>('themes');

  const handleThemeSelect = (theme: EditorTheme) => {
    setActiveTheme(theme);
    onThemeChange?.(theme);
  };

  const handleLayoutChange = (updates: Partial<LayoutConfig>) => {
    const newLayout = { ...layout, ...updates };
    setLayout(newLayout);
    onLayoutChange?.(newLayout);
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#1e1e1e' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: '#3c3c3c', backgroundColor: '#252526' }}
      >
        <div className="flex items-center gap-3">
          <Palette className="w-5 h-5 text-purple-400" />
          <span className="font-medium text-white">Appearance</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b" style={{ borderColor: '#3c3c3c' }}>
        {(['themes', 'layout', 'editor'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={cn(
              'px-4 py-2 text-sm transition-colors border-b-2 capitalize',
              selectedTab === tab
                ? 'text-blue-400 border-blue-400'
                : 'text-gray-400 border-transparent hover:text-white'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedTab === 'themes' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme)}
                  className={cn(
                    'p-3 rounded-lg border text-left transition-all',
                    activeTheme.id === theme.id
                      ? 'border-blue-500 ring-1 ring-blue-500'
                      : 'border-transparent hover:border-gray-700'
                  )}
                  style={{ backgroundColor: theme.colors.background }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ color: theme.colors.foreground }} className="text-sm font-medium">
                      {theme.name}
                    </span>
                    {theme.type === 'dark' ? (
                      <Moon className="w-4 h-4" style={{ color: theme.colors.foreground }} />
                    ) : (
                      <Sun className="w-4 h-4" style={{ color: theme.colors.foreground }} />
                    )}
                  </div>
                  <div className="flex gap-1">
                    {Object.values(theme.colors).slice(0, 5).map((color, idx) => (
                      <div
                        key={idx}
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-4 border-t" style={{ borderColor: '#3c3c3c' }}>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Color Preview</h4>
              <div className="space-y-2">
                {Object.entries(activeTheme.colors).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 capitalize">{key}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: value, borderColor: '#3c3c3c' }}
                      />
                      <span className="text-xs font-mono text-gray-500">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'layout' && (
          <div className="space-y-4">
            {/* Sidebar Options */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Sidebar</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Visible</span>
                  <button
                    onClick={() => handleLayoutChange({ sidebarVisible: !layout.sidebarVisible })}
                    className={cn(
                      'w-10 h-5 rounded-full transition-colors relative',
                      layout.sidebarVisible ? 'bg-blue-600' : 'bg-gray-600'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                        layout.sidebarVisible ? 'translate-x-5' : 'translate-x-0.5'
                      )}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Position</span>
                  <div className="flex gap-1 p-1 rounded" style={{ backgroundColor: '#3c3c3c' }}>
                    <button
                      onClick={() => handleLayoutChange({ sidebarPosition: 'left' })}
                      className={cn(
                        'p-1 rounded transition-colors',
                        layout.sidebarPosition === 'left'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      )}
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleLayoutChange({ sidebarPosition: 'right' })}
                      className={cn(
                        'p-1 rounded transition-colors',
                        layout.sidebarPosition === 'right'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      )}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">Width</span>
                    <span className="text-xs text-gray-500">{layout.sidebarWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min={150}
                    max={400}
                    value={layout.sidebarWidth}
                    onChange={(e) => handleLayoutChange({ sidebarWidth: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Panel Options */}
            <div className="pt-4 border-t" style={{ borderColor: '#3c3c3c' }}>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Panel</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Visible</span>
                  <button
                    onClick={() => handleLayoutChange({ panelVisible: !layout.panelVisible })}
                    className={cn(
                      'w-10 h-5 rounded-full transition-colors relative',
                      layout.panelVisible ? 'bg-blue-600' : 'bg-gray-600'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                        layout.panelVisible ? 'translate-x-5' : 'translate-x-0.5'
                      )}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Position</span>
                  <div className="flex gap-1 p-1 rounded" style={{ backgroundColor: '#3c3c3c' }}>
                    <button
                      onClick={() => handleLayoutChange({ panelPosition: 'bottom' })}
                      className={cn(
                        'p-1 rounded transition-colors',
                        layout.panelPosition === 'bottom'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      )}
                    >
                      <Rows className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleLayoutChange({ panelPosition: 'right' })}
                      className={cn(
                        'p-1 rounded transition-colors',
                        layout.panelPosition === 'right'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      )}
                    >
                      <Columns className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* View Options */}
            <div className="pt-4 border-t" style={{ borderColor: '#3c3c3c' }}>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">View</h4>
              <div className="space-y-3">
                {[
                  { key: 'minimap', label: 'Minimap' },
                  { key: 'breadcrumbs', label: 'Breadcrumbs' },
                  { key: 'lineNumbers', label: 'Line Numbers' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{label}</span>
                    <button
                      onClick={() => handleLayoutChange({ [key]: !layout[key as keyof LayoutConfig] })}
                      className={cn(
                        'w-10 h-5 rounded-full transition-colors relative',
                        layout[key as keyof LayoutConfig] ? 'bg-blue-600' : 'bg-gray-600'
                      )}
                    >
                      <div
                        className={cn(
                          'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                          layout[key as keyof LayoutConfig] ? 'translate-x-5' : 'translate-x-0.5'
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'editor' && (
          <div className="space-y-4">
            {/* Font Settings */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Font</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Family</label>
                  <select
                    value={layout.fontFamily}
                    onChange={(e) => handleLayoutChange({ fontFamily: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded text-white outline-none"
                    style={{ backgroundColor: '#3c3c3c' }}
                  >
                    <option value="Fira Code">Fira Code</option>
                    <option value="JetBrains Mono">JetBrains Mono</option>
                    <option value="Source Code Pro">Source Code Pro</option>
                    <option value="Consolas">Consolas</option>
                    <option value="Monaco">Monaco</option>
                  </select>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-300">Size</span>
                    <span className="text-xs text-gray-500">{layout.fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={24}
                    value={layout.fontSize}
                    onChange={(e) => handleLayoutChange({ fontSize: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Editor Settings */}
            <div className="pt-4 border-t" style={{ borderColor: '#3c3c3c' }}>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Editor</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Tab Size</label>
                  <div className="flex gap-1 p-1 rounded" style={{ backgroundColor: '#3c3c3c' }}>
                    {[2, 4, 8].map((size) => (
                      <button
                        key={size}
                        onClick={() => handleLayoutChange({ tabSize: size })}
                        className={cn(
                          'flex-1 py-1 text-xs rounded transition-colors',
                          layout.tabSize === size
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-400 hover:text-white'
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Word Wrap</span>
                  <button
                    onClick={() => handleLayoutChange({ wordWrap: !layout.wordWrap })}
                    className={cn(
                      'w-10 h-5 rounded-full transition-colors relative',
                      layout.wordWrap ? 'bg-blue-600' : 'bg-gray-600'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                        layout.wordWrap ? 'translate-x-5' : 'translate-x-0.5'
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="pt-4 border-t" style={{ borderColor: '#3c3c3c' }}>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Preview</h4>
              <pre
                className="p-4 rounded overflow-x-auto"
                style={{
                  backgroundColor: activeTheme.colors.editor,
                  fontFamily: layout.fontFamily,
                  fontSize: `${layout.fontSize}px`,
                }}
              >
                <code style={{ color: activeTheme.colors.foreground }}>
{`function hello() {
  const message = "Hello, World!";
  console.log(message);
  return message;
}`}
                </code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 51. GIT PROVIDER SYNC (GITHUB, GITLAB, BITBUCKET)
// ============================================================================

// Git Provider Types
export type GitProvider = 'github' | 'gitlab' | 'bitbucket';

export interface GitProviderConfig {
  provider: GitProvider;
  enabled: boolean;
  accessToken?: string;
  refreshToken?: string;
  username?: string;
  email?: string;
  avatarUrl?: string;
  connectedAt?: Date;
  lastSyncAt?: Date;
  autoSync: boolean;
  syncInterval: number; // minutes
  syncOnSave: boolean;
  syncBranch: string;
  defaultCommitMessage: string;
}

export interface GitRepository {
  id: string;
  name: string;
  fullName: string;
  description?: string;
  url: string;
  cloneUrl: string;
  defaultBranch: string;
  isPrivate: boolean;
  owner: {
    login: string;
    avatarUrl?: string;
  };
  lastPush?: Date;
  stars?: number;
  forks?: number;
}

export interface GitBranch {
  name: string;
  commit: string;
  isDefault: boolean;
  isProtected: boolean;
  lastCommitDate?: Date;
}

export interface GitSyncStatus {
  status: 'idle' | 'syncing' | 'pulling' | 'pushing' | 'error' | 'conflict';
  message?: string;
  progress?: number;
  lastSync?: Date;
  pendingChanges: number;
  conflictFiles?: string[];
}

export interface GitCommitHistory {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  date: Date;
  filesChanged: number;
  additions: number;
  deletions: number;
}

// Sample Data for Git Providers
export const sampleGitProviderConfigs: Record<GitProvider, GitProviderConfig> = {
  github: {
    provider: 'github',
    enabled: true,
    username: 'john-developer',
    email: 'john@example.com',
    avatarUrl: undefined,
    connectedAt: new Date(Date.now() - 86400000 * 30),
    lastSyncAt: new Date(Date.now() - 3600000),
    autoSync: true,
    syncInterval: 15,
    syncOnSave: true,
    syncBranch: 'main',
    defaultCommitMessage: 'Update functions via RustPress',
  },
  gitlab: {
    provider: 'gitlab',
    enabled: false,
    autoSync: false,
    syncInterval: 30,
    syncOnSave: false,
    syncBranch: 'main',
    defaultCommitMessage: 'Update functions via RustPress',
  },
  bitbucket: {
    provider: 'bitbucket',
    enabled: false,
    autoSync: false,
    syncInterval: 30,
    syncOnSave: false,
    syncBranch: 'main',
    defaultCommitMessage: 'Update functions via RustPress',
  },
};

export const sampleGitRepositories: GitRepository[] = [
  {
    id: 'repo-1',
    name: 'my-functions',
    fullName: 'john-developer/my-functions',
    description: 'Serverless functions collection',
    url: 'https://github.com/john-developer/my-functions',
    cloneUrl: 'https://github.com/john-developer/my-functions.git',
    defaultBranch: 'main',
    isPrivate: true,
    owner: { login: 'john-developer' },
    lastPush: new Date(Date.now() - 86400000),
    stars: 12,
    forks: 3,
  },
  {
    id: 'repo-2',
    name: 'api-handlers',
    fullName: 'john-developer/api-handlers',
    description: 'API endpoint handlers',
    url: 'https://github.com/john-developer/api-handlers',
    cloneUrl: 'https://github.com/john-developer/api-handlers.git',
    defaultBranch: 'main',
    isPrivate: false,
    owner: { login: 'john-developer' },
    lastPush: new Date(Date.now() - 86400000 * 3),
    stars: 45,
    forks: 8,
  },
];

export const sampleGitBranches: GitBranch[] = [
  { name: 'main', commit: 'abc123', isDefault: true, isProtected: true, lastCommitDate: new Date() },
  { name: 'develop', commit: 'def456', isDefault: false, isProtected: false, lastCommitDate: new Date(Date.now() - 3600000) },
  { name: 'feature/new-function', commit: 'ghi789', isDefault: false, isProtected: false, lastCommitDate: new Date(Date.now() - 86400000) },
];

export const sampleGitCommitHistory: GitCommitHistory[] = [
  {
    sha: 'abc123def456',
    message: 'Add new payment processing function',
    author: { name: 'John Developer', email: 'john@example.com' },
    date: new Date(Date.now() - 3600000),
    filesChanged: 3,
    additions: 150,
    deletions: 20,
  },
  {
    sha: 'def456ghi789',
    message: 'Fix error handling in email sender',
    author: { name: 'John Developer', email: 'john@example.com' },
    date: new Date(Date.now() - 86400000),
    filesChanged: 1,
    additions: 25,
    deletions: 10,
  },
  {
    sha: 'ghi789jkl012',
    message: 'Update dependencies and add tests',
    author: { name: 'John Developer', email: 'john@example.com' },
    date: new Date(Date.now() - 86400000 * 2),
    filesChanged: 5,
    additions: 200,
    deletions: 50,
  },
];

interface GitProviderSyncProps {
  onSync?: (provider: GitProvider, action: 'push' | 'pull') => void;
  onConnect?: (provider: GitProvider) => void;
  onDisconnect?: (provider: GitProvider) => void;
  onConfigChange?: (provider: GitProvider, config: GitProviderConfig) => void;
}

export const GitProviderSync: React.FC<GitProviderSyncProps> = ({
  onSync,
  onConnect,
  onDisconnect,
  onConfigChange,
}) => {
  const [configs, setConfigs] = useState<Record<GitProvider, GitProviderConfig>>(sampleGitProviderConfigs);
  const [selectedProvider, setSelectedProvider] = useState<GitProvider>('github');
  const [repositories, setRepositories] = useState<GitRepository[]>(sampleGitRepositories);
  const [selectedRepo, setSelectedRepo] = useState<GitRepository | null>(sampleGitRepositories[0]);
  const [branches, setBranches] = useState<GitBranch[]>(sampleGitBranches);
  const [commitHistory, setCommitHistory] = useState<GitCommitHistory[]>(sampleGitCommitHistory);
  const [syncStatus, setSyncStatus] = useState<GitSyncStatus>({
    status: 'idle',
    lastSync: new Date(Date.now() - 3600000),
    pendingChanges: 3,
  });
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [connectingProvider, setConnectingProvider] = useState<GitProvider | null>(null);
  const [accessToken, setAccessToken] = useState('');

  const providers: { id: GitProvider; name: string; icon: React.ReactNode; color: string; description: string }[] = [
    {
      id: 'github',
      name: 'GitHub',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
      color: '#333',
      description: 'Connect to GitHub repositories',
    },
    {
      id: 'gitlab',
      name: 'GitLab',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"/>
        </svg>
      ),
      color: '#FC6D26',
      description: 'Connect to GitLab repositories',
    },
    {
      id: 'bitbucket',
      name: 'Bitbucket',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M.778 1.211a.768.768 0 00-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 00.77-.646l3.27-20.03a.768.768 0 00-.768-.891zM14.52 15.53H9.522L8.17 8.466h7.561z"/>
        </svg>
      ),
      color: '#0052CC',
      description: 'Connect to Bitbucket repositories',
    },
  ];

  const currentConfig = configs[selectedProvider];
  const currentProviderInfo = providers.find((p) => p.id === selectedProvider);

  const handleConnect = (provider: GitProvider) => {
    setConnectingProvider(provider);
    setShowConnectModal(true);
  };

  const handleDisconnect = (provider: GitProvider) => {
    const updated = {
      ...configs,
      [provider]: {
        ...configs[provider],
        enabled: false,
        accessToken: undefined,
        username: undefined,
        email: undefined,
        connectedAt: undefined,
      },
    };
    setConfigs(updated);
    onDisconnect?.(provider);
  };

  const handleConnectSubmit = () => {
    if (!connectingProvider || !accessToken) return;

    // Simulate connection
    const updated = {
      ...configs,
      [connectingProvider]: {
        ...configs[connectingProvider],
        enabled: true,
        accessToken,
        username: 'connected-user',
        email: 'user@example.com',
        connectedAt: new Date(),
      },
    };
    setConfigs(updated);
    onConnect?.(connectingProvider);
    setShowConnectModal(false);
    setAccessToken('');
    setConnectingProvider(null);
  };

  const handleSync = (action: 'push' | 'pull') => {
    setSyncStatus({ ...syncStatus, status: action === 'push' ? 'pushing' : 'pulling', progress: 0 });

    // Simulate sync progress
    const interval = setInterval(() => {
      setSyncStatus((prev) => {
        const newProgress = (prev.progress || 0) + 20;
        if (newProgress >= 100) {
          clearInterval(interval);
          return {
            status: 'idle',
            lastSync: new Date(),
            pendingChanges: action === 'push' ? 0 : prev.pendingChanges,
            progress: undefined,
          };
        }
        return { ...prev, progress: newProgress };
      });
    }, 500);

    onSync?.(selectedProvider, action);
  };

  const handleConfigUpdate = (updates: Partial<GitProviderConfig>) => {
    const updated = {
      ...configs,
      [selectedProvider]: { ...currentConfig, ...updates },
    };
    setConfigs(updated);
    onConfigChange?.(selectedProvider, updated[selectedProvider]);
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="flex h-full" style={{ backgroundColor: '#1e1e1e' }}>
      {/* Provider Sidebar */}
      <div
        className="w-64 border-r flex flex-col"
        style={{ borderColor: '#3c3c3c', backgroundColor: '#252526' }}
      >
        <div className="p-3 border-b" style={{ borderColor: '#3c3c3c' }}>
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="w-5 h-5 text-orange-400" />
            <span className="font-medium text-white">Git Sync</span>
          </div>
          <p className="text-xs text-gray-500">
            Sync functions with your Git repositories
          </p>
        </div>

        {/* Provider List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {providers.map((provider) => {
            const config = configs[provider.id];
            return (
              <button
                key={provider.id}
                onClick={() => setSelectedProvider(provider.id)}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded transition-colors',
                  selectedProvider === provider.id
                    ? 'bg-blue-600/20 border border-blue-500/50'
                    : 'hover:bg-white/5 border border-transparent'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center"
                    style={{ backgroundColor: provider.color + '20', color: provider.color }}
                  >
                    {provider.icon}
                  </div>
                  <div className="text-left">
                    <span className="text-sm text-white block">{provider.name}</span>
                    <span className="text-xs text-gray-500">
                      {config.enabled ? config.username : 'Not connected'}
                    </span>
                  </div>
                </div>
                {config.enabled && (
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Sync Status */}
        <div className="p-3 border-t" style={{ borderColor: '#3c3c3c' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Sync Status</span>
            <span className={cn(
              'text-xs px-2 py-0.5 rounded',
              syncStatus.status === 'idle' ? 'bg-green-500/20 text-green-400' :
              syncStatus.status === 'error' ? 'bg-red-500/20 text-red-400' :
              'bg-blue-500/20 text-blue-400'
            )}>
              {syncStatus.status === 'idle' ? 'Synced' :
               syncStatus.status === 'pushing' ? 'Pushing...' :
               syncStatus.status === 'pulling' ? 'Pulling...' :
               syncStatus.status}
            </span>
          </div>
          {syncStatus.progress !== undefined && (
            <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ backgroundColor: '#3c3c3c' }}>
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${syncStatus.progress}%` }}
              />
            </div>
          )}
          <div className="text-xs text-gray-500">
            {syncStatus.lastSync && `Last sync: ${formatTimeAgo(syncStatus.lastSync)}`}
          </div>
          {syncStatus.pendingChanges > 0 && (
            <div className="text-xs text-yellow-400 mt-1">
              {syncStatus.pendingChanges} pending change{syncStatus.pendingChanges !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: '#3c3c3c' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded flex items-center justify-center"
              style={{ backgroundColor: currentProviderInfo?.color + '20', color: currentProviderInfo?.color }}
            >
              {currentProviderInfo?.icon}
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">{currentProviderInfo?.name}</h3>
              <p className="text-xs text-gray-500">{currentProviderInfo?.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentConfig.enabled ? (
              <>
                <button
                  onClick={() => handleSync('pull')}
                  disabled={syncStatus.status !== 'idle'}
                  className="px-3 py-1.5 text-xs rounded border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 disabled:opacity-50 transition-colors flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Pull
                </button>
                <button
                  onClick={() => handleSync('push')}
                  disabled={syncStatus.status !== 'idle'}
                  className="px-3 py-1.5 text-xs rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Push
                </button>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => handleConnect(selectedProvider)}
                className="px-4 py-2 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2"
              >
                <Link className="w-4 h-4" />
                Connect {currentProviderInfo?.name}
              </button>
            )}
          </div>
        </div>

        {currentConfig.enabled ? (
          <div className="flex-1 overflow-y-auto">
            {/* Repository Selection */}
            <div className="p-4 border-b" style={{ borderColor: '#3c3c3c' }}>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Repository</h4>
              <div className="space-y-2">
                {repositories.map((repo) => (
                  <button
                    key={repo.id}
                    onClick={() => setSelectedRepo(repo)}
                    className={cn(
                      'w-full p-3 rounded border text-left transition-colors',
                      selectedRepo?.id === repo.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-transparent hover:border-gray-700 bg-[#252526]'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium text-white">{repo.name}</span>
                        {repo.isPrivate && (
                          <Lock className="w-3 h-3 text-gray-500" />
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{repo.defaultBranch}</span>
                    </div>
                    {repo.description && (
                      <p className="text-xs text-gray-400 mb-2">{repo.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" /> {repo.stars}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3" /> {repo.forks}
                      </span>
                      {repo.lastPush && (
                        <span>Updated {formatTimeAgo(repo.lastPush)}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Branch Selection */}
            {selectedRepo && (
              <div className="p-4 border-b" style={{ borderColor: '#3c3c3c' }}>
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Branch</h4>
                <div className="flex gap-2 flex-wrap">
                  {branches.map((branch) => (
                    <button
                      key={branch.name}
                      onClick={() => handleConfigUpdate({ syncBranch: branch.name })}
                      className={cn(
                        'px-3 py-1.5 text-xs rounded border transition-colors flex items-center gap-1',
                        currentConfig.syncBranch === branch.name
                          ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                          : 'border-gray-600 text-gray-400 hover:text-white hover:border-gray-500'
                      )}
                    >
                      <GitBranch className="w-3 h-3" />
                      {branch.name}
                      {branch.isDefault && (
                        <span className="px-1 py-0.5 text-[10px] rounded bg-gray-600 text-gray-300 ml-1">
                          default
                        </span>
                      )}
                      {branch.isProtected && (
                        <Shield className="w-3 h-3 text-yellow-400 ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Commits */}
            <div className="p-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-3">Recent Commits</h4>
              <div className="space-y-2">
                {commitHistory.map((commit) => (
                  <div
                    key={commit.sha}
                    className="p-3 rounded"
                    style={{ backgroundColor: '#252526' }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-xs text-white">
                          {commit.author.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-sm text-white">{commit.message}</span>
                          <div className="text-xs text-gray-500">
                            {commit.author.name} • {formatTimeAgo(commit.date)}
                          </div>
                        </div>
                      </div>
                      <code className="text-xs text-gray-500 font-mono">
                        {commit.sha.substring(0, 7)}
                      </code>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-gray-500">{commit.filesChanged} file{commit.filesChanged !== 1 ? 's' : ''}</span>
                      <span className="text-green-400">+{commit.additions}</span>
                      <span className="text-red-400">-{commit.deletions}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: currentProviderInfo?.color + '20', color: currentProviderInfo?.color }}
              >
                {currentProviderInfo?.icon}
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Connect to {currentProviderInfo?.name}
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Sync your functions with {currentProviderInfo?.name} repositories. Push changes, pull updates, and collaborate with your team.
              </p>
              <button
                onClick={() => handleConnect(selectedProvider)}
                className="px-6 py-2 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2 mx-auto"
              >
                <Link className="w-4 h-4" />
                Connect {currentProviderInfo?.name}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Connect Modal */}
      <AnimatePresence>
        {showConnectModal && connectingProvider && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowConnectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-lg"
              style={{ backgroundColor: '#252526' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded flex items-center justify-center"
                  style={{
                    backgroundColor: providers.find((p) => p.id === connectingProvider)?.color + '20',
                    color: providers.find((p) => p.id === connectingProvider)?.color,
                  }}
                >
                  {providers.find((p) => p.id === connectingProvider)?.icon}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">
                    Connect to {providers.find((p) => p.id === connectingProvider)?.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Enter your personal access token
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Personal Access Token</label>
                  <input
                    type="password"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2 rounded text-sm text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500"
                    style={{ backgroundColor: '#3c3c3c' }}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Create a token with repo scope in your {providers.find((p) => p.id === connectingProvider)?.name} settings
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setShowConnectModal(false);
                      setAccessToken('');
                      setConnectingProvider(null);
                    }}
                    className="flex-1 px-4 py-2 text-sm rounded border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConnectSubmit}
                    disabled={!accessToken}
                    className="flex-1 px-4 py-2 text-sm rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors"
                  >
                    Connect
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowSettingsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md p-6 rounded-lg"
              style={{ backgroundColor: '#252526' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Sync Settings</h3>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Auto Sync */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-white">Auto Sync</span>
                    <p className="text-xs text-gray-500">Automatically sync changes</p>
                  </div>
                  <button
                    onClick={() => handleConfigUpdate({ autoSync: !currentConfig.autoSync })}
                    className={cn(
                      'w-10 h-5 rounded-full transition-colors relative',
                      currentConfig.autoSync ? 'bg-blue-600' : 'bg-gray-600'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                        currentConfig.autoSync ? 'translate-x-5' : 'translate-x-0.5'
                      )}
                    />
                  </button>
                </div>

                {/* Sync on Save */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-white">Sync on Save</span>
                    <p className="text-xs text-gray-500">Push changes when saving</p>
                  </div>
                  <button
                    onClick={() => handleConfigUpdate({ syncOnSave: !currentConfig.syncOnSave })}
                    className={cn(
                      'w-10 h-5 rounded-full transition-colors relative',
                      currentConfig.syncOnSave ? 'bg-blue-600' : 'bg-gray-600'
                    )}
                  >
                    <div
                      className={cn(
                        'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                        currentConfig.syncOnSave ? 'translate-x-5' : 'translate-x-0.5'
                      )}
                    />
                  </button>
                </div>

                {/* Sync Interval */}
                <div>
                  <label className="text-sm text-white mb-1 block">Sync Interval</label>
                  <select
                    value={currentConfig.syncInterval}
                    onChange={(e) => handleConfigUpdate({ syncInterval: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded text-white outline-none"
                    style={{ backgroundColor: '#3c3c3c' }}
                  >
                    <option value={5}>Every 5 minutes</option>
                    <option value={15}>Every 15 minutes</option>
                    <option value={30}>Every 30 minutes</option>
                    <option value={60}>Every hour</option>
                  </select>
                </div>

                {/* Default Commit Message */}
                <div>
                  <label className="text-sm text-white mb-1 block">Default Commit Message</label>
                  <input
                    type="text"
                    value={currentConfig.defaultCommitMessage}
                    onChange={(e) => handleConfigUpdate({ defaultCommitMessage: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded text-white placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500"
                    style={{ backgroundColor: '#3c3c3c' }}
                  />
                </div>

                {/* Disconnect */}
                <div className="pt-4 border-t" style={{ borderColor: '#3c3c3c' }}>
                  <button
                    onClick={() => {
                      handleDisconnect(selectedProvider);
                      setShowSettingsModal(false);
                    }}
                    className="w-full px-4 py-2 text-sm rounded border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Unlink className="w-4 h-4" />
                    Disconnect {currentProviderInfo?.name}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Types are already exported above
};
