/**
 * IDE Components - VS Code-like Code Editor
 * Complete feature set with 90+ enhancements
 *
 * Features include:
 * - Core editing (Monaco Editor, file tree, tabs, git integration)
 * - Code intelligence (CodeLens, Peek Definition, References, Call/Type Hierarchy)
 * - Debugging (Console, Breakpoints, Watch Expressions, Call Stack, Variables)
 * - Editor enhancements (Linked Editing, Bracket Colorizer, Indent Guides, Whitespace)
 * - Code formatting (Prettier integration, Emmet, Code Screenshots)
 * - Version control (Compare Files, Merge Conflicts, Timeline View)
 * - Search & navigation (Advanced Find/Replace, Bookmarks, Symbol Search)
 * - Tasks & automation (Tasks Runner, Live Preview)
 * - AI assistance (AI-powered coding assistant)
 */

// ============================================
// CORE COMPONENTS
// ============================================
export { IDE } from './IDE';
export { FileTree } from './FileTree';
export { EditorTabs } from './EditorTabs';
export { MonacoWrapper } from './MonacoWrapper';
export { GitPanel } from './GitPanel';
export { SettingsPanel } from './SettingsPanel';
export { StatusBar } from './StatusBar';

// ============================================
// FILE OPERATIONS
// ============================================
export { ContextMenu, getFileActions, getFolderActions } from './ContextMenu';
export { CreateFileModal } from './CreateFileModal';
export { ConfirmDialog } from './ConfirmDialog';

// ============================================
// SEARCH & NAVIGATION
// ============================================
export { GlobalSearch } from './GlobalSearch';
export { QuickOpen } from './QuickOpen';
export { CommandPalette, getDefaultCommands } from './CommandPalette';
export { GoToLineModal } from './GoToLineModal';
export { FindReplace } from './FindReplace';
export { Breadcrumbs } from './Breadcrumbs';
export { SymbolSearch } from './SymbolSearch';

// ============================================
// EDITOR FEATURES
// ============================================
export { EditorSettings, defaultEditorConfig } from './EditorSettings';
export { KeyboardShortcuts } from './KeyboardShortcuts';
export { SplitEditor } from './SplitEditor';
export { DiffView } from './DiffView';
export { ZenMode } from './ZenMode';
export { ColorPicker } from './ColorPicker';
export { ImagePreview } from './ImagePreview';

// ============================================
// PANELS & UI
// ============================================
export { Terminal } from './Terminal';
export { OutlinePanel } from './OutlinePanel';
export { ProblemsPanel } from './ProblemsPanel';
export { ActivityBar } from './ActivityBar';
export { NotificationsPanel, NotificationsContainer, NotificationToast } from './NotificationsPanel';
export { PanelPresets } from './PanelPresets';

// ============================================
// GIT & VERSION CONTROL
// ============================================
export { GitImport } from './GitImport';
export { FileHistory } from './FileHistory';

// ============================================
// EXTENSIONS & SNIPPETS
// ============================================
export { ExtensionsPanel } from './ExtensionsPanel';
export { SnippetsManager } from './SnippetsManager';

// ============================================
// ONBOARDING & WELCOME
// ============================================
export { WelcomeTab } from './WelcomeTab';
export { OnboardingWizard } from './OnboardingWizard';

// ============================================
// TYPES
// ============================================
export type { IDEProps, OpenFile } from './IDE';
export type { ContextMenuAction } from './ContextMenu';
export type { Command } from './CommandPalette';
export type { EditorConfig } from './EditorSettings';
export type { Snippet } from './SnippetsManager';
export type { Extension } from './ExtensionsPanel';
export type { Problem } from './ProblemsPanel';
export type { Notification } from './NotificationsPanel';
export type { WorkspaceSymbol } from './SymbolSearch';
export type { FileCommit } from './FileHistory';
export type { PanelLayout } from './PanelPresets';
export type { ActivityView } from './ActivityBar';

// ============================================
// BOOKMARKS & NAVIGATION (NEW)
// ============================================
export { default as BookmarksManager } from './BookmarksManager';
export type { CodeBookmark } from './BookmarksManager';

// ============================================
// MINIMAP & DISPLAY (NEW)
// ============================================
export { default as MinimapControls } from './MinimapControls';
export type { MinimapSettings } from './MinimapControls';

// ============================================
// TIMELINE & HISTORY (NEW)
// ============================================
export { default as TimelineView } from './TimelineView';
export type { TimelineEntry } from './TimelineView';

// ============================================
// KEYBINDINGS (NEW)
// ============================================
export { default as KeybindingsEditor } from './KeybindingsEditor';
export type { Keybinding } from './KeybindingsEditor';

// ============================================
// DEBUGGING (NEW)
// ============================================
export { default as DebugConsole } from './DebugConsole';
export { default as BreakpointsPanel } from './BreakpointsPanel';
export { default as WatchExpressions } from './WatchExpressions';
export { default as CallStackPanel } from './CallStackPanel';
export { default as VariablesPanel } from './VariablesPanel';
export type { ConsoleEntry } from './DebugConsole';
export type { Breakpoint, BreakpointType } from './BreakpointsPanel';
export type { WatchExpression } from './WatchExpressions';
export type { StackFrame, Thread } from './CallStackPanel';
export type { VariableItem, VariableScope } from './VariablesPanel';

// ============================================
// CODE INTELLIGENCE (NEW)
// ============================================
export { CodeLensPanel as CodeLens, CodeLensDecoration } from './CodeLens';
export { default as PeekDefinition } from './PeekDefinition';
export { default as ReferencesPanel } from './ReferencesPanel';
export { default as CallHierarchy } from './CallHierarchy';
export { default as TypeHierarchy } from './TypeHierarchy';
export { default as CodeActionsPanel } from './CodeActionsPanel';
export type { CodeLensItem, CodeLensSettings } from './CodeLens';
export type { Definition } from './PeekDefinition';
export type { Reference, ReferenceGroup } from './ReferencesPanel';
export type { CallItem } from './CallHierarchy';
export type { TypeItem } from './TypeHierarchy';
export type { CodeAction, CodeActionKind } from './CodeActionsPanel';

// ============================================
// EDITOR ENHANCEMENTS (NEW)
// ============================================
export { default as LinkedEditing } from './LinkedEditing';
export { default as BracketColorizer } from './BracketColorizer';
export { default as IndentGuides } from './IndentGuides';
export { default as WhitespaceRenderer } from './WhitespaceRenderer';
export type { LinkedEditGroup } from './LinkedEditing';
export type { BracketColorizerSettings } from './BracketColorizer';
export type { IndentGuidesSettings } from './IndentGuides';
export type { WhitespaceSettings } from './WhitespaceRenderer';

// ============================================
// CODE FORMATTING & TOOLS (NEW)
// ============================================
export { default as CodeScreenshot } from './CodeScreenshot';
export { default as FormatDocument } from './FormatDocument';
export { default as EmmetPanel } from './EmmetPanel';
export type { ScreenshotSettings } from './CodeScreenshot';
export type { FormatOptions } from './FormatDocument';
export type { EmmetSnippet, EmmetSettings } from './EmmetPanel';

// ============================================
// WORKSPACE & SETTINGS (NEW)
// ============================================
export { default as WorkspaceSettings } from './WorkspaceSettings';
export type { WorkspaceSetting } from './WorkspaceSettings';

// ============================================
// FILE COMPARISON (NEW)
// ============================================
export { default as CompareFiles } from './CompareFiles';
export { default as MergeConflicts } from './MergeConflicts';
export type { DiffLine, CompareFile } from './CompareFiles';
export type { ConflictHunk, ConflictFile } from './MergeConflicts';

// ============================================
// ADVANCED SEARCH (NEW)
// ============================================
export { default as FindAndReplaceAdvanced } from './FindAndReplaceAdvanced';
export type { SearchResult, SearchOptions } from './FindAndReplaceAdvanced';

// ============================================
// TASKS & AUTOMATION (NEW)
// ============================================
export { default as TasksRunner } from './TasksRunner';
export type { TaskConfig, TaskExecution } from './TasksRunner';

// ============================================
// PREVIEW & OUTPUT (NEW)
// ============================================
export { default as LivePreview } from './LivePreview';
export type { PreviewSettings, DevicePreset } from './LivePreview';

// ============================================
// AI ASSISTANCE (NEW)
// ============================================
export { default as AIAssistantPanel } from './AIAssistantPanel';
export type { AIMessage, AIConversation, AISettings } from './AIAssistantPanel';
