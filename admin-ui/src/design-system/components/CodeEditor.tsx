/**
 * CodeEditor Component
 *
 * Syntax highlighted code editor:
 * - Multiple language support
 * - Line numbers
 * - Syntax highlighting (basic)
 * - Auto-indent
 * - Copy to clipboard
 * - Read-only mode
 */

import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Check,
  Code,
  FileCode,
  ChevronDown,
  Terminal,
  Maximize2,
  Minimize2,
  Download,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export type Language =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'rust'
  | 'go'
  | 'html'
  | 'css'
  | 'json'
  | 'markdown'
  | 'sql'
  | 'bash'
  | 'yaml'
  | 'plaintext';

export interface CodeEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  language?: Language;
  placeholder?: string;
  readOnly?: boolean;
  disabled?: boolean;
  showLineNumbers?: boolean;
  showCopyButton?: boolean;
  showLanguageSelector?: boolean;
  highlightLines?: number[];
  minHeight?: number;
  maxHeight?: number;
  fontSize?: number;
  tabSize?: number;
  wordWrap?: boolean;
  theme?: 'light' | 'dark';
  onLanguageChange?: (language: Language) => void;
  className?: string;
}

export interface CodeBlockProps {
  code: string;
  language?: Language;
  showLineNumbers?: boolean;
  showCopyButton?: boolean;
  highlightLines?: number[];
  title?: string;
  className?: string;
}

// ============================================================================
// Syntax Highlighting (Basic)
// ============================================================================

interface TokenStyle {
  color: string;
  fontWeight?: string;
  fontStyle?: string;
}

interface ThemeColors {
  keyword: TokenStyle;
  string: TokenStyle;
  number: TokenStyle;
  comment: TokenStyle;
  function: TokenStyle;
  operator: TokenStyle;
  variable: TokenStyle;
  type: TokenStyle;
  punctuation: TokenStyle;
  default: TokenStyle;
}

const lightTheme: ThemeColors = {
  keyword: { color: '#d73a49', fontWeight: 'bold' },
  string: { color: '#032f62' },
  number: { color: '#005cc5' },
  comment: { color: '#6a737d', fontStyle: 'italic' },
  function: { color: '#6f42c1' },
  operator: { color: '#d73a49' },
  variable: { color: '#e36209' },
  type: { color: '#22863a' },
  punctuation: { color: '#24292e' },
  default: { color: '#24292e' },
};

const darkTheme: ThemeColors = {
  keyword: { color: '#ff7b72', fontWeight: 'bold' },
  string: { color: '#a5d6ff' },
  number: { color: '#79c0ff' },
  comment: { color: '#8b949e', fontStyle: 'italic' },
  function: { color: '#d2a8ff' },
  operator: { color: '#ff7b72' },
  variable: { color: '#ffa657' },
  type: { color: '#7ee787' },
  punctuation: { color: '#c9d1d9' },
  default: { color: '#c9d1d9' },
};

// Keywords by language
const keywords: Record<Language, string[]> = {
  javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new', 'delete', 'typeof', 'instanceof', 'class', 'extends', 'import', 'export', 'default', 'from', 'async', 'await', 'yield', 'this', 'super', 'true', 'false', 'null', 'undefined', 'void'],
  typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new', 'delete', 'typeof', 'instanceof', 'class', 'extends', 'import', 'export', 'default', 'from', 'async', 'await', 'yield', 'this', 'super', 'true', 'false', 'null', 'undefined', 'void', 'interface', 'type', 'enum', 'implements', 'abstract', 'private', 'public', 'protected', 'readonly', 'static', 'as', 'is', 'keyof', 'infer', 'never', 'unknown', 'any'],
  python: ['def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'break', 'continue', 'try', 'except', 'finally', 'raise', 'import', 'from', 'as', 'with', 'pass', 'lambda', 'yield', 'global', 'nonlocal', 'True', 'False', 'None', 'and', 'or', 'not', 'in', 'is', 'async', 'await'],
  rust: ['fn', 'let', 'mut', 'const', 'static', 'struct', 'enum', 'impl', 'trait', 'type', 'where', 'for', 'loop', 'while', 'if', 'else', 'match', 'return', 'break', 'continue', 'mod', 'pub', 'use', 'crate', 'self', 'super', 'as', 'in', 'ref', 'move', 'async', 'await', 'dyn', 'unsafe', 'extern', 'true', 'false', 'Some', 'None', 'Ok', 'Err'],
  go: ['func', 'var', 'const', 'type', 'struct', 'interface', 'map', 'chan', 'go', 'select', 'case', 'default', 'if', 'else', 'for', 'range', 'switch', 'break', 'continue', 'return', 'defer', 'panic', 'recover', 'import', 'package', 'true', 'false', 'nil', 'iota'],
  html: ['html', 'head', 'body', 'div', 'span', 'p', 'a', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'form', 'input', 'button', 'select', 'option', 'textarea', 'script', 'style', 'link', 'meta', 'title', 'header', 'footer', 'nav', 'main', 'section', 'article', 'aside'],
  css: ['@import', '@media', '@keyframes', '@font-face', '@supports', '@page', '!important'],
  json: [],
  markdown: [],
  sql: ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER', 'ADD', 'INDEX', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'GROUP', 'BY', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'OFFSET', 'HAVING', 'DISTINCT', 'AS', 'NULL', 'TRUE', 'FALSE', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END'],
  bash: ['if', 'then', 'else', 'elif', 'fi', 'case', 'esac', 'for', 'while', 'until', 'do', 'done', 'in', 'function', 'return', 'exit', 'export', 'source', 'alias', 'unalias', 'echo', 'printf', 'read', 'local', 'declare', 'readonly', 'shift', 'set', 'unset', 'true', 'false'],
  yaml: [],
  plaintext: [],
};

const tokenize = (code: string, language: Language): Array<{ text: string; type: keyof ThemeColors }> => {
  const tokens: Array<{ text: string; type: keyof ThemeColors }> = [];
  const langKeywords = keywords[language] || [];

  // Simple regex-based tokenizer
  const patterns: Array<{ pattern: RegExp; type: keyof ThemeColors }> = [
    { pattern: /^\/\/.*$/m, type: 'comment' },
    { pattern: /^#.*$/m, type: 'comment' },
    { pattern: /^\/\*[\s\S]*?\*\//m, type: 'comment' },
    { pattern: /^"(?:[^"\\]|\\.)*"/, type: 'string' },
    { pattern: /^'(?:[^'\\]|\\.)*'/, type: 'string' },
    { pattern: /^`(?:[^`\\]|\\.)*`/, type: 'string' },
    { pattern: /^\d+\.?\d*/, type: 'number' },
    { pattern: /^[+\-*/%=<>!&|^~?:]/, type: 'operator' },
    { pattern: /^[(){}[\],;.]/, type: 'punctuation' },
    { pattern: /^\w+/, type: 'default' },
    { pattern: /^\s+/, type: 'default' },
  ];

  let remaining = code;

  while (remaining.length > 0) {
    let matched = false;

    for (const { pattern, type } of patterns) {
      const match = remaining.match(pattern);
      if (match) {
        let tokenType = type;
        const text = match[0];

        // Check if it's a keyword
        if (type === 'default' && langKeywords.includes(text)) {
          tokenType = 'keyword';
        }
        // Check if followed by ( for function
        else if (type === 'default' && remaining.slice(text.length).match(/^\s*\(/)) {
          tokenType = 'function';
        }

        tokens.push({ text, type: tokenType });
        remaining = remaining.slice(text.length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      tokens.push({ text: remaining[0], type: 'default' });
      remaining = remaining.slice(1);
    }
  }

  return tokens;
};

// ============================================================================
// Language Selector Component
// ============================================================================

const languages: { value: Language; label: string; icon: React.ReactNode }[] = [
  { value: 'javascript', label: 'JavaScript', icon: <FileCode className="w-4 h-4" /> },
  { value: 'typescript', label: 'TypeScript', icon: <FileCode className="w-4 h-4" /> },
  { value: 'python', label: 'Python', icon: <FileCode className="w-4 h-4" /> },
  { value: 'rust', label: 'Rust', icon: <FileCode className="w-4 h-4" /> },
  { value: 'go', label: 'Go', icon: <FileCode className="w-4 h-4" /> },
  { value: 'html', label: 'HTML', icon: <Code className="w-4 h-4" /> },
  { value: 'css', label: 'CSS', icon: <Code className="w-4 h-4" /> },
  { value: 'json', label: 'JSON', icon: <FileCode className="w-4 h-4" /> },
  { value: 'sql', label: 'SQL', icon: <FileCode className="w-4 h-4" /> },
  { value: 'bash', label: 'Bash', icon: <Terminal className="w-4 h-4" /> },
  { value: 'yaml', label: 'YAML', icon: <FileCode className="w-4 h-4" /> },
  { value: 'markdown', label: 'Markdown', icon: <FileCode className="w-4 h-4" /> },
  { value: 'plaintext', label: 'Plain Text', icon: <FileCode className="w-4 h-4" /> },
];

// ============================================================================
// CodeEditor Component
// ============================================================================

export function CodeEditor({
  value = '',
  onChange,
  language = 'javascript',
  placeholder = 'Enter code...',
  readOnly = false,
  disabled = false,
  showLineNumbers = true,
  showCopyButton = true,
  showLanguageSelector = false,
  highlightLines = [],
  minHeight = 200,
  maxHeight = 600,
  fontSize = 14,
  tabSize = 2,
  wordWrap = false,
  theme = 'dark',
  onLanguageChange,
  className,
}: CodeEditorProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const themeColors = theme === 'dark' ? darkTheme : lightTheme;

  const lines = useMemo(() => value.split('\n'), [value]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const spaces = ' '.repeat(tabSize);

      const newValue = value.slice(0, start) + spaces + value.slice(end);
      onChange?.(newValue);

      // Set cursor position after tab
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + tabSize;
      }, 0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  };

  const handleDownload = () => {
    const extensions: Record<Language, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      rust: 'rs',
      go: 'go',
      html: 'html',
      css: 'css',
      json: 'json',
      sql: 'sql',
      bash: 'sh',
      yaml: 'yml',
      markdown: 'md',
      plaintext: 'txt',
    };

    const blob = new Blob([value], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${extensions[language]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render highlighted code
  const renderHighlightedCode = () => {
    return lines.map((line, i) => {
      const tokens = tokenize(line || ' ', language);
      const isHighlighted = highlightLines.includes(i + 1);

      return (
        <div
          key={i}
          className={cn(
            'px-4 py-0',
            isHighlighted && 'bg-yellow-500/20'
          )}
          style={{ minHeight: `${fontSize * 1.5}px` }}
        >
          {tokens.map((token, j) => {
            const style = themeColors[token.type];
            return (
              <span
                key={j}
                style={{
                  color: style.color,
                  fontWeight: style.fontWeight,
                  fontStyle: style.fontStyle,
                }}
              >
                {token.text}
              </span>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div
      ref={editorRef}
      className={cn(
        'rounded-lg overflow-hidden border',
        theme === 'dark'
          ? 'bg-neutral-900 border-neutral-700'
          : 'bg-white border-neutral-300',
        isFullscreen && 'fixed inset-4 z-50',
        className
      )}
    >
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between px-4 py-2 border-b',
        theme === 'dark' ? 'border-neutral-700 bg-neutral-800' : 'border-neutral-200 bg-neutral-50'
      )}>
        <div className="flex items-center gap-2">
          {/* Language selector */}
          {showLanguageSelector ? (
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className={cn(
                  'flex items-center gap-2 px-2 py-1 rounded text-sm',
                  theme === 'dark' ? 'hover:bg-neutral-700' : 'hover:bg-neutral-200'
                )}
              >
                <Code className="w-4 h-4" />
                {languages.find(l => l.value === language)?.label || language}
                <ChevronDown className="w-3 h-3" />
              </button>

              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={cn(
                      'absolute left-0 top-full mt-1 z-10 rounded-lg shadow-lg border py-1 min-w-[150px]',
                      theme === 'dark'
                        ? 'bg-neutral-800 border-neutral-700'
                        : 'bg-white border-neutral-200'
                    )}
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.value}
                        onClick={() => {
                          onLanguageChange?.(lang.value);
                          setLangDropdownOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left',
                          theme === 'dark' ? 'hover:bg-neutral-700' : 'hover:bg-neutral-100',
                          language === lang.value && (theme === 'dark' ? 'bg-neutral-700' : 'bg-neutral-100')
                        )}
                      >
                        {lang.icon}
                        {lang.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Code className="w-4 h-4" />
              {languages.find(l => l.value === language)?.label || language}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {showCopyButton && (
            <button
              onClick={handleCopy}
              className={cn(
                'p-1.5 rounded transition-colors',
                theme === 'dark' ? 'hover:bg-neutral-700' : 'hover:bg-neutral-200'
              )}
              title="Copy code"
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          )}

          <button
            onClick={handleDownload}
            className={cn(
              'p-1.5 rounded transition-colors',
              theme === 'dark' ? 'hover:bg-neutral-700' : 'hover:bg-neutral-200'
            )}
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={cn(
              'p-1.5 rounded transition-colors',
              theme === 'dark' ? 'hover:bg-neutral-700' : 'hover:bg-neutral-200'
            )}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div
        className="relative overflow-auto"
        style={{
          minHeight: isFullscreen ? 'calc(100% - 48px)' : minHeight,
          maxHeight: isFullscreen ? 'calc(100% - 48px)' : maxHeight,
        }}
      >
        <div className="flex">
          {/* Line numbers */}
          {showLineNumbers && (
            <div
              className={cn(
                'flex-shrink-0 text-right pr-2 py-2 select-none border-r',
                theme === 'dark'
                  ? 'text-neutral-500 border-neutral-700 bg-neutral-900/50'
                  : 'text-neutral-400 border-neutral-200 bg-neutral-50'
              )}
              style={{ fontSize, lineHeight: 1.5, width: `${String(lines.length).length * 10 + 20}px` }}
            >
              {lines.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    highlightLines.includes(i + 1) && 'bg-yellow-500/20'
                  )}
                  style={{ minHeight: `${fontSize * 1.5}px` }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          )}

          {/* Code area */}
          <div className="relative flex-1">
            {/* Highlighted code (display only) */}
            <div
              className="absolute inset-0 pointer-events-none py-2 overflow-hidden"
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize,
                lineHeight: 1.5,
                whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
                wordBreak: wordWrap ? 'break-word' : 'normal',
              }}
            >
              {renderHighlightedCode()}
            </div>

            {/* Editable textarea */}
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              readOnly={readOnly}
              disabled={disabled}
              spellCheck={false}
              className={cn(
                'w-full h-full py-2 px-4 resize-none outline-none bg-transparent',
                'text-transparent caret-current',
                theme === 'dark' ? 'caret-white' : 'caret-black',
                disabled && 'cursor-not-allowed opacity-50'
              )}
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize,
                lineHeight: 1.5,
                minHeight: isFullscreen ? 'calc(100vh - 120px)' : minHeight - 48,
                whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
                wordBreak: wordWrap ? 'break-word' : 'normal',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CodeBlock Component (Read-only display)
// ============================================================================

export function CodeBlock({
  code,
  language = 'javascript',
  showLineNumbers = true,
  showCopyButton = true,
  highlightLines = [],
  title,
  className,
}: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);
  const themeColors = darkTheme;
  const lines = code.split('\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className={cn('rounded-lg overflow-hidden bg-neutral-900 border border-neutral-700', className)}>
      {/* Header */}
      {(title || showCopyButton) && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-700 bg-neutral-800">
          {title && (
            <span className="text-sm text-neutral-400">{title}</span>
          )}
          {showCopyButton && (
            <button
              onClick={handleCopy}
              className="p-1.5 rounded hover:bg-neutral-700 transition-colors"
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-neutral-400" />
              )}
            </button>
          )}
        </div>
      )}

      {/* Code */}
      <div className="overflow-auto">
        <div className="flex">
          {showLineNumbers && (
            <div className="flex-shrink-0 text-right pr-2 py-3 select-none text-neutral-500 border-r border-neutral-700 bg-neutral-900/50 text-sm">
              {lines.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'px-2',
                    highlightLines.includes(i + 1) && 'bg-yellow-500/20'
                  )}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          )}

          <pre className="flex-1 py-3 px-4 text-sm overflow-x-auto">
            <code>
              {lines.map((line, i) => {
                const tokens = tokenize(line || ' ', language);
                const isHighlighted = highlightLines.includes(i + 1);

                return (
                  <div
                    key={i}
                    className={cn(isHighlighted && 'bg-yellow-500/20 -mx-4 px-4')}
                  >
                    {tokens.map((token, j) => {
                      const style = themeColors[token.type];
                      return (
                        <span
                          key={j}
                          style={{
                            color: style.color,
                            fontWeight: style.fontWeight,
                            fontStyle: style.fontStyle,
                          }}
                        >
                          {token.text}
                        </span>
                      );
                    })}
                  </div>
                );
              })}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export default CodeEditor;
