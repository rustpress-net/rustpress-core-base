/**
 * RustPress Rich Text Editor Component
 * WYSIWYG content editing with formatting toolbar
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link,
  Image,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Maximize2,
  Minimize2,
  Eye,
  Code2,
  Type,
  Palette,
  MoreHorizontal,
  X,
  Check,
  Upload,
} from 'lucide-react';
import { cn } from '../utils';
import { Button, IconButton } from './Button';
import { Input } from './Input';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
} from './Dropdown';

export interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  minHeight?: number | string;
  maxHeight?: number | string;
  readOnly?: boolean;
  showToolbar?: boolean;
  toolbarPosition?: 'top' | 'bottom' | 'floating';
  features?: EditorFeature[];
  onImageUpload?: (file: File) => Promise<string>;
  className?: string;
}

export type EditorFeature =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'heading'
  | 'alignment'
  | 'list'
  | 'link'
  | 'image'
  | 'code'
  | 'quote'
  | 'color'
  | 'undo'
  | 'fullscreen'
  | 'preview'
  | 'source';

const defaultFeatures: EditorFeature[] = [
  'bold',
  'italic',
  'underline',
  'heading',
  'alignment',
  'list',
  'link',
  'image',
  'code',
  'quote',
  'undo',
  'fullscreen',
  'preview',
];

export function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Start writing...',
  minHeight = 200,
  maxHeight = 600,
  readOnly = false,
  showToolbar = true,
  toolbarPosition = 'top',
  features = defaultFeatures,
  onImageUpload,
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [isSourceView, setIsSourceView] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Execute command
  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }, []);

  // Format commands
  const formatBold = () => execCommand('bold');
  const formatItalic = () => execCommand('italic');
  const formatUnderline = () => execCommand('underline');
  const formatStrikethrough = () => execCommand('strikethrough');

  const formatHeading = (level: number) => {
    execCommand('formatBlock', `h${level}`);
  };

  const formatParagraph = () => {
    execCommand('formatBlock', 'p');
  };

  const formatAlignment = (align: string) => {
    execCommand(`justify${align}`);
  };

  const formatList = (ordered: boolean) => {
    execCommand(ordered ? 'insertOrderedList' : 'insertUnorderedList');
  };

  const formatCode = () => {
    execCommand('formatBlock', 'pre');
  };

  const formatQuote = () => {
    execCommand('formatBlock', 'blockquote');
  };

  const insertLink = () => {
    if (linkUrl) {
      const selection = window.getSelection();
      const text = linkText || selection?.toString() || linkUrl;
      execCommand('insertHTML', `<a href="${linkUrl}" target="_blank">${text}</a>`);
      setShowLinkModal(false);
      setLinkUrl('');
      setLinkText('');
    }
  };

  const insertImage = async () => {
    if (imageUrl) {
      execCommand('insertHTML', `<img src="${imageUrl}" alt="${imageAlt}" style="max-width: 100%;" />`);
      setShowImageModal(false);
      setImageUrl('');
      setImageAlt('');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      const url = await onImageUpload(file);
      setImageUrl(url);
    }
  };

  const handleUndo = () => execCommand('undo');
  const handleRedo = () => execCommand('redo');

  // Handle content change
  const handleInput = useCallback(() => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Handle paste (clean HTML)
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    execCommand('insertText', text);
  }, [execCommand]);

  // Render toolbar button
  const ToolbarButton = ({
    icon: Icon,
    onClick,
    active,
    disabled,
    title,
  }: {
    icon: React.ElementType;
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || readOnly}
      title={title}
      className={cn(
        'p-1.5 rounded transition-colors',
        'hover:bg-neutral-100 dark:hover:bg-neutral-700',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        active && 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
      )}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  // Toolbar separator
  const ToolbarSeparator = () => (
    <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-1" />
  );

  // Render toolbar
  const renderToolbar = () => (
    <div
      className={cn(
        'flex items-center flex-wrap gap-0.5 p-2',
        'bg-neutral-50 dark:bg-neutral-800/50',
        'border-b border-neutral-200 dark:border-neutral-700',
        toolbarPosition === 'bottom' && 'border-b-0 border-t'
      )}
    >
      {/* Text formatting */}
      {features.includes('bold') && (
        <ToolbarButton icon={Bold} onClick={formatBold} title="Bold (Ctrl+B)" />
      )}
      {features.includes('italic') && (
        <ToolbarButton icon={Italic} onClick={formatItalic} title="Italic (Ctrl+I)" />
      )}
      {features.includes('underline') && (
        <ToolbarButton icon={Underline} onClick={formatUnderline} title="Underline (Ctrl+U)" />
      )}
      {features.includes('strikethrough') && (
        <ToolbarButton icon={Strikethrough} onClick={formatStrikethrough} title="Strikethrough" />
      )}

      {(features.includes('bold') || features.includes('italic')) && <ToolbarSeparator />}

      {/* Headings */}
      {features.includes('heading') && (
        <Dropdown>
          <DropdownTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 px-2 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
            >
              <Type className="w-4 h-4" />
              <span className="text-xs">Heading</span>
            </button>
          </DropdownTrigger>
          <DropdownMenu>
            <DropdownItem onClick={formatParagraph}>
              <Type className="w-4 h-4 mr-2" />
              Paragraph
            </DropdownItem>
            <DropdownItem onClick={() => formatHeading(1)}>
              <Heading1 className="w-4 h-4 mr-2" />
              Heading 1
            </DropdownItem>
            <DropdownItem onClick={() => formatHeading(2)}>
              <Heading2 className="w-4 h-4 mr-2" />
              Heading 2
            </DropdownItem>
            <DropdownItem onClick={() => formatHeading(3)}>
              <Heading3 className="w-4 h-4 mr-2" />
              Heading 3
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      )}

      {/* Alignment */}
      {features.includes('alignment') && (
        <>
          <ToolbarSeparator />
          <ToolbarButton icon={AlignLeft} onClick={() => formatAlignment('Left')} title="Align Left" />
          <ToolbarButton icon={AlignCenter} onClick={() => formatAlignment('Center')} title="Align Center" />
          <ToolbarButton icon={AlignRight} onClick={() => formatAlignment('Right')} title="Align Right" />
          <ToolbarButton icon={AlignJustify} onClick={() => formatAlignment('Full')} title="Justify" />
        </>
      )}

      {/* Lists */}
      {features.includes('list') && (
        <>
          <ToolbarSeparator />
          <ToolbarButton icon={List} onClick={() => formatList(false)} title="Bullet List" />
          <ToolbarButton icon={ListOrdered} onClick={() => formatList(true)} title="Numbered List" />
        </>
      )}

      {/* Links & Images */}
      {(features.includes('link') || features.includes('image')) && <ToolbarSeparator />}
      {features.includes('link') && (
        <ToolbarButton icon={Link} onClick={() => setShowLinkModal(true)} title="Insert Link" />
      )}
      {features.includes('image') && (
        <ToolbarButton icon={Image} onClick={() => setShowImageModal(true)} title="Insert Image" />
      )}

      {/* Code & Quote */}
      {(features.includes('code') || features.includes('quote')) && <ToolbarSeparator />}
      {features.includes('code') && (
        <ToolbarButton icon={Code} onClick={formatCode} title="Code Block" />
      )}
      {features.includes('quote') && (
        <ToolbarButton icon={Quote} onClick={formatQuote} title="Blockquote" />
      )}

      {/* Undo/Redo */}
      {features.includes('undo') && (
        <>
          <ToolbarSeparator />
          <ToolbarButton icon={Undo} onClick={handleUndo} title="Undo (Ctrl+Z)" />
          <ToolbarButton icon={Redo} onClick={handleRedo} title="Redo (Ctrl+Y)" />
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* View modes */}
      {features.includes('source') && (
        <ToolbarButton
          icon={Code2}
          onClick={() => setIsSourceView(!isSourceView)}
          active={isSourceView}
          title="Source View"
        />
      )}
      {features.includes('preview') && (
        <ToolbarButton
          icon={Eye}
          onClick={() => setIsPreview(!isPreview)}
          active={isPreview}
          title="Preview"
        />
      )}
      {features.includes('fullscreen') && (
        <ToolbarButton
          icon={isFullscreen ? Minimize2 : Maximize2}
          onClick={() => setIsFullscreen(!isFullscreen)}
          active={isFullscreen}
          title="Fullscreen"
        />
      )}
    </div>
  );

  const containerClass = cn(
    'rounded-xl border border-neutral-200 dark:border-neutral-700',
    'bg-white dark:bg-neutral-900',
    'overflow-hidden',
    isFullscreen && 'fixed inset-4 z-50 flex flex-col',
    isFocused && 'ring-2 ring-primary-500 border-transparent',
    className
  );

  const editorClass = cn(
    'prose prose-sm dark:prose-invert max-w-none',
    'p-4 outline-none',
    'overflow-y-auto',
    readOnly && 'cursor-default'
  );

  return (
    <>
      <div className={containerClass}>
        {showToolbar && toolbarPosition === 'top' && renderToolbar()}

        {/* Editor content */}
        {isSourceView ? (
          <textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className={cn(
              'w-full p-4 bg-neutral-900 text-neutral-100 font-mono text-sm',
              'outline-none resize-none'
            )}
            style={{
              minHeight: isFullscreen ? undefined : minHeight,
              maxHeight: isFullscreen ? undefined : maxHeight,
              height: isFullscreen ? '100%' : undefined,
            }}
            readOnly={readOnly}
          />
        ) : isPreview ? (
          <div
            className={editorClass}
            style={{
              minHeight: isFullscreen ? undefined : minHeight,
              maxHeight: isFullscreen ? undefined : maxHeight,
              height: isFullscreen ? '100%' : undefined,
            }}
            dangerouslySetInnerHTML={{ __html: value }}
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable={!readOnly}
            onInput={handleInput}
            onPaste={handlePaste}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={editorClass}
            style={{
              minHeight: isFullscreen ? undefined : minHeight,
              maxHeight: isFullscreen ? undefined : maxHeight,
              height: isFullscreen ? '100%' : undefined,
            }}
            data-placeholder={placeholder}
            suppressContentEditableWarning
          />
        )}

        {showToolbar && toolbarPosition === 'bottom' && renderToolbar()}
      </div>

      {/* Fullscreen backdrop */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsFullscreen(false)}
        />
      )}

      {/* Link Modal */}
      <AnimatePresence>
        {showLinkModal && (
          <LinkModal
            linkUrl={linkUrl}
            setLinkUrl={setLinkUrl}
            linkText={linkText}
            setLinkText={setLinkText}
            onInsert={insertLink}
            onClose={() => setShowLinkModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <ImageModal
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            imageAlt={imageAlt}
            setImageAlt={setImageAlt}
            onUpload={handleImageUpload}
            onInsert={insertImage}
            onClose={() => setShowImageModal(false)}
            showUpload={!!onImageUpload}
          />
        )}
      </AnimatePresence>

      {/* Styles for placeholder */}
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </>
  );
}

// Link Modal
interface LinkModalProps {
  linkUrl: string;
  setLinkUrl: (url: string) => void;
  linkText: string;
  setLinkText: (text: string) => void;
  onInsert: () => void;
  onClose: () => void;
}

function LinkModal({
  linkUrl,
  setLinkUrl,
  linkText,
  setLinkText,
  onInsert,
  onClose,
}: LinkModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl p-6 w-96"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-neutral-900 dark:text-white">Insert Link</h3>
          <IconButton variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </IconButton>
        </div>

        <div className="space-y-4">
          <Input
            label="URL"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://"
            autoFocus
          />
          <Input
            label="Text (optional)"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            placeholder="Link text"
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onInsert} disabled={!linkUrl}>
            <Check className="w-4 h-4 mr-2" />
            Insert Link
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Image Modal
interface ImageModalProps {
  imageUrl: string;
  setImageUrl: (url: string) => void;
  imageAlt: string;
  setImageAlt: (alt: string) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInsert: () => void;
  onClose: () => void;
  showUpload: boolean;
}

function ImageModal({
  imageUrl,
  setImageUrl,
  imageAlt,
  setImageAlt,
  onUpload,
  onInsert,
  onClose,
  showUpload,
}: ImageModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl p-6 w-96"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-neutral-900 dark:text-white">Insert Image</h3>
          <IconButton variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </IconButton>
        </div>

        <div className="space-y-4">
          {showUpload && (
            <>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg',
                  'p-6 text-center cursor-pointer',
                  'hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/20',
                  'transition-colors'
                )}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Click to upload an image
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onUpload}
                  className="hidden"
                />
              </div>
              <div className="text-center text-sm text-neutral-500">or</div>
            </>
          )}

          <Input
            label="Image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://"
          />
          <Input
            label="Alt Text"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            placeholder="Image description"
          />

          {imageUrl && (
            <div className="p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <img
                src={imageUrl}
                alt={imageAlt || 'Preview'}
                className="max-h-32 mx-auto rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" x="50" text-anchor="middle" dominant-baseline="middle" font-size="14">Invalid URL</text></svg>';
                }}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onInsert} disabled={!imageUrl}>
            <Check className="w-4 h-4 mr-2" />
            Insert Image
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Simple text area variant
export interface SimpleEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function SimpleEditor({
  value,
  onChange,
  placeholder,
  rows = 4,
  className,
}: SimpleEditorProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={cn(
        'w-full px-3 py-2 rounded-lg border',
        'border-neutral-300 dark:border-neutral-600',
        'bg-white dark:bg-neutral-800',
        'text-neutral-900 dark:text-white',
        'placeholder:text-neutral-400',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
        'resize-y',
        className
      )}
    />
  );
}

export default RichTextEditor;
