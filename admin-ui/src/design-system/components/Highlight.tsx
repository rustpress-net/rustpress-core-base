/**
 * Highlight Component (Enhancement #95)
 * Text highlighting and search result highlighting
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

export interface HighlightProps {
  children: string;
  query: string | string[];
  caseSensitive?: boolean;
  highlightClassName?: string;
  highlightStyle?: React.CSSProperties;
  renderHighlight?: (match: string, index: number) => React.ReactNode;
  className?: string;
}

export interface MarkProps {
  children: React.ReactNode;
  color?: 'yellow' | 'green' | 'blue' | 'pink' | 'orange' | 'purple' | 'red';
  variant?: 'solid' | 'gradient' | 'underline' | 'box';
  animated?: boolean;
  className?: string;
}

export interface CodeHighlightProps {
  code: string;
  language?: 'javascript' | 'typescript' | 'jsx' | 'tsx' | 'css' | 'html' | 'json' | 'python' | 'rust' | 'sql';
  showLineNumbers?: boolean;
  highlightLines?: number[];
  theme?: 'dark' | 'light';
  className?: string;
}

export interface DiffHighlightProps {
  oldText: string;
  newText: string;
  inline?: boolean;
  showLineNumbers?: boolean;
  className?: string;
}

export interface SearchHighlightProps {
  text: string;
  searchTerms: string[];
  maxLength?: number;
  contextLength?: number;
  className?: string;
}

export interface GradientTextProps {
  children: React.ReactNode;
  from?: string;
  via?: string;
  to?: string;
  animate?: boolean;
  className?: string;
}

// ============================================================================
// Utility Functions
// ============================================================================

const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const findMatches = (
  text: string,
  query: string | string[],
  caseSensitive: boolean
): { start: number; end: number; match: string }[] => {
  const queries = Array.isArray(query) ? query : [query];
  const matches: { start: number; end: number; match: string }[] = [];

  for (const q of queries) {
    if (!q) continue;

    const pattern = escapeRegExp(q);
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(pattern, flags);

    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        start: match.index,
        end: match.index + match[0].length,
        match: match[0],
      });
    }
  }

  // Sort by start position and remove overlaps
  matches.sort((a, b) => a.start - b.start);

  const filteredMatches: typeof matches = [];
  for (const match of matches) {
    const lastMatch = filteredMatches[filteredMatches.length - 1];
    if (!lastMatch || match.start >= lastMatch.end) {
      filteredMatches.push(match);
    }
  }

  return filteredMatches;
};

// ============================================================================
// Highlight Component
// ============================================================================

export function Highlight({
  children,
  query,
  caseSensitive = false,
  highlightClassName = '',
  highlightStyle,
  renderHighlight,
  className = '',
}: HighlightProps) {
  const parts = useMemo(() => {
    if (!query || (Array.isArray(query) && query.length === 0)) {
      return [{ text: children, highlighted: false }];
    }

    const matches = findMatches(children, query, caseSensitive);
    if (matches.length === 0) {
      return [{ text: children, highlighted: false }];
    }

    const result: { text: string; highlighted: boolean }[] = [];
    let lastIndex = 0;

    for (const match of matches) {
      if (match.start > lastIndex) {
        result.push({
          text: children.substring(lastIndex, match.start),
          highlighted: false,
        });
      }
      result.push({
        text: match.match,
        highlighted: true,
      });
      lastIndex = match.end;
    }

    if (lastIndex < children.length) {
      result.push({
        text: children.substring(lastIndex),
        highlighted: false,
      });
    }

    return result;
  }, [children, query, caseSensitive]);

  const defaultHighlightClass = `
    bg-yellow-200 dark:bg-yellow-500/30
    text-yellow-900 dark:text-yellow-100
    rounded px-0.5
  `;

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.highlighted) {
          if (renderHighlight) {
            return (
              <React.Fragment key={index}>
                {renderHighlight(part.text, index)}
              </React.Fragment>
            );
          }
          return (
            <mark
              key={index}
              className={highlightClassName || defaultHighlightClass}
              style={highlightStyle}
            >
              {part.text}
            </mark>
          );
        }
        return <React.Fragment key={index}>{part.text}</React.Fragment>;
      })}
    </span>
  );
}

// ============================================================================
// Mark Component
// ============================================================================

export function Mark({
  children,
  color = 'yellow',
  variant = 'solid',
  animated = false,
  className = '',
}: MarkProps) {
  const colorClasses = {
    yellow: {
      solid: 'bg-yellow-200 dark:bg-yellow-500/30 text-yellow-900 dark:text-yellow-100',
      gradient: 'bg-gradient-to-r from-yellow-200 to-yellow-300 dark:from-yellow-500/30 dark:to-yellow-400/30',
      underline: 'border-b-2 border-yellow-400 dark:border-yellow-500',
      box: 'border-2 border-yellow-400 dark:border-yellow-500 bg-yellow-50 dark:bg-yellow-500/10',
    },
    green: {
      solid: 'bg-green-200 dark:bg-green-500/30 text-green-900 dark:text-green-100',
      gradient: 'bg-gradient-to-r from-green-200 to-green-300 dark:from-green-500/30 dark:to-green-400/30',
      underline: 'border-b-2 border-green-400 dark:border-green-500',
      box: 'border-2 border-green-400 dark:border-green-500 bg-green-50 dark:bg-green-500/10',
    },
    blue: {
      solid: 'bg-blue-200 dark:bg-blue-500/30 text-blue-900 dark:text-blue-100',
      gradient: 'bg-gradient-to-r from-blue-200 to-blue-300 dark:from-blue-500/30 dark:to-blue-400/30',
      underline: 'border-b-2 border-blue-400 dark:border-blue-500',
      box: 'border-2 border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-500/10',
    },
    pink: {
      solid: 'bg-pink-200 dark:bg-pink-500/30 text-pink-900 dark:text-pink-100',
      gradient: 'bg-gradient-to-r from-pink-200 to-pink-300 dark:from-pink-500/30 dark:to-pink-400/30',
      underline: 'border-b-2 border-pink-400 dark:border-pink-500',
      box: 'border-2 border-pink-400 dark:border-pink-500 bg-pink-50 dark:bg-pink-500/10',
    },
    orange: {
      solid: 'bg-orange-200 dark:bg-orange-500/30 text-orange-900 dark:text-orange-100',
      gradient: 'bg-gradient-to-r from-orange-200 to-orange-300 dark:from-orange-500/30 dark:to-orange-400/30',
      underline: 'border-b-2 border-orange-400 dark:border-orange-500',
      box: 'border-2 border-orange-400 dark:border-orange-500 bg-orange-50 dark:bg-orange-500/10',
    },
    purple: {
      solid: 'bg-purple-200 dark:bg-purple-500/30 text-purple-900 dark:text-purple-100',
      gradient: 'bg-gradient-to-r from-purple-200 to-purple-300 dark:from-purple-500/30 dark:to-purple-400/30',
      underline: 'border-b-2 border-purple-400 dark:border-purple-500',
      box: 'border-2 border-purple-400 dark:border-purple-500 bg-purple-50 dark:bg-purple-500/10',
    },
    red: {
      solid: 'bg-red-200 dark:bg-red-500/30 text-red-900 dark:text-red-100',
      gradient: 'bg-gradient-to-r from-red-200 to-red-300 dark:from-red-500/30 dark:to-red-400/30',
      underline: 'border-b-2 border-red-400 dark:border-red-500',
      box: 'border-2 border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-500/10',
    },
  };

  const baseClasses = variant === 'underline' ? 'pb-0.5' : 'px-1 rounded';

  const content = (
    <mark className={`${baseClasses} ${colorClasses[color][variant]} ${className}`}>
      {children}
    </mark>
  );

  if (animated) {
    return (
      <motion.span
        initial={{ backgroundColor: 'transparent' }}
        animate={{ backgroundColor: 'auto' }}
        transition={{ duration: 0.5 }}
      >
        {content}
      </motion.span>
    );
  }

  return content;
}

// ============================================================================
// Code Highlight Component (Basic Syntax Highlighting)
// ============================================================================

const tokenPatterns = {
  keyword: /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|default|async|await|try|catch|throw|new|this|super|extends|implements|interface|type|enum|public|private|protected|static|readonly|abstract|final|def|fn|use|mod|pub|struct|impl|trait|match|where|SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|JOIN|AND|OR|NOT|NULL|CREATE|DROP|ALTER|INDEX|TABLE|DATABASE)\b/g,
  string: /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g,
  number: /\b\d+(?:\.\d+)?\b/g,
  comment: /\/\/.*$|\/\*[\s\S]*?\*\/|#.*$/gm,
  function: /\b([a-zA-Z_]\w*)\s*\(/g,
  operator: /[+\-*/%=<>!&|^~?:]+/g,
  punctuation: /[{}[\]();,.:]/g,
  boolean: /\b(true|false|True|False|TRUE|FALSE)\b/g,
  builtin: /\b(console|Math|JSON|Object|Array|String|Number|Boolean|Date|Promise|Error|Map|Set|window|document|React|useState|useEffect|useCallback|useMemo|useRef)\b/g,
};

const themeColors = {
  dark: {
    keyword: 'text-purple-400',
    string: 'text-green-400',
    number: 'text-orange-400',
    comment: 'text-neutral-500',
    function: 'text-blue-400',
    operator: 'text-neutral-400',
    punctuation: 'text-neutral-400',
    boolean: 'text-orange-400',
    builtin: 'text-cyan-400',
    default: 'text-neutral-200',
  },
  light: {
    keyword: 'text-purple-600',
    string: 'text-green-600',
    number: 'text-orange-600',
    comment: 'text-neutral-400',
    function: 'text-blue-600',
    operator: 'text-neutral-600',
    punctuation: 'text-neutral-600',
    boolean: 'text-orange-600',
    builtin: 'text-cyan-600',
    default: 'text-neutral-800',
  },
};

export function CodeHighlight({
  code,
  language = 'javascript',
  showLineNumbers = false,
  highlightLines = [],
  theme = 'dark',
  className = '',
}: CodeHighlightProps) {
  const colors = themeColors[theme];
  const lines = code.split('\n');

  const tokenizeLine = (line: string): React.ReactNode[] => {
    const tokens: { type: string; value: string; index: number }[] = [];

    // Find all matches
    for (const [type, pattern] of Object.entries(tokenPatterns)) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;
      while ((match = regex.exec(line)) !== null) {
        tokens.push({
          type,
          value: type === 'function' ? match[1] : match[0],
          index: type === 'function' ? match.index : match.index,
        });
      }
    }

    // Sort by index
    tokens.sort((a, b) => a.index - b.index);

    // Build result
    const result: React.ReactNode[] = [];
    let lastIndex = 0;

    for (const token of tokens) {
      if (token.index > lastIndex) {
        const text = line.substring(lastIndex, token.index);
        result.push(
          <span key={`text-${lastIndex}`} className={colors.default}>
            {text}
          </span>
        );
      }

      result.push(
        <span
          key={`${token.type}-${token.index}`}
          className={colors[token.type as keyof typeof colors] || colors.default}
        >
          {token.value}
        </span>
      );

      lastIndex = token.index + token.value.length;
    }

    if (lastIndex < line.length) {
      result.push(
        <span key={`text-${lastIndex}`} className={colors.default}>
          {line.substring(lastIndex)}
        </span>
      );
    }

    if (result.length === 0) {
      result.push(
        <span key="empty" className={colors.default}>
          {line || ' '}
        </span>
      );
    }

    return result;
  };

  return (
    <pre
      className={`
        font-mono text-sm
        ${theme === 'dark' ? 'bg-neutral-900' : 'bg-neutral-50'}
        p-4 rounded-lg overflow-x-auto
        ${className}
      `}
    >
      <code>
        {lines.map((line, index) => {
          const lineNumber = index + 1;
          const isHighlighted = highlightLines.includes(lineNumber);

          return (
            <div
              key={index}
              className={`
                ${isHighlighted
                  ? theme === 'dark'
                    ? 'bg-primary-500/20 -mx-4 px-4'
                    : 'bg-primary-100 -mx-4 px-4'
                  : ''
                }
              `}
            >
              {showLineNumbers && (
                <span
                  className={`
                    inline-block w-8 mr-4 text-right select-none
                    ${theme === 'dark' ? 'text-neutral-600' : 'text-neutral-400'}
                  `}
                >
                  {lineNumber}
                </span>
              )}
              {tokenizeLine(line)}
            </div>
          );
        })}
      </code>
    </pre>
  );
}

// ============================================================================
// Diff Highlight Component
// ============================================================================

export function DiffHighlight({
  oldText,
  newText,
  inline = false,
  showLineNumbers = true,
  className = '',
}: DiffHighlightProps) {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');

  // Simple line-by-line diff
  const diffLines: { type: 'unchanged' | 'removed' | 'added'; line: string }[] = [];

  const maxLen = Math.max(oldLines.length, newLines.length);
  let oldIndex = 0;
  let newIndex = 0;

  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    const oldLine = oldLines[oldIndex];
    const newLine = newLines[newIndex];

    if (oldLine === newLine) {
      diffLines.push({ type: 'unchanged', line: oldLine || '' });
      oldIndex++;
      newIndex++;
    } else if (oldLine !== undefined && !newLines.includes(oldLine)) {
      diffLines.push({ type: 'removed', line: oldLine });
      oldIndex++;
    } else if (newLine !== undefined && !oldLines.includes(newLine)) {
      diffLines.push({ type: 'added', line: newLine });
      newIndex++;
    } else {
      oldIndex++;
      newIndex++;
    }
  }

  const typeClasses = {
    unchanged: 'text-neutral-600 dark:text-neutral-400',
    removed: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    added: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  };

  const prefixes = {
    unchanged: ' ',
    removed: '-',
    added: '+',
  };

  return (
    <pre
      className={`
        font-mono text-sm
        bg-neutral-50 dark:bg-neutral-900
        rounded-lg overflow-x-auto
        ${className}
      `}
    >
      <code>
        {diffLines.map((diff, index) => (
          <div
            key={index}
            className={`px-4 ${typeClasses[diff.type]}`}
          >
            {showLineNumbers && (
              <span className="inline-block w-8 text-right mr-2 text-neutral-400 select-none">
                {index + 1}
              </span>
            )}
            <span className="mr-2 select-none">{prefixes[diff.type]}</span>
            <span>{diff.line || ' '}</span>
          </div>
        ))}
      </code>
    </pre>
  );
}

// ============================================================================
// Search Highlight Component
// ============================================================================

export function SearchHighlight({
  text,
  searchTerms,
  maxLength = 200,
  contextLength = 50,
  className = '',
}: SearchHighlightProps) {
  const result = useMemo(() => {
    if (!searchTerms.length || !text) {
      const truncated = text.length > maxLength
        ? text.substring(0, maxLength) + '...'
        : text;
      return { text: truncated, hasMatches: false };
    }

    const matches = findMatches(text, searchTerms, false);
    if (matches.length === 0) {
      const truncated = text.length > maxLength
        ? text.substring(0, maxLength) + '...'
        : text;
      return { text: truncated, hasMatches: false };
    }

    // Get context around first match
    const firstMatch = matches[0];
    const start = Math.max(0, firstMatch.start - contextLength);
    const end = Math.min(text.length, firstMatch.end + contextLength);

    let excerpt = text.substring(start, end);
    if (start > 0) excerpt = '...' + excerpt;
    if (end < text.length) excerpt = excerpt + '...';

    return { text: excerpt, hasMatches: true };
  }, [text, searchTerms, maxLength, contextLength]);

  return (
    <Highlight
      query={searchTerms}
      className={className}
    >
      {result.text}
    </Highlight>
  );
}

// ============================================================================
// Gradient Text Component
// ============================================================================

export function GradientText({
  children,
  from = '#3b82f6',
  via,
  to = '#8b5cf6',
  animate = false,
  className = '',
}: GradientTextProps) {
  const gradient = via
    ? `linear-gradient(90deg, ${from}, ${via}, ${to})`
    : `linear-gradient(90deg, ${from}, ${to})`;

  const style: React.CSSProperties = {
    background: gradient,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  if (animate) {
    return (
      <motion.span
        className={className}
        style={{
          ...style,
          backgroundSize: '200% auto',
        }}
        animate={{
          backgroundPosition: ['0% center', '100% center', '0% center'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        {children}
      </motion.span>
    );
  }

  return (
    <span className={className} style={style}>
      {children}
    </span>
  );
}

// ============================================================================
// Text Emphasis Component
// ============================================================================

export interface TextEmphasisProps {
  children: React.ReactNode;
  type?: 'strong' | 'em' | 'underline' | 'strikethrough' | 'code';
  className?: string;
}

export function TextEmphasis({
  children,
  type = 'strong',
  className = '',
}: TextEmphasisProps) {
  switch (type) {
    case 'strong':
      return <strong className={`font-bold ${className}`}>{children}</strong>;
    case 'em':
      return <em className={`italic ${className}`}>{children}</em>;
    case 'underline':
      return <u className={`underline underline-offset-2 ${className}`}>{children}</u>;
    case 'strikethrough':
      return <s className={`line-through ${className}`}>{children}</s>;
    case 'code':
      return (
        <code
          className={`
            px-1.5 py-0.5 rounded
            bg-neutral-100 dark:bg-neutral-800
            text-sm font-mono
            text-primary-600 dark:text-primary-400
            ${className}
          `}
        >
          {children}
        </code>
      );
    default:
      return <span className={className}>{children}</span>;
  }
}

export default Highlight;
