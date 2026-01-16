// ============================================================================
// FUNCTIONS COMPONENTS - BARREL EXPORT
// ============================================================================

// =============================================================================
// EDITOR COMPONENTS (1-10) - VS Code-style code editor
// =============================================================================
export {
  // Components
  MonacoEditor,
  MultiTabEditor,
  FileExplorer,
  Minimap,
  BreadcrumbNav,
  CommandPalette,
  SearchReplacePanel,
  ProblemsPanel,
  OutputPanel,
  TerminalPanel,
  // Types
  type EditorFile,
  type FileTreeNode,
  type EditorTab,
  type DiagnosticItem,
  type OutputLine,
  type SearchResult,
  type CommandItem,
  type EditorTheme as EditorThemeConfig,
  // Sample Data
  sampleFileTree,
  sampleEditorFile,
  sampleDiagnostics,
  sampleOutputs,
  sampleCommands,
  sampleTerminals,
} from './FunctionsEditor';

// =============================================================================
// GITHUB INTEGRATION COMPONENTS (11-20)
// =============================================================================
export {
  // Components
  GitHubConnector,
  BranchSelector,
  CommitHistory,
  CommitSelector,
  PullRequestPanel,
  GitHubActionsDisplay,
  RepoFileBrowser,
  DiffViewer,
  BranchCompare,
  WebhookConfig,
  // Types
  type GitHubRepository,
  type GitHubBranch,
  type GitHubCommit,
  type CommitFile,
  type GitHubPullRequest,
  type GitHubAction,
  type GitHubJob,
  type GitHubStep,
  type GitHubWebhook,
  type FileDiff,
  type DiffHunk,
  type DiffLine,
  // Sample Data
  sampleRepositories,
  sampleBranches,
  sampleCommits,
  samplePullRequests,
  sampleActions,
  sampleWebhooks,
  sampleDiffs,
} from './FunctionsGitHub';

// =============================================================================
// SANDBOX ENVIRONMENT COMPONENTS (21-30) - With Error Handling & Notifications
// =============================================================================
export {
  // Components
  ErrorNotificationBanner,
  AdminNotificationCenter,
  SandboxContainerManager,
  EnvironmentEditor,
  SandboxConsole,
  TestRunnerPanel,
  ResourceMonitor,
  SnapshotManager,
  NetworkInspector,
  MockDataGenerator,
  SandboxComparison,
  DeployToSandbox,
  // Types
  type SandboxError,
  type AdminNotification,
  type NotificationSettings,
  type SandboxContainer,
  type EnvironmentVariable,
  type ConsoleLog,
  type TestResult,
  type ResourceMetrics,
  type Snapshot,
  type NetworkRequest,
  type MockDataTemplate,
  // Sample Data
  sampleSandboxContainers,
  sampleConsoleLogs,
  sampleTestResults,
  sampleNotifications,
  sampleNotificationSettings,
} from './FunctionsSandbox';

// =============================================================================
// FUNCTION MANAGEMENT COMPONENTS (31-40)
// =============================================================================
export {
  // Components
  FunctionList,
  FunctionDetails,
  TriggerConfig,
  DependenciesManager,
  VersioningPanel,
  MetricsDashboard,
  LogsViewer,
  CronEditor,
  SecretsManager,
  RateLimitingConfig,
  // Types
  type FunctionItem,
  type FunctionTrigger,
  type FunctionDependency,
  type FunctionVersion,
  type FunctionMetrics,
  type FunctionLog,
  type CronSchedule,
  type FunctionSecret,
  type RateLimitConfig,
  // Sample Data
  sampleFunctions,
  sampleDependencies,
  sampleVersions,
  sampleLogs,
  sampleSecrets,
} from './FunctionsManagement';

// =============================================================================
// ADVANCED FEATURES COMPONENTS (41-51)
// =============================================================================
export {
  // AI Code Assistant (41)
  AICodeAssistant,
  type AIMessage,
  type AICodeBlock,
  type AISuggestion,
  type AIContext,
  sampleAIMessages,

  // Code Snippets Library (42)
  SnippetsLibrary,
  type CodeSnippet,
  type SnippetVariable,
  type SnippetCategory,
  sampleSnippets,

  // Collaborative Editing (43)
  CollaborativeEditor,
  type CollaboratorCursor,
  type CollaboratorUser,
  type CollaborativeSession,
  sampleCollaborators,
  sampleCursors,

  // Function Templates Gallery (44)
  TemplatesGallery,
  type FunctionTemplate,
  type TemplateCategory,
  sampleTemplates,

  // API Documentation Generator (45)
  APIDocGenerator,
  type APIEndpoint,
  type APIParameter,
  type APIRequestBody,
  type APIResponse,
  sampleAPIEndpoints,

  // Performance Profiler (46)
  PerformanceProfiler,
  type ProfilerData,
  type ProfilerCall,
  type ProfilerHotspot,
  type ProfilerFlameNode,
  sampleProfilerData,

  // Debugging Breakpoints Panel (47)
  BreakpointsPanel,
  type Breakpoint,
  type DebugVariable,
  type DebugCallStack,
  type DebugSession,
  sampleBreakpoints,

  // Import/Export Manager (48)
  ImportExportManager,
  type ExportConfig,
  type ImportResult,
  type ExportableFunction,

  // Keyboard Shortcuts Manager (49)
  KeyboardShortcutsManager,
  type KeyboardShortcut,
  type ShortcutCategory,
  sampleShortcuts,

  // Theme & Layout Customizer (50)
  ThemeLayoutCustomizer,
  type EditorTheme,
  type ThemeColors,
  type LayoutConfig,
  sampleThemes,

  // Git Provider Sync - GitHub, GitLab, Bitbucket (51)
  GitProviderSync,
  type GitProvider,
  type GitProviderConfig,
  type GitRepository,
  type GitBranch,
  type GitSyncStatus,
  type GitCommitHistory,
  sampleGitProviderConfigs,
  sampleGitRepositories,
  sampleGitBranches,
  sampleGitCommitHistory,
} from './FunctionsAdvanced';
