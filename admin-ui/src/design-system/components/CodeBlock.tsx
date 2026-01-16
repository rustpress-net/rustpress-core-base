/**
 * RustPress Code Block Component
 * Syntax highlighted code display with copy, line numbers, and language support
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Check,
  Download,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronRight,
  FileCode,
  Terminal as TerminalIcon,
  Eye,
  EyeOff,
  WrapText,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export type SupportedLanguage =
  | 'javascript'
  | 'typescript'
  | 'jsx'
  | 'tsx'
  | 'python'
  | 'rust'
  | 'go'
  | 'java'
  | 'c'
  | 'cpp'
  | 'csharp'
  | 'php'
  | 'ruby'
  | 'swift'
  | 'kotlin'
  | 'html'
  | 'css'
  | 'scss'
  | 'json'
  | 'yaml'
  | 'toml'
  | 'xml'
  | 'markdown'
  | 'sql'
  | 'bash'
  | 'shell'
  | 'powershell'
  | 'dockerfile'
  | 'graphql'
  | 'plaintext';

export interface CodeBlockProps {
  code: string;
  language?: SupportedLanguage;
  filename?: string;
  showLineNumbers?: boolean;
  showCopy?: boolean;
  showDownload?: boolean;
  showExpand?: boolean;
  highlightLines?: number[];
  startLine?: number;
  maxHeight?: number | string;
  wordWrap?: boolean;
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
  onCopy?: (code: string) => void;
  onDownload?: (code: string, filename?: string) => void;
}

// ============================================================================
// Language Configurations
// ============================================================================

const languageConfig: Record<SupportedLanguage, { name: string; color: string }> = {
  javascript: { name: 'JavaScript', color: '#f7df1e' },
  typescript: { name: 'TypeScript', color: '#3178c6' },
  jsx: { name: 'JSX', color: '#61dafb' },
  tsx: { name: 'TSX', color: '#3178c6' },
  python: { name: 'Python', color: '#3776ab' },
  rust: { name: 'Rust', color: '#dea584' },
  go: { name: 'Go', color: '#00add8' },
  java: { name: 'Java', color: '#b07219' },
  c: { name: 'C', color: '#555555' },
  cpp: { name: 'C++', color: '#f34b7d' },
  csharp: { name: 'C#', color: '#178600' },
  php: { name: 'PHP', color: '#4f5d95' },
  ruby: { name: 'Ruby', color: '#701516' },
  swift: { name: 'Swift', color: '#f05138' },
  kotlin: { name: 'Kotlin', color: '#a97bff' },
  html: { name: 'HTML', color: '#e34c26' },
  css: { name: 'CSS', color: '#563d7c' },
  scss: { name: 'SCSS', color: '#c6538c' },
  json: { name: 'JSON', color: '#292929' },
  yaml: { name: 'YAML', color: '#cb171e' },
  toml: { name: 'TOML', color: '#9c4221' },
  xml: { name: 'XML', color: '#0060ac' },
  markdown: { name: 'Markdown', color: '#083fa1' },
  sql: { name: 'SQL', color: '#e38c00' },
  bash: { name: 'Bash', color: '#89e051' },
  shell: { name: 'Shell', color: '#89e051' },
  powershell: { name: 'PowerShell', color: '#012456' },
  dockerfile: { name: 'Dockerfile', color: '#384d54' },
  graphql: { name: 'GraphQL', color: '#e10098' },
  plaintext: { name: 'Plain Text', color: '#6b7280' },
};

// ============================================================================
// Simple Syntax Highlighting
// ============================================================================

interface TokenStyle {
  color: string;
  fontWeight?: string;
  fontStyle?: string;
}

const tokenStyles: Record<string, TokenStyle> = {
  keyword: { color: '#c678dd', fontWeight: 'bold' },
  string: { color: '#98c379' },
  number: { color: '#d19a66' },
  comment: { color: '#5c6370', fontStyle: 'italic' },
  function: { color: '#61afef' },
  operator: { color: '#56b6c2' },
  punctuation: { color: '#abb2bf' },
  variable: { color: '#e06c75' },
  type: { color: '#e5c07b' },
  attribute: { color: '#d19a66' },
  tag: { color: '#e06c75' },
  property: { color: '#e06c75' },
};

// Keywords by language
const keywords: Partial<Record<SupportedLanguage, string[]>> = {
  javascript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'async', 'await', 'class', 'extends', 'new', 'this', 'super', 'import', 'export', 'from', 'default', 'null', 'undefined', 'true', 'false', 'typeof', 'instanceof', 'in', 'of'],
  typescript: ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'async', 'await', 'class', 'extends', 'new', 'this', 'super', 'import', 'export', 'from', 'default', 'null', 'undefined', 'true', 'false', 'typeof', 'instanceof', 'in', 'of', 'type', 'interface', 'enum', 'implements', 'private', 'public', 'protected', 'readonly', 'abstract', 'as', 'is', 'keyof', 'never', 'unknown', 'any', 'void', 'string', 'number', 'boolean', 'object'],
  python: ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally', 'with', 'as', 'import', 'from', 'return', 'yield', 'raise', 'pass', 'break', 'continue', 'lambda', 'and', 'or', 'not', 'in', 'is', 'None', 'True', 'False', 'self', 'global', 'nonlocal', 'async', 'await'],
  rust: ['fn', 'let', 'mut', 'const', 'static', 'if', 'else', 'match', 'for', 'while', 'loop', 'break', 'continue', 'return', 'struct', 'enum', 'impl', 'trait', 'where', 'pub', 'use', 'mod', 'crate', 'self', 'super', 'as', 'ref', 'move', 'async', 'await', 'dyn', 'type', 'true', 'false', 'Some', 'None', 'Ok', 'Err'],
  go: ['func', 'var', 'const', 'type', 'struct', 'interface', 'map', 'chan', 'if', 'else', 'for', 'range', 'switch', 'case', 'default', 'break', 'continue', 'return', 'go', 'defer', 'select', 'package', 'import', 'true', 'false', 'nil', 'make', 'new', 'len', 'cap', 'append', 'copy', 'delete'],
  sql: ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL', 'ORDER', 'BY', 'ASC', 'DESC', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'DROP', 'ALTER', 'INDEX', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE', 'DEFAULT', 'AS', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN'],
  bash: ['if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'do', 'done', 'case', 'esac', 'function', 'return', 'exit', 'echo', 'read', 'local', 'export', 'source', 'alias', 'cd', 'pwd', 'ls', 'mkdir', 'rm', 'cp', 'mv', 'cat', 'grep', 'sed', 'awk', 'curl', 'wget'],
};

function highlightCode(code: string, language: SupportedLanguage): React.ReactNode[] {
  const lines = code.split('\n');
  const langKeywords = keywords[language] || keywords.javascript || [];

  return lines.map((line, lineIndex) => {
    const tokens: React.ReactNode[] = [];
    let remaining = line;
    let keyIndex = 0;

    while (remaining.length > 0) {
      let matched = false;

      // Comments
      if (remaining.startsWith('//') || remaining.startsWith('#')) {
        tokens.push(
          <span key={`${lineIndex}-${keyIndex++}`} style={tokenStyles.comment}>
            {remaining}
          </span>
        );
        break;
      }

      // Multi-line comment start
      if (remaining.startsWith('/*') || remaining.startsWith('"""') || remaining.startsWith("'''")) {
        tokens.push(
          <span key={`${lineIndex}-${keyIndex++}`} style={tokenStyles.comment}>
            {remaining}
          </span>
        );
        break;
      }

      // Strings (double quotes)
      const doubleQuoteMatch = remaining.match(/^"(?:[^"\\]|\\.)*"/);
      if (doubleQuoteMatch) {
        tokens.push(
          <span key={`${lineIndex}-${keyIndex++}`} style={tokenStyles.string}>
            {doubleQuoteMatch[0]}
          </span>
        );
        remaining = remaining.slice(doubleQuoteMatch[0].length);
        matched = true;
        continue;
      }

      // Strings (single quotes)
      const singleQuoteMatch = remaining.match(/^'(?:[^'\\]|\\.)*'/);
      if (singleQuoteMatch) {
        tokens.push(
          <span key={`${lineIndex}-${keyIndex++}`} style={tokenStyles.string}>
            {singleQuoteMatch[0]}
          </span>
        );
        remaining = remaining.slice(singleQuoteMatch[0].length);
        matched = true;
        continue;
      }

      // Template literals
      const templateMatch = remaining.match(/^`(?:[^`\\]|\\.)*`/);
      if (templateMatch) {
        tokens.push(
          <span key={`${lineIndex}-${keyIndex++}`} style={tokenStyles.string}>
            {templateMatch[0]}
          </span>
        );
        remaining = remaining.slice(templateMatch[0].length);
        matched = true;
        continue;
      }

      // Numbers
      const numberMatch = remaining.match(/^-?\d+\.?\d*(?:e[+-]?\d+)?/i);
      if (numberMatch) {
        tokens.push(
          <span key={`${lineIndex}-${keyIndex++}`} style={tokenStyles.number}>
            {numberMatch[0]}
          </span>
        );
        remaining = remaining.slice(numberMatch[0].length);
        matched = true;
        continue;
      }

      // Keywords and identifiers
      const wordMatch = remaining.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/);
      if (wordMatch) {
        const word = wordMatch[0];
        const isKeyword = langKeywords.includes(word) || langKeywords.includes(word.toUpperCase());

        if (isKeyword) {
          tokens.push(
            <span key={`${lineIndex}-${keyIndex++}`} style={tokenStyles.keyword}>
              {word}
            </span>
          );
        } else if (remaining.length > word.length && remaining[word.length] === '(') {
          // Function call
          tokens.push(
            <span key={`${lineIndex}-${keyIndex++}`} style={tokenStyles.function}>
              {word}
            </span>
          );
        } else {
          tokens.push(<span key={`${lineIndex}-${keyIndex++}`}>{word}</span>);
        }
        remaining = remaining.slice(word.length);
        matched = true;
        continue;
      }

      // Operators
      const operatorMatch = remaining.match(/^[+\-*/%=<>!&|^~?:]+/);
      if (operatorMatch) {
        tokens.push(
          <span key={`${lineIndex}-${keyIndex++}`} style={tokenStyles.operator}>
            {operatorMatch[0]}
          </span>
        );
        remaining = remaining.slice(operatorMatch[0].length);
        matched = true;
        continue;
      }

      // Default: single character
      if (!matched) {
        tokens.push(<span key={`${lineIndex}-${keyIndex++}`}>{remaining[0]}</span>);
        remaining = remaining.slice(1);
      }
    }

    return tokens;
  });
}

// ============================================================================
// Main Code Block Component
// ============================================================================

export function CodeBlock({
  code,
  language = 'plaintext',
  filename,
  showLineNumbers = true,
  showCopy = true,
  showDownload = false,
  showExpand = false,
  highlightLines = [],
  startLine = 1,
  maxHeight,
  wordWrap = false,
  theme = 'dark',
  className,
  onCopy,
  onDownload,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isWrapping, setIsWrapping] = useState(wordWrap);

  const lines = code.split('\n');
  const highlightedLines = useMemo(() => highlightCode(code, language), [code, language]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopy?.(code);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }, [code, onCopy]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `code.${language === 'plaintext' ? 'txt' : language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onDownload?.(code, filename);
  }, [code, filename, language, onDownload]);

  const langConfig = languageConfig[language];
  const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden border',
        isDark
          ? 'bg-[#282c34] border-neutral-700'
          : 'bg-neutral-50 border-neutral-200',
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-2 border-b',
          isDark
            ? 'bg-[#21252b] border-neutral-700'
            : 'bg-neutral-100 border-neutral-200'
        )}
      >
        <div className="flex items-center gap-2">
          {filename ? (
            <>
              <FileCode className={cn('w-4 h-4', isDark ? 'text-neutral-400' : 'text-neutral-500')} />
              <span className={cn('text-sm font-medium', isDark ? 'text-neutral-200' : 'text-neutral-700')}>
                {filename}
              </span>
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: langConfig.color }}
              />
              <span className={cn('text-sm', isDark ? 'text-neutral-400' : 'text-neutral-600')}>
                {langConfig.name}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Wrap Toggle */}
          <button
            onClick={() => setIsWrapping(!isWrapping)}
            className={cn(
              'p-1.5 rounded transition-colors',
              isDark
                ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700'
                : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200',
              isWrapping && (isDark ? 'bg-neutral-700' : 'bg-neutral-200')
            )}
            title={isWrapping ? 'Disable word wrap' : 'Enable word wrap'}
          >
            <WrapText className="w-4 h-4" />
          </button>

          {/* Expand Toggle */}
          {showExpand && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                'p-1.5 rounded transition-colors',
                isDark
                  ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700'
                  : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200'
              )}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Download */}
          {showDownload && (
            <button
              onClick={handleDownload}
              className={cn(
                'p-1.5 rounded transition-colors',
                isDark
                  ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700'
                  : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200'
              )}
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Copy */}
          {showCopy && (
            <button
              onClick={handleCopy}
              className={cn(
                'p-1.5 rounded transition-colors',
                isDark
                  ? 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700'
                  : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200',
                copied && 'text-green-500'
              )}
              title={copied ? 'Copied!' : 'Copy code'}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Code Content */}
      <div
        className={cn('overflow-auto', !isExpanded && maxHeight && 'overflow-y-auto')}
        style={{ maxHeight: isExpanded ? undefined : maxHeight }}
      >
        <pre
          className={cn(
            'p-4 text-sm font-mono',
            isDark ? 'text-[#abb2bf]' : 'text-neutral-800',
            isWrapping ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
          )}
        >
          <code>
            {highlightedLines.map((lineTokens, index) => {
              const lineNumber = startLine + index;
              const isHighlighted = highlightLines.includes(lineNumber);

              return (
                <div
                  key={index}
                  className={cn(
                    'flex',
                    isHighlighted && (isDark ? 'bg-yellow-500/10' : 'bg-yellow-100')
                  )}
                >
                  {showLineNumbers && (
                    <span
                      className={cn(
                        'select-none pr-4 text-right min-w-[3rem]',
                        isDark ? 'text-neutral-600' : 'text-neutral-400',
                        isHighlighted && (isDark ? 'text-yellow-500/70' : 'text-yellow-600')
                      )}
                    >
                      {lineNumber}
                    </span>
                  )}
                  <span className="flex-1">{lineTokens}</span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
}

// ============================================================================
// Inline Code Component
// ============================================================================

export interface InlineCodeProps {
  children: string;
  className?: string;
}

export function InlineCode({ children, className }: InlineCodeProps) {
  return (
    <code
      className={cn(
        'px-1.5 py-0.5 text-sm font-mono rounded',
        'bg-neutral-100 dark:bg-neutral-800',
        'text-pink-600 dark:text-pink-400',
        'border border-neutral-200 dark:border-neutral-700',
        className
      )}
    >
      {children}
    </code>
  );
}

// ============================================================================
// Code Group Component (for tabbed code blocks)
// ============================================================================

export interface CodeTab {
  label: string;
  language: SupportedLanguage;
  code: string;
  filename?: string;
}

export interface CodeGroupProps {
  tabs: CodeTab[];
  defaultTab?: number;
  showLineNumbers?: boolean;
  showCopy?: boolean;
  maxHeight?: number | string;
  className?: string;
}

export function CodeGroup({
  tabs,
  defaultTab = 0,
  showLineNumbers = true,
  showCopy = true,
  maxHeight,
  className,
}: CodeGroupProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const activeCode = tabs[activeTab];

  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden border border-neutral-700',
        'bg-[#282c34]',
        className
      )}
    >
      {/* Tabs */}
      <div className="flex border-b border-neutral-700 bg-[#21252b]">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={cn(
              'px-4 py-2 text-sm transition-colors',
              index === activeTab
                ? 'text-white bg-[#282c34] border-b-2 border-primary-500'
                : 'text-neutral-400 hover:text-neutral-200'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Code Block */}
      {activeCode && (
        <CodeBlock
          code={activeCode.code}
          language={activeCode.language}
          filename={activeCode.filename}
          showLineNumbers={showLineNumbers}
          showCopy={showCopy}
          maxHeight={maxHeight}
          theme="dark"
          className="border-0 rounded-none"
        />
      )}
    </div>
  );
}

// ============================================================================
// Terminal/Console Component
// ============================================================================

export interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success' | 'info';
  content: string;
  prompt?: string;
}

export interface TerminalProps {
  lines: TerminalLine[];
  title?: string;
  showHeader?: boolean;
  className?: string;
}

export function Terminal({
  lines,
  title = 'Terminal',
  showHeader = true,
  className,
}: TerminalProps) {
  const lineStyles: Record<TerminalLine['type'], string> = {
    input: 'text-white',
    output: 'text-neutral-300',
    error: 'text-red-400',
    success: 'text-green-400',
    info: 'text-blue-400',
  };

  return (
    <div
      className={cn(
        'rounded-lg overflow-hidden bg-neutral-900 border border-neutral-700',
        className
      )}
    >
      {/* Header */}
      {showHeader && (
        <div className="flex items-center gap-2 px-4 py-3 bg-neutral-800 border-b border-neutral-700">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="flex-1 text-center text-sm text-neutral-400">
            {title}
          </span>
          <TerminalIcon className="w-4 h-4 text-neutral-500" />
        </div>
      )}

      {/* Content */}
      <div className="p-4 font-mono text-sm overflow-x-auto">
        {lines.map((line, index) => (
          <div key={index} className={cn('py-0.5', lineStyles[line.type])}>
            {line.type === 'input' && (
              <span className="text-green-400 mr-2">
                {line.prompt || '$'}
              </span>
            )}
            <span className="whitespace-pre-wrap">{line.content}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Collapsible Code Block
// ============================================================================

export interface CollapsibleCodeBlockProps extends CodeBlockProps {
  title?: string;
  defaultOpen?: boolean;
}

export function CollapsibleCodeBlock({
  title,
  defaultOpen = false,
  ...codeBlockProps
}: CollapsibleCodeBlockProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const lines = codeBlockProps.code.split('\n').length;

  return (
    <div className="rounded-lg overflow-hidden border border-neutral-700 bg-[#282c34]">
      {/* Toggle Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-[#21252b] hover:bg-neutral-800 transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-neutral-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-neutral-400" />
        )}
        <FileCode className="w-4 h-4 text-neutral-400" />
        <span className="flex-1 text-left text-sm text-neutral-200">
          {title || codeBlockProps.filename || 'Code'}
        </span>
        <span className="text-xs text-neutral-500">
          {lines} line{lines !== 1 ? 's' : ''}
        </span>
      </button>

      {/* Code Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <CodeBlock
              {...codeBlockProps}
              className="border-0 rounded-none"
              theme="dark"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CodeBlock;
