import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  CheckSquare,
  Indent,
  Outdent,
  Quote,
  Code,
  Link,
  Unlink,
  Image,
  Table,
  Minus,
  Type,
  Palette,
  Highlighter,
  RotateCcw,
  RotateCw,
  Copy,
  Scissors,
  Clipboard,
  Eraser,
  FileCode,
  Hash,
  AtSign,
  Maximize,
  Minimize,
  ChevronsUp,
  ChevronsDown,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  MessageSquare,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Terminal,
  FileText,
  Video,
  Music,
  MapPin,
  Calendar,
  Clock,
  Phone,
  Mail,
  Globe,
  Smile,
  Star,
  Heart,
  Zap,
  Columns,
  LayoutGrid,
  Frame,
  Box,
  Layers,
  PanelLeft,
  PanelRight,
  Sparkles,
  X,
  ChevronDown,
  ChevronRight,
  GripVertical
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface FormattingOption {
  id: string;
  label: string;
  icon: React.ElementType;
  category: string;
  shortcut?: string;
  html?: string;
  action?: 'command' | 'insert' | 'wrap' | 'style';
  command?: string;
  value?: string;
  description?: string;
}

interface FormattingToolbarProps {
  onInsert: (html: string) => void;
  onFormat?: (command: string, value?: string) => void;
  className?: string;
  compact?: boolean;
}

const formattingOptions: FormattingOption[] = [
  // Text Formatting (10 options)
  { id: 'bold', label: 'Bold', icon: Bold, category: 'Text Formatting', shortcut: 'Ctrl+B', action: 'command', command: 'bold', description: 'Make text bold' },
  { id: 'italic', label: 'Italic', icon: Italic, category: 'Text Formatting', shortcut: 'Ctrl+I', action: 'command', command: 'italic', description: 'Make text italic' },
  { id: 'underline', label: 'Underline', icon: Underline, category: 'Text Formatting', shortcut: 'Ctrl+U', action: 'command', command: 'underline', description: 'Underline text' },
  { id: 'strikethrough', label: 'Strikethrough', icon: Strikethrough, category: 'Text Formatting', action: 'wrap', html: '<s>{{content}}</s>', description: 'Strike through text' },
  { id: 'subscript', label: 'Subscript', icon: Subscript, category: 'Text Formatting', action: 'wrap', html: '<sub>{{content}}</sub>', description: 'Subscript text' },
  { id: 'superscript', label: 'Superscript', icon: Superscript, category: 'Text Formatting', action: 'wrap', html: '<sup>{{content}}</sup>', description: 'Superscript text' },
  { id: 'highlight', label: 'Highlight', icon: Highlighter, category: 'Text Formatting', action: 'wrap', html: '<mark>{{content}}</mark>', description: 'Highlight text with yellow background' },
  { id: 'small', label: 'Small Text', icon: Minimize, category: 'Text Formatting', action: 'wrap', html: '<small>{{content}}</small>', description: 'Make text smaller' },
  { id: 'big', label: 'Large Text', icon: Maximize, category: 'Text Formatting', action: 'wrap', html: '<span style="font-size: 1.5em;">{{content}}</span>', description: 'Make text larger' },
  { id: 'code-inline', label: 'Inline Code', icon: Code, category: 'Text Formatting', action: 'wrap', html: '<code>{{content}}</code>', description: 'Format as inline code' },

  // Headings (6 options)
  { id: 'h1', label: 'Heading 1', icon: Heading1, category: 'Headings', action: 'insert', html: '<h1>Heading 1</h1>', description: 'Large heading' },
  { id: 'h2', label: 'Heading 2', icon: Heading2, category: 'Headings', action: 'insert', html: '<h2>Heading 2</h2>', description: 'Medium-large heading' },
  { id: 'h3', label: 'Heading 3', icon: Heading3, category: 'Headings', action: 'insert', html: '<h3>Heading 3</h3>', description: 'Medium heading' },
  { id: 'h4', label: 'Heading 4', icon: Heading4, category: 'Headings', action: 'insert', html: '<h4>Heading 4</h4>', description: 'Small-medium heading' },
  { id: 'h5', label: 'Heading 5', icon: Heading5, category: 'Headings', action: 'insert', html: '<h5>Heading 5</h5>', description: 'Small heading' },
  { id: 'h6', label: 'Heading 6', icon: Heading6, category: 'Headings', action: 'insert', html: '<h6>Heading 6</h6>', description: 'Smallest heading' },

  // Alignment (4 options)
  { id: 'align-left', label: 'Align Left', icon: AlignLeft, category: 'Alignment', action: 'style', value: 'text-align: left;', description: 'Align text to the left' },
  { id: 'align-center', label: 'Align Center', icon: AlignCenter, category: 'Alignment', action: 'style', value: 'text-align: center;', description: 'Center align text' },
  { id: 'align-right', label: 'Align Right', icon: AlignRight, category: 'Alignment', action: 'style', value: 'text-align: right;', description: 'Align text to the right' },
  { id: 'align-justify', label: 'Justify', icon: AlignJustify, category: 'Alignment', action: 'style', value: 'text-align: justify;', description: 'Justify text' },

  // Lists (5 options)
  { id: 'ul', label: 'Bullet List', icon: List, category: 'Lists', action: 'insert', html: '<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n</ul>', description: 'Unordered bullet list' },
  { id: 'ol', label: 'Numbered List', icon: ListOrdered, category: 'Lists', action: 'insert', html: '<ol>\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n</ol>', description: 'Ordered numbered list' },
  { id: 'checklist', label: 'Checklist', icon: CheckSquare, category: 'Lists', action: 'insert', html: '<ul class="checklist">\n  <li><input type="checkbox" /> Task 1</li>\n  <li><input type="checkbox" /> Task 2</li>\n  <li><input type="checkbox" checked /> Task 3 (done)</li>\n</ul>', description: 'Task checklist' },
  { id: 'indent', label: 'Increase Indent', icon: Indent, category: 'Lists', action: 'style', value: 'margin-left: 2em;', description: 'Increase indentation' },
  { id: 'outdent', label: 'Decrease Indent', icon: Outdent, category: 'Lists', action: 'style', value: 'margin-left: 0;', description: 'Decrease indentation' },

  // Blocks (8 options)
  { id: 'paragraph', label: 'Paragraph', icon: Type, category: 'Blocks', action: 'insert', html: '<p>New paragraph text...</p>', description: 'Regular paragraph' },
  { id: 'blockquote', label: 'Blockquote', icon: Quote, category: 'Blocks', action: 'insert', html: '<blockquote>\n  Quote text here...\n  <cite>— Author Name</cite>\n</blockquote>', description: 'Quoted text block' },
  { id: 'code-block', label: 'Code Block', icon: Terminal, category: 'Blocks', action: 'insert', html: '<pre><code class="language-javascript">// Your code here\nfunction example() {\n  return true;\n}</code></pre>', description: 'Syntax-highlighted code' },
  { id: 'divider', label: 'Horizontal Rule', icon: Minus, category: 'Blocks', action: 'insert', html: '<hr />', description: 'Horizontal divider line' },
  { id: 'details', label: 'Accordion', icon: ChevronDown, category: 'Blocks', action: 'insert', html: '<details>\n  <summary>Click to expand</summary>\n  <p>Hidden content here...</p>\n</details>', description: 'Collapsible content block' },
  { id: 'address', label: 'Address Block', icon: MapPin, category: 'Blocks', action: 'insert', html: '<address>\n  123 Street Name<br>\n  City, State 12345<br>\n  <a href="tel:+1234567890">(123) 456-7890</a>\n</address>', description: 'Contact address block' },
  { id: 'figure', label: 'Figure with Caption', icon: Frame, category: 'Blocks', action: 'insert', html: '<figure>\n  <img src="/placeholder.jpg" alt="Description" />\n  <figcaption>Image caption here</figcaption>\n</figure>', description: 'Image with caption' },
  { id: 'aside', label: 'Sidebar Note', icon: PanelRight, category: 'Blocks', action: 'insert', html: '<aside class="sidebar-note">\n  <strong>Note:</strong> Additional information here...\n</aside>', description: 'Sidebar content' },

  // Alerts & Callouts (5 options)
  { id: 'alert-info', label: 'Info Alert', icon: Info, category: 'Alerts', action: 'insert', html: '<div class="alert alert-info" style="padding: 1rem; background: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 4px;">\n  <strong>Info:</strong> Information message here.\n</div>', description: 'Blue info alert' },
  { id: 'alert-success', label: 'Success Alert', icon: CheckCircle, category: 'Alerts', action: 'insert', html: '<div class="alert alert-success" style="padding: 1rem; background: #e8f5e9; border-left: 4px solid #4caf50; border-radius: 4px;">\n  <strong>Success:</strong> Success message here.\n</div>', description: 'Green success alert' },
  { id: 'alert-warning', label: 'Warning Alert', icon: AlertCircle, category: 'Alerts', action: 'insert', html: '<div class="alert alert-warning" style="padding: 1rem; background: #fff3e0; border-left: 4px solid #ff9800; border-radius: 4px;">\n  <strong>Warning:</strong> Warning message here.\n</div>', description: 'Orange warning alert' },
  { id: 'alert-error', label: 'Error Alert', icon: XCircle, category: 'Alerts', action: 'insert', html: '<div class="alert alert-error" style="padding: 1rem; background: #ffebee; border-left: 4px solid #f44336; border-radius: 4px;">\n  <strong>Error:</strong> Error message here.\n</div>', description: 'Red error alert' },
  { id: 'tip', label: 'Pro Tip', icon: Sparkles, category: 'Alerts', action: 'insert', html: '<div class="tip" style="padding: 1rem; background: #f3e5f5; border-left: 4px solid #9c27b0; border-radius: 4px;">\n  <strong>Pro Tip:</strong> Helpful tip here.\n</div>', description: 'Purple pro tip box' },

  // Media (6 options)
  { id: 'image', label: 'Image', icon: Image, category: 'Media', action: 'insert', html: '<img src="/placeholder.jpg" alt="Image description" style="max-width: 100%; height: auto;" />', description: 'Insert image' },
  { id: 'video', label: 'Video Embed', icon: Video, category: 'Media', action: 'insert', html: '<video controls width="100%">\n  <source src="/video.mp4" type="video/mp4">\n  Your browser does not support video.\n</video>', description: 'HTML5 video player' },
  { id: 'youtube', label: 'YouTube Embed', icon: Video, category: 'Media', action: 'insert', html: '<div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">\n  <iframe src="https://www.youtube.com/embed/VIDEO_ID" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allowfullscreen></iframe>\n</div>', description: 'Responsive YouTube embed' },
  { id: 'audio', label: 'Audio Player', icon: Music, category: 'Media', action: 'insert', html: '<audio controls>\n  <source src="/audio.mp3" type="audio/mpeg">\n  Your browser does not support audio.\n</audio>', description: 'HTML5 audio player' },
  { id: 'gallery', label: 'Image Gallery', icon: LayoutGrid, category: 'Media', action: 'insert', html: '<div class="gallery" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">\n  <img src="/image1.jpg" alt="Image 1" />\n  <img src="/image2.jpg" alt="Image 2" />\n  <img src="/image3.jpg" alt="Image 3" />\n</div>', description: '3-column image gallery' },
  { id: 'iframe', label: 'iFrame Embed', icon: Globe, category: 'Media', action: 'insert', html: '<iframe src="https://example.com" width="100%" height="400" frameborder="0"></iframe>', description: 'Embed external content' },

  // Links (4 options)
  { id: 'link', label: 'Link', icon: Link, category: 'Links', action: 'insert', html: '<a href="https://example.com" target="_blank" rel="noopener noreferrer">Link text</a>', description: 'Hyperlink' },
  { id: 'button', label: 'Button Link', icon: Box, category: 'Links', action: 'insert', html: '<a href="#" class="button" style="display: inline-block; padding: 0.75rem 1.5rem; background: #2196f3; color: white; text-decoration: none; border-radius: 4px;">Button Text</a>', description: 'Styled button link' },
  { id: 'email', label: 'Email Link', icon: Mail, category: 'Links', action: 'insert', html: '<a href="mailto:email@example.com">email@example.com</a>', description: 'Email mailto link' },
  { id: 'phone', label: 'Phone Link', icon: Phone, category: 'Links', action: 'insert', html: '<a href="tel:+1234567890">(123) 456-7890</a>', description: 'Phone tel link' },

  // Tables (3 options)
  { id: 'table', label: 'Basic Table', icon: Table, category: 'Tables', action: 'insert', html: '<table style="width: 100%; border-collapse: collapse;">\n  <thead>\n    <tr>\n      <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Header 1</th>\n      <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Header 2</th>\n      <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Header 3</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td style="border: 1px solid #ddd; padding: 8px;">Cell 1</td>\n      <td style="border: 1px solid #ddd; padding: 8px;">Cell 2</td>\n      <td style="border: 1px solid #ddd; padding: 8px;">Cell 3</td>\n    </tr>\n  </tbody>\n</table>', description: 'Basic HTML table' },
  { id: 'table-striped', label: 'Striped Table', icon: Table, category: 'Tables', action: 'insert', html: '<table class="striped" style="width: 100%; border-collapse: collapse;">\n  <thead style="background: #f5f5f5;">\n    <tr>\n      <th style="border: 1px solid #ddd; padding: 12px;">Header 1</th>\n      <th style="border: 1px solid #ddd; padding: 12px;">Header 2</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr style="background: #fff;">\n      <td style="border: 1px solid #ddd; padding: 12px;">Row 1</td>\n      <td style="border: 1px solid #ddd; padding: 12px;">Data</td>\n    </tr>\n    <tr style="background: #f9f9f9;">\n      <td style="border: 1px solid #ddd; padding: 12px;">Row 2</td>\n      <td style="border: 1px solid #ddd; padding: 12px;">Data</td>\n    </tr>\n  </tbody>\n</table>', description: 'Alternating row colors' },
  { id: 'pricing-table', label: 'Pricing Table', icon: Table, category: 'Tables', action: 'insert', html: '<div class="pricing-table" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">\n  <div style="border: 1px solid #ddd; padding: 2rem; text-align: center; border-radius: 8px;">\n    <h3>Basic</h3>\n    <p style="font-size: 2rem; font-weight: bold;">$9/mo</p>\n    <ul style="list-style: none; padding: 0;"><li>Feature 1</li><li>Feature 2</li></ul>\n    <a href="#" style="display: block; padding: 0.75rem; background: #2196f3; color: white; text-decoration: none; border-radius: 4px;">Choose</a>\n  </div>\n  <div style="border: 2px solid #2196f3; padding: 2rem; text-align: center; border-radius: 8px;">\n    <h3>Pro</h3>\n    <p style="font-size: 2rem; font-weight: bold;">$29/mo</p>\n    <ul style="list-style: none; padding: 0;"><li>All Basic +</li><li>Feature 3</li></ul>\n    <a href="#" style="display: block; padding: 0.75rem; background: #2196f3; color: white; text-decoration: none; border-radius: 4px;">Choose</a>\n  </div>\n  <div style="border: 1px solid #ddd; padding: 2rem; text-align: center; border-radius: 8px;">\n    <h3>Enterprise</h3>\n    <p style="font-size: 2rem; font-weight: bold;">$99/mo</p>\n    <ul style="list-style: none; padding: 0;"><li>All Pro +</li><li>Priority Support</li></ul>\n    <a href="#" style="display: block; padding: 0.75rem; background: #2196f3; color: white; text-decoration: none; border-radius: 4px;">Contact</a>\n  </div>\n</div>', description: '3-tier pricing layout' },

  // Layout (6 options)
  { id: 'columns-2', label: '2 Columns', icon: Columns, category: 'Layout', action: 'insert', html: '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">\n  <div>\n    <h3>Column 1</h3>\n    <p>Content for the first column.</p>\n  </div>\n  <div>\n    <h3>Column 2</h3>\n    <p>Content for the second column.</p>\n  </div>\n</div>', description: 'Two equal columns' },
  { id: 'columns-3', label: '3 Columns', icon: LayoutGrid, category: 'Layout', action: 'insert', html: '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem;">\n  <div>\n    <h3>Column 1</h3>\n    <p>Content here.</p>\n  </div>\n  <div>\n    <h3>Column 2</h3>\n    <p>Content here.</p>\n  </div>\n  <div>\n    <h3>Column 3</h3>\n    <p>Content here.</p>\n  </div>\n</div>', description: 'Three equal columns' },
  { id: 'sidebar-left', label: 'Left Sidebar', icon: PanelLeft, category: 'Layout', action: 'insert', html: '<div style="display: grid; grid-template-columns: 250px 1fr; gap: 2rem;">\n  <aside style="background: #f5f5f5; padding: 1rem; border-radius: 8px;">\n    <h4>Sidebar</h4>\n    <nav>\n      <a href="#">Link 1</a><br>\n      <a href="#">Link 2</a>\n    </nav>\n  </aside>\n  <main>\n    <h2>Main Content</h2>\n    <p>Your content here.</p>\n  </main>\n</div>', description: 'Sidebar on left' },
  { id: 'sidebar-right', label: 'Right Sidebar', icon: PanelRight, category: 'Layout', action: 'insert', html: '<div style="display: grid; grid-template-columns: 1fr 250px; gap: 2rem;">\n  <main>\n    <h2>Main Content</h2>\n    <p>Your content here.</p>\n  </main>\n  <aside style="background: #f5f5f5; padding: 1rem; border-radius: 8px;">\n    <h4>Sidebar</h4>\n    <nav>\n      <a href="#">Link 1</a><br>\n      <a href="#">Link 2</a>\n    </nav>\n  </aside>\n</div>', description: 'Sidebar on right' },
  { id: 'card', label: 'Card', icon: Box, category: 'Layout', action: 'insert', html: '<div class="card" style="border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">\n  <img src="/placeholder.jpg" alt="Card image" style="width: 100%; height: 200px; object-fit: cover;" />\n  <div style="padding: 1.5rem;">\n    <h3 style="margin: 0 0 0.5rem;">Card Title</h3>\n    <p style="color: #666; margin: 0 0 1rem;">Card description goes here.</p>\n    <a href="#" style="color: #2196f3; text-decoration: none;">Read more →</a>\n  </div>\n</div>', description: 'Card with image' },
  { id: 'hero', label: 'Hero Section', icon: Layers, category: 'Layout', action: 'insert', html: '<section style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4rem 2rem; text-align: center; border-radius: 8px;">\n  <h1 style="font-size: 3rem; margin: 0 0 1rem;">Hero Title</h1>\n  <p style="font-size: 1.25rem; margin: 0 0 2rem; opacity: 0.9;">Subtitle or description text goes here.</p>\n  <a href="#" style="display: inline-block; padding: 1rem 2rem; background: white; color: #667eea; text-decoration: none; border-radius: 4px; font-weight: bold;">Call to Action</a>\n</section>', description: 'Full-width hero banner' },

  // Interactive (4 options)
  { id: 'tabs', label: 'Tabs', icon: Layers, category: 'Interactive', action: 'insert', html: '<div class="tabs">\n  <div style="display: flex; border-bottom: 1px solid #ddd;">\n    <button style="padding: 0.75rem 1.5rem; border: none; background: none; border-bottom: 2px solid #2196f3; cursor: pointer;">Tab 1</button>\n    <button style="padding: 0.75rem 1.5rem; border: none; background: none; cursor: pointer;">Tab 2</button>\n    <button style="padding: 0.75rem 1.5rem; border: none; background: none; cursor: pointer;">Tab 3</button>\n  </div>\n  <div style="padding: 1rem;">\n    <p>Tab 1 content here.</p>\n  </div>\n</div>', description: 'Tabbed content area' },
  { id: 'accordion', label: 'Accordion', icon: ChevronDown, category: 'Interactive', action: 'insert', html: '<div class="accordion">\n  <details open>\n    <summary style="padding: 1rem; background: #f5f5f5; cursor: pointer; font-weight: bold;">Section 1</summary>\n    <div style="padding: 1rem;">Content for section 1.</div>\n  </details>\n  <details>\n    <summary style="padding: 1rem; background: #f5f5f5; cursor: pointer; font-weight: bold;">Section 2</summary>\n    <div style="padding: 1rem;">Content for section 2.</div>\n  </details>\n  <details>\n    <summary style="padding: 1rem; background: #f5f5f5; cursor: pointer; font-weight: bold;">Section 3</summary>\n    <div style="padding: 1rem;">Content for section 3.</div>\n  </details>\n</div>', description: 'Expandable sections' },
  { id: 'tooltip', label: 'Tooltip', icon: MessageSquare, category: 'Interactive', action: 'insert', html: '<span style="border-bottom: 1px dashed #666; cursor: help;" title="This is a tooltip!">Hover over me</span>', description: 'Hover tooltip' },
  { id: 'modal-trigger', label: 'Modal Link', icon: Maximize, category: 'Interactive', action: 'insert', html: '<a href="#modal" class="modal-trigger" style="color: #2196f3; cursor: pointer;">Open Modal</a>\n<div id="modal" class="modal" style="display: none;">\n  <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 500px; margin: 10vh auto;">\n    <h2>Modal Title</h2>\n    <p>Modal content here.</p>\n    <button onclick="this.closest(\'.modal\').style.display=\'none\'">Close</button>\n  </div>\n</div>', description: 'Modal popup trigger' },

  // Typography (5 options)
  { id: 'dropcap', label: 'Drop Cap', icon: Type, category: 'Typography', action: 'insert', html: '<p><span style="float: left; font-size: 4rem; line-height: 1; margin-right: 0.5rem; font-weight: bold;">T</span>his paragraph starts with a decorative drop cap letter. Use this for article introductions or special sections.</p>', description: 'Large initial letter' },
  { id: 'lead', label: 'Lead Paragraph', icon: Type, category: 'Typography', action: 'insert', html: '<p class="lead" style="font-size: 1.25rem; font-weight: 300; line-height: 1.6; color: #555;">This is a lead paragraph with larger, lighter text. Perfect for article introductions.</p>', description: 'Emphasized intro paragraph' },
  { id: 'pullquote', label: 'Pull Quote', icon: Quote, category: 'Typography', action: 'insert', html: '<aside style="border-left: 4px solid #2196f3; padding: 1rem 2rem; margin: 2rem 0; font-size: 1.5rem; font-style: italic; color: #333;">\n  "A notable quote pulled from the article to highlight key points."\n</aside>', description: 'Featured quote' },
  { id: 'footnote', label: 'Footnote', icon: Hash, category: 'Typography', action: 'insert', html: '<sup id="fn1"><a href="#footnote1">[1]</a></sup>\n<!-- At the bottom of your content: -->\n<div class="footnotes" style="font-size: 0.875rem; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ddd;">\n  <p id="footnote1">[1] Footnote text here. <a href="#fn1">↩</a></p>\n</div>', description: 'Reference footnote' },
  { id: 'abbr', label: 'Abbreviation', icon: Info, category: 'Typography', action: 'insert', html: '<abbr title="HyperText Markup Language">HTML</abbr>', description: 'Abbreviation with tooltip' },

  // Special Elements (6 options)
  { id: 'emoji', label: 'Emoji', icon: Smile, category: 'Special', action: 'insert', html: '😊', description: 'Insert emoji' },
  { id: 'rating', label: 'Star Rating', icon: Star, category: 'Special', action: 'insert', html: '<div class="rating" style="color: #ffc107;">★★★★☆</div>', description: '5-star rating' },
  { id: 'progress', label: 'Progress Bar', icon: Zap, category: 'Special', action: 'insert', html: '<div style="background: #e0e0e0; border-radius: 4px; overflow: hidden;">\n  <div style="width: 75%; height: 24px; background: linear-gradient(90deg, #2196f3, #21cbf3); text-align: center; color: white; line-height: 24px;">75%</div>\n</div>', description: 'Visual progress indicator' },
  { id: 'badge', label: 'Badge', icon: Bookmark, category: 'Special', action: 'insert', html: '<span style="display: inline-block; padding: 0.25rem 0.75rem; background: #2196f3; color: white; border-radius: 9999px; font-size: 0.875rem;">New</span>', description: 'Label badge' },
  { id: 'avatar', label: 'Avatar', icon: Smile, category: 'Special', action: 'insert', html: '<img src="/avatar.jpg" alt="User Name" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;" />', description: 'Circular avatar image' },
  { id: 'divider-fancy', label: 'Fancy Divider', icon: Minus, category: 'Special', action: 'insert', html: '<div style="text-align: center; margin: 2rem 0;">\n  <span style="display: inline-block; width: 60px; height: 2px; background: #ddd;"></span>\n  <span style="margin: 0 1rem; color: #999;">✦</span>\n  <span style="display: inline-block; width: 60px; height: 2px; background: #ddd;"></span>\n</div>', description: 'Decorative section divider' },

  // Date & Time (3 options)
  { id: 'datetime', label: 'Date/Time', icon: Calendar, category: 'Date & Time', action: 'insert', html: '<time datetime="2025-01-15">January 15, 2025</time>', description: 'Semantic date element' },
  { id: 'countdown', label: 'Countdown', icon: Clock, category: 'Date & Time', action: 'insert', html: '<div class="countdown" style="display: flex; gap: 1rem; justify-content: center; text-align: center;">\n  <div><span style="font-size: 2rem; font-weight: bold;">30</span><br><small>Days</small></div>\n  <div><span style="font-size: 2rem; font-weight: bold;">12</span><br><small>Hours</small></div>\n  <div><span style="font-size: 2rem; font-weight: bold;">45</span><br><small>Minutes</small></div>\n  <div><span style="font-size: 2rem; font-weight: bold;">00</span><br><small>Seconds</small></div>\n</div>', description: 'Countdown timer display' },
  { id: 'schedule', label: 'Schedule Item', icon: Clock, category: 'Date & Time', action: 'insert', html: '<div style="display: flex; gap: 1rem; padding: 1rem; border-left: 3px solid #2196f3; background: #f5f5f5;">\n  <div style="min-width: 80px; color: #2196f3; font-weight: bold;">10:00 AM</div>\n  <div>\n    <strong>Event Title</strong>\n    <p style="margin: 0; color: #666;">Event description or speaker info.</p>\n  </div>\n</div>', description: 'Event schedule item' },
];

const categories = [...new Set(formattingOptions.map(opt => opt.category))];

export default function FormattingToolbar({ onInsert, onFormat, className, compact = false }: FormattingToolbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const filteredOptions = useMemo(() => {
    let options = formattingOptions;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      options = options.filter(opt =>
        opt.label.toLowerCase().includes(query) ||
        opt.category.toLowerCase().includes(query) ||
        opt.description?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      options = options.filter(opt => opt.category === selectedCategory);
    }

    return options;
  }, [searchQuery, selectedCategory]);

  const groupedOptions = useMemo(() => {
    const groups: Record<string, FormattingOption[]> = {};
    filteredOptions.forEach(opt => {
      if (!groups[opt.category]) {
        groups[opt.category] = [];
      }
      groups[opt.category].push(opt);
    });
    return groups;
  }, [filteredOptions]);

  const handleOptionClick = useCallback((option: FormattingOption) => {
    if (option.action === 'insert' && option.html) {
      onInsert(option.html);
      toast.success(`Inserted ${option.label}`);
    } else if (option.action === 'command' && option.command && onFormat) {
      onFormat(option.command, option.value);
    } else if (option.action === 'wrap' && option.html) {
      onInsert(option.html.replace('{{content}}', 'Selected text'));
      toast.success(`Applied ${option.label}`);
    } else if (option.action === 'style' && option.value) {
      onInsert(`<div style="${option.value}">Content here</div>`);
      toast.success(`Applied ${option.label} style`);
    }
  }, [onInsert, onFormat]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className={clsx('formatting-toolbar bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden', className)}>
      {/* Search Bar */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search formatting options..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={() => setSelectedCategory(null)}
            className={clsx(
              'px-3 py-1 text-xs font-medium rounded-full transition-colors',
              !selectedCategory
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            )}
          >
            All ({formattingOptions.length})
          </button>
          {categories.map(category => {
            const count = formattingOptions.filter(opt => opt.category === category).length;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                className={clsx(
                  'px-3 py-1 text-xs font-medium rounded-full transition-colors',
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                )}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      {searchQuery && (
        <div className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20">
          Found {filteredOptions.length} formatting option{filteredOptions.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Options List */}
      <div className="max-h-[400px] overflow-y-auto">
        {Object.entries(groupedOptions).map(([category, options]) => (
          <div key={category} className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
            >
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {category}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {options.length} option{options.length !== 1 ? 's' : ''}
                </span>
                <ChevronDown
                  size={16}
                  className={clsx(
                    'text-gray-400 transition-transform',
                    expandedCategories.includes(category) && 'rotate-180'
                  )}
                />
              </div>
            </button>

            {/* Options Grid */}
            <AnimatePresence>
              {(expandedCategories.includes(category) || searchQuery || selectedCategory) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className={clsx(
                    'p-2 grid gap-1',
                    compact ? 'grid-cols-4' : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5'
                  )}>
                    {options.map(option => {
                      const Icon = option.icon;
                      return (
                        <motion.button
                          key={option.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleOptionClick(option)}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                          title={option.description}
                        >
                          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                            <Icon size={16} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400 text-center line-clamp-1">
                            {option.label}
                          </span>
                          {option.shortcut && (
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">
                              {option.shortcut}
                            </span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {filteredOptions.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Search size={32} className="mx-auto mb-2 opacity-50" />
            <p>No formatting options found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{formattingOptions.length} formatting elements</span>
        <span>{categories.length} categories</span>
      </div>
    </div>
  );
}
