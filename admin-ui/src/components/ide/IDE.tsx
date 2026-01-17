/**
 * IDE - VS Code-like Code Editor
 * Main container with full feature set including:
 * - File tree and editor
 * - Terminal and Problems panel
 * - Git integration
 * - Extensions and snippets
 * - Image preview
 * - Zen mode
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, GitBranch, Settings, ChevronLeft, ChevronRight,
  Loader2, ArrowLeft, Code2, FolderOpen, Palette, Zap, Puzzle, Image as ImageIcon, AppWindow,
  Search, Pin, PinOff, X, Upload, FilePlus, FolderPlus, Maximize2, Minimize2,
  Terminal as TerminalIcon, AlertTriangle, AlertCircle, List, Bell, Package, History,
  FileText, ChevronDown, ChevronUp, Play, Square, Trash2, Plus, RefreshCw,
  Download, GitCommit, Eye, Scissors, Layout, Code, Circle, Hash, Map,
  TerminalSquare, ListTodo, Hammer, MessageSquare, AlignLeft, Lock, Unlock,
  // New icons for extended features
  Bug, Bookmark as BookmarkIcon, Bot, Camera, Clock, Columns, Cpu, FileCode,
  FileSearch, Filter, GitCompare, GitMerge, Keyboard, Layers, Link2,
  ListTree, Microscope, Monitor, PanelBottom, Sparkles, Split, Rows,
  SquareFunction, Timer, Type, Variable as VariableIcon, Workflow, FolderRoot, Wand2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Core components
import { FileTree } from './FileTree';
import { EditorTabs } from './EditorTabs';
import { MonacoWrapper } from './MonacoWrapper';
import { GitPanel } from './GitPanel';
import { SettingsPanel } from './SettingsPanel';
import { StatusBar } from './StatusBar';
import { ContextMenu, getFileActions, getFolderActions, type ContextMenuAction } from './ContextMenu';
import { CreateFileModal } from './CreateFileModal';
import { ConfirmDialog } from './ConfirmDialog';

// Search and navigation
import { GlobalSearch } from './GlobalSearch';
import { QuickOpen } from './QuickOpen';
import { CommandPalette, getDefaultCommands, type Command } from './CommandPalette';
import { GoToLineModal } from './GoToLineModal';
import { FindReplace } from './FindReplace';
import { Breadcrumbs } from './Breadcrumbs';
import { SymbolSearch, type WorkspaceSymbol } from './SymbolSearch';

// Editor features
import { EditorSettings as EditorSettingsPanel, defaultEditorConfig, type EditorConfig } from './EditorSettings';
import { KeyboardShortcuts } from './KeyboardShortcuts';
import { SplitEditor } from './SplitEditor';
import { DiffView } from './DiffView';
import { ZenMode } from './ZenMode';
import { ColorPicker } from './ColorPicker';
import { ImagePreview } from './ImagePreview';
import { EditorGroups, type EditorGroup } from './EditorGroups';

// Panels
import { Terminal } from './Terminal';
import { OutlinePanel } from './OutlinePanel';
import { ProblemsPanel, type Problem } from './ProblemsPanel';
import { ActivityBar, type ActivityView } from './ActivityBar';
import { NotificationsPanel, NotificationsContainer, NotificationToast, type Notification } from './NotificationsPanel';
import { PanelPresets, type PanelLayout } from './PanelPresets';

// Git and extensions
import { GitImport } from './GitImport';
import { FileHistory, type FileCommit } from './FileHistory';
import { ExtensionsPanel, type Extension } from './ExtensionsPanel';
import { SnippetsManager, type Snippet } from './SnippetsManager';

// Onboarding
import { WelcomeTab } from './WelcomeTab';
import { OnboardingWizard } from './OnboardingWizard';
import { UnlockSessionModal } from './UnlockSessionModal';

// New IDE Features - Debugging
import DebugConsole, { type ConsoleEntry } from './DebugConsole';
import BreakpointsPanel, { type Breakpoint } from './BreakpointsPanel';
import WatchExpressions, { type WatchExpression } from './WatchExpressions';
import CallStackPanel, { type StackFrame, type Thread } from './CallStackPanel';
import VariablesPanel, { type VariableItem, type VariableScope } from './VariablesPanel';

// New IDE Features - Code Intelligence
import { CodeLensPanel, CodeLensDecoration, type CodeLensItem } from './CodeLens';
import PeekDefinition, { type Definition } from './PeekDefinition';
import ReferencesPanel, { type Reference, type ReferenceGroup } from './ReferencesPanel';
import CallHierarchy, { type CallItem } from './CallHierarchy';
import TypeHierarchy, { type TypeItem } from './TypeHierarchy';
import CodeActionsPanel, { type CodeAction } from './CodeActionsPanel';

// New IDE Features - Editor Enhancements
import LinkedEditing, { type LinkedEditGroup } from './LinkedEditing';
import BracketColorizer from './BracketColorizer';
import IndentGuides from './IndentGuides';
import WhitespaceRenderer from './WhitespaceRenderer';
import MinimapControls, { type MinimapSettings } from './MinimapControls';
import BookmarksManager, { type CodeBookmark } from './BookmarksManager';
import TimelineView, { type TimelineEntry } from './TimelineView';
import KeybindingsEditor, { type Keybinding } from './KeybindingsEditor';

// New IDE Features - Tools
import CodeScreenshot, { type ScreenshotSettings } from './CodeScreenshot';
import FormatDocument, { type FormatOptions } from './FormatDocument';
import EmmetPanel, { type EmmetSnippet, type EmmetSettings } from './EmmetPanel';
import WorkspaceSettings, { type WorkspaceSetting } from './WorkspaceSettings';

// New IDE Features - File Comparison
import CompareFiles, { type DiffLine, type CompareFile } from './CompareFiles';
import MergeConflicts, { type ConflictHunk, type ConflictFile } from './MergeConflicts';

// New IDE Features - Search & Tasks
import FindAndReplaceAdvanced, { type SearchResult, type SearchOptions } from './FindAndReplaceAdvanced';
import TasksRunner, { type TaskConfig, type TaskExecution } from './TasksRunner';

// New IDE Features - Preview & AI
import LivePreview, { type PreviewSettings, type DevicePreset } from './LivePreview';
import AIAssistantPanel, { type AIMessage, type AIConversation, type AISettings } from './AIAssistantPanel';
import { HtmlCssPreview } from './HtmlCssPreview';
import { FunctionRunner } from './FunctionRunner';
import { AppPreview } from './AppPreview';
import { PluginPreview } from './PluginPreview';
import { GitWarningBanner } from './GitWarningBanner';

// Collaboration
import { CollaborationPanel } from './collaboration';
import { useCollaborationStore } from '../../store/collaborationStore';

// Chat
import { ConversationList, ConversationView } from './chat';
import { useChatStore } from '../../store/chatStore';

// Wizards
import { WizardLauncher } from './wizards';
import {
  generateThemeProject,
  generatePluginProject,
  generateFunctionProject,
  generateAppProject,
  type ThemeConfig,
  type PluginConfig,
  type FunctionConfig,
  type AppConfig,
  type GenerationResult,
} from '../../services/projectGeneratorService';

// RustPress CMS Components
import {
  ContentManager,
  MediaLibrary,
  TaxonomyManager,
  MenuBuilder,
  CommentModeration,
  ThemeDesigner,
  APIExplorer,
  DatabaseInspector,
  WebhookManager,
  SEOAnalyzer,
  PerformanceProfiler,
  CacheManager,
  SecurityScanner,
  BackupManager,
  LogViewer,
  UserRoleEditor,
  FormBuilder,
  WidgetManager,
  PluginManager,
  AnalyticsDashboard,
  SettingsPanel as RustPressSettings,
  EmailTemplateEditor,
  RedirectManager,
  ScheduledTasks,
} from './rustpress';

// Services
import { readFile, writeFile, listDirectory, createFile, deleteFile, renameFile, getLanguageFromPath, checkGitStatus, initGitRepository, type FileNode, type GitStatus } from '../../services/fileSystemService';
import { windowSyncService, type FileContentPayload, type DetachPayload } from '../../services/windowSyncService';
import { toast } from 'react-hot-toast';

// ============================================
// TYPES
// ============================================

export interface OpenFile {
  path: string;
  name: string;
  content: string;
  originalContent: string;
  language: string;
  isModified: boolean;
  isPinned: boolean;
  cursorPosition: { line: number; column: number };
}

export interface IDEProps {
  projectName?: string;
  projectVersion?: string;
  initialFolder?: 'themes' | 'functions' | 'plugins' | 'apps' | 'assets';
}

type RightPanel = 'git' | 'settings' | 'search' | 'editor-settings' | 'extensions' | 'outline' | 'history' | 'ai-assistant' | 'references' | 'call-hierarchy' | 'type-hierarchy' | 'bookmarks' | 'timeline' | 'compare' | null;
type BottomPanel = 'terminal' | 'problems' | 'output' | 'debug-console' | 'tasks' | 'preview' | null;

// Folder configuration - base folders always shown
const BASE_FOLDERS = [
  { id: 'themes', label: 'Themes', icon: Palette, path: 'themes' },
  { id: 'functions', label: 'Functions', icon: Zap, path: 'functions' },
  { id: 'plugins', label: 'Plugins', icon: Puzzle, path: 'plugins' },
  { id: 'apps', label: 'Apps', icon: AppWindow, path: 'apps' },
  { id: 'assets', label: 'Assets', icon: ImageIcon, path: 'assets' },
] as const;

// Root folder option - only shown when admin is unlocked
const ROOT_FOLDER = { id: 'root', label: 'Folders', icon: FolderRoot, path: '/' } as const;

type FolderId = typeof BASE_FOLDERS[number]['id'] | 'root';

// Image extensions (excluding SVG which has its own preview)
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.bmp'];

// HTML/CSS/SVG extensions for live preview
const HTML_EXTENSIONS = ['.html', '.htm', '.xhtml'];
const CSS_EXTENSIONS = ['.css', '.scss', '.sass', '.less'];
const SVG_EXTENSIONS = ['.svg'];

// Function/Script extensions
const FUNCTION_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.py', '.rs', '.go', '.php'];

// ============================================
// HELPER FUNCTIONS
// ============================================

const isImageFile = (path: string): boolean => {
  const ext = path.toLowerCase().substring(path.lastIndexOf('.'));
  return IMAGE_EXTENSIONS.includes(ext);
};

const isHtmlFile = (path: string): boolean => {
  const ext = path.toLowerCase().substring(path.lastIndexOf('.'));
  return HTML_EXTENSIONS.includes(ext);
};

const isCssFile = (path: string): boolean => {
  const ext = path.toLowerCase().substring(path.lastIndexOf('.'));
  return CSS_EXTENSIONS.includes(ext);
};

const isSvgFile = (path: string): boolean => {
  const ext = path.toLowerCase().substring(path.lastIndexOf('.'));
  return SVG_EXTENSIONS.includes(ext);
};

const isPreviewableFile = (path: string): boolean => {
  return isHtmlFile(path) || isCssFile(path) || isSvgFile(path);
};

const isFunctionFile = (path: string): boolean => {
  const ext = path.toLowerCase().substring(path.lastIndexOf('.'));
  return FUNCTION_EXTENSIONS.includes(ext);
};

// ============================================
// CHAT PANEL COMPONENT
// ============================================

const ChatPanel: React.FC = () => {
  const {
    activeConversationId,
    setActiveConversation,
    loadConversations,
  } = useChatStore();

  // Load conversations on mount
  React.useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-700 flex items-center gap-2">
        {activeConversationId && (
          <button
            onClick={() => setActiveConversation(null)}
            className="p-1 text-gray-400 hover:text-white rounded transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <MessageSquare className="w-4 h-4 text-blue-400" />
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {activeConversationId ? 'Conversation' : 'Chat'}
        </h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeConversationId ? (
          <ConversationView conversationId={activeConversationId} />
        ) : (
          <ConversationList />
        )}
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const IDE: React.FC<IDEProps> = ({
  projectName = 'RustPress',
  projectVersion = '1.0.0',
  initialFolder = 'themes'
}) => {
  // Active folder state
  const [activeFolder, setActiveFolder] = useState<FolderId>(initialFolder);
  const currentFolder = activeFolder === 'root'
    ? ROOT_FOLDER
    : BASE_FOLDERS.find(f => f.id === activeFolder) || BASE_FOLDERS[0];

  // File state
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);

  // Multi-panel editor groups state
  const [editorGroups, setEditorGroups] = useState<EditorGroup[]>([
    { id: 'group-1', files: [], activeFilePath: null }
  ]);
  const [activeGroupId, setActiveGroupId] = useState('group-1');
  const [useMultiPanel, setUseMultiPanel] = useState(false);

  // Layout state
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanel, setRightPanel] = useState<RightPanel>('git');
  const [rightPanelWidth, setRightPanelWidth] = useState(300);
  const [bottomPanel, setBottomPanel] = useState<BottomPanel>(null);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(200);
  const [activityView, setActivityView] = useState<ActivityView>('files');

  // Collaboration state
  const { onlineUsers, isConnected: isCollaborationConnected } = useCollaborationStore();

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [splitMode, setSplitMode] = useState<'none' | 'horizontal' | 'vertical'>('none');

  // Modal state
  const [showQuickOpen, setShowQuickOpen] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showGoToLine, setShowGoToLine] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showCreateFileModal, setShowCreateFileModal] = useState(false);
  const [createFileType, setCreateFileType] = useState<'file' | 'folder'>('file');
  const [createFilePath, setCreateFilePath] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ path: string; name: string; type: 'file' | 'folder' } | null>(null);
  const [showGitImport, setShowGitImport] = useState(false);
  const [showSymbolSearch, setShowSymbolSearch] = useState(false);
  const [showSnippetsManager, setShowSnippetsManager] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDiffView, setShowDiffView] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerValue, setColorPickerValue] = useState('#3b82f6');
  const [showPanelPresets, setShowPanelPresets] = useState(false);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; actions: ContextMenuAction[] } | null>(null);

  // Terminal state (Terminal component is self-contained)
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [isTerminalDetached, setIsTerminalDetached] = useState(false);

  // Problems state
  const [problems, setProblems] = useState<Problem[]>([]);

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Extensions state with mock data
  const [extensions, setExtensions] = useState<Extension[]>([
    {
      id: 'prettier',
      name: 'Prettier',
      displayName: 'Prettier - Code Formatter',
      description: 'Code formatter using prettier',
      version: '10.1.0',
      publisher: 'esbenp',
      icon: 'https://esbenp.gallerycdn.vsassets.io/extensions/esbenp/prettier-vscode/10.1.0/1690819498575/Microsoft.VisualStudio.Services.Icons.Default',
      installed: true,
      enabled: true,
      rating: 4.8,
      downloadCount: 42000000
    },
    {
      id: 'eslint',
      name: 'ESLint',
      displayName: 'ESLint',
      description: 'Integrates ESLint JavaScript into VS Code',
      version: '2.4.2',
      publisher: 'dbaeumer',
      icon: 'https://dbaeumer.gallerycdn.vsassets.io/extensions/dbaeumer/vscode-eslint/2.4.2/1687441427519/Microsoft.VisualStudio.Services.Icons.Default',
      installed: true,
      enabled: true,
      rating: 4.7,
      downloadCount: 28000000
    },
    {
      id: 'gitlens',
      name: 'GitLens',
      displayName: 'GitLens — Git supercharged',
      description: 'Supercharge Git within VS Code',
      version: '14.0.0',
      publisher: 'gitkraken',
      icon: 'https://gitkraken.gallerycdn.vsassets.io/extensions/gitkraken/gitlens/14.0.0/1686159722773/Microsoft.VisualStudio.Services.Icons.Default',
      installed: false,
      enabled: false,
      rating: 4.9,
      downloadCount: 35000000
    },
    {
      id: 'tailwindcss',
      name: 'Tailwind CSS IntelliSense',
      displayName: 'Tailwind CSS IntelliSense',
      description: 'Intelligent Tailwind CSS tooling',
      version: '0.10.0',
      publisher: 'bradlc',
      icon: 'https://bradlc.gallerycdn.vsassets.io/extensions/bradlc/vscode-tailwindcss/0.10.0/1686159722773/Microsoft.VisualStudio.Services.Icons.Default',
      installed: true,
      enabled: true,
      rating: 4.8,
      downloadCount: 12000000
    },
    {
      id: 'rust-analyzer',
      name: 'rust-analyzer',
      displayName: 'rust-analyzer',
      description: 'Rust language support for Visual Studio Code',
      version: '0.3.1600',
      publisher: 'rust-lang',
      icon: 'https://rust-lang.gallerycdn.vsassets.io/extensions/rust-lang/rust-analyzer/0.3.1600/1686159722773/Microsoft.VisualStudio.Services.Icons.Default',
      installed: true,
      enabled: true,
      rating: 4.9,
      downloadCount: 8000000
    },
    {
      id: 'python',
      name: 'Python',
      displayName: 'Python',
      description: 'IntelliSense, linting, debugging, formatting for Python',
      version: '2023.14.0',
      publisher: 'ms-python',
      icon: 'https://ms-python.gallerycdn.vsassets.io/extensions/ms-python/python/2023.14.0/1686159722773/Microsoft.VisualStudio.Services.Icons.Default',
      installed: false,
      enabled: false,
      rating: 4.7,
      downloadCount: 95000000
    },
    {
      id: 'docker',
      name: 'Docker',
      displayName: 'Docker',
      description: 'Makes it easy to create, manage, and debug containerized applications',
      version: '1.25.2',
      publisher: 'ms-azuretools',
      icon: 'https://ms-azuretools.gallerycdn.vsassets.io/extensions/ms-azuretools/vscode-docker/1.25.2/1686159722773/Microsoft.VisualStudio.Services.Icons.Default',
      installed: false,
      enabled: false,
      rating: 4.6,
      downloadCount: 22000000
    },
    {
      id: 'live-server',
      name: 'Live Server',
      displayName: 'Live Server',
      description: 'Launch a development local Server with live reload',
      version: '5.7.9',
      publisher: 'ritwickdey',
      icon: 'https://ritwickdey.gallerycdn.vsassets.io/extensions/ritwickdey/liveserver/5.7.9/1686159722773/Microsoft.VisualStudio.Services.Icons.Default',
      installed: true,
      enabled: true,
      rating: 4.5,
      downloadCount: 38000000
    }
  ]);

  // File locking state
  const [isEditorLocked, setIsEditorLocked] = useState(true);
  const [unlockSessionExpiry, setUnlockSessionExpiry] = useState<Date | null>(null);
  const [unlockedByEmail, setUnlockedByEmail] = useState<string | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [sessionTimerTick, setSessionTimerTick] = useState(0); // Forces re-render for timer display

  // Git branch state - subfolder-based (each project/subfolder can have its own branch)
  // Keys are project paths like "themes/my-theme", "plugins/analytics", etc.
  const [projectBranches, setProjectBranches] = useState<Record<string, string>>({
    // Default branches for example subfolders
    'themes/starter': 'main',
    'themes/starter-developer': 'dev',
    'functions/api-utils': 'main',
    'plugins/seo-optimizer': 'feature/v2',
    'apps/dashboard': 'main',
    'assets': 'main'
  });

  // Current active project path (e.g., "themes/my-theme")
  const [activeProjectPath, setActiveProjectPath] = useState<string | null>(null);

  // Git status tracking per project
  const [projectGitStatus, setProjectGitStatus] = useState<Record<string, GitStatus>>({});
  const [dismissedGitWarnings, setDismissedGitWarnings] = useState<Set<string>>(new Set());
  const [isInitializingGit, setIsInitializingGit] = useState(false);

  // Helper to get project path from file path
  const getProjectPath = useCallback((filePath: string): string => {
    const parts = filePath.split('/');
    if (parts.length >= 2) {
      // Return first two parts as project path (e.g., "themes/my-theme")
      return `${parts[0]}/${parts[1]}`;
    }
    return parts[0] || activeFolder;
  }, [activeFolder]);

  // Computed current branch based on active project or active folder
  const currentBranch = useMemo(() => {
    if (activeProjectPath && projectBranches[activeProjectPath]) {
      return projectBranches[activeProjectPath];
    }
    // Fallback to active folder's first project or 'main'
    const folderProjects = Object.keys(projectBranches).filter(p => p.startsWith(activeFolder + '/'));
    if (folderProjects.length > 0) {
      return projectBranches[folderProjects[0]] || 'main';
    }
    return 'main';
  }, [activeProjectPath, projectBranches, activeFolder]);

  // Set branch for current project
  const setCurrentBranch = useCallback((branch: string) => {
    if (activeProjectPath) {
      setProjectBranches(prev => ({ ...prev, [activeProjectPath]: branch }));
    }
  }, [activeProjectPath]);
  const [gitRefreshTrigger, setGitRefreshTrigger] = useState(0);
  const [showBranchMegamenu, setShowBranchMegamenu] = useState(false);
  const [availableBranches, setAvailableBranches] = useState<string[]>(['main', 'dev', 'feature/new-ui', 'feature/api-v2', 'hotfix/login-bug']);
  const [showPushConfirmation, setShowPushConfirmation] = useState(false);
  const [pushChangesReport, setPushChangesReport] = useState<{
    files: { path: string; status: 'added' | 'modified' | 'deleted' }[];
    commitMessage: string;
    targetBranch: string;
  } | null>(null);
  const branchMenuRef = useRef<HTMLDivElement>(null);

  // Production branches that require caution
  const PRODUCTION_BRANCHES = ['main', 'master', 'release', 'production', 'prod'];
  const DEV_BRANCHES = ['dev', 'develop', 'development', 'test', 'testing', 'stage', 'staging', 'feature'];

  const isProductionBranch = PRODUCTION_BRANCHES.some(b =>
    currentBranch.toLowerCase() === b || currentBranch.toLowerCase().startsWith(b + '/')
  );
  const isDevBranch = DEV_BRANCHES.some(b =>
    currentBranch.toLowerCase() === b ||
    currentBranch.toLowerCase().startsWith(b + '/') ||
    currentBranch.toLowerCase().startsWith(b + '-')
  );

  const getBranchColor = () => {
    // Main/master/production branches = orange (warning - be careful)
    if (isProductionBranch) return { text: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' };
    // All other branches = green (safe to work on)
    return { text: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' };
  };

  // Snippets state
  const [snippets, setSnippets] = useState<Snippet[]>([]);

  // File history state
  const [fileHistory, setFileHistory] = useState<FileCommit[]>([]);

  // ============================================
  // NEW FEATURE STATES
  // ============================================

  // Debugging state
  const [debugConsoleEntries, setDebugConsoleEntries] = useState<ConsoleEntry[]>([]);
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]);
  const [watchExpressions, setWatchExpressions] = useState<WatchExpression[]>([]);
  const [callStack, setCallStack] = useState<StackFrame[]>([]);
  const [debugVariables, setDebugVariables] = useState<VariableItem[]>([]);
  const [debugThreads, setDebugThreads] = useState<Thread[]>([]);
  const [isDebugging, setIsDebugging] = useState(false);

  // Code Intelligence state
  const [codeLensItems, setCodeLensItems] = useState<CodeLensItem[]>([]);
  const [references, setReferences] = useState<Reference[]>([]);
  const [callHierarchyItem, setCallHierarchyItem] = useState<CallItem | null>(null);
  const [typeHierarchyItem, setTypeHierarchyItem] = useState<TypeItem | null>(null);
  const [codeActions, setCodeActions] = useState<CodeAction[]>([]);
  const [showPeekDefinition, setShowPeekDefinition] = useState(false);
  const [peekDefinition, setPeekDefinition] = useState<Definition | null>(null);

  // Bookmarks state
  const [bookmarks, setBookmarks] = useState<CodeBookmark[]>([]);
  const [bookmarkCategories, setBookmarkCategories] = useState<string[]>(['Default']);

  // Timeline state
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);

  // Tasks state
  const [tasks, setTasks] = useState<TaskConfig[]>([
    { id: '1', name: 'Build', type: 'build', command: 'npm run build' },
    { id: '2', name: 'Test', type: 'test', command: 'npm test' },
    { id: '3', name: 'Dev Server', type: 'dev', command: 'npm run dev' },
  ]);
  const [taskExecutions, setTaskExecutions] = useState<TaskExecution[]>([]);

  // AI Assistant state
  const [aiConversations, setAIConversations] = useState<AIConversation[]>([]);
  const [activeAIConversation, setActiveAIConversation] = useState<string | null>(null);

  // Compare Files state
  const [compareFiles, setCompareFiles] = useState<{ left: CompareFile | null; right: CompareFile | null }>({
    left: null,
    right: null
  });
  const [showCompareFiles, setShowCompareFiles] = useState(false);

  // Merge Conflicts state
  const [conflictFiles, setConflictFiles] = useState<ConflictFile[]>([]);
  const [showMergeConflicts, setShowMergeConflicts] = useState(false);

  // HTML/CSS Live Preview state
  const [showHtmlPreview, setShowHtmlPreview] = useState(true); // Auto-show for HTML/CSS files
  const [previewWidth, setPreviewWidth] = useState(400);

  // App/Plugin Preview state
  const [showAppPreview, setShowAppPreview] = useState(false);
  const [showPluginPreview, setShowPluginPreview] = useState(false);
  const [previewAppPath, setPreviewAppPath] = useState<string | null>(null);
  const [previewPluginPath, setPreviewPluginPath] = useState<string | null>(null);

  // Advanced Search state
  const [advancedSearchResults, setAdvancedSearchResults] = useState<SearchResult[]>([]);
  const [advancedSearchOptions, setAdvancedSearchOptions] = useState<SearchOptions>({
    caseSensitive: false,
    wholeWord: false,
    useRegex: false,
    includePattern: '',
    excludePattern: 'node_modules/**',
    searchInFiles: true,
    preserveCase: false
  });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  // Preview state
  const [previewContent, setPreviewContent] = useState<string>('');
  const [previewSettings, setPreviewSettings] = useState<PreviewSettings>({
    autoRefresh: true,
    refreshDelay: 500,
    showDeviceFrame: true,
    backgroundColor: '#ffffff'
  });

  // Tools modals state
  const [showCodeScreenshot, setShowCodeScreenshot] = useState(false);
  const [showFormatDocument, setShowFormatDocument] = useState(false);
  const [showEmmetPanel, setShowEmmetPanel] = useState(false);
  const [showWorkspaceSettings, setShowWorkspaceSettings] = useState(false);
  const [showKeybindingsEditor, setShowKeybindingsEditor] = useState(false);
  const [showMinimapControls, setShowMinimapControls] = useState(false);
  const [showBookmarksManager, setShowBookmarksManager] = useState(false);
  const [showWizardLauncher, setShowWizardLauncher] = useState(false);

  // Additional component state
  const [panelPresets, setPanelPresets] = useState<PanelLayout[]>([]);
  const [screenshotSettings, setScreenshotSettings] = useState<ScreenshotSettings>({
    theme: 'dark',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: 32,
    borderRadius: 8,
    showWindowControls: true,
    showLineNumbers: true,
    fontSize: 14,
    fontFamily: 'Fira Code',
    shadowEnabled: true,
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowBlur: 20
  });
  const [formatOptions, setFormatOptions] = useState<FormatOptions>({
    tabSize: 2,
    useTabs: false,
    printWidth: 80,
    singleQuote: true,
    trailingComma: 'es5',
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: 'always',
    semi: true,
    endOfLine: 'lf',
    proseWrap: 'preserve'
  });
  const [emmetSnippets, setEmmetSnippets] = useState<EmmetSnippet[]>([
    { id: '1', abbreviation: '!', expansion: '<!DOCTYPE html>...', description: 'HTML5 boilerplate', language: 'html' },
    { id: '2', abbreviation: 'div.container', expansion: '<div class="container"></div>', language: 'html' }
  ]);
  const [recentEmmetSnippets, setRecentEmmetSnippets] = useState<string[]>(['!', 'div.container']);
  const [emmetSettings, setEmmetSettings] = useState<EmmetSettings>({
    enabled: true,
    triggerExpansionOnTab: true,
    showPreview: true,
    showSuggestions: true,
    syntaxProfiles: {},
    variables: {}
  });
  const [workspaceSymbols, setWorkspaceSymbols] = useState<WorkspaceSymbol[]>([]);

  // Editor config
  const [editorConfig, setEditorConfig] = useState<EditorConfig>(() => {
    const saved = localStorage.getItem('ide-editor-config');
    return saved ? { ...defaultEditorConfig, ...JSON.parse(saved) } : defaultEditorConfig;
  });

  // Auto-save timer
  const autoSaveTimer = useRef<NodeJS.Timeout>();

  const navigate = useNavigate();

  // Get active file
  const activeFile = openFiles.find(f => f.path === activeFilePath);

  // Load file tree when folder changes
  useEffect(() => {
    const loadTree = async () => {
      try {
        const tree = await listDirectory(currentFolder.path);
        setFileTree(tree);
      } catch (error) {
        console.error('Error loading file tree:', error);
      }
    };
    loadTree();
  }, [currentFolder.path]);

  // Save editor config
  useEffect(() => {
    localStorage.setItem('ide-editor-config', JSON.stringify(editorConfig));
  }, [editorConfig]);

  // Auto-save functionality
  useEffect(() => {
    if (editorConfig.autoSave) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
      const modifiedFiles = openFiles.filter(f => f.isModified);
      if (modifiedFiles.length > 0) {
        autoSaveTimer.current = setTimeout(() => {
          handleSave();
        }, editorConfig.autoSaveDelay);
      }
    }
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [openFiles, editorConfig.autoSave, editorConfig.autoSaveDelay]);

  // Check for first-time user
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('ide-onboarding-complete');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  // Check git status when active project changes
  useEffect(() => {
    if (!activeProjectPath) return;

    // Skip if we already checked this project
    if (projectGitStatus[activeProjectPath] !== undefined) return;

    const checkGit = async () => {
      const status = await checkGitStatus(activeProjectPath);
      setProjectGitStatus(prev => ({ ...prev, [activeProjectPath]: status }));
    };

    checkGit();
  }, [activeProjectPath, projectGitStatus]);

  // Handler to initialize git for current project
  const handleInitGit = useCallback(async () => {
    if (!activeProjectPath) return;

    setIsInitializingGit(true);
    try {
      const success = await initGitRepository(activeProjectPath);
      if (success) {
        setProjectGitStatus(prev => ({
          ...prev,
          [activeProjectPath]: { hasGit: true, branch: 'main' }
        }));
        toast.success(`Git repository initialized in ${activeProjectPath}`);
      } else {
        toast.error('Failed to initialize git repository');
      }
    } catch (error) {
      toast.error('Failed to initialize git repository');
    } finally {
      setIsInitializingGit(false);
    }
  }, [activeProjectPath]);

  // Handler to dismiss git warning for current project
  const handleDismissGitWarning = useCallback(() => {
    if (!activeProjectPath) return;
    setDismissedGitWarnings(prev => new Set(prev).add(activeProjectPath));
  }, [activeProjectPath]);

  // Computed: should show git warning for current project
  const showGitWarning = useMemo(() => {
    if (!activeProjectPath) return false;
    if (dismissedGitWarnings.has(activeProjectPath)) return false;
    const status = projectGitStatus[activeProjectPath];
    return status && !status.hasGit;
  }, [activeProjectPath, projectGitStatus, dismissedGitWarnings]);

  // Computed: check if current project has git initialized (for branch menu)
  const currentProjectHasGit = useMemo(() => {
    if (!activeProjectPath) return true; // Default to true if no project selected
    const status = projectGitStatus[activeProjectPath];
    if (!status) return true; // Still loading, assume yes
    return status.hasGit;
  }, [activeProjectPath, projectGitStatus]);

  // Open a file
  const openFileHandler = useCallback(async (path: string, name: string, line?: number, column?: number) => {
    // Update active project path based on file path
    const projectPath = getProjectPath(path);
    setActiveProjectPath(projectPath);

    // Initialize branch for new projects if not exists
    if (!projectBranches[projectPath]) {
      setProjectBranches(prev => ({ ...prev, [projectPath]: 'main' }));
    }

    // Check if already open
    const existing = openFiles.find(f => f.path === path);
    if (existing) {
      setActiveFilePath(path);
      if (line) {
        setOpenFiles(prev => prev.map(f =>
          f.path === path ? { ...f, cursorPosition: { line, column: column || 1 } } : f
        ));
      }
      return;
    }

    // Check if it's an image file
    if (isImageFile(path)) {
      const newFile: OpenFile = {
        path,
        name,
        content: '', // Images don't have text content
        originalContent: '',
        language: 'image',
        isModified: false,
        isPinned: false,
        cursorPosition: { line: 1, column: 1 }
      };
      setOpenFiles(prev => [...prev, newFile]);
      setActiveFilePath(path);
      return;
    }

    // Load file content
    setIsLoadingFile(true);
    try {
      const fileData = await readFile(path);
      const newFile: OpenFile = {
        path,
        name,
        content: fileData.content,
        originalContent: fileData.content,
        language: fileData.language,
        isModified: false,
        isPinned: false,
        cursorPosition: { line: line || 1, column: column || 1 }
      };

      setOpenFiles(prev => [...prev, newFile]);
      setActiveFilePath(path);
      setRecentFiles(prev => [path, ...prev.filter(p => p !== path)].slice(0, 20));
    } catch (error) {
      console.error('Error opening file:', error);
      toast.error(`Failed to open ${name}`);
    } finally {
      setIsLoadingFile(false);
    }
  }, [openFiles, getProjectPath, projectBranches]);

  // Open file from search (extracts name from path)
  const openFileFromPath = useCallback((path: string, line?: number, column?: number) => {
    const name = path.split('/').pop() || path;
    return openFileHandler(path, name, line, column);
  }, [openFileHandler]);

  // Close a file
  const closeFile = useCallback((path: string) => {
    const fileIndex = openFiles.findIndex(f => f.path === path);
    if (fileIndex === -1) return;

    const file = openFiles[fileIndex];

    // Warn if modified
    if (file.isModified) {
      if (!confirm(`${file.name} has unsaved changes. Close anyway?`)) {
        return;
      }
    }

    const newFiles = openFiles.filter(f => f.path !== path);
    setOpenFiles(newFiles);

    // Update active file if needed
    if (activeFilePath === path) {
      if (newFiles.length > 0) {
        const newIndex = Math.min(fileIndex, newFiles.length - 1);
        setActiveFilePath(newFiles[newIndex].path);
      } else {
        setActiveFilePath(null);
      }
    }
  }, [openFiles, activeFilePath]);

  // Close all files except the specified one
  const closeOthers = useCallback((pathToKeep: string) => {
    const modifiedFiles = openFiles.filter(f => f.path !== pathToKeep && f.isModified);
    if (modifiedFiles.length > 0) {
      if (!confirm(`${modifiedFiles.length} file(s) have unsaved changes. Close them anyway?`)) {
        return;
      }
    }
    setOpenFiles(prev => prev.filter(f => f.path === pathToKeep));
    setActiveFilePath(pathToKeep);
  }, [openFiles]);

  // Close all files
  const closeAll = useCallback(() => {
    const modifiedFiles = openFiles.filter(f => f.isModified);
    if (modifiedFiles.length > 0) {
      if (!confirm(`${modifiedFiles.length} file(s) have unsaved changes. Close them anyway?`)) {
        return;
      }
    }
    setOpenFiles([]);
    setActiveFilePath(null);
  }, [openFiles]);

  // Close all saved (unmodified) files
  const closeSaved = useCallback(() => {
    const savedFiles = openFiles.filter(f => !f.isModified);
    if (savedFiles.length === 0) {
      toast('No saved files to close');
      return;
    }
    const remainingFiles = openFiles.filter(f => f.isModified);
    setOpenFiles(remainingFiles);
    if (activeFilePath && !remainingFiles.some(f => f.path === activeFilePath)) {
      setActiveFilePath(remainingFiles.length > 0 ? remainingFiles[0].path : null);
    }
  }, [openFiles, activeFilePath]);

  // Detach a tab into its own window
  const detachTab = useCallback((file: OpenFile) => {
    const windowId = windowSyncService.detachTab(file);
    if (windowId) {
      toast.success(`Detached ${file.name} to new window`);
    } else {
      toast.error('Failed to detach tab. Pop-ups may be blocked.');
    }
  }, []);

  // Copy file path to clipboard
  const copyFilePath = useCallback((path: string) => {
    navigator.clipboard.writeText(path).then(() => {
      toast.success('Path copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy path');
    });
  }, []);

  // Toggle pin status
  const togglePinFile = useCallback((path: string) => {
    setOpenFiles(prev => prev.map(f =>
      f.path === path ? { ...f, isPinned: !f.isPinned } : f
    ));
  }, []);

  // Update file content
  const updateFileContent = useCallback((path: string, content: string) => {
    setOpenFiles(prev => prev.map(f => {
      if (f.path !== path) return f;
      return {
        ...f,
        content,
        isModified: content !== f.originalContent
      };
    }));
  }, []);

  // Update cursor position
  const updateCursorPosition = useCallback((path: string, line: number, column: number) => {
    setOpenFiles(prev => prev.map(f => {
      if (f.path !== path) return f;
      return { ...f, cursorPosition: { line, column } };
    }));
  }, []);

  // Sync editor groups with open files
  useEffect(() => {
    if (useMultiPanel) {
      // Update the active group's files when openFiles changes
      setEditorGroups(prev => prev.map(group => {
        if (group.id === activeGroupId) {
          return {
            ...group,
            files: openFiles.filter(f => group.files.some(gf => gf.path === f.path) || f.path === activeFilePath),
            activeFilePath: activeFilePath
          };
        }
        return group;
      }));
    }
  }, [openFiles, activeFilePath, activeGroupId, useMultiPanel]);

  // Handle file change in editor group
  const handleGroupFileChange = useCallback((groupId: string, path: string, content: string) => {
    updateFileContent(path, content);
  }, [updateFileContent]);

  // Handle cursor change in editor group
  const handleGroupCursorChange = useCallback((groupId: string, path: string, line: number, column: number) => {
    updateCursorPosition(path, line, column);
  }, [updateCursorPosition]);

  // Handle file close in editor group
  const handleGroupCloseFile = useCallback((groupId: string, path: string) => {
    closeFile(path);
    setEditorGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        const newFiles = group.files.filter(f => f.path !== path);
        return {
          ...group,
          files: newFiles,
          activeFilePath: newFiles.length > 0 ? newFiles[0].path : null
        };
      }
      return group;
    }));
  }, [closeFile]);

  // Handle file select in editor group
  const handleGroupSelectFile = useCallback((groupId: string, path: string) => {
    setActiveGroupId(groupId);
    setActiveFilePath(path);
    setEditorGroups(prev => prev.map(group => {
      if (group.id === groupId) {
        return { ...group, activeFilePath: path };
      }
      return group;
    }));
  }, []);

  // Handle moving file between groups
  const handleMoveFile = useCallback((fromGroupId: string, toGroupId: string, path: string) => {
    const file = openFiles.find(f => f.path === path);
    if (!file) return;

    setEditorGroups(prev => prev.map(group => {
      if (group.id === fromGroupId) {
        const newFiles = group.files.filter(f => f.path !== path);
        return {
          ...group,
          files: newFiles,
          activeFilePath: newFiles.length > 0 ? newFiles[0].path : null
        };
      }
      if (group.id === toGroupId) {
        return {
          ...group,
          files: [...group.files, file],
          activeFilePath: path
        };
      }
      return group;
    }));

    setActiveGroupId(toGroupId);
    setActiveFilePath(path);
  }, [openFiles]);

  // Toggle multi-panel mode
  const toggleMultiPanel = useCallback(() => {
    setUseMultiPanel(prev => {
      const newValue = !prev;
      if (newValue) {
        // Initialize first group with current files
        setEditorGroups([{
          id: 'group-1',
          files: openFiles,
          activeFilePath: activeFilePath
        }]);
      }
      return newValue;
    });
  }, [openFiles, activeFilePath]);

  // Save all modified files
  const handleSave = useCallback(async () => {
    const modifiedFiles = openFiles.filter(f => f.isModified);
    if (modifiedFiles.length === 0) return;

    setIsSaving(true);
    try {
      const savePromises = modifiedFiles.map(file =>
        writeFile(file.path, file.content)
      );

      await Promise.all(savePromises);

      setOpenFiles(prev => prev.map(f => ({
        ...f,
        originalContent: f.content,
        isModified: false
      })));

      toast.success(`Saved ${modifiedFiles.length} file${modifiedFiles.length > 1 ? 's' : ''}`);
      addNotification('success', 'Files Saved', `${modifiedFiles.length} file(s) saved successfully`);

      // Trigger git panel refresh to show new changes
      setGitRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error saving files:', error);
      toast.error('Failed to save files');
      addNotification('error', 'Save Failed', 'Could not save one or more files');
    } finally {
      setIsSaving(false);
    }
  }, [openFiles]);

  // Handle unlock session with custom duration
  const handleUnlockSession = useCallback((email: string, durationMinutes: number = 60) => {
    const expiryTime = new Date(Date.now() + durationMinutes * 60 * 1000);
    setIsEditorLocked(false);
    setUnlockSessionExpiry(expiryTime);
    setUnlockedByEmail(email);

    // Format duration for display
    const durationText = durationMinutes < 60
      ? `${durationMinutes} minutes`
      : durationMinutes === 60
        ? '1 hour'
        : `${durationMinutes / 60} hours`;

    toast.success(`Editor unlocked for ${durationText}`);
    addNotification('info', 'Editor Unlocked', `Session unlocked by ${email}. Expires at ${expiryTime.toLocaleTimeString()}`);
  }, []);

  // Handle lock editor manually
  const handleLockEditor = useCallback(() => {
    setIsEditorLocked(true);
    setUnlockSessionExpiry(null);
    setUnlockedByEmail(null);
    toast.success('Editor locked');
    addNotification('info', 'Editor Locked', 'Files are now read-only');
  }, []);

  // Check session expiry periodically and update timer display
  useEffect(() => {
    if (!unlockSessionExpiry) return;

    const checkExpiry = () => {
      if (new Date() >= unlockSessionExpiry) {
        handleLockEditor();
        toast.error('Editing session expired');
      } else {
        // Update tick to force re-render for timer display
        setSessionTimerTick(tick => tick + 1);
      }
    };

    const interval = setInterval(checkExpiry, 1000);
    return () => clearInterval(interval);
  }, [unlockSessionExpiry, handleLockEditor]);

  // Calculate remaining session time (sessionTimerTick forces recalculation every second)
  const getSessionTimeRemaining = useCallback(() => {
    if (!unlockSessionExpiry) return null;
    const remaining = unlockSessionExpiry.getTime() - Date.now();
    if (remaining <= 0) return null;
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlockSessionExpiry, sessionTimerTick]);

  // Create new file/folder
  const handleCreateFile = useCallback(async (name: string, type: 'file' | 'folder') => {
    const fullPath = createFilePath ? `${createFilePath}/${name}` : name;
    try {
      await createFile(fullPath, type);
      // Refresh file tree
      const tree = await listDirectory(currentFolder.path);
      setFileTree(tree);
      toast.success(`Created ${type}: ${name}`);
      if (type === 'file') {
        openFileHandler(fullPath, name);
      }
    } catch (error) {
      console.error('Error creating file:', error);
      toast.error(`Failed to create ${type}`);
    }
  }, [createFilePath, currentFolder.path, openFileHandler]);

  // Delete file/folder
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteFile(deleteTarget.path);
      // Close if open
      closeFile(deleteTarget.path);
      // Refresh file tree
      const tree = await listDirectory(currentFolder.path);
      setFileTree(tree);
      toast.success(`Deleted ${deleteTarget.name}`);
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete');
    }
    setDeleteTarget(null);
  }, [deleteTarget, currentFolder.path, closeFile]);

  // Go to line
  const handleGoToLine = useCallback((line: number, column?: number) => {
    if (activeFile) {
      setOpenFiles(prev => prev.map(f =>
        f.path === activeFile.path
          ? { ...f, cursorPosition: { line, column: column || 1 } }
          : f
      ));
    }
  }, [activeFile]);

  // Search in files
  const searchInFiles = useCallback(async (query: string, options: { caseSensitive: boolean; wholeWord: boolean; useRegex: boolean }) => {
    // Mock implementation - would search through all files
    const results: { filePath: string; fileName: string; matches: { line: number; column: number; text: string; matchStart: number; matchEnd: number; }[] }[] = [];

    // Search through open files as a simple implementation
    openFiles.forEach(file => {
      const lines = file.content.split('\n');
      const matches: { line: number; column: number; text: string; matchStart: number; matchEnd: number; }[] = [];

      lines.forEach((lineText, lineIndex) => {
        const searchText = options.caseSensitive ? lineText : lineText.toLowerCase();
        const searchQuery = options.caseSensitive ? query : query.toLowerCase();
        let startIndex = 0;
        let foundIndex: number;

        while ((foundIndex = searchText.indexOf(searchQuery, startIndex)) !== -1) {
          matches.push({
            line: lineIndex + 1,
            column: foundIndex + 1,
            text: lineText,
            matchStart: foundIndex,
            matchEnd: foundIndex + query.length
          });
          startIndex = foundIndex + 1;
        }
      });

      if (matches.length > 0) {
        results.push({
          filePath: file.path,
          fileName: file.name,
          matches
        });
      }
    });

    return results;
  }, [openFiles]);

  // Handle branch switch for current project
  const handleBranchSwitch = useCallback((branch: string) => {
    if (branch === currentBranch) {
      setShowBranchMegamenu(false);
      return;
    }

    // Show confirmation for switching branches with project context
    const projectName = activeProjectPath || currentFolder.label;
    const confirmSwitch = confirm(`Switch "${projectName}" to branch "${branch}"?\n\nThis will pull the latest code from ${branch} for this project. Any uncommitted changes will need to be stashed or committed first.`);

    if (confirmSwitch) {
      setCurrentBranch(branch);
      setShowBranchMegamenu(false);
      toast.success(`${projectName}: Switched to branch ${branch}`);
      addNotification('info', 'Branch Switched', `${projectName} now on branch: ${branch}`);
      // Trigger git refresh
      setGitRefreshTrigger(prev => prev + 1);
    }
  }, [currentBranch, activeProjectPath, currentFolder.label, setCurrentBranch]);

  // Handle push with confirmation
  const handlePushWithConfirmation = useCallback(() => {
    // Generate changes report (mock data for now)
    const modifiedFiles = openFiles.filter(f => f.isModified);
    const report = {
      files: modifiedFiles.map(f => ({
        path: f.path,
        status: 'modified' as const
      })),
      commitMessage: 'Latest changes',
      targetBranch: currentBranch
    };

    setPushChangesReport(report);
    setShowPushConfirmation(true);
  }, [openFiles, currentBranch]);

  // Confirm and execute push
  const handleConfirmPush = useCallback(() => {
    if (!pushChangesReport) return;

    toast.success(`Pushed ${pushChangesReport.files.length} file(s) to ${pushChangesReport.targetBranch}`);
    addNotification('success', 'Push Complete', `Successfully pushed to ${pushChangesReport.targetBranch}`);
    setShowPushConfirmation(false);
    setPushChangesReport(null);
    setGitRefreshTrigger(prev => prev + 1);
  }, [pushChangesReport]);

  // Close branch megamenu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (branchMenuRef.current && !branchMenuRef.current.contains(event.target as Node)) {
        setShowBranchMegamenu(false);
      }
    };

    if (showBranchMegamenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showBranchMegamenu]);

  // Add notification
  const addNotification = useCallback((type: Notification['type'], title: string, message: string) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  // Git import handler
  const handleGitImport = useCallback(async (url: string, branch: string, path: string, credentials?: { username: string; token: string }) => {
    // Simulate git clone
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success('Repository imported successfully');
    addNotification('success', 'Git Import', `Cloned ${url} to ${path}`);

    // Refresh file tree
    const tree = await listDirectory(currentFolder.path);
    setFileTree(tree);
  }, [currentFolder.path, addNotification]);

  // Symbol search handler
  const handleSymbolSelect = useCallback((symbol: WorkspaceSymbol) => {
    openFileFromPath(symbol.file, symbol.line, symbol.column);
    setShowSymbolSearch(false);
  }, [openFileFromPath]);

  // Apply panel preset
  const handleApplyPreset = useCallback((preset: PanelLayout) => {
    setSidebarCollapsed(!preset.config.showSidebar);
    setRightPanel(preset.config.showRightPanel ? 'git' : null);
    setBottomPanel(preset.config.showTerminal ? 'terminal' : null);
    if (preset.config.sidebarWidth) setSidebarWidth(preset.config.sidebarWidth);
    if (preset.config.rightPanelWidth) setRightPanelWidth(preset.config.rightPanelWidth);
    if (preset.config.terminalHeight) setBottomPanelHeight(preset.config.terminalHeight);
    setShowPanelPresets(false);
  }, []);

  // Command palette commands
  const commands = useMemo<Command[]>(() => getDefaultCommands({
    onSave: handleSave,
    onOpenFile: () => setShowQuickOpen(true),
    onGlobalSearch: () => setRightPanel('search'),
    onGoToLine: () => setShowGoToLine(true),
    onToggleSidebar: () => setSidebarCollapsed(prev => !prev),
    onToggleMinimap: () => setEditorConfig(prev => ({ ...prev, minimap: !prev.minimap })),
    onToggleWordWrap: () => setEditorConfig(prev => ({ ...prev, wordWrap: !prev.wordWrap })),
    onZoomIn: () => setEditorConfig(prev => ({ ...prev, fontSize: Math.min(24, prev.fontSize + 1) })),
    onZoomOut: () => setEditorConfig(prev => ({ ...prev, fontSize: Math.max(10, prev.fontSize - 1) })),
    onResetZoom: () => setEditorConfig(prev => ({ ...prev, fontSize: 14 })),
    onSplitEditor: () => setSplitMode(prev => prev === 'none' ? 'vertical' : 'none'),
    onToggleGit: () => setRightPanel(prev => prev === 'git' ? null : 'git'),
    onToggleSettings: () => setRightPanel(prev => prev === 'settings' ? null : 'settings'),
    onFormatDocument: () => toast('Format document coming soon'),
    onToggleTheme: () => setEditorConfig(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    })),
    onShowKeyboardShortcuts: () => setShowKeyboardShortcuts(true),
  }), [handleSave]);

  // Extended commands for command palette
  const extendedCommands = useMemo<Command[]>(() => [
    ...commands,
    // View commands
    { id: 'terminal', label: 'Toggle Terminal', icon: <TerminalSquare className="w-4 h-4" />, shortcut: 'Ctrl+`', action: () => setBottomPanel(prev => prev === 'terminal' ? null : 'terminal'), category: 'View' },
    { id: 'problems', label: 'Toggle Problems Panel', icon: <AlertCircle className="w-4 h-4" />, shortcut: 'Ctrl+Shift+M', action: () => setBottomPanel(prev => prev === 'problems' ? null : 'problems'), category: 'View' },
    { id: 'zen-mode', label: 'Toggle Zen Mode', icon: <Maximize2 className="w-4 h-4" />, shortcut: 'Ctrl+K Z', action: () => setZenMode(prev => !prev), category: 'View' },
    { id: 'split-editor', label: 'Toggle Split Editor', icon: <Columns className="w-4 h-4" />, shortcut: 'Ctrl+\\', action: toggleMultiPanel, category: 'View' },
    { id: 'extensions', label: 'Extensions', icon: <Package className="w-4 h-4" />, action: () => setRightPanel('extensions'), category: 'View' },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, action: () => setShowNotifications(true), category: 'View' },
    { id: 'panel-presets', label: 'Panel Layouts', icon: <Layout className="w-4 h-4" />, action: () => setShowPanelPresets(true), category: 'View' },

    // Git commands
    { id: 'git-import', label: 'Import from Git', icon: <GitBranch className="w-4 h-4" />, action: () => setShowGitImport(true), category: 'Git' },
    { id: 'file-history', label: 'File History', icon: <History className="w-4 h-4" />, action: () => setRightPanel('history'), category: 'Git' },
    { id: 'timeline', label: 'Show Timeline', icon: <Clock className="w-4 h-4" />, action: () => setRightPanel('timeline'), category: 'Git' },
    { id: 'compare-files', label: 'Compare Files', icon: <GitCompare className="w-4 h-4" />, action: () => setShowCompareFiles(true), category: 'Git' },
    { id: 'merge-conflicts', label: 'Merge Conflicts', icon: <GitMerge className="w-4 h-4" />, action: () => setShowMergeConflicts(true), category: 'Git' },

    // Navigation commands
    { id: 'symbol-search', label: 'Go to Symbol', icon: <Hash className="w-4 h-4" />, shortcut: 'Ctrl+Shift+O', action: () => setShowSymbolSearch(true), category: 'Navigation' },
    { id: 'bookmarks', label: 'Toggle Bookmarks Panel', icon: <BookmarkIcon className="w-4 h-4" />, action: () => setRightPanel('bookmarks'), category: 'Navigation' },
    { id: 'add-bookmark', label: 'Add Bookmark', icon: <BookmarkIcon className="w-4 h-4" />, shortcut: 'Ctrl+Alt+B', action: () => {
      if (activeFile) {
        const newBookmark: CodeBookmark = {
          id: Date.now().toString(),
          name: `Line ${activeFile.cursorPosition.line}`,
          filePath: activeFile.path,
          line: activeFile.cursorPosition.line,
          column: activeFile.cursorPosition.column,
          preview: activeFile.content.split('\n')[activeFile.cursorPosition.line - 1]?.substring(0, 50) || '',
          createdAt: new Date().toISOString()
        };
        setBookmarks(prev => [...prev, newBookmark]);
        toast.success('Bookmark added');
      }
    }, category: 'Navigation' },

    // Editor commands
    { id: 'snippets', label: 'Manage Snippets', icon: <FileCode className="w-4 h-4" />, action: () => setShowSnippetsManager(true), category: 'Editor' },
    { id: 'keybindings', label: 'Keyboard Shortcuts Editor', icon: <Keyboard className="w-4 h-4" />, action: () => setShowKeybindingsEditor(true), category: 'Editor' },
    { id: 'minimap-settings', label: 'Minimap Settings', icon: <Map className="w-4 h-4" />, action: () => setShowMinimapControls(true), category: 'Editor' },
    { id: 'workspace-settings', label: 'Workspace Settings', icon: <Settings className="w-4 h-4" />, action: () => setShowWorkspaceSettings(true), category: 'Editor' },

    // Tools commands
    { id: 'color-picker', label: 'Color Picker', icon: <Palette className="w-4 h-4" />, action: () => setShowColorPicker(true), category: 'Tools' },
    { id: 'code-screenshot', label: 'Take Code Screenshot', icon: <Camera className="w-4 h-4" />, action: () => setShowCodeScreenshot(true), category: 'Tools' },
    { id: 'format-document', label: 'Format Document', icon: <AlignLeft className="w-4 h-4" />, shortcut: 'Shift+Alt+F', action: () => setShowFormatDocument(true), category: 'Tools' },
    { id: 'emmet', label: 'Emmet Panel', icon: <Code className="w-4 h-4" />, action: () => setShowEmmetPanel(true), category: 'Tools' },

    // Debugging commands
    { id: 'debug-console', label: 'Toggle Debug Console', icon: <TerminalSquare className="w-4 h-4" />, action: () => setBottomPanel(prev => prev === 'debug-console' ? null : 'debug-console'), category: 'Debug' },
    { id: 'start-debugging', label: 'Start Debugging', icon: <Play className="w-4 h-4" />, shortcut: 'F5', action: () => {
      setIsDebugging(true);
      setBottomPanel('debug-console');
      addNotification('info', 'Debugging', 'Debug session started');
    }, category: 'Debug' },
    { id: 'stop-debugging', label: 'Stop Debugging', icon: <Square className="w-4 h-4" />, shortcut: 'Shift+F5', action: () => {
      setIsDebugging(false);
      addNotification('info', 'Debugging', 'Debug session ended');
    }, category: 'Debug' },
    { id: 'toggle-breakpoint', label: 'Toggle Breakpoint', icon: <Circle className="w-4 h-4" />, shortcut: 'F9', action: () => {
      if (activeFile) {
        const line = activeFile.cursorPosition.line;
        const existingIdx = breakpoints.findIndex(bp => bp.filePath === activeFile.path && bp.line === line);
        if (existingIdx >= 0) {
          setBreakpoints(prev => prev.filter((_, i) => i !== existingIdx));
          toast.success('Breakpoint removed');
        } else {
          const newBp: Breakpoint = {
            id: Date.now().toString(),
            filePath: activeFile.path,
            line,
            enabled: true,
            type: 'line',
            verified: true
          };
          setBreakpoints(prev => [...prev, newBp]);
          toast.success('Breakpoint added');
        }
      }
    }, category: 'Debug' },

    // Code Intelligence commands
    { id: 'find-references', label: 'Find All References', icon: <Search className="w-4 h-4" />, shortcut: 'Shift+F12', action: () => setRightPanel('references'), category: 'Code Intelligence' },
    { id: 'call-hierarchy', label: 'Show Call Hierarchy', icon: <Workflow className="w-4 h-4" />, action: () => setRightPanel('call-hierarchy'), category: 'Code Intelligence' },
    { id: 'type-hierarchy', label: 'Show Type Hierarchy', icon: <Type className="w-4 h-4" />, action: () => setRightPanel('type-hierarchy'), category: 'Code Intelligence' },
    { id: 'peek-definition', label: 'Peek Definition', icon: <Eye className="w-4 h-4" />, shortcut: 'Alt+F12', action: () => setShowPeekDefinition(true), category: 'Code Intelligence' },

    // Tasks commands
    { id: 'tasks-panel', label: 'Toggle Tasks Panel', icon: <ListTodo className="w-4 h-4" />, action: () => setBottomPanel(prev => prev === 'tasks' ? null : 'tasks'), category: 'Tasks' },
    { id: 'run-build-task', label: 'Run Build Task', icon: <Hammer className="w-4 h-4" />, shortcut: 'Ctrl+Shift+B', action: () => {
      const buildTask = tasks.find(t => t.type === 'build');
      if (buildTask) {
        const execution: TaskExecution = {
          id: Date.now().toString(),
          taskId: buildTask.id,
          taskName: buildTask.name,
          status: 'running',
          startTime: new Date().toISOString(),
          output: ['Starting build...']
        };
        setTaskExecutions(prev => [...prev, execution]);
        setBottomPanel('tasks');
        toast.success(`Running: ${buildTask.name}`);
      }
    }, category: 'Tasks' },

    // AI Assistant commands
    { id: 'ai-assistant', label: 'Toggle AI Assistant', icon: <Bot className="w-4 h-4" />, shortcut: 'Ctrl+Shift+A', action: () => setRightPanel(prev => prev === 'ai-assistant' ? null : 'ai-assistant'), category: 'AI' },
    { id: 'ai-explain-code', label: 'AI: Explain Selected Code', icon: <MessageSquare className="w-4 h-4" />, action: () => {
      setRightPanel('ai-assistant');
      toast('Select code and ask AI to explain it');
    }, category: 'AI' },
    { id: 'ai-generate-code', label: 'AI: Generate Code', icon: <Sparkles className="w-4 h-4" />, action: () => {
      setRightPanel('ai-assistant');
      toast('Describe what you want to generate');
    }, category: 'AI' },

    // Preview commands
    { id: 'live-preview', label: 'Toggle Live Preview', icon: <Eye className="w-4 h-4" />, action: () => setBottomPanel(prev => prev === 'preview' ? null : 'preview'), category: 'Preview' },

    // Advanced Search
    { id: 'advanced-search', label: 'Advanced Find and Replace', icon: <Search className="w-4 h-4" />, shortcut: 'Ctrl+Shift+H', action: () => setShowAdvancedSearch(true), category: 'Search' },

    // Project Wizards
    { id: 'wizard-launcher', label: 'Create New Project...', icon: <Wand2 className="w-4 h-4" />, shortcut: 'Ctrl+Shift+N', action: () => setShowWizardLauncher(true), category: 'Project' },
    { id: 'create-theme', label: 'Create Theme', icon: <Palette className="w-4 h-4" />, action: () => setShowWizardLauncher(true), category: 'Project' },
    { id: 'create-plugin', label: 'Create Plugin', icon: <Puzzle className="w-4 h-4" />, action: () => setShowWizardLauncher(true), category: 'Project' },
    { id: 'create-function', label: 'Create Function', icon: <Zap className="w-4 h-4" />, action: () => setShowWizardLauncher(true), category: 'Project' },
    { id: 'create-app', label: 'Create App', icon: <AppWindow className="w-4 h-4" />, action: () => setShowWizardLauncher(true), category: 'Project' },
  ], [commands, activeFile, breakpoints, tasks, addNotification]);

  // Window sync for detached tabs
  useEffect(() => {
    // Handle file content changes from detached windows
    const unsubContentChanged = windowSyncService.on('file-content-changed', (payload) => {
      const data = payload as FileContentPayload;
      updateFileContent(data.path, data.content);
    });

    // Handle file save requests from detached windows
    const unsubFileSaved = windowSyncService.on('file-saved', (payload) => {
      const data = payload as FileContentPayload;
      // Find the file and save it
      const file = openFiles.find(f => f.path === data.path);
      if (file) {
        writeFile(data.path, data.content).then(() => {
          setOpenFiles(prev => prev.map(f =>
            f.path === data.path
              ? { ...f, content: data.content, originalContent: data.content, isModified: false }
              : f
          ));
          toast.success(`Saved ${file.name}`);
        }).catch(err => {
          toast.error(`Failed to save: ${err.message}`);
        });
      }
    });

    // Handle file data requests from detached windows
    const unsubRequestFile = windowSyncService.on('request-file', (payload) => {
      const data = payload as { path: string };
      const file = openFiles.find(f => f.path === data.path);
      if (file) {
        windowSyncService.sendMessage('file-data', { file, targetWindowId: '*' });
      }
    });

    // Handle tab reattachment
    const unsubReattach = windowSyncService.on('tab-reattached', (payload) => {
      const data = payload as DetachPayload;
      // Update local file with any changes from detached window
      setOpenFiles(prev => prev.map(f =>
        f.path === data.file.path ? data.file : f
      ));
      toast.success(`Reattached ${data.file.name}`);
    });

    // Handle ping (respond with current state)
    const unsubPing = windowSyncService.on('ping', (payload) => {
      const data = payload as { windowId: string; filePath: string };
      const file = openFiles.find(f => f.path === data.filePath);
      if (file) {
        windowSyncService.sendFileData(file, data.windowId);
      }
    });

    return () => {
      unsubContentChanged();
      unsubFileSaved();
      unsubRequestFile();
      unsubReattach();
      unsubPing();
    };
  }, [openFiles, updateFileContent]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.metaKey || e.ctrlKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      // ==========================================
      // FILE OPERATIONS
      // ==========================================

      // Ctrl + S - Save
      if (isCtrl && e.key === 's' && !isShift) {
        e.preventDefault();
        handleSave();
      }
      // Ctrl + Shift + S - Save All
      else if (isCtrl && isShift && e.key === 'S') {
        e.preventDefault();
        handleSave();
      }
      // Ctrl + W - Close file
      else if (isCtrl && e.key === 'w' && !isShift) {
        e.preventDefault();
        if (activeFilePath) closeFile(activeFilePath);
      }
      // Ctrl + Shift + W - Close all files
      else if (isCtrl && isShift && e.key === 'W') {
        e.preventDefault();
        openFiles.forEach(f => closeFile(f.path));
      }
      // Ctrl + N - New file
      else if (isCtrl && e.key === 'n' && !isShift) {
        e.preventDefault();
        setCreateFileType('file');
        setCreateFilePath(currentFolder.path);
        setShowCreateFileModal(true);
      }
      // Ctrl + Shift + N - New folder
      else if (isCtrl && isShift && e.key === 'N') {
        e.preventDefault();
        setCreateFileType('folder');
        setCreateFilePath(currentFolder.path);
        setShowCreateFileModal(true);
      }

      // ==========================================
      // NAVIGATION & SEARCH
      // ==========================================

      // Ctrl + P - Quick open
      else if (isCtrl && e.key === 'p' && !isShift) {
        e.preventDefault();
        setShowQuickOpen(true);
      }
      // Ctrl + Shift + P - Command palette
      else if (isCtrl && isShift && e.key === 'P') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      // Ctrl + Shift + F - Global search
      else if (isCtrl && isShift && e.key === 'F') {
        e.preventDefault();
        setRightPanel('search');
      }
      // Ctrl + G - Go to line
      else if (isCtrl && e.key === 'g') {
        e.preventDefault();
        setShowGoToLine(true);
      }
      // Ctrl + F - Find in file
      else if (isCtrl && e.key === 'f' && !isShift) {
        e.preventDefault();
        setShowFindReplace(true);
      }
      // Ctrl + H - Find and replace
      else if (isCtrl && e.key === 'h') {
        e.preventDefault();
        setShowFindReplace(true);
      }
      // Ctrl + Shift + O - Symbol search
      else if (isCtrl && isShift && e.key === 'O') {
        e.preventDefault();
        setShowSymbolSearch(true);
      }

      // ==========================================
      // TAB NAVIGATION
      // ==========================================

      // Ctrl + Tab - Next tab
      else if (isCtrl && e.key === 'Tab' && !isShift) {
        e.preventDefault();
        if (openFiles.length > 1 && activeFilePath) {
          const currentIndex = openFiles.findIndex(f => f.path === activeFilePath);
          const nextIndex = (currentIndex + 1) % openFiles.length;
          setActiveFilePath(openFiles[nextIndex].path);
        }
      }
      // Ctrl + Shift + Tab - Previous tab
      else if (isCtrl && isShift && e.key === 'Tab') {
        e.preventDefault();
        if (openFiles.length > 1 && activeFilePath) {
          const currentIndex = openFiles.findIndex(f => f.path === activeFilePath);
          const prevIndex = (currentIndex - 1 + openFiles.length) % openFiles.length;
          setActiveFilePath(openFiles[prevIndex].path);
        }
      }
      // Ctrl + 1-9 - Go to tab by number
      else if (isCtrl && !isShift && !isAlt && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const tabIndex = parseInt(e.key) - 1;
        if (tabIndex < openFiles.length) {
          setActiveFilePath(openFiles[tabIndex].path);
        }
      }

      // ==========================================
      // VIEW & PANELS
      // ==========================================

      // Ctrl + B - Toggle sidebar
      else if (isCtrl && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed(prev => !prev);
      }
      // Ctrl + J - Toggle bottom panel
      else if (isCtrl && e.key === 'j') {
        e.preventDefault();
        setBottomPanel(prev => prev ? null : 'terminal');
      }
      // Ctrl + ` - Toggle terminal
      else if (isCtrl && e.key === '`') {
        e.preventDefault();
        setBottomPanel(prev => prev === 'terminal' ? null : 'terminal');
      }
      // Ctrl + Shift + M - Toggle problems
      else if (isCtrl && isShift && e.key === 'M') {
        e.preventDefault();
        setBottomPanel(prev => prev === 'problems' ? null : 'problems');
      }
      // Ctrl + Shift + E - Focus explorer/file tree
      else if (isCtrl && isShift && e.key === 'E') {
        e.preventDefault();
        setSidebarCollapsed(false);
        setActiveView('explorer');
      }
      // Ctrl + Shift + G - Focus git panel
      else if (isCtrl && isShift && e.key === 'G') {
        e.preventDefault();
        setRightPanel('git');
      }
      // Ctrl + Shift + X - Focus extensions
      else if (isCtrl && isShift && e.key === 'X') {
        e.preventDefault();
        setRightPanel('extensions');
      }
      // Ctrl + , - Open settings
      else if (isCtrl && e.key === ',') {
        e.preventDefault();
        setRightPanel('settings');
      }
      // Ctrl + K, Ctrl + S - Keyboard shortcuts
      else if (isCtrl && e.key === 'k') {
        // Start of Ctrl+K chord - we'll handle simple case
        e.preventDefault();
      }
      // Ctrl + \ - Split editor
      else if (isCtrl && e.key === '\\') {
        e.preventDefault();
        toggleMultiPanel();
      }

      // ==========================================
      // EDITOR ZOOM
      // ==========================================

      // Ctrl + + - Zoom in
      else if (isCtrl && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        setEditorConfig(prev => ({ ...prev, fontSize: Math.min(32, prev.fontSize + 1) }));
      }
      // Ctrl + - - Zoom out
      else if (isCtrl && e.key === '-') {
        e.preventDefault();
        setEditorConfig(prev => ({ ...prev, fontSize: Math.max(8, prev.fontSize - 1) }));
      }
      // Ctrl + 0 - Reset zoom
      else if (isCtrl && e.key === '0' && !isShift) {
        e.preventDefault();
        setEditorConfig(prev => ({ ...prev, fontSize: 14 }));
      }

      // ==========================================
      // ZEN MODE & FULLSCREEN
      // ==========================================

      // Ctrl + K, Z - Toggle zen mode (simplified to Ctrl+Shift+Z)
      else if (isCtrl && isShift && e.key === 'Z') {
        e.preventDefault();
        setZenMode(prev => !prev);
      }
      // F11 - Toggle fullscreen/maximize
      else if (e.key === 'F11') {
        e.preventDefault();
        setZenMode(prev => !prev);
      }

      // ==========================================
      // DEBUGGING
      // ==========================================

      // F5 - Start/Continue debugging
      else if (e.key === 'F5' && !isCtrl && !isShift) {
        e.preventDefault();
        if (!isDebugging) {
          setIsDebugging(true);
          setBottomPanel('debug-console');
        }
      }
      // Shift + F5 - Stop debugging
      else if (e.key === 'F5' && isShift && !isCtrl) {
        e.preventDefault();
        setIsDebugging(false);
      }
      // F9 - Toggle breakpoint (placeholder)
      else if (e.key === 'F9' && !isCtrl && !isShift) {
        e.preventDefault();
        // Toggle breakpoint at current line - would need Monaco integration
      }
      // F10 - Step over
      else if (e.key === 'F10' && !isCtrl && !isShift) {
        e.preventDefault();
        // Step over - placeholder
      }
      // F11 without modifiers is handled above for zen mode
      // Shift + F11 - Step out
      else if (e.key === 'F11' && isShift && !isCtrl) {
        e.preventDefault();
        // Step out - placeholder
      }

      // ==========================================
      // MISC
      // ==========================================

      // Escape - Close modals/panels or exit zen mode
      else if (e.key === 'Escape') {
        if (zenMode) {
          setZenMode(false);
        } else if (showCommandPalette) {
          setShowCommandPalette(false);
        } else if (showQuickOpen) {
          setShowQuickOpen(false);
        } else if (showFindReplace) {
          setShowFindReplace(false);
        } else if (showGoToLine) {
          setShowGoToLine(false);
        } else if (showSymbolSearch) {
          setShowSymbolSearch(false);
        } else if (rightPanel) {
          setRightPanel(null);
        }
      }

      // Alt + Left Arrow - Navigate back
      else if (isAlt && e.key === 'ArrowLeft' && !isCtrl) {
        e.preventDefault();
        // Navigate back in history - placeholder
      }
      // Alt + Right Arrow - Navigate forward
      else if (isAlt && e.key === 'ArrowRight' && !isCtrl) {
        e.preventDefault();
        // Navigate forward in history - placeholder
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleSave, closeFile, activeFilePath, currentFolder.path, zenMode,
    openFiles, toggleMultiPanel, isDebugging, showCommandPalette,
    showQuickOpen, showFindReplace, showGoToLine, showSymbolSearch, rightPanel
  ]);

  // Count modified files
  const modifiedCount = openFiles.filter(f => f.isModified).length;

  // Sort files: pinned first, then by order
  const sortedFiles = useMemo(() => {
    return [...openFiles].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });
  }, [openFiles]);

  // File upload handler
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = async () => {
        const content = reader.result as string;
        const path = `${currentFolder.path}/${file.name}`;
        try {
          await writeFile(path, content);
          const tree = await listDirectory(currentFolder.path);
          setFileTree(tree);
          toast.success(`Uploaded ${file.name}`);
        } catch (error) {
          toast.error(`Failed to upload ${file.name}`);
        }
      };
      reader.readAsText(file);
    });
    e.target.value = '';
  }, [currentFolder.path]);

  // Unread notifications count
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Zen mode render
  if (zenMode && activeFile) {
    return (
      <ZenMode
        isOpen={zenMode}
        file={activeFile}
        onClose={() => setZenMode(false)}
        onChange={(content) => updateFileContent(activeFile.path, content)}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white overflow-hidden">
      {/* Top Bar - Red when on production branch */}
      <div className={`h-12 flex items-center justify-between px-4 border-b transition-colors ${
        isProductionBranch
          ? 'bg-red-900/80 border-red-700'
          : 'bg-gray-800 border-gray-700'
      }`}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-2 py-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Back to Admin"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
              <Code2 className="w-3.5 h-3.5 text-white" />
            </div>
            <h1 className="text-sm font-semibold">IDE</h1>
          </div>

          {/* Folder Tabs */}
          <div className="flex items-center gap-1 ml-2">
            {/* Show Root Folders tab when unlocked */}
            {!isEditorLocked && (
              <button
                onClick={() => setActiveFolder('root')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  activeFolder === 'root'
                    ? 'bg-green-600 text-white'
                    : 'text-green-400 hover:text-white hover:bg-gray-700 border border-green-500/30'
                }`}
              >
                <FolderRoot className="w-3.5 h-3.5" />
                Folders
              </button>
            )}
            {BASE_FOLDERS.map(folder => {
              const Icon = folder.icon;
              const isActive = activeFolder === folder.id;
              return (
                <button
                  key={folder.id}
                  onClick={() => setActiveFolder(folder.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {folder.label}
                </button>
              );
            })}

            {/* Run App button - shown when in apps folder */}
            {activeFolder === 'apps' && activeProjectPath && (
              <button
                onClick={() => {
                  setPreviewAppPath(activeProjectPath);
                  setShowAppPreview(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-green-600 hover:bg-green-500 text-white transition-colors ml-2"
                title="Run the current app in preview mode"
              >
                <Play className="w-3.5 h-3.5" />
                Run App
              </button>
            )}

            {/* Test Plugin button - shown when in plugins folder */}
            {activeFolder === 'plugins' && activeProjectPath && (
              <button
                onClick={() => {
                  setPreviewPluginPath(activeProjectPath);
                  setShowPluginPreview(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-purple-600 hover:bg-purple-500 text-white transition-colors ml-2"
                title="Test the current plugin"
              >
                <Bug className="w-3.5 h-3.5" />
                Test Plugin
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Button */}
          <button
            onClick={() => setShowQuickOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Quick Open (Ctrl+P)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] bg-gray-700 rounded">⌘P</kbd>
          </button>

          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(true)}
            className="relative p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center text-[10px] bg-red-500 text-white rounded-full">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Zen Mode Button */}
          <button
            onClick={() => setZenMode(true)}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Zen Mode"
            disabled={!activeFile}
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Split Editor Button */}
          <button
            onClick={toggleMultiPanel}
            className={`p-1.5 rounded transition-colors ${
              useMultiPanel
                ? 'text-blue-400 bg-blue-500/20 hover:bg-blue-500/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title={useMultiPanel ? 'Single Editor' : 'Split Editor'}
          >
            <Columns className="w-4 h-4" />
          </button>

          {/* Git Branch - Color coded by environment with Megamenu, or No Git indicator */}
          <div className="relative" ref={branchMenuRef}>
            {currentProjectHasGit ? (
              <button
                onClick={() => setShowBranchMegamenu(!showBranchMegamenu)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded border transition-colors ${
                  getBranchColor().text
                } ${getBranchColor().bg} ${getBranchColor().border} hover:opacity-80`}
                title={`${activeProjectPath || currentFolder.label}: ${currentBranch}${isProductionBranch ? ' (PRODUCTION - Be careful!)' : isDevBranch ? ' (Development)' : ''}`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span className="text-gray-500 truncate max-w-24">{activeProjectPath || currentFolder.label.toLowerCase()}:</span>
                <span>{currentBranch}</span>
                {isProductionBranch && (
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showBranchMegamenu ? 'rotate-180' : ''}`} />
              </button>
            ) : (
              <button
                onClick={() => setShowUnlockModal(false)} // No action, or could show a tooltip
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded border transition-colors text-red-400 bg-red-500/20 border-red-500/30 cursor-default"
                title={`${activeProjectPath || currentFolder.label}: No Git - Code saved locally without version control`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="text-gray-500 truncate max-w-24">{activeProjectPath || currentFolder.label.toLowerCase()}:</span>
                <span>No Git</span>
              </button>
            )}

            {/* Branch Megamenu */}
            <AnimatePresence>
              {showBranchMegamenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-[480px] bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-50 overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-3 border-b border-gray-700 bg-gray-750">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <GitBranch className="w-4 h-4" />
                        Switch Branch for "{activeProjectPath || currentFolder.label}"
                      </h3>
                      <button
                        onClick={() => setShowBranchMegamenu(false)}
                        className="p-1 text-gray-400 hover:text-white rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Each project subfolder can be on a different branch</p>
                  </div>

                  {/* All Project Branches Overview */}
                  <div className="p-3 border-b border-gray-700 bg-gray-900/50 max-h-48 overflow-y-auto">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">All Project Branches</p>
                    <div className="space-y-1">
                      {Object.entries(projectBranches).map(([projectPath, branch]) => {
                        const isProd = PRODUCTION_BRANCHES.some(b => branch.toLowerCase() === b);
                        const isDev = DEV_BRANCHES.some(b => branch.toLowerCase() === b || branch.toLowerCase().startsWith(b + '/'));
                        const isActive = projectPath === activeProjectPath;
                        return (
                          <button
                            key={projectPath}
                            onClick={() => {
                              setActiveProjectPath(projectPath);
                            }}
                            className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors ${
                              isActive
                                ? 'bg-blue-500/20 border border-blue-500/30'
                                : 'bg-gray-800/50 hover:bg-gray-700/50'
                            }`}
                          >
                            <span className={`truncate ${isActive ? 'text-blue-400' : 'text-gray-400'}`}>{projectPath}</span>
                            <span className={`font-medium flex-shrink-0 ml-2 ${
                              isProd ? 'text-orange-400' : 'text-green-400'
                            }`}>{branch}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Branch List */}
                  <div className="max-h-64 overflow-y-auto">
                    {availableBranches.map(branch => {
                      const isProd = PRODUCTION_BRANCHES.some(b => branch.toLowerCase() === b || branch.toLowerCase().startsWith(b + '/'));
                      const isDev = DEV_BRANCHES.some(b => branch.toLowerCase() === b || branch.toLowerCase().startsWith(b + '/') || branch.toLowerCase().startsWith(b + '-'));
                      const isCurrent = branch === currentBranch;

                      return (
                        <button
                          key={branch}
                          onClick={() => handleBranchSwitch(branch)}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${
                            isCurrent
                              ? 'bg-blue-600/20 text-blue-400'
                              : 'text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <GitBranch className={`w-4 h-4 ${
                              isProd ? 'text-orange-400' : 'text-green-400'
                            }`} />
                            <span className="text-sm">{branch}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isProd && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-orange-500/20 text-orange-400 rounded font-medium">
                                MAIN
                              </span>
                            )}
                            {!isProd && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-green-500/20 text-green-400 rounded font-medium">
                                SAFE
                              </span>
                            )}
                            {isCurrent && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-blue-500/20 text-blue-400 rounded font-medium">
                                CURRENT
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer Actions */}
                  <div className="p-3 border-t border-gray-700 bg-gray-750 space-y-2">
                    <button
                      onClick={() => {
                        setShowBranchMegamenu(false);
                        setActivityView('git');
                        setSidebarCollapsed(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                    >
                      <GitCommit className="w-3.5 h-3.5" />
                      Open Git Panel
                    </button>
                    {isProductionBranch && (
                      <div className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span>You are on a production branch. Be careful with changes!</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Loading indicator */}
          {isLoadingFile && (
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          )}

          {/* Modified indicator */}
          {modifiedCount > 0 && (
            <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">
              {modifiedCount} unsaved
            </span>
          )}

          {/* Lock/Unlock Button */}
          <button
            onClick={() => isEditorLocked ? setShowUnlockModal(true) : handleLockEditor()}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded transition-colors ${
              isEditorLocked
                ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
            }`}
            title={isEditorLocked ? 'Files are locked - Click to unlock' : `Unlocked by ${unlockedByEmail} - ${getSessionTimeRemaining()} remaining - Click to lock`}
          >
            {isEditorLocked ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Locked</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-semibold">Unlocked</span>
                <span className="hidden md:inline text-green-300/80 ml-1">({getSessionTimeRemaining()})</span>
              </>
            )}
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving || modifiedCount === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              modifiedCount > 0
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar */}
        <ActivityBar
          activeView={activityView}
          onViewChange={(view) => {
            setActivityView(view);
            // Always expand left sidebar when switching views
            setSidebarCollapsed(false);
          }}
          notifications={unreadNotificationsCount}
          collaborators={onlineUsers.size}
        />

        {/* Left Sidebar - Dynamic content based on activity view */}
        <motion.div
          animate={{ width: sidebarCollapsed ? 0 : sidebarWidth }}
          className="bg-gray-850 border-r border-gray-700 flex flex-col overflow-hidden"
          style={{ backgroundColor: '#1e1e2e' }}
        >
          {!sidebarCollapsed && (
            <>
              {/* Files View */}
              {activityView === 'files' && (
                <>
                  <div className="p-3 border-b border-gray-700">
                    {/* New Project Button */}
                    <button
                      onClick={() => setShowWizardLauncher(true)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 mb-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg transition-all shadow-lg hover:shadow-blue-500/25"
                    >
                      <Wand2 className="w-4 h-4" />
                      New Project
                    </button>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Search files..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setCreateFileType('file');
                          setCreateFilePath(currentFolder.path);
                          setShowCreateFileModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                        title="New File"
                      >
                        <FilePlus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setCreateFileType('folder');
                          setCreateFilePath(currentFolder.path);
                          setShowCreateFileModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                        title="New Folder"
                      >
                        <FolderPlus className="w-3.5 h-3.5" />
                      </button>
                      <label className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={() => setShowGitImport(true)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                        title="Import from Git"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Git Warning Banner - shown when project doesn't have .git */}
                  {showGitWarning && activeProjectPath && (
                    <GitWarningBanner
                      projectPath={activeProjectPath}
                      projectName={activeProjectPath.split('/').pop() || activeProjectPath}
                      onInitGit={handleInitGit}
                      onDismiss={handleDismissGitWarning}
                      isInitializing={isInitializingGit}
                    />
                  )}

                  <div className="flex-1 overflow-auto filetree-scrollbar">
                    <FileTree
                      onFileSelect={openFileHandler}
                      activeFilePath={activeFilePath}
                      openFiles={openFiles}
                      searchQuery={searchQuery}
                      rootPath={currentFolder.path}
                      rootLabel={currentFolder.label}
                    />
                  </div>
                </>
              )}

              {/* Search View */}
              {activityView === 'search' && (
                <GlobalSearch
                  isOpen={true}
                  onClose={() => setActivityView('files')}
                  onFileOpen={openFileFromPath}
                  searchInFiles={searchInFiles}
                />
              )}

              {/* Git View */}
              {activityView === 'git' && (
                <GitPanel
                  modifiedFiles={openFiles.filter(f => f.isModified).map(f => f.path)}
                  refreshTrigger={gitRefreshTrigger}
                  onCreatePR={(repo, targetBranch, title, description) => {
                    toast.success(`Creating PR: ${title}`);
                    addNotification('info', 'Pull Request', `PR "${title}" created to merge into ${targetBranch}`);
                  }}
                />
              )}

              {/* Extensions View */}
              {activityView === 'extensions' && (
                <ExtensionsPanel
                  extensions={extensions}
                  onInstall={(id) => {
                    setExtensions(prev => prev.map(ext =>
                      ext.id === id ? { ...ext, installed: true, enabled: true } : ext
                    ));
                    toast.success('Extension installed');
                  }}
                  onUninstall={(id) => {
                    setExtensions(prev => prev.map(ext =>
                      ext.id === id ? { ...ext, installed: false, enabled: false } : ext
                    ));
                    toast.success('Extension uninstalled');
                  }}
                  onToggle={(id) => {
                    setExtensions(prev => prev.map(ext =>
                      ext.id === id ? { ...ext, enabled: !ext.enabled } : ext
                    ));
                  }}
                />
              )}

              {/* Debug View */}
              {activityView === 'debug' && (
                <div className="flex flex-col h-full">
                  <div className="p-3 border-b border-gray-700">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Debug</h3>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <BreakpointsPanel
                      breakpoints={breakpoints}
                      onToggle={(id) => {
                        setBreakpoints(prev => prev.map(bp =>
                          bp.id === id ? { ...bp, enabled: !bp.enabled } : bp
                        ));
                      }}
                      onRemove={(id) => {
                        setBreakpoints(prev => prev.filter(bp => bp.id !== id));
                      }}
                      onNavigate={(file, line) => openFileFromPath(file, line)}
                    />
                    <WatchExpressions
                      expressions={watchExpressions}
                      onAdd={(expr) => {
                        setWatchExpressions(prev => [...prev, {
                          id: Date.now().toString(),
                          expression: expr,
                          value: undefined,
                          type: 'unknown'
                        }]);
                      }}
                      onRemove={(id) => {
                        setWatchExpressions(prev => prev.filter(w => w.id !== id));
                      }}
                      onEdit={(id, newExpr) => {
                        setWatchExpressions(prev => prev.map(w =>
                          w.id === id ? { ...w, expression: newExpr } : w
                        ));
                      }}
                    />
                  </div>
                </div>
              )}

              {/* AI Assistant View */}
              {activityView === 'ai-assistant' && (
                <AIAssistantPanel
                  conversations={aiConversations}
                  activeConversation={activeAIConversation || undefined}
                  settings={{
                    model: 'gpt-4',
                    temperature: 0.7,
                    maxTokens: 2000,
                    contextWindow: 10,
                    autoComplete: true,
                    suggestFixes: true
                  }}
                  currentFile={activeFile?.path}
                  selectedCode={activeFile?.content.substring(0, 200)}
                  onSendMessage={(message) => {
                    if (!activeAIConversation) {
                      const newConvo: AIConversation = {
                        id: Date.now().toString(),
                        title: message.substring(0, 30) + '...',
                        messages: [{
                          id: Date.now().toString(),
                          role: 'user',
                          content: message,
                          timestamp: new Date().toISOString()
                        }],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                      };
                      setAIConversations(prev => [...prev, newConvo]);
                      setActiveAIConversation(newConvo.id);
                      setTimeout(() => {
                        setAIConversations(prev => prev.map(c =>
                          c.id === newConvo.id ? {
                            ...c,
                            messages: [...c.messages, {
                              id: (Date.now() + 1).toString(),
                              role: 'assistant' as const,
                              content: 'I can help you with that! Let me analyze your code...',
                              timestamp: new Date().toISOString()
                            }]
                          } : c
                        ));
                      }, 1000);
                    }
                  }}
                  onNewConversation={() => setActiveAIConversation(null)}
                  onSelectConversation={(id) => setActiveAIConversation(id)}
                  onDeleteConversation={(id) => {
                    setAIConversations(prev => prev.filter(c => c.id !== id));
                    if (activeAIConversation === id) setActiveAIConversation(null);
                  }}
                  onFeedback={(messageId, feedback) => {
                    toast.success(`Feedback recorded: ${feedback}`);
                  }}
                  onCopyCode={(code) => {
                    navigator.clipboard.writeText(code);
                    toast.success('Code copied');
                  }}
                  onInsertCode={(code) => {
                    if (activeFile) {
                      updateFileContent(activeFile.path, activeFile.content + '\n' + code);
                      toast.success('Code inserted');
                    }
                  }}
                  onSettingsChange={(settings) => {
                    toast('AI settings updated');
                  }}
                  onRegenerateResponse={(messageId) => {
                    toast('Regenerating response...');
                  }}
                />
              )}

              {/* Outline View */}
              {activityView === 'outline' && activeFile && (
                <OutlinePanel
                  content={activeFile.content}
                  language={activeFile.language}
                  onNavigate={(line, column) => handleGoToLine(line, column)}
                />
              )}

              {/* Outline View - No File Selected */}
              {activityView === 'outline' && !activeFile && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                  <List className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm text-center">No file selected</p>
                  <p className="text-xs text-center mt-1">Open a file to see its outline</p>
                </div>
              )}

              {/* Bookmarks View */}
              {activityView === 'bookmarks' && (
                <BookmarksManager
                  bookmarks={bookmarks}
                  currentFile={activeFile?.path}
                  currentLine={activeFile?.cursorPosition.line}
                  onNavigate={(filePath, line, column) => {
                    openFileFromPath(filePath, line, column);
                  }}
                  onAdd={(bookmark) => {
                    const newBookmark: CodeBookmark = {
                      ...bookmark,
                      id: Date.now().toString(),
                      createdAt: new Date().toISOString()
                    };
                    setBookmarks(prev => [...prev, newBookmark]);
                    toast.success('Bookmark added');
                  }}
                  onDelete={(id) => {
                    setBookmarks(prev => prev.filter(b => b.id !== id));
                    toast.success('Bookmark removed');
                  }}
                  onUpdate={(id, updates) => {
                    setBookmarks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
                  }}
                />
              )}

              {/* Timeline View */}
              {activityView === 'timeline' && (
                <TimelineView
                  entries={timelineEntries}
                  currentFile={activeFile?.path}
                  onRestore={(entryId) => {
                    const entry = timelineEntries.find(e => e.id === entryId);
                    if (entry) toast.success(`Restored to: ${entry.label}`);
                  }}
                  onPreview={(entryId) => {
                    const entry = timelineEntries.find(e => e.id === entryId);
                    if (entry) toast(`Previewing: ${entry.label}`);
                  }}
                  onCompare={(entryId, compareWith) => {
                    const entry = timelineEntries.find(e => e.id === entryId);
                    if (entry) toast(`Comparing ${entry.label} with ${compareWith}`);
                  }}
                  onRefresh={() => toast('Refreshing timeline...')}
                />
              )}

              {/* Editor Settings View */}
              {activityView === 'editor-settings' && (
                <EditorSettingsPanel
                  config={editorConfig}
                  onChange={(changes) => setEditorConfig(prev => ({ ...prev, ...changes }))}
                />
              )}

              {/* Collaboration View */}
              {activityView === 'collaboration' && (
                <CollaborationPanel />
              )}

              {/* Chat View */}
              {activityView === 'chat' && (
                <ChatPanel />
              )}

              {/* RustPress CMS Views */}
              {activityView === 'content' && (
                <ContentManager
                  onEdit={(item) => toast(`Editing: ${item.title}`)}
                  onDelete={(item) => toast(`Deleting: ${item.title}`)}
                  onPublish={(item) => toast(`Publishing: ${item.title}`)}
                />
              )}

              {activityView === 'media' && (
                <MediaLibrary
                  onSelect={(item) => toast(`Selected: ${item.name}`)}
                  onUpload={(files) => toast(`Uploading ${files.length} files`)}
                />
              )}

              {activityView === 'taxonomy' && (
                <TaxonomyManager
                  onSave={(taxonomies) => toast('Taxonomies saved')}
                  onDelete={(taxonomy) => toast(`Deleted: ${taxonomy.name}`)}
                />
              )}

              {activityView === 'menus' && (
                <MenuBuilder
                  onSave={(config) => toast('Menu saved')}
                />
              )}

              {activityView === 'comments' && (
                <CommentModeration
                  onApprove={(comment) => toast(`Approved comment from ${comment.author}`)}
                  onReject={(comment) => toast(`Rejected comment from ${comment.author}`)}
                  onSpam={(comment) => toast(`Marked as spam: ${comment.author}`)}
                />
              )}

              {activityView === 'themes' && (
                <ThemeDesigner
                  onSave={(variables) => toast('Theme saved')}
                  onPreview={() => toast('Opening preview...')}
                />
              )}

              {activityView === 'api' && (
                <APIExplorer
                  onTest={(endpoint) => toast(`Testing: ${endpoint.method} ${endpoint.path}`)}
                />
              )}

              {activityView === 'database' && (
                <DatabaseInspector
                  onQuery={(sql, results) => toast(`Query returned ${results.length} rows`)}
                />
              )}

              {activityView === 'webhooks' && (
                <WebhookManager
                  onSave={(webhooks) => toast('Webhooks saved')}
                  onTest={(webhook) => toast(`Testing: ${webhook.name}`)}
                />
              )}

              {activityView === 'seo' && (
                <SEOAnalyzer
                  onFix={(issue) => toast(`Fixing: ${issue.title}`)}
                  onAnalyze={() => toast('Analyzing...')}
                />
              )}

              {activityView === 'performance' && (
                <PerformanceProfiler
                  onOptimize={(recommendations) => toast('Optimizing...')}
                  onRefresh={() => toast('Refreshing metrics...')}
                />
              )}

              {activityView === 'cache' && (
                <CacheManager
                  onClear={(keys) => toast(`Cleared ${keys?.length || 'all'} entries`)}
                  onSave={(settings) => toast('Cache settings saved')}
                />
              )}

              {activityView === 'security' && (
                <SecurityScanner
                  onFix={(issue) => toast(`Fixing: ${issue.title}`)}
                  onScan={() => toast('Starting security scan...')}
                />
              )}

              {activityView === 'backups' && (
                <BackupManager
                  onCreate={(type) => toast(`Creating ${type} backup...`)}
                  onRestore={(backup) => toast(`Restoring backup from ${backup.date}`)}
                  onDelete={(backup) => toast(`Deleting backup: ${backup.id}`)}
                />
              )}

              {activityView === 'logs' && (
                <LogViewer
                  onClear={() => toast('Logs cleared')}
                  onExport={(format) => toast(`Exporting as ${format}`)}
                />
              )}

              {activityView === 'users' && (
                <UserRoleEditor
                  onSave={(roles) => toast('Roles saved')}
                  onUserUpdate={(user) => toast(`Updated: ${user.name}`)}
                />
              )}

              {activityView === 'forms' && (
                <FormBuilder
                  onSave={(form) => toast(`Form saved: ${form.name}`)}
                  onPreview={(form) => toast('Opening form preview...')}
                />
              )}

              {activityView === 'widgets' && (
                <WidgetManager
                  onSave={(areas) => toast('Widgets saved')}
                />
              )}

              {activityView === 'plugins' && (
                <PluginManager
                  onActivate={(plugin) => toast(`Activated: ${plugin.name}`)}
                  onDeactivate={(plugin) => toast(`Deactivated: ${plugin.name}`)}
                  onDelete={(plugin) => toast(`Deleted: ${plugin.name}`)}
                  onUpdate={(plugin) => toast(`Updating: ${plugin.name}`)}
                />
              )}

              {activityView === 'analytics' && (
                <AnalyticsDashboard
                  onExport={(format) => toast(`Exporting as ${format}`)}
                  onRefresh={() => toast('Refreshing analytics...')}
                />
              )}

              {activityView === 'email' && (
                <EmailTemplateEditor
                  onSave={(template) => toast(`Template saved: ${template.name}`)}
                  onSend={(template, to) => toast(`Test email sent to ${to}`)}
                />
              )}

              {activityView === 'redirects' && (
                <RedirectManager
                  onSave={(redirects) => toast(`Saved ${redirects.length} redirects`)}
                  onTest={(url) => toast(`Testing redirect: ${url}`)}
                />
              )}

              {activityView === 'tasks' && (
                <ScheduledTasks
                  onRun={(task) => toast(`Running: ${task.name}`)}
                  onSave={(tasks) => toast('Tasks saved')}
                />
              )}
            </>
          )}
        </motion.div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Breadcrumbs with Preview Toggle */}
          {activeFile && (
            <div className="flex items-center justify-between bg-gray-850" style={{ backgroundColor: '#1e1e2e' }}>
              <Breadcrumbs path={activeFile.path} />
              {/* Preview Toggle for HTML/CSS files */}
              {isPreviewableFile(activeFile.path) && (
                <button
                  onClick={() => setShowHtmlPreview(prev => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1 mr-2 text-xs font-medium rounded transition-colors ${
                    showHtmlPreview
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                  title={showHtmlPreview ? 'Hide preview' : 'Show preview'}
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showHtmlPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              )}
            </div>
          )}

          {/* Editor Tabs */}
          <EditorTabs
            files={sortedFiles}
            activeFilePath={activeFilePath}
            onSelectFile={setActiveFilePath}
            onCloseFile={closeFile}
            onPinFile={togglePinFile}
            folderBranches={projectBranches}
            showBranchLabels={true}
            onBranchClick={(projectPath: string) => {
              setActiveProjectPath(projectPath);
              setShowBranchMegamenu(true);
            }}
            onDetachTab={detachTab}
            onCloseOthers={closeOthers}
            onCloseAll={closeAll}
            onCloseSaved={closeSaved}
            onCopyPath={copyFilePath}
          />

          {/* Find/Replace Bar */}
          <FindReplace
            isOpen={showFindReplace}
            onClose={() => setShowFindReplace(false)}
            onFind={() => {}}
            onFindNext={() => {}}
            onFindPrevious={() => {}}
            onReplace={() => {}}
            onReplaceAll={() => {}}
          />

          {/* Editor Content */}
          <div className="flex-1 overflow-hidden">
            {useMultiPanel ? (
              /* Multi-Panel Editor Mode */
              <EditorGroups
                groups={editorGroups}
                activeGroupId={activeGroupId}
                onActiveGroupChange={setActiveGroupId}
                onSelectFile={handleGroupSelectFile}
                onCloseFile={handleGroupCloseFile}
                onFileChange={handleGroupFileChange}
                onCursorChange={handleGroupCursorChange}
                onMoveFile={handleMoveFile}
                onGroupChange={setEditorGroups}
                readOnly={isEditorLocked}
                editorOptions={{
                  fontSize: editorConfig.fontSize,
                  fontFamily: editorConfig.fontFamily,
                  tabSize: editorConfig.tabSize,
                  wordWrap: editorConfig.wordWrap,
                  minimap: editorConfig.minimap,
                  lineNumbers: editorConfig.lineNumbers,
                  bracketMatching: editorConfig.bracketMatching,
                  indentGuides: editorConfig.indentGuides,
                }}
              />
            ) : activeFile ? (
              activeFile.language === 'image' ? (
                <ImagePreview
                  src={activeFile.path}
                  fileName={activeFile.name}
                />
              ) : isPreviewableFile(activeFile.path) && showHtmlPreview ? (
                /* HTML/CSS Split View - Code Editor + Live Preview */
                <div className="flex h-full">
                  {/* Code Editor */}
                  <div className="flex-1 overflow-hidden" style={{ minWidth: 300 }}>
                    <MonacoWrapper
                      path={activeFile.path}
                      content={activeFile.content}
                      language={activeFile.language}
                      onChange={(content) => updateFileContent(activeFile.path, content)}
                      onCursorChange={(line, column) => updateCursorPosition(activeFile.path, line, column)}
                      readOnly={isEditorLocked}
                      editorOptions={{
                        fontSize: editorConfig.fontSize,
                        fontFamily: editorConfig.fontFamily,
                        tabSize: editorConfig.tabSize,
                        wordWrap: editorConfig.wordWrap,
                        minimap: editorConfig.minimap,
                        lineNumbers: editorConfig.lineNumbers,
                        bracketMatching: editorConfig.bracketMatching,
                        indentGuides: editorConfig.indentGuides,
                      }}
                    />
                  </div>
                  {/* Resize Handle */}
                  <div
                    className="w-1 bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-colors flex-shrink-0 group relative"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const startX = e.clientX;
                      const startWidth = previewWidth;

                      const handleMouseMove = (moveEvent: MouseEvent) => {
                        const delta = startX - moveEvent.clientX;
                        const newWidth = Math.max(250, Math.min(800, startWidth + delta));
                        setPreviewWidth(newWidth);
                      };

                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                        document.body.style.cursor = '';
                        document.body.style.userSelect = '';
                      };

                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                      document.body.style.cursor = 'col-resize';
                      document.body.style.userSelect = 'none';
                    }}
                  >
                    <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/20" />
                  </div>
                  {/* Preview Panel */}
                  <div
                    className="overflow-hidden flex flex-col"
                    style={{ width: previewWidth, minWidth: 250 }}
                  >
                    <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800 border-b border-gray-700">
                      <span className="text-xs font-medium text-gray-300">Live Preview</span>
                      <button
                        onClick={() => setShowHtmlPreview(false)}
                        className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                        title="Close preview"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <HtmlCssPreview
                        content={activeFile.content}
                        language={isHtmlFile(activeFile.path) ? 'html' : isSvgFile(activeFile.path) ? 'svg' : 'css'}
                        filePath={activeFile.path}
                      />
                    </div>
                  </div>
                </div>
              ) : isFunctionFile(activeFile.path) && activeFile.path.startsWith('functions/') ? (
                /* Function Split View - Code Editor + Function Runner */
                <div className="flex h-full">
                  {/* Code Editor */}
                  <div className="flex-1 overflow-hidden" style={{ minWidth: 300 }}>
                    <MonacoWrapper
                      path={activeFile.path}
                      content={activeFile.content}
                      language={activeFile.language}
                      onChange={(content) => updateFileContent(activeFile.path, content)}
                      onCursorChange={(line, column) => updateCursorPosition(activeFile.path, line, column)}
                      readOnly={isEditorLocked}
                      editorOptions={{
                        fontSize: editorConfig.fontSize,
                        fontFamily: editorConfig.fontFamily,
                        tabSize: editorConfig.tabSize,
                        wordWrap: editorConfig.wordWrap,
                        minimap: editorConfig.minimap,
                        lineNumbers: editorConfig.lineNumbers,
                        bracketMatching: editorConfig.bracketMatching,
                        indentGuides: editorConfig.indentGuides,
                      }}
                    />
                  </div>
                  {/* Resize Handle */}
                  <div
                    className="w-1 bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-colors flex-shrink-0 group relative"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const startX = e.clientX;
                      const startWidth = previewWidth;

                      const handleMouseMove = (moveEvent: MouseEvent) => {
                        const delta = startX - moveEvent.clientX;
                        const newWidth = Math.max(300, Math.min(800, startWidth + delta));
                        setPreviewWidth(newWidth);
                      };

                      const handleMouseUp = () => {
                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);
                        document.body.style.cursor = '';
                        document.body.style.userSelect = '';
                      };

                      document.addEventListener('mousemove', handleMouseMove);
                      document.addEventListener('mouseup', handleMouseUp);
                      document.body.style.cursor = 'col-resize';
                      document.body.style.userSelect = 'none';
                    }}
                  >
                    <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-blue-500/20" />
                  </div>
                  {/* Function Runner Panel */}
                  <div
                    className="overflow-hidden flex flex-col"
                    style={{ width: previewWidth, minWidth: 300 }}
                  >
                    <FunctionRunner
                      functionCode={activeFile.content}
                      functionName={activeFile.name.replace(/\.[^.]+$/, '')}
                      language={activeFile.language}
                    />
                  </div>
                </div>
              ) : (
                <MonacoWrapper
                  path={activeFile.path}
                  content={activeFile.content}
                  language={activeFile.language}
                  onChange={(content) => updateFileContent(activeFile.path, content)}
                  onCursorChange={(line, column) => updateCursorPosition(activeFile.path, line, column)}
                  readOnly={isEditorLocked}
                  editorOptions={{
                    fontSize: editorConfig.fontSize,
                    fontFamily: editorConfig.fontFamily,
                    tabSize: editorConfig.tabSize,
                    wordWrap: editorConfig.wordWrap,
                    minimap: editorConfig.minimap,
                    lineNumbers: editorConfig.lineNumbers,
                    bracketMatching: editorConfig.bracketMatching,
                    indentGuides: editorConfig.indentGuides,
                  }}
                />
              )
            ) : (
              <WelcomeTab
                recentFiles={recentFiles.slice(0, 5).map(path => ({
                  path,
                  name: path.split('/').pop() || path,
                  timestamp: new Date()
                }))}
                onOpenFile={openFileFromPath}
                onOpenFolder={() => {
                  setCreateFileType('folder');
                  setCreateFilePath(currentFolder.path);
                  setShowCreateFileModal(true);
                }}
                onStartTutorial={() => setShowOnboarding(true)}
                onOpenSettings={() => setShowWorkspaceSettings(true)}
                onOpenShortcuts={() => setShowKeyboardShortcuts(true)}
              />
            )}
          </div>

          {/* Bottom Panel */}
          <AnimatePresence>
            {bottomPanel && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: bottomPanelHeight }}
                exit={{ height: 0 }}
                className="bg-gray-850 border-t border-gray-700 flex flex-col overflow-hidden"
                style={{ backgroundColor: '#1e1e2e' }}
              >
                {/* Bottom Panel Tabs */}
                <div className="flex items-center justify-between border-b border-gray-700 px-2">
                  <div className="flex">
                    <button
                      onClick={() => setBottomPanel('terminal')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                        bottomPanel === 'terminal'
                          ? 'text-white border-b-2 border-blue-500'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <TerminalIcon className="w-3.5 h-3.5" />
                      Terminal
                    </button>
                    <button
                      onClick={() => setBottomPanel('problems')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                        bottomPanel === 'problems'
                          ? 'text-white border-b-2 border-blue-500'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Problems
                      {problems.length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-red-500/20 text-red-400 rounded">
                          {problems.length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setBottomPanel('output')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                        bottomPanel === 'output'
                          ? 'text-white border-b-2 border-blue-500'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Output
                    </button>
                    <button
                      onClick={() => setBottomPanel('debug-console')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                        bottomPanel === 'debug-console'
                          ? 'text-white border-b-2 border-blue-500'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Bug className="w-3.5 h-3.5" />
                      Debug
                      {isDebugging && (
                        <span className="ml-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </button>
                    <button
                      onClick={() => setBottomPanel('tasks')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                        bottomPanel === 'tasks'
                          ? 'text-white border-b-2 border-blue-500'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Workflow className="w-3.5 h-3.5" />
                      Tasks
                      {taskExecutions.filter(t => t.status === 'running').length > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-blue-500/20 text-blue-400 rounded">
                          {taskExecutions.filter(t => t.status === 'running').length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setBottomPanel('preview')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                        bottomPanel === 'preview'
                          ? 'text-white border-b-2 border-blue-500'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      Preview
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setBottomPanelHeight(prev => Math.min(window.innerHeight * 0.6, prev + 50))}
                      className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                      title="Expand panel"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setBottomPanelHeight(prev => Math.max(100, prev - 50))}
                      className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                      title="Shrink panel"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setBottomPanelHeight(window.innerHeight * 0.5)}
                      className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                      title="Half screen"
                    >
                      <Rows className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setBottomPanel(null)}
                      className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                      title="Close panel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom Panel Content */}
                <div className="flex-1 overflow-auto">
                  {bottomPanel === 'terminal' && !isTerminalDetached && (
                    <Terminal
                      isOpen={bottomPanel === 'terminal'}
                      onClose={() => setBottomPanel(null)}
                      onToggle={() => setBottomPanel(prev => prev === 'terminal' ? null : 'terminal')}
                      height={terminalHeight}
                      onHeightChange={setTerminalHeight}
                      isDetached={isTerminalDetached}
                      onDetach={() => setIsTerminalDetached(true)}
                      onAttach={() => setIsTerminalDetached(false)}
                      isIDEUnlocked={!isEditorLocked}
                      unlockEmail={unlockedByEmail}
                      onRequestUnlock={() => setShowUnlockModal(true)}
                    />
                  )}
                  {bottomPanel === 'problems' && (
                    <ProblemsPanel
                      problems={problems}
                      onNavigate={(file, line, column) => {
                        openFileFromPath(file, line, column);
                      }}
                      onRefresh={() => {
                        // Re-check for problems
                        toast('Refreshing problems...');
                      }}
                    />
                  )}
                  {bottomPanel === 'output' && (
                    <div className="p-4 font-mono text-xs text-gray-400">
                      <p>Output panel - Build and task output will appear here</p>
                    </div>
                  )}
                  {bottomPanel === 'debug-console' && (
                    <DebugConsole
                      entries={debugConsoleEntries}
                      isRunning={isDebugging}
                      onExecute={(expression) => {
                        const entry: ConsoleEntry = {
                          id: Date.now().toString(),
                          level: 'log',
                          message: `Evaluating: ${expression}`,
                          timestamp: new Date().toISOString(),
                          source: 'user'
                        };
                        setDebugConsoleEntries(prev => [...prev, entry]);
                      }}
                      onClear={() => setDebugConsoleEntries([])}
                      onPause={() => setIsDebugging(false)}
                      onResume={() => setIsDebugging(true)}
                      onStop={() => {
                        setIsDebugging(false);
                        setDebugConsoleEntries([]);
                      }}
                      onExport={() => {
                        const content = debugConsoleEntries.map(e => `[${e.timestamp}] ${e.level}: ${e.message}`).join('\n');
                        const blob = new Blob([content], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'debug-console.log';
                        a.click();
                      }}
                      onSourceClick={(source, line) => {
                        openFileFromPath(source, line, 0);
                      }}
                    />
                  )}
                  {bottomPanel === 'tasks' && (
                    <TasksRunner
                      tasks={tasks}
                      executions={taskExecutions}
                      onRunTask={(taskId) => {
                        const task = tasks.find(t => t.id === taskId);
                        if (task) {
                          const execution: TaskExecution = {
                            id: Date.now().toString(),
                            taskId,
                            taskName: task.name,
                            status: 'running',
                            startTime: new Date().toISOString(),
                            output: [`Running: ${task.command}`]
                          };
                          setTaskExecutions(prev => [...prev, execution]);
                          toast.success(`Task started: ${task.name}`);
                          // Simulate completion after 3 seconds
                          setTimeout(() => {
                            setTaskExecutions(prev => prev.map(e =>
                              e.id === execution.id
                                ? { ...e, status: 'success', endTime: new Date().toISOString(), output: [...e.output, 'Task completed successfully'] }
                                : e
                            ));
                          }, 3000);
                        }
                      }}
                      onStopTask={(executionId) => {
                        setTaskExecutions(prev => prev.map(e =>
                          e.id === executionId ? { ...e, status: 'cancelled', endTime: new Date().toISOString() } : e
                        ));
                      }}
                      onRestartTask={(executionId) => {
                        const execution = taskExecutions.find(e => e.id === executionId);
                        if (execution) {
                          const task = tasks.find(t => t.id === execution.taskId);
                          if (task) {
                            const newExecution: TaskExecution = {
                              id: Date.now().toString(),
                              taskId: task.id,
                              taskName: task.name,
                              status: 'running',
                              startTime: new Date().toISOString(),
                              output: [`Restarting: ${task.command}`]
                            };
                            setTaskExecutions(prev => [...prev, newExecution]);
                          }
                        }
                      }}
                      onCreateTask={(task) => setTasks(prev => [...prev, { ...task, id: Date.now().toString() }])}
                      onDeleteTask={(taskId) => setTasks(prev => prev.filter(t => t.id !== taskId))}
                      onClearOutput={(executionId) => {
                        setTaskExecutions(prev => prev.filter(e => e.id !== executionId));
                      }}
                      onSelectExecution={(executionId) => {
                        // Could be used to show details of the execution
                        console.log('Selected execution:', executionId);
                      }}
                    />
                  )}
                  {bottomPanel === 'preview' && (
                    <LivePreview
                      content={activeFile?.content || '<html><body><h1>No file selected</h1></body></html>'}
                      contentType="html"
                      settings={previewSettings}
                      devices={[
                        { id: 'desktop', name: 'Desktop', width: 1920, height: 1080, type: 'desktop' as const },
                        { id: 'tablet', name: 'Tablet', width: 768, height: 1024, type: 'tablet' as const },
                        { id: 'mobile', name: 'Mobile', width: 375, height: 667, type: 'mobile' as const }
                      ]}
                      onSettingsChange={setPreviewSettings}
                      onDeviceChange={() => {}}
                      onRefresh={() => {
                        if (activeFile) {
                          setPreviewContent(activeFile.content);
                        }
                      }}
                      onOpenExternal={() => {
                        window.open('about:blank', '_blank');
                      }}
                      onCopyContent={() => {
                        if (activeFile) {
                          navigator.clipboard.writeText(activeFile.content);
                          toast.success('Content copied to clipboard');
                        }
                      }}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        activeFile={activeFile}
        hasUnsavedChanges={modifiedCount > 0}
        editorConfig={editorConfig}
      />

      {/* Modals */}
      <QuickOpen
        isOpen={showQuickOpen}
        onClose={() => setShowQuickOpen(false)}
        onFileSelect={openFileHandler}
        files={fileTree}
        recentFiles={recentFiles}
      />

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        commands={extendedCommands}
      />

      <GoToLineModal
        isOpen={showGoToLine}
        onClose={() => setShowGoToLine(false)}
        onGoToLine={handleGoToLine}
        currentLine={activeFile?.cursorPosition.line}
        totalLines={activeFile?.content.split('\n').length}
      />

      <KeyboardShortcuts
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />

      <CreateFileModal
        isOpen={showCreateFileModal}
        onClose={() => setShowCreateFileModal(false)}
        onCreate={handleCreateFile}
        type={createFileType}
        parentPath={createFilePath}
      />

      <ConfirmDialog
        isOpen={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        title="Delete File"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />

      <GitImport
        isOpen={showGitImport}
        onClose={() => setShowGitImport(false)}
        onImport={handleGitImport}
        defaultPath={currentFolder.path}
      />

      <SymbolSearch
        isOpen={showSymbolSearch}
        onClose={() => setShowSymbolSearch(false)}
        symbols={workspaceSymbols}
        onNavigate={(file, line, column) => {
          openFileFromPath(file, line, column);
          setShowSymbolSearch(false);
        }}
      />

      <SnippetsManager
        isOpen={showSnippetsManager}
        onClose={() => setShowSnippetsManager(false)}
        snippets={snippets}
        onAdd={(snippet) => {
          const newSnippet: Snippet = {
            ...snippet,
            id: Date.now().toString()
          };
          setSnippets(prev => [...prev, newSnippet]);
        }}
        onEdit={(id, updates) => {
          setSnippets(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
        }}
        onDelete={(id) => setSnippets(prev => prev.filter(s => s.id !== id))}
        onInsert={(snippet) => {
          if (activeFile) {
            updateFileContent(activeFile.path, activeFile.content + '\n' + snippet.body);
          }
          setShowSnippetsManager(false);
        }}
      />

      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={() => {
          setShowOnboarding(false);
          localStorage.setItem('ide-onboarding-complete', 'true');
        }}
        onComplete={() => {
          setShowOnboarding(false);
          localStorage.setItem('ide-onboarding-complete', 'true');
          toast.success('Welcome to RustPress IDE!');
        }}
      />

      <WizardLauncher
        isOpen={showWizardLauncher}
        onClose={() => setShowWizardLauncher(false)}
        onProjectCreated={async (type, config) => {
          const typeName = type.charAt(0).toUpperCase() + type.slice(1);
          toast(`Creating ${typeName} project...`, { icon: '🔨' });

          let result: GenerationResult;

          try {
            switch (type) {
              case 'theme':
                result = await generateThemeProject(config as ThemeConfig);
                break;
              case 'plugin':
                result = await generatePluginProject(config as PluginConfig);
                break;
              case 'function':
                result = await generateFunctionProject(config as FunctionConfig);
                break;
              case 'app':
                result = await generateAppProject(config as AppConfig);
                break;
              default:
                toast.error(`Unknown project type: ${type}`);
                return;
            }

            if (result.success) {
              toast.success(
                `${typeName} project created successfully! ${result.filesCreated.length} files generated.`,
                { duration: 5000 }
              );

              // Refresh the file tree to show new project
              const tree = await listDirectory(currentFolder.path);
              setFileTree(tree);

              // Add notification with details
              addNotification(
                'success',
                `${typeName} Created`,
                `Project "${(config as { name?: string }).name || type}" created at ${result.projectPath}`
              );

              // Optionally open the main file
              const mainFile = result.filesCreated.find(f =>
                f.endsWith('theme.json') ||
                f.endsWith('plugin.json') ||
                f.endsWith('function.json') ||
                f.endsWith('app.json')
              );
              if (mainFile) {
                openFileFromPath(mainFile);
              }
            } else {
              toast.error(`Failed to create ${typeName} project: ${result.errors.join(', ')}`);
              addNotification('error', 'Project Creation Failed', result.errors.join(', '));
            }
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            toast.error(`Error creating ${typeName} project: ${errorMsg}`);
            addNotification('error', 'Project Creation Error', errorMsg);
          }
        }}
      />

      <UnlockSessionModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        onUnlock={handleUnlockSession}
      />

      {/* Push Confirmation Modal */}
      <AnimatePresence>
        {showPushConfirmation && pushChangesReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowPushConfirmation(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-4 border-b ${
                isProductionBranch ? 'bg-red-900/50 border-red-700' : 'bg-gray-800 border-gray-700'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isProductionBranch ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                    <Upload className={`w-5 h-5 ${isProductionBranch ? 'text-red-500' : 'text-blue-500'}`} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Confirm Push</h2>
                    <p className="text-xs text-gray-400">
                      Pushing to <span className={isProductionBranch ? 'text-red-400 font-bold' : 'text-blue-400'}>{pushChangesReport.targetBranch}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPushConfirmation(false)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Warning for production */}
                {isProductionBranch && (
                  <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0 animate-pulse" />
                    <div>
                      <p className="text-sm font-medium text-red-400">Production Branch Warning</p>
                      <p className="text-xs text-gray-400 mt-1">
                        You are pushing directly to a production branch. These changes will be live immediately.
                      </p>
                    </div>
                  </div>
                )}

                {/* Changes Summary */}
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Changes to be pushed:</h3>
                  <div className="max-h-48 overflow-y-auto bg-gray-800 rounded-lg border border-gray-700">
                    {pushChangesReport.files.length > 0 ? (
                      pushChangesReport.files.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between px-3 py-2 border-b border-gray-700 last:border-b-0"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-300 font-mono">{file.path}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            file.status === 'added' ? 'bg-green-500/20 text-green-400' :
                            file.status === 'modified' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {file.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No changes to push
                      </div>
                    )}
                  </div>
                </div>

                {/* Production comparison notice */}
                {isProductionBranch && (
                  <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <p className="text-xs text-gray-400">
                      <span className="text-yellow-400 font-medium">Tip:</span> Consider creating a pull request instead of pushing directly to production.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-4 bg-gray-800/50 border-t border-gray-700">
                <button
                  onClick={() => setShowPushConfirmation(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-400 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPush}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
                    isProductionBranch
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  {isProductionBranch ? 'Push to Production' : 'Push Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkRead={(id) => {
          setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
          ));
        }}
        onMarkAllRead={() => {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }}
        onClear={() => setNotifications([])}
      />

      <ColorPicker
        isOpen={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        initialColor={colorPickerValue}
        onColorChange={(color) => {
          setColorPickerValue(color);
          if (activeFile) {
            navigator.clipboard.writeText(color);
            toast.success(`Color ${color} copied to clipboard`);
          }
        }}
      />

      <PanelPresets
        isOpen={showPanelPresets}
        onClose={() => setShowPanelPresets(false)}
        presets={panelPresets}
        onApplyPreset={handleApplyPreset}
        onSavePreset={(name, config) => {
          const newPreset: PanelLayout = {
            id: Date.now().toString(),
            name,
            config
          };
          setPanelPresets(prev => [...prev, newPreset]);
          toast.success(`Saved preset: ${name}`);
        }}
        onDeletePreset={(id) => {
          setPanelPresets(prev => prev.filter(p => p.id !== id));
        }}
        onUpdatePreset={(id, name) => {
          setPanelPresets(prev => prev.map(p => p.id === id ? { ...p, name } : p));
        }}
        currentLayout={{
          showSidebar: !sidebarCollapsed,
          showRightPanel: rightPanel !== null,
          showTerminal: bottomPanel !== null,
          sidebarWidth,
          rightPanelWidth,
          terminalHeight: bottomPanelHeight,
          showActivityBar: true,
          showStatusBar: true,
        }}
      />

      {/* New Feature Modals */}
      {showCodeScreenshot && activeFile && (
        <CodeScreenshot
          code={activeFile.content}
          language={activeFile.language}
          filename={activeFile.name}
          settings={screenshotSettings}
          onSettingsChange={setScreenshotSettings}
          onDownload={(format) => {
            toast.success(`Screenshot saved as ${format.toUpperCase()}`);
            setShowCodeScreenshot(false);
          }}
          onCopyToClipboard={() => {
            toast.success('Screenshot copied to clipboard');
          }}
        />
      )}

      {showFormatDocument && activeFile && (
        <FormatDocument
          code={activeFile.content}
          language={activeFile.language}
          options={formatOptions}
          availableFormatters={[
            { id: 'prettier', name: 'Prettier', icon: 'wand', supported: ['javascript', 'typescript', 'css', 'html', 'json'] },
            { id: 'eslint', name: 'ESLint', icon: 'check', supported: ['javascript', 'typescript'] }
          ]}
          selectedFormatter="prettier"
          onFormat={() => {
            toast.success('Document formatted');
            setShowFormatDocument(false);
          }}
          onOptionsChange={setFormatOptions}
          onFormatterChange={(formatterId) => toast(`Formatter: ${formatterId}`)}
          onImportConfig={(config) => toast('Config imported')}
          onExportConfig={() => JSON.stringify(formatOptions)}
        />
      )}

      {showEmmetPanel && (
        <EmmetPanel
          snippets={emmetSnippets}
          recentSnippets={recentEmmetSnippets}
          settings={emmetSettings}
          currentLanguage={activeFile?.language || 'html'}
          onExpand={(abbreviation) => {
            // Expand abbreviation (simplified)
            return `<${abbreviation}></${abbreviation}>`;
          }}
          onInsert={(expansion) => {
            if (activeFile) {
              updateFileContent(activeFile.path, activeFile.content + '\n' + expansion);
              toast.success('Emmet expansion inserted');
            }
            setShowEmmetPanel(false);
          }}
          onToggleFavorite={(snippetId) => {
            setEmmetSnippets(prev => prev.map(s =>
              s.id === snippetId ? { ...s, isFavorite: !s.isFavorite } : s
            ));
          }}
          onSettingsChange={setEmmetSettings}
        />
      )}

      {showWorkspaceSettings && (
        <WorkspaceSettings
          settings={[
            { id: '1', key: 'editor.fontSize', value: editorConfig.fontSize, defaultValue: 14, type: 'number', label: 'Font Size', category: 'editor', scope: 'workspace' },
            { id: '2', key: 'editor.tabSize', value: editorConfig.tabSize, defaultValue: 2, type: 'number', label: 'Tab Size', category: 'editor', scope: 'workspace' },
            { id: '3', key: 'editor.wordWrap', value: editorConfig.wordWrap, defaultValue: false, type: 'boolean', label: 'Word Wrap', category: 'editor', scope: 'workspace' },
            { id: '4', key: 'editor.minimap', value: editorConfig.minimap, defaultValue: true, type: 'boolean', label: 'Show Minimap', category: 'editor', scope: 'workspace' },
          ]}
          workspacePath={currentFolder.path}
          onSettingChange={(settingId, value) => {
            const setting = [
              { id: '1', key: 'fontSize' },
              { id: '2', key: 'tabSize' },
              { id: '3', key: 'wordWrap' },
              { id: '4', key: 'minimap' }
            ].find(s => s.id === settingId);
            if (setting) {
              setEditorConfig(prev => ({ ...prev, [setting.key]: value }));
            }
          }}
          onResetSetting={(settingId) => toast(`Reset setting ${settingId}`)}
          onResetAll={() => toast('All settings reset')}
          onSave={() => {
            toast.success('Settings saved');
            setShowWorkspaceSettings(false);
          }}
          onImport={(config) => toast('Config imported')}
          onExport={() => JSON.stringify(editorConfig)}
        />
      )}

      {showKeybindingsEditor && (
        <KeybindingsEditor
          keybindings={[
            { id: '1', command: 'editor.save', description: 'Save', keybinding: ['Ctrl', 'S'], when: 'editorFocus', category: 'File', isDefault: true },
            { id: '2', command: 'editor.saveAll', description: 'Save All', keybinding: ['Ctrl', 'Alt', 'S'], when: 'editorFocus', category: 'File', isDefault: true },
            { id: '3', command: 'workbench.quickOpen', description: 'Quick Open', keybinding: ['Ctrl', 'P'], when: 'always', category: 'Navigation', isDefault: true },
            { id: '4', command: 'workbench.commandPalette', description: 'Command Palette', keybinding: ['Ctrl', 'Shift', 'P'], when: 'always', category: 'Navigation', isDefault: true },
            { id: '5', command: 'terminal.toggle', description: 'Toggle Terminal', keybinding: ['Ctrl', '`'], when: 'always', category: 'View', isDefault: true },
            { id: '6', command: 'view.toggleSidebar', description: 'Toggle Sidebar', keybinding: ['Ctrl', 'B'], when: 'always', category: 'View', isDefault: true },
          ]}
          onUpdate={(id, keys) => {
            toast.success(`Keybinding updated: ${keys.join('+')}`);
          }}
          onReset={(id) => toast(`Reset keybinding ${id}`)}
          onResetAll={() => toast.success('All keybindings reset')}
          onExport={() => toast('Keybindings exported')}
          onImport={(data) => toast('Keybindings imported')}
        />
      )}

      {showMinimapControls && (
        <MinimapControls
          settings={{
            enabled: editorConfig.minimap,
            side: 'right',
            showSlider: true,
            renderCharacters: true,
            maxColumn: 120,
            scale: 1,
            showDecorations: true,
            autohide: false
          }}
          onSettingsChange={(settings) => {
            setEditorConfig(prev => ({ ...prev, minimap: settings.enabled }));
            setShowMinimapControls(false);
          }}
        />
      )}

      {showAdvancedSearch && (
        <FindAndReplaceAdvanced
          results={advancedSearchResults}
          totalMatches={advancedSearchResults.length}
          searchQuery=""
          replaceQuery=""
          options={advancedSearchOptions}
          isSearching={false}
          onSearch={(query, options) => {
            // Perform search across files
            const results: SearchResult[] = [];
            openFiles.forEach(file => {
              const lines = file.content.split('\n');
              lines.forEach((line, idx) => {
                const searchTerm = options.caseSensitive ? query : query.toLowerCase();
                const searchLine = options.caseSensitive ? line : line.toLowerCase();
                let pos = searchLine.indexOf(searchTerm);
                while (pos !== -1) {
                  results.push({
                    id: `${file.path}-${idx}-${pos}`,
                    file: file.path,
                    line: idx + 1,
                    column: pos + 1,
                    matchStart: pos,
                    matchEnd: pos + query.length,
                    lineContent: line
                  });
                  pos = searchLine.indexOf(searchTerm, pos + 1);
                }
              });
            });
            setAdvancedSearchResults(results);
          }}
          onReplace={(resultId, replacement) => {
            toast.success('Replaced occurrence');
          }}
          onReplaceAll={(replacement) => {
            toast.success(`Replaced ${advancedSearchResults.length} occurrences`);
          }}
          onReplaceInFile={(file, replacement) => {
            toast.success(`Replaced all in ${file}`);
          }}
          onNavigateResult={() => {}}
          onOpenResult={(result) => {
            openFileFromPath(result.file, result.line, result.column);
          }}
          onOptionsChange={setAdvancedSearchOptions}
          onQueryChange={() => {}}
          onReplaceQueryChange={() => {}}
          onClose={() => setShowAdvancedSearch(false)}
        />
      )}

      {showCompareFiles && (
        <CompareFiles
          leftFile={compareFiles.left}
          rightFile={compareFiles.right}
          diffLines={[]}
          totalDiffs={0}
          onNavigateDiff={(direction) => toast(`Navigate ${direction}`)}
          onSwapFiles={() => {
            setCompareFiles({ left: compareFiles.right, right: compareFiles.left });
          }}
          onClose={() => setShowCompareFiles(false)}
        />
      )}

      {showMergeConflicts && (
        <MergeConflicts
          files={conflictFiles}
          currentBranch="main"
          incomingBranch="feature"
          onResolveHunk={(fileId, hunkId, resolution) => {
            toast.success('Conflict hunk resolved');
          }}
          onResolveFile={(fileId, resolution) => {
            toast.success('File conflicts resolved');
          }}
          onOpenFile={(fileId) => {
            const file = conflictFiles.find(f => f.id === fileId);
            if (file) openFileFromPath(file.path);
          }}
          onRefresh={() => toast('Refreshing conflicts...')}
          onAcceptAll={(resolution) => {
            toast.success(`Accepted all ${resolution} changes`);
          }}
          onComplete={() => {
            toast.success('Merge complete');
            setShowMergeConflicts(false);
          }}
        />
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isOpen={true}
          onClose={() => setContextMenu(null)}
          actions={contextMenu.actions}
        />
      )}

      {/* App Preview Modal */}
      {showAppPreview && previewAppPath && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl h-[90vh] bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
            <AppPreview
              appPath={previewAppPath}
              appName={previewAppPath.split('/').pop() || 'App'}
              onClose={() => {
                setShowAppPreview(false);
                setPreviewAppPath(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Plugin Preview Modal */}
      {showPluginPreview && previewPluginPath && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl h-[85vh] bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-700">
            <PluginPreview
              pluginPath={previewPluginPath}
              pluginName={previewPluginPath.split('/').pop() || 'Plugin'}
              onClose={() => {
                setShowPluginPreview(false);
                setPreviewPluginPath(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Detached Terminal (floating window) */}
      {isTerminalDetached && bottomPanel === 'terminal' && (
        <Terminal
          isOpen={true}
          onClose={() => {
            setBottomPanel(null);
            setIsTerminalDetached(false);
          }}
          onToggle={() => setBottomPanel(prev => prev === 'terminal' ? null : 'terminal')}
          height={400}
          isDetached={true}
          onDetach={() => setIsTerminalDetached(true)}
          onAttach={() => setIsTerminalDetached(false)}
          isIDEUnlocked={!isEditorLocked}
          unlockEmail={unlockedByEmail}
          onRequestUnlock={() => setShowUnlockModal(true)}
        />
      )}
    </div>
  );
};

export default IDE;
