/**
 * RustPress Markdown Preview Component
 * Live markdown rendering with syntax highlighting
 */

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Edit3,
  Columns,
  Copy,
  Check,
  ExternalLink,
  Image as ImageIcon,
  Link2,
  Code,
  List,
  ListOrdered,
  Quote,
  Minus,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// Types
// ============================================================================

export interface MarkdownPreviewProps {
  content: string;
  className?: string;
  showTableOfContents?: boolean;
  enableLinks?: boolean;
  enableImages?: boolean;
  enableCodeBlocks?: boolean;
  onLinkClick?: (href: string) => void;
  onImageClick?: (src: string, alt: string) => void;
}

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number | string;
  maxHeight?: number | string;
  showToolbar?: boolean;
  showPreview?: boolean;
  previewMode?: 'side' | 'tab';
  className?: string;
}

// ============================================================================
// Markdown Parser
// ============================================================================

interface ParsedToken {
  type: string;
  content: string | ParsedToken[];
  props?: Record<string, string>;
}

function parseMarkdown(text: string): ParsedToken[] {
  const tokens: ParsedToken[] = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Code block
    if (line.startsWith('```')) {
      const language = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      tokens.push({
        type: 'codeblock',
        content: codeLines.join('\n'),
        props: { language },
      });
      i++;
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      tokens.push({
        type: `h${headingMatch[1].length}`,
        content: parseInline(headingMatch[2]),
        props: { id: slugify(headingMatch[2]) },
      });
      i++;
      continue;
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(line.trim())) {
      tokens.push({ type: 'hr', content: '' });
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].slice(1).trim());
        i++;
      }
      tokens.push({
        type: 'blockquote',
        content: parseMarkdown(quoteLines.join('\n')),
      });
      continue;
    }

    // Unordered list
    if (/^[-*+]\s+/.test(line)) {
      const listItems: ParsedToken[] = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i])) {
        listItems.push({
          type: 'li',
          content: parseInline(lines[i].replace(/^[-*+]\s+/, '')),
        });
        i++;
      }
      tokens.push({ type: 'ul', content: listItems });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const listItems: ParsedToken[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        listItems.push({
          type: 'li',
          content: parseInline(lines[i].replace(/^\d+\.\s+/, '')),
        });
        i++;
      }
      tokens.push({ type: 'ol', content: listItems });
      continue;
    }

    // Task list
    if (/^[-*]\s+\[[ x]\]\s+/.test(line)) {
      const listItems: ParsedToken[] = [];
      while (i < lines.length && /^[-*]\s+\[[ x]\]\s+/.test(lines[i])) {
        const checked = lines[i].includes('[x]');
        listItems.push({
          type: 'task',
          content: parseInline(lines[i].replace(/^[-*]\s+\[[ x]\]\s+/, '')),
          props: { checked: checked ? 'true' : 'false' },
        });
        i++;
      }
      tokens.push({ type: 'tasklist', content: listItems });
      continue;
    }

    // Table
    if (line.includes('|') && i + 1 < lines.length && lines[i + 1].includes('---')) {
      const tableRows: ParsedToken[] = [];
      const headerCells = line.split('|').filter((c) => c.trim());
      tableRows.push({
        type: 'thead',
        content: headerCells.map((cell) => ({
          type: 'th',
          content: parseInline(cell.trim()),
        })),
      });
      i += 2; // Skip header and separator
      while (i < lines.length && lines[i].includes('|')) {
        const cells = lines[i].split('|').filter((c) => c.trim());
        tableRows.push({
          type: 'tr',
          content: cells.map((cell) => ({
            type: 'td',
            content: parseInline(cell.trim()),
          })),
        });
        i++;
      }
      tokens.push({ type: 'table', content: tableRows });
      continue;
    }

    // Paragraph
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('>') &&
      !lines[i].startsWith('```') &&
      !/^[-*+]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i])
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }
    if (paragraphLines.length > 0) {
      tokens.push({
        type: 'p',
        content: parseInline(paragraphLines.join('\n')),
      });
    }
  }

  return tokens;
}

function parseInline(text: string): ParsedToken[] {
  const tokens: ParsedToken[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    // Image
    const imageMatch = remaining.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imageMatch) {
      tokens.push({
        type: 'img',
        content: '',
        props: { alt: imageMatch[1], src: imageMatch[2] },
      });
      remaining = remaining.slice(imageMatch[0].length);
      continue;
    }

    // Link
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      tokens.push({
        type: 'a',
        content: linkMatch[1],
        props: { href: linkMatch[2] },
      });
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Bold
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      tokens.push({ type: 'strong', content: boldMatch[1] });
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic
    const italicMatch = remaining.match(/^\*(.+?)\*/);
    if (italicMatch) {
      tokens.push({ type: 'em', content: italicMatch[1] });
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Strikethrough
    const strikeMatch = remaining.match(/^~~(.+?)~~/);
    if (strikeMatch) {
      tokens.push({ type: 'del', content: strikeMatch[1] });
      remaining = remaining.slice(strikeMatch[0].length);
      continue;
    }

    // Inline code
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      tokens.push({ type: 'code', content: codeMatch[1] });
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Plain text
    const plainMatch = remaining.match(/^[^*`\[!~]+/);
    if (plainMatch) {
      tokens.push({ type: 'text', content: plainMatch[0] });
      remaining = remaining.slice(plainMatch[0].length);
      continue;
    }

    // Single character fallback
    tokens.push({ type: 'text', content: remaining[0] });
    remaining = remaining.slice(1);
  }

  return tokens;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ============================================================================
// Render Functions
// ============================================================================

interface RenderContext {
  enableLinks: boolean;
  enableImages: boolean;
  enableCodeBlocks: boolean;
  onLinkClick?: (href: string) => void;
  onImageClick?: (src: string, alt: string) => void;
}

function renderToken(token: ParsedToken, index: number, ctx: RenderContext): React.ReactNode {
  const key = `${token.type}-${index}`;

  switch (token.type) {
    case 'h1':
      return (
        <h1
          key={key}
          id={token.props?.id}
          className="text-3xl font-bold text-neutral-900 dark:text-white mt-8 mb-4 first:mt-0"
        >
          {renderTokens(token.content as ParsedToken[], ctx)}
        </h1>
      );
    case 'h2':
      return (
        <h2
          key={key}
          id={token.props?.id}
          className="text-2xl font-bold text-neutral-900 dark:text-white mt-6 mb-3"
        >
          {renderTokens(token.content as ParsedToken[], ctx)}
        </h2>
      );
    case 'h3':
      return (
        <h3
          key={key}
          id={token.props?.id}
          className="text-xl font-semibold text-neutral-900 dark:text-white mt-5 mb-2"
        >
          {renderTokens(token.content as ParsedToken[], ctx)}
        </h3>
      );
    case 'h4':
      return (
        <h4
          key={key}
          id={token.props?.id}
          className="text-lg font-semibold text-neutral-900 dark:text-white mt-4 mb-2"
        >
          {renderTokens(token.content as ParsedToken[], ctx)}
        </h4>
      );
    case 'h5':
      return (
        <h5
          key={key}
          id={token.props?.id}
          className="text-base font-semibold text-neutral-900 dark:text-white mt-4 mb-2"
        >
          {renderTokens(token.content as ParsedToken[], ctx)}
        </h5>
      );
    case 'h6':
      return (
        <h6
          key={key}
          id={token.props?.id}
          className="text-sm font-semibold text-neutral-900 dark:text-white mt-4 mb-2"
        >
          {renderTokens(token.content as ParsedToken[], ctx)}
        </h6>
      );
    case 'p':
      return (
        <p key={key} className="text-neutral-700 dark:text-neutral-300 mb-4 leading-relaxed">
          {renderTokens(token.content as ParsedToken[], ctx)}
        </p>
      );
    case 'blockquote':
      return (
        <blockquote
          key={key}
          className="border-l-4 border-primary-500 pl-4 my-4 italic text-neutral-600 dark:text-neutral-400"
        >
          {renderTokens(token.content as ParsedToken[], ctx)}
        </blockquote>
      );
    case 'ul':
      return (
        <ul key={key} className="list-disc list-inside mb-4 space-y-1 text-neutral-700 dark:text-neutral-300">
          {(token.content as ParsedToken[]).map((item, i) => renderToken(item, i, ctx))}
        </ul>
      );
    case 'ol':
      return (
        <ol key={key} className="list-decimal list-inside mb-4 space-y-1 text-neutral-700 dark:text-neutral-300">
          {(token.content as ParsedToken[]).map((item, i) => renderToken(item, i, ctx))}
        </ol>
      );
    case 'li':
      return (
        <li key={key}>
          {renderTokens(token.content as ParsedToken[], ctx)}
        </li>
      );
    case 'tasklist':
      return (
        <ul key={key} className="mb-4 space-y-2">
          {(token.content as ParsedToken[]).map((item, i) => renderToken(item, i, ctx))}
        </ul>
      );
    case 'task':
      return (
        <li key={key} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={token.props?.checked === 'true'}
            readOnly
            className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
          <span className={token.props?.checked === 'true' ? 'line-through text-neutral-500' : ''}>
            {renderTokens(token.content as ParsedToken[], ctx)}
          </span>
        </li>
      );
    case 'table':
      return (
        <div key={key} className="overflow-x-auto mb-4">
          <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
            {(token.content as ParsedToken[]).map((row, i) => {
              if (row.type === 'thead') {
                return (
                  <thead key={i} className="bg-neutral-50 dark:bg-neutral-800">
                    <tr>
                      {(row.content as ParsedToken[]).map((cell, j) => (
                        <th
                          key={j}
                          className="px-4 py-2 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
                        >
                          {renderTokens(cell.content as ParsedToken[], ctx)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                );
              }
              return (
                <tbody key={i} className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  <tr>
                    {(row.content as ParsedToken[]).map((cell, j) => (
                      <td
                        key={j}
                        className="px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300"
                      >
                        {renderTokens(cell.content as ParsedToken[], ctx)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              );
            })}
          </table>
        </div>
      );
    case 'codeblock':
      if (!ctx.enableCodeBlocks) {
        return (
          <pre key={key} className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg mb-4 overflow-x-auto">
            <code className="text-sm font-mono">{token.content as string}</code>
          </pre>
        );
      }
      return (
        <pre
          key={key}
          className="bg-[#282c34] text-[#abb2bf] p-4 rounded-lg mb-4 overflow-x-auto"
        >
          <code className="text-sm font-mono">{token.content as string}</code>
        </pre>
      );
    case 'hr':
      return <hr key={key} className="my-8 border-neutral-200 dark:border-neutral-700" />;
    case 'strong':
      return <strong key={key} className="font-bold">{token.content as string}</strong>;
    case 'em':
      return <em key={key} className="italic">{token.content as string}</em>;
    case 'del':
      return <del key={key} className="line-through">{token.content as string}</del>;
    case 'code':
      return (
        <code
          key={key}
          className="px-1.5 py-0.5 text-sm font-mono rounded bg-neutral-100 dark:bg-neutral-800 text-pink-600 dark:text-pink-400"
        >
          {token.content as string}
        </code>
      );
    case 'a':
      if (!ctx.enableLinks) {
        return <span key={key}>{token.content as string}</span>;
      }
      return (
        <a
          key={key}
          href={token.props?.href}
          onClick={(e) => {
            if (ctx.onLinkClick) {
              e.preventDefault();
              ctx.onLinkClick(token.props?.href || '');
            }
          }}
          className="text-primary-600 dark:text-primary-400 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {token.content as string}
        </a>
      );
    case 'img':
      if (!ctx.enableImages) {
        return <span key={key}>[Image: {token.props?.alt}]</span>;
      }
      return (
        <img
          key={key}
          src={token.props?.src}
          alt={token.props?.alt}
          onClick={() => ctx.onImageClick?.(token.props?.src || '', token.props?.alt || '')}
          className="max-w-full h-auto rounded-lg my-4 cursor-pointer"
        />
      );
    case 'text':
      return <React.Fragment key={key}>{token.content as string}</React.Fragment>;
    default:
      return null;
  }
}

function renderTokens(tokens: ParsedToken[], ctx: RenderContext): React.ReactNode {
  return tokens.map((token, i) => renderToken(token, i, ctx));
}

// ============================================================================
// Table of Contents
// ============================================================================

interface TocItem {
  id: string;
  title: string;
  level: number;
}

function extractToc(tokens: ParsedToken[]): TocItem[] {
  const toc: TocItem[] = [];

  for (const token of tokens) {
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(token.type)) {
      const level = parseInt(token.type.slice(1));
      const content = token.content as ParsedToken[];
      const title = content.map((t) => (typeof t.content === 'string' ? t.content : '')).join('');
      toc.push({
        id: token.props?.id || slugify(title),
        title,
        level,
      });
    }
  }

  return toc;
}

interface TableOfContentsProps {
  items: TocItem[];
  className?: string;
}

export function TableOfContents({ items, className }: TableOfContentsProps) {
  return (
    <nav className={cn('space-y-1', className)}>
      <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-3">
        Table of Contents
      </h4>
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={cn(
            'block text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors',
            item.level === 1 && 'font-medium',
            item.level >= 2 && `pl-${(item.level - 1) * 4}`
          )}
          style={{ paddingLeft: `${(item.level - 1) * 16}px` }}
        >
          {item.title}
        </a>
      ))}
    </nav>
  );
}

// ============================================================================
// Main Markdown Preview Component
// ============================================================================

export function MarkdownPreview({
  content,
  className,
  showTableOfContents = false,
  enableLinks = true,
  enableImages = true,
  enableCodeBlocks = true,
  onLinkClick,
  onImageClick,
}: MarkdownPreviewProps) {
  const tokens = useMemo(() => parseMarkdown(content), [content]);
  const toc = useMemo(() => extractToc(tokens), [tokens]);

  const ctx: RenderContext = {
    enableLinks,
    enableImages,
    enableCodeBlocks,
    onLinkClick,
    onImageClick,
  };

  return (
    <div className={cn('flex gap-8', className)}>
      {/* Main Content */}
      <article className="flex-1 prose prose-neutral dark:prose-invert max-w-none">
        {renderTokens(tokens, ctx)}
      </article>

      {/* Table of Contents */}
      {showTableOfContents && toc.length > 0 && (
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-4">
            <TableOfContents items={toc} />
          </div>
        </aside>
      )}
    </div>
  );
}

// ============================================================================
// Markdown Editor with Preview
// ============================================================================

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your markdown here...',
  minHeight = 300,
  maxHeight,
  showToolbar = true,
  showPreview = true,
  previewMode = 'tab',
  className,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [copied, setCopied] = useState(false);

  const handleToolbarAction = (action: string) => {
    const textarea = document.querySelector('textarea[data-markdown-editor]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    let newText = '';
    let newCursorPos = start;

    switch (action) {
      case 'bold':
        newText = `${value.substring(0, start)}**${selectedText}**${value.substring(end)}`;
        newCursorPos = end + 4;
        break;
      case 'italic':
        newText = `${value.substring(0, start)}*${selectedText}*${value.substring(end)}`;
        newCursorPos = end + 2;
        break;
      case 'h1':
        newText = `${value.substring(0, start)}# ${selectedText}${value.substring(end)}`;
        newCursorPos = end + 2;
        break;
      case 'h2':
        newText = `${value.substring(0, start)}## ${selectedText}${value.substring(end)}`;
        newCursorPos = end + 3;
        break;
      case 'h3':
        newText = `${value.substring(0, start)}### ${selectedText}${value.substring(end)}`;
        newCursorPos = end + 4;
        break;
      case 'link':
        newText = `${value.substring(0, start)}[${selectedText || 'link text'}](url)${value.substring(end)}`;
        newCursorPos = selectedText ? end + 7 : start + 1;
        break;
      case 'image':
        newText = `${value.substring(0, start)}![${selectedText || 'alt text'}](url)${value.substring(end)}`;
        newCursorPos = selectedText ? end + 8 : start + 2;
        break;
      case 'code':
        newText = `${value.substring(0, start)}\`${selectedText}\`${value.substring(end)}`;
        newCursorPos = end + 2;
        break;
      case 'codeblock':
        newText = `${value.substring(0, start)}\n\`\`\`\n${selectedText}\n\`\`\`\n${value.substring(end)}`;
        newCursorPos = start + 4;
        break;
      case 'ul':
        newText = `${value.substring(0, start)}- ${selectedText}${value.substring(end)}`;
        newCursorPos = end + 2;
        break;
      case 'ol':
        newText = `${value.substring(0, start)}1. ${selectedText}${value.substring(end)}`;
        newCursorPos = end + 3;
        break;
      case 'quote':
        newText = `${value.substring(0, start)}> ${selectedText}${value.substring(end)}`;
        newCursorPos = end + 2;
        break;
      case 'hr':
        newText = `${value.substring(0, start)}\n---\n${value.substring(end)}`;
        newCursorPos = start + 5;
        break;
      default:
        return;
    }

    onChange(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toolbarButtons = [
    { action: 'bold', icon: Bold, title: 'Bold' },
    { action: 'italic', icon: Italic, title: 'Italic' },
    { action: 'divider' },
    { action: 'h1', icon: Heading1, title: 'Heading 1' },
    { action: 'h2', icon: Heading2, title: 'Heading 2' },
    { action: 'h3', icon: Heading3, title: 'Heading 3' },
    { action: 'divider' },
    { action: 'link', icon: Link2, title: 'Link' },
    { action: 'image', icon: ImageIcon, title: 'Image' },
    { action: 'code', icon: Code, title: 'Inline Code' },
    { action: 'divider' },
    { action: 'ul', icon: List, title: 'Bullet List' },
    { action: 'ol', icon: ListOrdered, title: 'Numbered List' },
    { action: 'quote', icon: Quote, title: 'Quote' },
    { action: 'hr', icon: Minus, title: 'Horizontal Rule' },
  ];

  return (
    <div
      className={cn(
        'border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden',
        'bg-white dark:bg-neutral-900',
        className
      )}
    >
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
          <div className="flex items-center gap-1">
            {toolbarButtons.map((btn, i) =>
              btn.action === 'divider' ? (
                <div
                  key={i}
                  className="w-px h-5 bg-neutral-300 dark:bg-neutral-600 mx-1"
                />
              ) : (
                <button
                  key={btn.action}
                  onClick={() => handleToolbarAction(btn.action)}
                  className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
                  title={btn.title}
                >
                  {btn.icon && <btn.icon className="w-4 h-4" />}
                </button>
              )
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Copy */}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
              title={copied ? 'Copied!' : 'Copy markdown'}
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Preview Toggle */}
            {showPreview && previewMode === 'tab' && (
              <div className="flex items-center gap-1 p-0.5 bg-neutral-200 dark:bg-neutral-700 rounded">
                <button
                  onClick={() => setActiveTab('write')}
                  className={cn(
                    'px-2 py-1 text-xs rounded transition-colors',
                    activeTab === 'write'
                      ? 'bg-white dark:bg-neutral-600 text-neutral-900 dark:text-white shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400'
                  )}
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={cn(
                    'px-2 py-1 text-xs rounded transition-colors',
                    activeTab === 'preview'
                      ? 'bg-white dark:bg-neutral-600 text-neutral-900 dark:text-white shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400'
                  )}
                >
                  <Eye className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div
        className={cn(
          'flex',
          previewMode === 'side' && showPreview ? 'divide-x divide-neutral-200 dark:divide-neutral-700' : ''
        )}
      >
        {/* Editor */}
        {(previewMode === 'side' || activeTab === 'write') && (
          <div className={cn('flex-1', previewMode === 'side' && showPreview && 'w-1/2')}>
            <textarea
              data-markdown-editor
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className={cn(
                'w-full p-4 resize-none font-mono text-sm',
                'bg-transparent text-neutral-900 dark:text-white',
                'placeholder:text-neutral-400',
                'focus:outline-none'
              )}
              style={{
                minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
                maxHeight: maxHeight ? (typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight) : undefined,
              }}
            />
          </div>
        )}

        {/* Preview */}
        {showPreview && (previewMode === 'side' || activeTab === 'preview') && (
          <div
            className={cn(
              'flex-1 p-4 overflow-auto',
              previewMode === 'side' && 'w-1/2'
            )}
            style={{
              minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
              maxHeight: maxHeight ? (typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight) : undefined,
            }}
          >
            {value ? (
              <MarkdownPreview content={value} />
            ) : (
              <p className="text-neutral-400 italic">Nothing to preview</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MarkdownPreview;
