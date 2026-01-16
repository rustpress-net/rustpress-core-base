import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit3,
  Copy,
  Trash2,
  EyeOff,
  Eye,
  MoveUp,
  MoveDown,
  Settings,
  Type,
  Image,
  Code,
  List,
  Quote,
  Table,
  Video,
  Link,
  MoreVertical,
  Plus,
  GripVertical,
  ChevronDown,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  X,
  Check,
  Palette,
  Layers
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface Block {
  id: string;
  type: 'heading' | 'paragraph' | 'image' | 'list' | 'quote' | 'code' | 'table' | 'video' | 'embed' | 'div' | 'custom';
  content: string;
  tag: string;
  attributes: Record<string, string>;
  isHidden: boolean;
  isSelected: boolean;
}

interface RealTimeEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
}

// Parse HTML string into blocks
function parseHtmlToBlocks(html: string): Block[] {
  if (!html.trim()) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const container = doc.body.firstChild as HTMLElement;

  if (!container) return [];

  const blocks: Block[] = [];

  const processNode = (node: Node, depth: number = 0) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        blocks.push({
          id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'paragraph',
          content: text,
          tag: 'p',
          attributes: {},
          isHidden: false,
          isSelected: false,
        });
      }
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();

    // Get attributes
    const attributes: Record<string, string> = {};
    for (const attr of Array.from(element.attributes)) {
      attributes[attr.name] = attr.value;
    }

    // Determine block type
    let blockType: Block['type'] = 'custom';
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
      blockType = 'heading';
    } else if (tagName === 'p') {
      blockType = 'paragraph';
    } else if (tagName === 'img') {
      blockType = 'image';
    } else if (['ul', 'ol'].includes(tagName)) {
      blockType = 'list';
    } else if (tagName === 'blockquote') {
      blockType = 'quote';
    } else if (['pre', 'code'].includes(tagName)) {
      blockType = 'code';
    } else if (tagName === 'table') {
      blockType = 'table';
    } else if (['video', 'iframe'].includes(tagName)) {
      blockType = 'video';
    } else if (tagName === 'a') {
      blockType = 'embed';
    } else if (tagName === 'div') {
      blockType = 'div';
    }

    // For container elements, we might want to process children
    if (['div', 'section', 'article', 'main', 'header', 'footer'].includes(tagName) && element.children.length > 0) {
      // Process children as separate blocks
      Array.from(element.childNodes).forEach(child => processNode(child, depth + 1));
    } else {
      blocks.push({
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: blockType,
        content: element.outerHTML,
        tag: tagName,
        attributes,
        isHidden: false,
        isSelected: false,
      });
    }
  };

  Array.from(container.childNodes).forEach(node => processNode(node));

  return blocks;
}

// Convert blocks back to HTML
function blocksToHtml(blocks: Block[]): string {
  return blocks
    .filter(block => !block.isHidden)
    .map(block => block.content)
    .join('\n');
}

// Get icon for block type
function getBlockIcon(type: Block['type'], tag: string) {
  switch (type) {
    case 'heading':
      if (tag === 'h1') return Heading1;
      if (tag === 'h2') return Heading2;
      if (tag === 'h3') return Heading3;
      return Type;
    case 'paragraph':
      return AlignLeft;
    case 'image':
      return Image;
    case 'list':
      return List;
    case 'quote':
      return Quote;
    case 'code':
      return Code;
    case 'table':
      return Table;
    case 'video':
      return Video;
    case 'embed':
      return Link;
    case 'div':
      return Layers;
    default:
      return Code;
  }
}

// Get block type label
function getBlockLabel(type: Block['type'], tag: string): string {
  switch (type) {
    case 'heading':
      return tag.toUpperCase();
    case 'paragraph':
      return 'Paragraph';
    case 'image':
      return 'Image';
    case 'list':
      return tag === 'ul' ? 'Unordered List' : 'Ordered List';
    case 'quote':
      return 'Quote';
    case 'code':
      return 'Code Block';
    case 'table':
      return 'Table';
    case 'video':
      return 'Video';
    case 'embed':
      return 'Embed';
    case 'div':
      return 'Container';
    default:
      return 'Custom Block';
  }
}

// Block Menu Component
function BlockMenu({
  block,
  onEdit,
  onDuplicate,
  onRemove,
  onToggleHide,
  onMoveUp,
  onMoveDown,
  onClose,
  canMoveUp,
  canMoveDown
}: {
  block: Block;
  onEdit: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onToggleHide: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onClose: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const menuItems = [
    { icon: Edit3, label: 'Edit Block', action: onEdit, color: 'text-blue-600 dark:text-blue-400' },
    { icon: Copy, label: 'Duplicate', action: onDuplicate, color: 'text-green-600 dark:text-green-400' },
    { icon: block.isHidden ? Eye : EyeOff, label: block.isHidden ? 'Show' : 'Hide', action: onToggleHide, color: 'text-amber-600 dark:text-amber-400' },
    { icon: MoveUp, label: 'Move Up', action: onMoveUp, disabled: !canMoveUp, color: 'text-purple-600 dark:text-purple-400' },
    { icon: MoveDown, label: 'Move Down', action: onMoveDown, disabled: !canMoveDown, color: 'text-purple-600 dark:text-purple-400' },
    { icon: Trash2, label: 'Remove', action: onRemove, color: 'text-red-600 dark:text-red-400', danger: true },
  ];

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className="absolute right-0 top-full mt-1 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[180px]"
    >
      <div className="p-1">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => {
                if (!item.disabled) {
                  item.action();
                  onClose();
                }
              }}
              disabled={item.disabled}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                item.disabled
                  ? 'opacity-40 cursor-not-allowed text-gray-400'
                  : item.danger
                  ? 'hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-200'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
              )}
            >
              <Icon size={16} className={item.color} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

// Block Editor Modal
function BlockEditor({
  block,
  onSave,
  onClose
}: {
  block: Block;
  onSave: (content: string) => void;
  onClose: () => void;
}) {
  const [editedContent, setEditedContent] = useState(block.content);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {React.createElement(getBlockIcon(block.type, block.tag), { size: 20, className: 'text-blue-600' })}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit {getBlockLabel(block.type, block.tag)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Block HTML Content
          </label>
          <textarea
            value={editedContent}
            onChange={e => setEditedContent(e.target.value)}
            className="w-full h-64 px-4 py-3 font-mono text-sm bg-gray-900 text-gray-100 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            spellCheck={false}
          />

          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</p>
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: editedContent }}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(editedContent);
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Check size={16} />
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Add Block Menu with 30+ blocks, search, and categories
function AddBlockMenu({ onAdd, onClose }: { onAdd: (type: string) => void; onClose: () => void }) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const blockTypes = [
    // Text & Typography (11)
    { type: 'heading-1', label: 'Heading 1', icon: Heading1, category: 'Text', template: '<h1>Heading 1</h1>', shortcuts: ['H1', 'h1', 'title'] },
    { type: 'heading-2', label: 'Heading 2', icon: Heading2, category: 'Text', template: '<h2>Heading 2</h2>', shortcuts: ['H2', 'h2', 'section'] },
    { type: 'heading-3', label: 'Heading 3', icon: Heading3, category: 'Text', template: '<h3>Heading 3</h3>', shortcuts: ['H3', 'h3', 'subsection'] },
    { type: 'heading-4', label: 'Heading 4', icon: Type, category: 'Text', template: '<h4>Heading 4</h4>', shortcuts: ['H4', 'h4'] },
    { type: 'heading-5', label: 'Heading 5', icon: Type, category: 'Text', template: '<h5>Heading 5</h5>', shortcuts: ['H5', 'h5'] },
    { type: 'heading-6', label: 'Heading 6', icon: Type, category: 'Text', template: '<h6>Heading 6</h6>', shortcuts: ['H6', 'h6'] },
    { type: 'paragraph', label: 'Paragraph', icon: AlignLeft, category: 'Text', template: '<p>New paragraph text...</p>', shortcuts: ['P', 'p', 'para', 'text'] },
    { type: 'lead', label: 'Lead Text', icon: Type, category: 'Text', template: '<p class="lead" style="font-size: 1.25rem; font-weight: 300;">Lead paragraph with larger text...</p>', shortcuts: ['lead', 'intro'] },
    { type: 'dropcap', label: 'Drop Cap', icon: Type, category: 'Text', template: '<p><span style="float: left; font-size: 4rem; line-height: 1; margin-right: 0.5rem; font-weight: bold;">T</span>his paragraph starts with a decorative drop cap letter.</p>', shortcuts: ['drop', 'cap', 'initial'] },
    { type: 'highlight', label: 'Highlight', icon: Type, category: 'Text', template: '<p><mark style="background: #fef08a; padding: 0.125rem 0.25rem;">Highlighted text</mark></p>', shortcuts: ['mark', 'highlight', 'hl'] },
    { type: 'blockquote', label: 'Quote', icon: Quote, category: 'Text', template: '<blockquote style="border-left: 4px solid #3b82f6; padding-left: 1rem; font-style: italic;">\n  Quote text here...\n  <cite style="display: block; margin-top: 0.5rem; font-size: 0.875rem;">— Author Name</cite>\n</blockquote>', shortcuts: ['quote', 'blockquote', 'bq', 'cite'] },

    // Media (6)
    { type: 'image', label: 'Image', icon: Image, category: 'Media', template: '<figure>\n  <img src="/placeholder.jpg" alt="Image description" style="max-width: 100%; height: auto; border-radius: 8px;" />\n  <figcaption style="text-align: center; font-size: 0.875rem; color: #666; margin-top: 0.5rem;">Image caption</figcaption>\n</figure>', shortcuts: ['img', 'image', 'photo', 'picture', 'fig'] },
    { type: 'gallery', label: 'Gallery', icon: Image, category: 'Media', template: '<div class="gallery" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">\n  <img src="/image1.jpg" alt="Gallery 1" style="width: 100%; border-radius: 8px;" />\n  <img src="/image2.jpg" alt="Gallery 2" style="width: 100%; border-radius: 8px;" />\n  <img src="/image3.jpg" alt="Gallery 3" style="width: 100%; border-radius: 8px;" />\n</div>', shortcuts: ['gallery', 'grid', 'photos'] },
    { type: 'video', label: 'Video', icon: Video, category: 'Media', template: '<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px;">\n  <iframe src="https://www.youtube.com/embed/VIDEO_ID" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allowfullscreen></iframe>\n</div>', shortcuts: ['video', 'youtube', 'yt', 'vimeo', 'embed'] },
    { type: 'audio', label: 'Audio', icon: Video, category: 'Media', template: '<audio controls style="width: 100%;">\n  <source src="/audio.mp3" type="audio/mpeg">\n  Your browser does not support audio.\n</audio>', shortcuts: ['audio', 'mp3', 'sound', 'music', 'podcast'] },
    { type: 'embed', label: 'Embed', icon: Link, category: 'Media', template: '<iframe src="https://example.com" width="100%" height="400" frameborder="0" style="border-radius: 8px;"></iframe>', shortcuts: ['embed', 'iframe', 'widget'] },
    { type: 'file', label: 'File Download', icon: Link, category: 'Media', template: '<a href="/file.pdf" download style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: #f3f4f6; border-radius: 8px; text-decoration: none; color: #374151;">\n  📄 Download File (PDF, 2.5MB)\n</a>', shortcuts: ['file', 'download', 'pdf', 'attachment'] },

    // Lists (4)
    { type: 'ul', label: 'Bullet List', icon: List, category: 'Lists', template: '<ul style="padding-left: 1.5rem;">\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n</ul>', shortcuts: ['UL', 'ul', 'bullet', 'unordered', 'bullets'] },
    { type: 'ol', label: 'Numbered List', icon: List, category: 'Lists', template: '<ol style="padding-left: 1.5rem;">\n  <li>First item</li>\n  <li>Second item</li>\n  <li>Third item</li>\n</ol>', shortcuts: ['OL', 'ol', 'numbered', 'ordered', 'numbers'] },
    { type: 'checklist', label: 'Checklist', icon: List, category: 'Lists', template: '<ul style="list-style: none; padding: 0;">\n  <li>✅ Completed task</li>\n  <li>⬜ Pending task</li>\n  <li>⬜ Another task</li>\n</ul>', shortcuts: ['check', 'todo', 'task', 'checkbox'] },
    { type: 'definition', label: 'Definition List', icon: List, category: 'Lists', template: '<dl>\n  <dt style="font-weight: bold;">Term 1</dt>\n  <dd style="margin-left: 1rem; color: #666;">Definition for term 1</dd>\n  <dt style="font-weight: bold; margin-top: 1rem;">Term 2</dt>\n  <dd style="margin-left: 1rem; color: #666;">Definition for term 2</dd>\n</dl>', shortcuts: ['DL', 'dl', 'definition', 'terms', 'glossary'] },

    // Layout (6)
    { type: 'columns-2', label: '2 Columns', icon: Layers, category: 'Layout', template: '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">\n  <div>\n    <h3>Column 1</h3>\n    <p>Content for the first column.</p>\n  </div>\n  <div>\n    <h3>Column 2</h3>\n    <p>Content for the second column.</p>\n  </div>\n</div>', shortcuts: ['2col', 'twocol', 'columns2', 'split'] },
    { type: 'columns-3', label: '3 Columns', icon: Layers, category: 'Layout', template: '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem;">\n  <div><h3>Column 1</h3><p>Content here.</p></div>\n  <div><h3>Column 2</h3><p>Content here.</p></div>\n  <div><h3>Column 3</h3><p>Content here.</p></div>\n</div>', shortcuts: ['3col', 'threecol', 'columns3'] },
    { type: 'card', label: 'Card', icon: Layers, category: 'Layout', template: '<div style="border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">\n  <img src="/placeholder.jpg" alt="Card" style="width: 100%; height: 200px; object-fit: cover;" />\n  <div style="padding: 1.5rem;">\n    <h3 style="margin: 0 0 0.5rem;">Card Title</h3>\n    <p style="color: #666; margin: 0;">Card description goes here.</p>\n  </div>\n</div>', shortcuts: ['card', 'box', 'panel'] },
    { type: 'hero', label: 'Hero Section', icon: Layers, category: 'Layout', template: '<section style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4rem 2rem; text-align: center; border-radius: 12px;">\n  <h1 style="font-size: 2.5rem; margin: 0 0 1rem;">Hero Title</h1>\n  <p style="font-size: 1.25rem; margin: 0 0 2rem; opacity: 0.9;">Subtitle text goes here.</p>\n  <a href="#" style="display: inline-block; padding: 1rem 2rem; background: white; color: #667eea; text-decoration: none; border-radius: 8px; font-weight: bold;">Call to Action</a>\n</section>', shortcuts: ['hero', 'banner', 'jumbotron', 'header'] },
    { type: 'divider', label: 'Divider', icon: Layers, category: 'Layout', template: '<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0;" />', shortcuts: ['hr', 'divider', 'line', 'separator'] },
    { type: 'spacer', label: 'Spacer', icon: Layers, category: 'Layout', template: '<div style="height: 4rem;"></div>', shortcuts: ['spacer', 'space', 'gap', 'margin'] },

    // Data (4)
    { type: 'table', label: 'Table', icon: Table, category: 'Data', template: '<table style="width: 100%; border-collapse: collapse;">\n  <thead>\n    <tr style="background: #f3f4f6;">\n      <th style="border: 1px solid #e5e7eb; padding: 12px; text-align: left;">Header 1</th>\n      <th style="border: 1px solid #e5e7eb; padding: 12px; text-align: left;">Header 2</th>\n      <th style="border: 1px solid #e5e7eb; padding: 12px; text-align: left;">Header 3</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td style="border: 1px solid #e5e7eb; padding: 12px;">Cell 1</td>\n      <td style="border: 1px solid #e5e7eb; padding: 12px;">Cell 2</td>\n      <td style="border: 1px solid #e5e7eb; padding: 12px;">Cell 3</td>\n    </tr>\n  </tbody>\n</table>', shortcuts: ['table', 'grid', 'data', 'spreadsheet'] },
    { type: 'pricing', label: 'Pricing Table', icon: Table, category: 'Data', template: '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">\n  <div style="border: 1px solid #e5e7eb; padding: 2rem; text-align: center; border-radius: 12px;">\n    <h3>Basic</h3>\n    <p style="font-size: 2rem; font-weight: bold;">$9/mo</p>\n    <ul style="list-style: none; padding: 0; margin: 1rem 0;"><li>Feature 1</li><li>Feature 2</li></ul>\n    <a href="#" style="display: block; padding: 0.75rem; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px;">Choose</a>\n  </div>\n  <div style="border: 2px solid #3b82f6; padding: 2rem; text-align: center; border-radius: 12px;">\n    <h3>Pro</h3>\n    <p style="font-size: 2rem; font-weight: bold;">$29/mo</p>\n    <ul style="list-style: none; padding: 0; margin: 1rem 0;"><li>All Basic +</li><li>Feature 3</li></ul>\n    <a href="#" style="display: block; padding: 0.75rem; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px;">Choose</a>\n  </div>\n  <div style="border: 1px solid #e5e7eb; padding: 2rem; text-align: center; border-radius: 12px;">\n    <h3>Enterprise</h3>\n    <p style="font-size: 2rem; font-weight: bold;">$99/mo</p>\n    <ul style="list-style: none; padding: 0; margin: 1rem 0;"><li>All Pro +</li><li>Priority</li></ul>\n    <a href="#" style="display: block; padding: 0.75rem; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px;">Contact</a>\n  </div>\n</div>', shortcuts: ['pricing', 'price', 'plans', 'tiers'] },
    { type: 'stats', label: 'Statistics', icon: Table, category: 'Data', template: '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; text-align: center;">\n  <div style="padding: 1.5rem; background: #f3f4f6; border-radius: 12px;">\n    <div style="font-size: 2rem; font-weight: bold; color: #3b82f6;">100+</div>\n    <div style="color: #666;">Customers</div>\n  </div>\n  <div style="padding: 1.5rem; background: #f3f4f6; border-radius: 12px;">\n    <div style="font-size: 2rem; font-weight: bold; color: #10b981;">50K</div>\n    <div style="color: #666;">Downloads</div>\n  </div>\n  <div style="padding: 1.5rem; background: #f3f4f6; border-radius: 12px;">\n    <div style="font-size: 2rem; font-weight: bold; color: #f59e0b;">99%</div>\n    <div style="color: #666;">Uptime</div>\n  </div>\n  <div style="padding: 1.5rem; background: #f3f4f6; border-radius: 12px;">\n    <div style="font-size: 2rem; font-weight: bold; color: #8b5cf6;">24/7</div>\n    <div style="color: #666;">Support</div>\n  </div>\n</div>', shortcuts: ['stats', 'statistics', 'numbers', 'metrics', 'kpi'] },
    { type: 'progress', label: 'Progress Bar', icon: Table, category: 'Data', template: '<div style="margin: 1rem 0;">\n  <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;"><span>Progress</span><span>75%</span></div>\n  <div style="background: #e5e7eb; border-radius: 9999px; overflow: hidden;">\n    <div style="width: 75%; height: 8px; background: linear-gradient(90deg, #3b82f6, #8b5cf6);"></div>\n  </div>\n</div>', shortcuts: ['progress', 'bar', 'loading', 'percent'] },

    // Alerts & Callouts (5)
    { type: 'alert-info', label: 'Info Alert', icon: Code, category: 'Alerts', template: '<div style="padding: 1rem; background: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 4px; color: #1e40af;">\n  <strong>ℹ️ Info:</strong> This is an informational message.\n</div>', shortcuts: ['info', 'note', 'notice'] },
    { type: 'alert-success', label: 'Success Alert', icon: Code, category: 'Alerts', template: '<div style="padding: 1rem; background: #dcfce7; border-left: 4px solid #22c55e; border-radius: 4px; color: #166534;">\n  <strong>✅ Success:</strong> Operation completed successfully.\n</div>', shortcuts: ['success', 'done', 'complete', 'ok'] },
    { type: 'alert-warning', label: 'Warning Alert', icon: Code, category: 'Alerts', template: '<div style="padding: 1rem; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; color: #92400e;">\n  <strong>⚠️ Warning:</strong> Please review before proceeding.\n</div>', shortcuts: ['warning', 'warn', 'caution', 'attention'] },
    { type: 'alert-error', label: 'Error Alert', icon: Code, category: 'Alerts', template: '<div style="padding: 1rem; background: #fee2e2; border-left: 4px solid #ef4444; border-radius: 4px; color: #991b1b;">\n  <strong>❌ Error:</strong> Something went wrong.\n</div>', shortcuts: ['error', 'danger', 'fail', 'alert'] },
    { type: 'tip', label: 'Pro Tip', icon: Code, category: 'Alerts', template: '<div style="padding: 1rem; background: #f3e8ff; border-left: 4px solid #a855f7; border-radius: 4px; color: #6b21a8;">\n  <strong>💡 Pro Tip:</strong> Here\'s a helpful tip for you.\n</div>', shortcuts: ['tip', 'hint', 'pro', 'advice'] },

    // Code (3)
    { type: 'code', label: 'Code Block', icon: Code, category: 'Code', template: '<pre style="background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 8px; overflow-x: auto;"><code>// Your code here\nfunction example() {\n  return true;\n}</code></pre>', shortcuts: ['code', 'pre', 'snippet', 'syntax'] },
    { type: 'code-inline', label: 'Inline Code', icon: Code, category: 'Code', template: '<p>Use <code style="background: #f3f4f6; padding: 0.125rem 0.375rem; border-radius: 4px; font-family: monospace;">inlineCode()</code> in your text.</p>', shortcuts: ['inline', 'backtick', 'mono'] },
    { type: 'terminal', label: 'Terminal', icon: Code, category: 'Code', template: '<div style="background: #1a1a2e; border-radius: 8px; overflow: hidden;">\n  <div style="background: #16213e; padding: 0.5rem 1rem; display: flex; gap: 0.5rem;">\n    <span style="width: 12px; height: 12px; background: #ff5f56; border-radius: 50%;"></span>\n    <span style="width: 12px; height: 12px; background: #ffbd2e; border-radius: 50%;"></span>\n    <span style="width: 12px; height: 12px; background: #27ca40; border-radius: 50%;"></span>\n  </div>\n  <pre style="color: #0f0; padding: 1rem; margin: 0; font-family: monospace;">$ npm install package-name\n$ npm run dev</pre>\n</div>', shortcuts: ['terminal', 'console', 'shell', 'cmd', 'bash'] },

    // Interactive (4)
    { type: 'accordion', label: 'Accordion', icon: Layers, category: 'Interactive', template: '<details style="border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 0.5rem;">\n  <summary style="padding: 1rem; cursor: pointer; font-weight: 500; background: #f9fafb;">Click to expand</summary>\n  <div style="padding: 1rem; border-top: 1px solid #e5e7eb;">Hidden content here...</div>\n</details>', shortcuts: ['accordion', 'collapse', 'expand', 'details', 'faq'] },
    { type: 'tabs', label: 'Tabs', icon: Layers, category: 'Interactive', template: '<div>\n  <div style="display: flex; border-bottom: 1px solid #e5e7eb;">\n    <button style="padding: 0.75rem 1.5rem; border: none; background: none; border-bottom: 2px solid #3b82f6; cursor: pointer; font-weight: 500;">Tab 1</button>\n    <button style="padding: 0.75rem 1.5rem; border: none; background: none; cursor: pointer; color: #6b7280;">Tab 2</button>\n    <button style="padding: 0.75rem 1.5rem; border: none; background: none; cursor: pointer; color: #6b7280;">Tab 3</button>\n  </div>\n  <div style="padding: 1rem;">Tab 1 content here.</div>\n</div>', shortcuts: ['tabs', 'tabbed', 'nav'] },
    { type: 'button', label: 'Button', icon: Layers, category: 'Interactive', template: '<a href="#" style="display: inline-block; padding: 0.75rem 1.5rem; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">Button Text</a>', shortcuts: ['button', 'btn', 'action'] },
    { type: 'cta', label: 'Call to Action', icon: Layers, category: 'Interactive', template: '<div style="background: #f3f4f6; padding: 2rem; border-radius: 12px; text-align: center;">\n  <h3 style="margin: 0 0 0.5rem;">Ready to get started?</h3>\n  <p style="color: #6b7280; margin: 0 0 1rem;">Join thousands of happy customers today.</p>\n  <a href="#" style="display: inline-block; padding: 0.75rem 2rem; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">Get Started</a>\n</div>', shortcuts: ['cta', 'calltoaction', 'signup', 'subscribe'] },

    // Formatting (12)
    { type: 'bold', label: 'Bold', icon: Bold, category: 'Formatting', template: '<strong>Bold text</strong>', shortcuts: ['B', 'bold', 'strong'] },
    { type: 'italic', label: 'Italic', icon: Italic, category: 'Formatting', template: '<em>Italic text</em>', shortcuts: ['I', 'italic', 'em', 'emphasis'] },
    { type: 'underline', label: 'Underline', icon: Underline, category: 'Formatting', template: '<u>Underlined text</u>', shortcuts: ['U', 'underline'] },
    { type: 'strikethrough', label: 'Strikethrough', icon: Type, category: 'Formatting', template: '<s>Strikethrough text</s>', shortcuts: ['S', 'strike', 'strikethrough', 'del'] },
    { type: 'subscript', label: 'Subscript', icon: Type, category: 'Formatting', template: '<p>H<sub>2</sub>O - Subscript example</p>', shortcuts: ['sub', 'subscript'] },
    { type: 'superscript', label: 'Superscript', icon: Type, category: 'Formatting', template: '<p>E=mc<sup>2</sup> - Superscript example</p>', shortcuts: ['sup', 'superscript', 'power'] },
    { type: 'small', label: 'Small Text', icon: Type, category: 'Formatting', template: '<small>Smaller text for fine print</small>', shortcuts: ['small', 'fine', 'tiny'] },
    { type: 'abbr', label: 'Abbreviation', icon: Type, category: 'Formatting', template: '<abbr title="HyperText Markup Language">HTML</abbr>', shortcuts: ['abbr', 'abbreviation', 'acronym'] },
    { type: 'kbd', label: 'Keyboard Key', icon: Type, category: 'Formatting', template: '<p>Press <kbd style="background: #f3f4f6; padding: 0.125rem 0.5rem; border-radius: 4px; border: 1px solid #e5e7eb; font-family: monospace;">Ctrl</kbd> + <kbd style="background: #f3f4f6; padding: 0.125rem 0.5rem; border-radius: 4px; border: 1px solid #e5e7eb; font-family: monospace;">C</kbd> to copy</p>', shortcuts: ['kbd', 'keyboard', 'key', 'shortcut'] },
    { type: 'mark', label: 'Highlight Mark', icon: Type, category: 'Formatting', template: '<p>This is <mark style="background: #fef08a;">highlighted text</mark> in a sentence.</p>', shortcuts: ['mark', 'yellow', 'highlight'] },
    { type: 'var', label: 'Variable', icon: Type, category: 'Formatting', template: '<p>The variable <var style="font-style: italic;">x</var> equals 10.</p>', shortcuts: ['var', 'variable', 'math'] },
    { type: 'time', label: 'Date/Time', icon: Type, category: 'Formatting', template: '<time datetime="2025-01-15">January 15, 2025</time>', shortcuts: ['time', 'date', 'datetime'] },

    // Links & Buttons (6)
    { type: 'link', label: 'Link', icon: Link, category: 'Links', template: '<a href="https://example.com" style="color: #3b82f6; text-decoration: underline;">Link text</a>', shortcuts: ['A', 'a', 'link', 'href', 'url'] },
    { type: 'email-link', label: 'Email Link', icon: Link, category: 'Links', template: '<a href="mailto:hello@example.com" style="color: #3b82f6;">hello@example.com</a>', shortcuts: ['email', 'mailto', 'mail'] },
    { type: 'phone-link', label: 'Phone Link', icon: Link, category: 'Links', template: '<a href="tel:+1234567890" style="color: #3b82f6;">(123) 456-7890</a>', shortcuts: ['phone', 'tel', 'call'] },
    { type: 'btn-primary', label: 'Primary Button', icon: Layers, category: 'Links', template: '<a href="#" style="display: inline-block; padding: 0.75rem 1.5rem; background: #3b82f6; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">Primary Button</a>', shortcuts: ['primary', 'main', 'blue'] },
    { type: 'btn-secondary', label: 'Secondary Button', icon: Layers, category: 'Links', template: '<a href="#" style="display: inline-block; padding: 0.75rem 1.5rem; background: white; color: #3b82f6; text-decoration: none; border-radius: 8px; font-weight: 500; border: 2px solid #3b82f6;">Secondary Button</a>', shortcuts: ['secondary', 'ghost'] },
    { type: 'btn-outline', label: 'Outline Button', icon: Layers, category: 'Links', template: '<a href="#" style="display: inline-block; padding: 0.75rem 1.5rem; background: transparent; color: #374151; text-decoration: none; border-radius: 8px; font-weight: 500; border: 1px solid #d1d5db;">Outline Button</a>', shortcuts: ['outline', 'border'] },

    // Special Elements (6)
    { type: 'badge', label: 'Badge', icon: Type, category: 'Special', template: '<span style="display: inline-block; padding: 0.25rem 0.75rem; background: #3b82f6; color: white; border-radius: 9999px; font-size: 0.75rem; font-weight: 500;">New</span>', shortcuts: ['badge', 'tag', 'chip', 'label'] },
    { type: 'avatar', label: 'Avatar', icon: Image, category: 'Special', template: '<img src="/avatar.jpg" alt="User" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;" />', shortcuts: ['avatar', 'profile', 'user', 'face'] },
    { type: 'rating', label: 'Star Rating', icon: Type, category: 'Special', template: '<div style="color: #fbbf24; font-size: 1.25rem;">★★★★☆</div>', shortcuts: ['rating', 'stars', 'review', 'score'] },
    { type: 'tooltip', label: 'Tooltip', icon: Type, category: 'Special', template: '<span style="border-bottom: 1px dashed #6b7280; cursor: help;" title="This is a tooltip!">Hover for tooltip</span>', shortcuts: ['tooltip', 'hover', 'title'] },
    { type: 'emoji', label: 'Emoji', icon: Type, category: 'Special', template: '<span style="font-size: 2rem;">🎉</span>', shortcuts: ['emoji', 'icon', 'emoticon'] },
    { type: 'fancy-divider', label: 'Fancy Divider', icon: Layers, category: 'Special', template: '<div style="text-align: center; margin: 2rem 0;">\n  <span style="display: inline-block; width: 60px; height: 2px; background: #e5e7eb;"></span>\n  <span style="margin: 0 1rem; color: #9ca3af;">✦</span>\n  <span style="display: inline-block; width: 60px; height: 2px; background: #e5e7eb;"></span>\n</div>', shortcuts: ['fancy', 'ornament', 'decorative'] },
  ];

  const categories = [...new Set(blockTypes.map(b => b.category))];

  const filteredBlocks = blockTypes.filter(block => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery ||
      block.label.toLowerCase().includes(query) ||
      block.category.toLowerCase().includes(query) ||
      block.type.toLowerCase().includes(query) ||
      (block.shortcuts && block.shortcuts.some(shortcut => shortcut.toLowerCase() === query || shortcut.toLowerCase().includes(query)));
    const matchesCategory = !selectedCategory || block.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedBlocks = categories.reduce((acc, category) => {
    const blocks = filteredBlocks.filter(b => b.category === category);
    if (blocks.length > 0) {
      acc[category] = blocks;
    }
    return acc;
  }, {} as Record<string, typeof blockTypes>);

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-[480px] max-h-[500px] overflow-hidden flex flex-col"
    >
      {/* Search Bar */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search... (try H1, H2, UL, OL, B, I)"
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={clsx(
              'px-2.5 py-1 text-xs font-medium rounded-full transition-colors',
              !selectedCategory
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            )}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
              className={clsx(
                'px-2.5 py-1 text-xs font-medium rounded-full transition-colors',
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Blocks List */}
      <div className="flex-1 overflow-y-auto p-2">
        {Object.entries(groupedBlocks).map(([category, blocks]) => (
          <div key={category} className="mb-3">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 py-1">
              {category}
            </div>
            <div className="grid grid-cols-4 gap-1">
              {blocks.map(block => {
                const Icon = block.icon;
                const shortcutHint = block.shortcuts ? `(${block.shortcuts.slice(0, 2).join(', ')})` : '';
                return (
                  <button
                    key={block.type}
                    onClick={() => {
                      onAdd(block.template);
                      onClose();
                    }}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                    title={`${block.label}${block.shortcuts ? ` - Search: ${block.shortcuts.join(', ')}` : ''}`}
                  >
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                      <Icon size={16} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                    <span className="text-[10px] text-gray-600 dark:text-gray-400 text-center line-clamp-1">{block.label}</span>
                    {searchQuery && block.shortcuts && (
                      <span className="text-[8px] text-blue-500 dark:text-blue-400 font-mono">{shortcutHint}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {filteredBlocks.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm">No blocks found</p>
            <p className="text-xs">Try a different search term</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
        <span>{filteredBlocks.length} blocks available</span>
        <span>Click to insert</span>
      </div>
    </motion.div>
  );
}

// Main Real Time Editor Component
export default function RealTimeEditor({ content, onChange, className }: RealTimeEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(() => parseHtmlToBlocks(content));
  const [activeMenuBlockId, setActiveMenuBlockId] = useState<string | null>(null);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addMenuIndex, setAddMenuIndex] = useState<number>(-1);

  // Re-parse when content changes externally
  useEffect(() => {
    const newBlocks = parseHtmlToBlocks(content);
    if (JSON.stringify(newBlocks.map(b => b.content)) !== JSON.stringify(blocks.map(b => b.content))) {
      setBlocks(newBlocks);
    }
  }, [content]);

  // Update parent when blocks change
  const updateContent = useCallback((newBlocks: Block[]) => {
    setBlocks(newBlocks);
    onChange(blocksToHtml(newBlocks));
  }, [onChange]);

  const handleEdit = useCallback((blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (block) {
      setEditingBlock(block);
    }
  }, [blocks]);

  const handleSaveEdit = useCallback((blockId: string, newContent: string) => {
    const newBlocks = blocks.map(b =>
      b.id === blockId ? { ...b, content: newContent } : b
    );
    updateContent(newBlocks);
    toast.success('Block updated');
  }, [blocks, updateContent]);

  const handleDuplicate = useCallback((blockId: string) => {
    const index = blocks.findIndex(b => b.id === blockId);
    if (index !== -1) {
      const block = blocks[index];
      const newBlock = {
        ...block,
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      updateContent(newBlocks);
      toast.success('Block duplicated');
    }
  }, [blocks, updateContent]);

  const handleRemove = useCallback((blockId: string) => {
    const newBlocks = blocks.filter(b => b.id !== blockId);
    updateContent(newBlocks);
    toast.success('Block removed');
  }, [blocks, updateContent]);

  const handleToggleHide = useCallback((blockId: string) => {
    const newBlocks = blocks.map(b =>
      b.id === blockId ? { ...b, isHidden: !b.isHidden } : b
    );
    updateContent(newBlocks);
  }, [blocks, updateContent]);

  const handleMoveUp = useCallback((blockId: string) => {
    const index = blocks.findIndex(b => b.id === blockId);
    if (index > 0) {
      const newBlocks = [...blocks];
      [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
      updateContent(newBlocks);
    }
  }, [blocks, updateContent]);

  const handleMoveDown = useCallback((blockId: string) => {
    const index = blocks.findIndex(b => b.id === blockId);
    if (index < blocks.length - 1) {
      const newBlocks = [...blocks];
      [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
      updateContent(newBlocks);
    }
  }, [blocks, updateContent]);

  const handleAddBlock = useCallback((template: string, afterIndex: number) => {
    const newBlock: Block = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'custom',
      content: template,
      tag: 'div',
      attributes: {},
      isHidden: false,
      isSelected: false,
    };
    const newBlocks = [...blocks];
    newBlocks.splice(afterIndex + 1, 0, newBlock);
    updateContent(newBlocks);
    toast.success('Block added');
  }, [blocks, updateContent]);

  return (
    <div className={clsx('real-time-editor', className)}>
      {/* Empty State */}
      {blocks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
          <Layers size={48} className="mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No content blocks yet</p>
          <p className="text-sm mb-4">Add content in the HTML Editor or click below to add a block</p>
          <div className="relative">
            <button
              onClick={() => {
                setAddMenuIndex(-1);
                setShowAddMenu(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Add Block
            </button>
            <AnimatePresence>
              {showAddMenu && addMenuIndex === -1 && (
                <AddBlockMenu
                  onAdd={(template) => handleAddBlock(template, -1)}
                  onClose={() => setShowAddMenu(false)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Blocks List */}
      <div className="space-y-3">
        {blocks.map((block, index) => {
          const Icon = getBlockIcon(block.type, block.tag);
          const canMoveUp = index > 0;
          const canMoveDown = index < blocks.length - 1;

          return (
            <div key={block.id} className="group">
              {/* Block Container */}
              <motion.div
                layout
                className={clsx(
                  'relative rounded-xl border-2 transition-all',
                  block.isHidden
                    ? 'border-dashed border-gray-300 dark:border-gray-600 opacity-50'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500',
                  'bg-white dark:bg-gray-800'
                )}
              >
                {/* Block Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white dark:bg-gray-700 rounded-lg shadow-sm cursor-grab">
                      <GripVertical size={14} className="text-gray-400" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon size={16} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {getBlockLabel(block.type, block.tag)}
                      </span>
                    </div>
                    {block.isHidden && (
                      <span className="px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                        Hidden
                      </span>
                    )}
                  </div>

                  {/* Block Actions */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuBlockId(activeMenuBlockId === block.id ? null : block.id)}
                      className={clsx(
                        'p-2 rounded-lg transition-colors',
                        activeMenuBlockId === block.id
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                          : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                      )}
                    >
                      <MoreVertical size={16} />
                    </button>

                    <AnimatePresence>
                      {activeMenuBlockId === block.id && (
                        <BlockMenu
                          block={block}
                          onEdit={() => handleEdit(block.id)}
                          onDuplicate={() => handleDuplicate(block.id)}
                          onRemove={() => handleRemove(block.id)}
                          onToggleHide={() => handleToggleHide(block.id)}
                          onMoveUp={() => handleMoveUp(block.id)}
                          onMoveDown={() => handleMoveDown(block.id)}
                          onClose={() => setActiveMenuBlockId(null)}
                          canMoveUp={canMoveUp}
                          canMoveDown={canMoveDown}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Block Content Preview - Double-click to edit */}
                <div
                  className={clsx(
                    'p-4 prose dark:prose-invert max-w-none text-sm cursor-pointer',
                    'hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors',
                    block.isHidden && 'line-through opacity-50'
                  )}
                  dangerouslySetInnerHTML={{ __html: block.content }}
                  onDoubleClick={() => handleEdit(block.id)}
                  title="Double-click to edit this block"
                />
              </motion.div>

              {/* Add Block Button (between blocks) */}
              <div className="flex justify-center py-1 opacity-0 group-hover:opacity-100 transition-opacity relative">
                <button
                  onClick={() => {
                    setAddMenuIndex(index);
                    setShowAddMenu(true);
                  }}
                  className="p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <Plus size={14} />
                </button>
                <AnimatePresence>
                  {showAddMenu && addMenuIndex === index && (
                    <AddBlockMenu
                      onAdd={(template) => handleAddBlock(template, index)}
                      onClose={() => setShowAddMenu(false)}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* Block Editor Modal */}
      <AnimatePresence>
        {editingBlock && (
          <BlockEditor
            block={editingBlock}
            onSave={(content) => handleSaveEdit(editingBlock.id, content)}
            onClose={() => setEditingBlock(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
