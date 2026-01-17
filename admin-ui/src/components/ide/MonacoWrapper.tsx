/**
 * MonacoWrapper - Monaco Editor integration with VS Code features
 * Includes SVG split view with live preview
 */

import React, { useRef, useCallback, useState, useMemo, useEffect } from 'react';
import Editor, { OnMount, BeforeMount, Monaco, loader } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { Eye, EyeOff, Columns, Maximize2, Minimize2, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { useCollaborationStore } from '../../store/collaborationStore';
import { useRemoteCursors } from './collaboration/RemoteCursor';
import { useRemoteSelections } from './collaboration/RemoteSelection';

// Configure Monaco loader to use jsDelivr CDN with specific version for reliability
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs'
  }
});

// ============================================
// TYPES
// ============================================

interface EditorOptions {
  fontSize?: number;
  fontFamily?: string;
  tabSize?: number;
  wordWrap?: boolean;
  minimap?: boolean;
  lineNumbers?: boolean;
  bracketMatching?: boolean;
  indentGuides?: boolean;
}

interface MonacoWrapperProps {
  path: string;
  content: string;
  language: string;
  onChange: (content: string) => void;
  onCursorChange?: (line: number, column: number) => void;
  onSave?: () => void;
  onGoToLine?: () => void;
  onFindReplace?: () => void;
  editorOptions?: EditorOptions;
  readOnly?: boolean;
}

// ============================================
// THEME DEFINITION
// ============================================

const defineTheme = (monaco: Monaco) => {
  monaco.editor.defineTheme('rustpress-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'keyword', foreground: 'C586C0' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'tag', foreground: '569CD6' },
      { token: 'attribute.name', foreground: '9CDCFE' },
      { token: 'attribute.value', foreground: 'CE9178' },
      { token: 'delimiter', foreground: '808080' },
      { token: 'type', foreground: '4EC9B0' },
      { token: 'variable', foreground: '9CDCFE' },
      { token: 'function', foreground: 'DCDCAA' },
    ],
    colors: {
      'editor.background': '#1e1e2e',
      'editor.foreground': '#d4d4d4',
      'editor.lineHighlightBackground': '#2a2a3e',
      'editor.selectionBackground': '#264f78',
      'editorCursor.foreground': '#aeafad',
      'editorWhitespace.foreground': '#3b3b3b',
      'editorIndentGuide.background': '#404040',
      'editorIndentGuide.activeBackground': '#707070',
      'editor.selectionHighlightBackground': '#add6ff26',
      'editorLineNumber.foreground': '#5a5a5a',
      'editorLineNumber.activeForeground': '#c6c6c6',
      'editorGutter.background': '#1e1e2e',
      'minimap.background': '#1e1e2e',
    }
  });
};

// ============================================
// JINJA2/TEMPLATE LANGUAGE SUPPORT
// ============================================

const registerJinja2Support = (monaco: Monaco) => {
  // Register a custom language for HTML with Jinja2
  monaco.languages.register({ id: 'html-jinja' });

  // Extend HTML tokenizer with Jinja2 patterns
  monaco.languages.setMonarchTokensProvider('html-jinja', {
    defaultToken: '',
    tokenPostfix: '.html',

    // Jinja2 delimiters
    jinjaStatement: /\{%.*?%\}/,
    jinjaExpression: /\{\{.*?\}\}/,
    jinjaComment: /\{#.*?#\}/,

    tokenizer: {
      root: [
        // Jinja2 comment
        [/\{#/, 'comment.jinja', '@jinjaComment'],
        // Jinja2 statement
        [/\{%/, 'keyword.jinja', '@jinjaStatement'],
        // Jinja2 expression
        [/\{\{/, 'variable.jinja', '@jinjaExpression'],
        // HTML
        [/<!DOCTYPE/, 'metatag', '@doctype'],
        [/<!--/, 'comment', '@comment'],
        [/(<)((?:[\w\-]+:)?[\w\-]+)(\s*)(\/>)/, ['delimiter', 'tag', '', 'delimiter']],
        [/(<)(script)/, ['delimiter', { token: 'tag', next: '@script' }]],
        [/(<)(style)/, ['delimiter', { token: 'tag', next: '@style' }]],
        [/(<)((?:[\w\-]+:)?[\w\-]+)/, ['delimiter', { token: 'tag', next: '@otherTag' }]],
        [/(<\/)((?:[\w\-]+:)?[\w\-]+)/, ['delimiter', { token: 'tag', next: '@otherTag' }]],
        [/</, 'delimiter'],
        [/[^<{]+/, ''],
      ],

      jinjaComment: [
        [/#\}/, 'comment.jinja', '@pop'],
        [/./, 'comment.jinja'],
      ],

      jinjaStatement: [
        [/%\}/, 'keyword.jinja', '@pop'],
        [/\b(if|else|elif|endif|for|endfor|block|endblock|extends|include|macro|endmacro|call|endcall|filter|endfilter|set|raw|endraw|with|endwith|autoescape|endautoescape)\b/, 'keyword.jinja'],
        [/\b(and|or|not|in|is)\b/, 'keyword.jinja'],
        [/"[^"]*"/, 'string.jinja'],
        [/'[^']*'/, 'string.jinja'],
        [/\d+/, 'number.jinja'],
        [/\w+/, 'variable.jinja'],
        [/./, 'keyword.jinja'],
      ],

      jinjaExpression: [
        [/\}\}/, 'variable.jinja', '@pop'],
        [/\|/, 'operator.jinja'],
        [/"[^"]*"/, 'string.jinja'],
        [/'[^']*'/, 'string.jinja'],
        [/\d+/, 'number.jinja'],
        [/\w+/, 'variable.jinja'],
        [/./, 'variable.jinja'],
      ],

      doctype: [
        [/[^>]+/, 'metatag.content'],
        [/>/, 'metatag', '@pop'],
      ],

      comment: [
        [/-->/, 'comment', '@pop'],
        [/[^-]+/, 'comment.content'],
        [/./, 'comment.content'],
      ],

      otherTag: [
        [/\/?>/, 'delimiter', '@pop'],
        [/"([^"]*)"/, 'attribute.value'],
        [/'([^']*)'/, 'attribute.value'],
        [/[\w\-]+/, 'attribute.name'],
        [/=/, 'delimiter'],
        [/[ \t\r\n]+/, ''],
      ],

      script: [
        [/<\/script\s*>/, { token: '@rematch', next: '@pop' }],
        [/./, { token: '@rematch', next: '@scriptWithCustomType' }],
      ],

      scriptWithCustomType: [
        [/<\/script\s*>/, { token: 'delimiter', next: '@popall' }],
        [/./, 'source.js'],
      ],

      style: [
        [/<\/style\s*>/, { token: '@rematch', next: '@pop' }],
        [/./, { token: '@rematch', next: '@styleWithCustomType' }],
      ],

      styleWithCustomType: [
        [/<\/style\s*>/, { token: 'delimiter', next: '@popall' }],
        [/./, 'source.css'],
      ],
    },
  });
};

// ============================================
// SVG PREVIEW COMPONENT
// ============================================

interface SvgPreviewProps {
  content: string;
  zoom: number;
  showGrid: boolean;
}

const SvgPreview: React.FC<SvgPreviewProps> = ({ content, zoom, showGrid }) => {
  // Sanitize SVG content to prevent XSS
  const sanitizedSvg = useMemo(() => {
    // Remove any script tags and event handlers
    let svg = content
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '');
    return svg;
  }, [content]);

  const isValidSvg = sanitizedSvg.trim().startsWith('<svg') || sanitizedSvg.trim().startsWith('<?xml');

  return (
    <div
      className={`w-full h-full flex items-center justify-center overflow-auto p-4 ${
        showGrid ? 'bg-[url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'grid\' width=\'20\' height=\'20\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 20 0 L 0 0 0 20\' fill=\'none\' stroke=\'%233f3f46\' stroke-width=\'0.5\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'%2318181b\'/%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23grid)\'/%3E%3C/svg%3E")]' : 'bg-zinc-900'
      }`}
    >
      {isValidSvg ? (
        <div
          className="svg-preview-container transition-transform"
          style={{ transform: `scale(${zoom})` }}
          dangerouslySetInnerHTML={{ __html: sanitizedSvg }}
        />
      ) : (
        <div className="text-center text-gray-500">
          <p className="text-sm">Invalid SVG content</p>
          <p className="text-xs mt-1">Start your SVG with &lt;svg&gt; tag</p>
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const MonacoWrapper: React.FC<MonacoWrapperProps> = ({
  path,
  content,
  language,
  onChange,
  onCursorChange,
  onSave,
  onGoToLine,
  onFindReplace,
  editorOptions = {},
  readOnly = false
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // Collaboration state
  const {
    fileCollaborators,
    remoteCursors,
    remoteSelections,
    moveCursor,
    updateSelection,
    openFile,
    closeFile,
  } = useCollaborationStore();

  // Get collaborators for this file
  const collaborators = fileCollaborators.get(path) || [];
  const cursors = remoteCursors.get(path) || [];
  const selections = remoteSelections.get(path) || [];

  // Use remote cursor and selection hooks
  useRemoteCursors(editorRef.current, monacoRef.current, path, cursors);
  useRemoteSelections(editorRef.current, monacoRef.current, path, selections);

  // Track file open/close for collaboration
  useEffect(() => {
    openFile(path);
    return () => {
      closeFile(path);
    };
  }, [path, openFile, closeFile]);

  // SVG preview state
  const isSvgFile = path.toLowerCase().endsWith('.svg');
  const [showPreview, setShowPreview] = useState(isSvgFile);
  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);

  // Before mount - set up theme and languages
  const handleBeforeMount: BeforeMount = (monaco) => {
    monacoRef.current = monaco;
    defineTheme(monaco);
    registerJinja2Support(monaco);
  };

  // On mount - configure editor
  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Focus editor
    editor.focus();

    // Listen for cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      if (onCursorChange) {
        onCursorChange(e.position.lineNumber, e.position.column);
      }
      // Send cursor update to collaboration
      moveCursor(path, {
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });

    // Listen for selection changes
    editor.onDidChangeCursorSelection((e) => {
      const selection = e.selection;
      if (selection.startLineNumber !== selection.endLineNumber ||
          selection.startColumn !== selection.endColumn) {
        // Has a selection
        updateSelection(path, {
          startLine: selection.startLineNumber,
          startColumn: selection.startColumn,
          endLine: selection.endLineNumber,
          endColumn: selection.endColumn,
        });
      } else {
        // No selection (cursor only)
        updateSelection(path, null);
      }
    });

    // Add custom commands
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyD, () => {
      editor.getAction('editor.action.copyLinesDownAction')?.run();
    });

    // Save command
    if (onSave) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        onSave();
      });
    }

    // Go to line command
    if (onGoToLine) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG, () => {
        onGoToLine();
      });
    }

    // Find/Replace command
    if (onFindReplace) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, () => {
        onFindReplace();
      });
    }
  };

  // Handle content changes
  const handleChange = useCallback((value: string | undefined) => {
    onChange(value || '');
  }, [onChange]);

  // Determine language (use html-jinja for HTML files)
  const effectiveLanguage = language === 'html' ? 'html' : language;

  // SVG editor options
  const editorOptionsWithDefaults = {
    fontSize: editorOptions.fontSize || 13,
    fontFamily: editorOptions.fontFamily || "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace",
    fontLigatures: true,
    lineHeight: (editorOptions.fontSize || 13) * 1.5,
    minimap: {
      enabled: editorOptions.minimap !== false && !isSvgFile,
      maxColumn: 80,
      renderCharacters: false,
    },
    lineNumbers: editorOptions.lineNumbers !== false ? 'on' as const : 'off' as const,
    renderLineHighlight: 'all' as const,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    folding: true,
    foldingStrategy: 'indentation' as const,
    bracketPairColorization: { enabled: editorOptions.bracketMatching !== false },
    guides: {
      bracketPairs: editorOptions.bracketMatching !== false,
      indentation: editorOptions.indentGuides !== false,
    },
    wordWrap: editorOptions.wordWrap ? 'on' as const : 'off' as const,
    tabSize: editorOptions.tabSize || 2,
    insertSpaces: true,
    formatOnPaste: true,
    formatOnType: true,
    autoIndent: 'full' as const,
    suggestOnTriggerCharacters: true,
    quickSuggestions: true,
    acceptSuggestionOnEnter: 'on' as const,
    scrollbar: {
      vertical: 'visible' as const,
      horizontal: 'visible' as const,
      useShadows: false,
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
    padding: { top: 10, bottom: 10 },
    cursorBlinking: 'smooth' as const,
    cursorSmoothCaretAnimation: 'on' as const,
    smoothScrolling: true,
    mouseWheelZoom: true,
    links: true,
    colorDecorators: true,
    renderWhitespace: 'selection' as const,
    renderControlCharacters: false,
    readOnly: readOnly,
  };

  // Render SVG split view
  if (isSvgFile) {
    return (
      <div className="h-full flex flex-col">
        {/* SVG Preview Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 bg-zinc-800 border-b border-zinc-700">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">SVG Preview</span>
            <div className="h-4 w-px bg-zinc-600" />
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`p-1.5 rounded transition-colors ${
                showPreview ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-zinc-700'
              }`}
              title={showPreview ? 'Hide preview' : 'Show preview'}
            >
              {showPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1.5 rounded transition-colors ${
                showGrid ? 'bg-zinc-600 text-white' : 'text-gray-400 hover:text-white hover:bg-zinc-700'
              }`}
              title={showGrid ? 'Hide grid' : 'Show grid'}
            >
              <Columns className="w-4 h-4" />
            </button>
          </div>

          {showPreview && (
            <div className="flex items-center gap-2">
              {/* Zoom controls */}
              <button
                onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-400 min-w-[4ch] text-center">{Math.round(zoom * 100)}%</span>
              <button
                onClick={() => setZoom(Math.min(4, zoom + 0.25))}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                title="Reset zoom"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <div className="h-4 w-px bg-zinc-600" />
              <button
                onClick={() => setPreviewFullscreen(!previewFullscreen)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                title={previewFullscreen ? 'Exit fullscreen' : 'Fullscreen preview'}
              >
                {previewFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        {/* SVG Split View Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Code Editor */}
          <div className={`${showPreview && !previewFullscreen ? 'w-1/2' : previewFullscreen ? 'hidden' : 'w-full'} h-full`}>
            <Editor
              path={path}
              value={content}
              language="xml"
              theme="rustpress-dark"
              onChange={handleChange}
              beforeMount={handleBeforeMount}
              onMount={handleMount}
              options={editorOptionsWithDefaults}
              loading={
                <div className="h-full flex items-center justify-center bg-gray-900">
                  <div className="text-gray-400 text-sm">Loading editor...</div>
                </div>
              }
            />
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className={`${previewFullscreen ? 'w-full' : 'w-1/2 border-l border-zinc-700'} h-full`}>
              <SvgPreview content={content} zoom={zoom} showGrid={showGrid} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Regular editor for non-SVG files
  return (
    <Editor
      path={path}
      value={content}
      language={effectiveLanguage}
      theme="rustpress-dark"
      onChange={handleChange}
      beforeMount={handleBeforeMount}
      onMount={handleMount}
      options={editorOptionsWithDefaults}
      loading={
        <div className="h-full flex items-center justify-center bg-gray-900">
          <div className="text-gray-400 text-sm">Loading editor...</div>
        </div>
      }
    />
  );
};

export default MonacoWrapper;
