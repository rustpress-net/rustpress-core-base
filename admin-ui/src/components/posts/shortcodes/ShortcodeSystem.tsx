import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code,
  Copy,
  Check,
  X,
  Search,
  Plus,
  Settings,
  Eye,
  Edit3,
  Info,
  Zap,
  ShoppingCart,
  Image,
  FileText,
  Users,
  Star,
  Mail,
  Calendar,
  Video,
  Map,
  MessageSquare,
  BarChart3,
  Share2,
  AlertCircle,
  ChevronRight,
  Package
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

// Shortcode Definition
export interface Shortcode {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'ecommerce' | 'media' | 'forms' | 'social' | 'layout' | 'utility';
  icon: React.ElementType;
  syntax: string;
  attributes: ShortcodeAttribute[];
  hasContent?: boolean; // If true, shortcode wraps content [shortcode]content[/shortcode]
  preview?: string;
  example?: string;
}

export interface ShortcodeAttribute {
  name: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'color' | 'url' | 'id';
  required?: boolean;
  default?: string | number | boolean;
  options?: { label: string; value: string }[];
  description?: string;
  placeholder?: string;
}

// Predefined Shortcodes Library
export const shortcodeLibrary: Shortcode[] = [
  // Content Shortcodes
  {
    id: 'button',
    name: 'Button',
    description: 'Insert a styled button with link',
    category: 'content',
    icon: Zap,
    syntax: '[button]',
    hasContent: true,
    attributes: [
      { name: 'url', type: 'url', required: true, description: 'Link URL', placeholder: 'https://example.com' },
      { name: 'style', type: 'select', default: 'primary', options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Outline', value: 'outline' },
        { label: 'Ghost', value: 'ghost' }
      ]},
      { name: 'size', type: 'select', default: 'md', options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' }
      ]},
      { name: 'target', type: 'select', default: '_self', options: [
        { label: 'Same Window', value: '_self' },
        { label: 'New Tab', value: '_blank' }
      ]}
    ],
    example: '[button url="https://example.com" style="primary"]Click Here[/button]'
  },
  {
    id: 'alert',
    name: 'Alert Box',
    description: 'Display an alert or notice box',
    category: 'content',
    icon: AlertCircle,
    syntax: '[alert]',
    hasContent: true,
    attributes: [
      { name: 'type', type: 'select', default: 'info', options: [
        { label: 'Info', value: 'info' },
        { label: 'Success', value: 'success' },
        { label: 'Warning', value: 'warning' },
        { label: 'Error', value: 'error' }
      ]},
      { name: 'title', type: 'text', description: 'Alert title', placeholder: 'Note' },
      { name: 'dismissible', type: 'boolean', default: false }
    ],
    example: '[alert type="warning" title="Important"]This is a warning message.[/alert]'
  },
  {
    id: 'accordion',
    name: 'Accordion',
    description: 'Collapsible content section',
    category: 'content',
    icon: ChevronRight,
    syntax: '[accordion]',
    hasContent: true,
    attributes: [
      { name: 'title', type: 'text', required: true, placeholder: 'Accordion Title' },
      { name: 'open', type: 'boolean', default: false, description: 'Start expanded' },
      { name: 'icon', type: 'select', default: 'chevron', options: [
        { label: 'Chevron', value: 'chevron' },
        { label: 'Plus/Minus', value: 'plus' },
        { label: 'Arrow', value: 'arrow' }
      ]}
    ],
    example: '[accordion title="Click to expand"]Hidden content here.[/accordion]'
  },
  {
    id: 'tabs',
    name: 'Tabs',
    description: 'Tabbed content container',
    category: 'content',
    icon: FileText,
    syntax: '[tabs]',
    hasContent: true,
    attributes: [
      { name: 'style', type: 'select', default: 'default', options: [
        { label: 'Default', value: 'default' },
        { label: 'Pills', value: 'pills' },
        { label: 'Underline', value: 'underline' }
      ]}
    ],
    example: '[tabs]\n[tab title="Tab 1"]Content 1[/tab]\n[tab title="Tab 2"]Content 2[/tab]\n[/tabs]'
  },
  {
    id: 'columns',
    name: 'Columns',
    description: 'Multi-column layout',
    category: 'layout',
    icon: FileText,
    syntax: '[columns]',
    hasContent: true,
    attributes: [
      { name: 'count', type: 'select', default: '2', options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' }
      ]},
      { name: 'gap', type: 'select', default: 'md', options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' }
      ]}
    ],
    example: '[columns count="2"]\n[column]Left content[/column]\n[column]Right content[/column]\n[/columns]'
  },
  // E-commerce Shortcodes
  {
    id: 'product',
    name: 'Product',
    description: 'Display a single product',
    category: 'ecommerce',
    icon: Package,
    syntax: '[product]',
    attributes: [
      { name: 'id', type: 'id', required: true, description: 'Product ID', placeholder: '123' },
      { name: 'show_price', type: 'boolean', default: true },
      { name: 'show_button', type: 'boolean', default: true },
      { name: 'button_text', type: 'text', default: 'Add to Cart' }
    ],
    example: '[product id="123" show_price="true"]'
  },
  {
    id: 'product_grid',
    name: 'Product Grid',
    description: 'Display multiple products in a grid',
    category: 'ecommerce',
    icon: Package,
    syntax: '[product_grid]',
    attributes: [
      { name: 'ids', type: 'text', description: 'Comma-separated product IDs', placeholder: '1,2,3,4' },
      { name: 'category', type: 'text', description: 'Filter by category slug' },
      { name: 'limit', type: 'number', default: 4 },
      { name: 'columns', type: 'select', default: '4', options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' }
      ]}
    ],
    example: '[product_grid category="featured" limit="4" columns="4"]'
  },
  {
    id: 'add_to_cart',
    name: 'Add to Cart',
    description: 'Add to cart button for a product',
    category: 'ecommerce',
    icon: ShoppingCart,
    syntax: '[add_to_cart]',
    attributes: [
      { name: 'id', type: 'id', required: true, description: 'Product ID' },
      { name: 'quantity', type: 'number', default: 1 },
      { name: 'show_quantity', type: 'boolean', default: false }
    ],
    example: '[add_to_cart id="123" show_quantity="true"]'
  },
  {
    id: 'price',
    name: 'Price Display',
    description: 'Display product price',
    category: 'ecommerce',
    icon: ShoppingCart,
    syntax: '[price]',
    attributes: [
      { name: 'id', type: 'id', required: true, description: 'Product ID' },
      { name: 'show_sale', type: 'boolean', default: true, description: 'Show sale price if available' }
    ],
    example: '[price id="123" show_sale="true"]'
  },
  // Media Shortcodes
  {
    id: 'gallery',
    name: 'Gallery',
    description: 'Image gallery with lightbox',
    category: 'media',
    icon: Image,
    syntax: '[gallery]',
    attributes: [
      { name: 'ids', type: 'text', required: true, description: 'Comma-separated image IDs', placeholder: '1,2,3' },
      { name: 'columns', type: 'select', default: '3', options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
        { label: '5 Columns', value: '5' }
      ]},
      { name: 'size', type: 'select', default: 'medium', options: [
        { label: 'Thumbnail', value: 'thumbnail' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' }
      ]},
      { name: 'link', type: 'select', default: 'lightbox', options: [
        { label: 'Lightbox', value: 'lightbox' },
        { label: 'Media File', value: 'file' },
        { label: 'None', value: 'none' }
      ]}
    ],
    example: '[gallery ids="1,2,3,4" columns="4" link="lightbox"]'
  },
  {
    id: 'video',
    name: 'Video Embed',
    description: 'Embed video from URL',
    category: 'media',
    icon: Video,
    syntax: '[video]',
    attributes: [
      { name: 'url', type: 'url', required: true, placeholder: 'https://youtube.com/watch?v=...' },
      { name: 'width', type: 'number', default: 640 },
      { name: 'height', type: 'number', default: 360 },
      { name: 'autoplay', type: 'boolean', default: false },
      { name: 'loop', type: 'boolean', default: false }
    ],
    example: '[video url="https://youtube.com/watch?v=abc123" width="640"]'
  },
  {
    id: 'audio',
    name: 'Audio Player',
    description: 'Embed audio file',
    category: 'media',
    icon: Video,
    syntax: '[audio]',
    attributes: [
      { name: 'url', type: 'url', required: true },
      { name: 'autoplay', type: 'boolean', default: false },
      { name: 'loop', type: 'boolean', default: false }
    ],
    example: '[audio url="https://example.com/audio.mp3"]'
  },
  // Form Shortcodes
  {
    id: 'contact_form',
    name: 'Contact Form',
    description: 'Display a contact form',
    category: 'forms',
    icon: Mail,
    syntax: '[contact_form]',
    attributes: [
      { name: 'id', type: 'id', description: 'Form ID (optional)', placeholder: 'form-1' },
      { name: 'title', type: 'text', default: 'Contact Us' },
      { name: 'submit_text', type: 'text', default: 'Send Message' }
    ],
    example: '[contact_form title="Get in Touch"]'
  },
  {
    id: 'newsletter',
    name: 'Newsletter Signup',
    description: 'Email subscription form',
    category: 'forms',
    icon: Mail,
    syntax: '[newsletter]',
    attributes: [
      { name: 'title', type: 'text', default: 'Subscribe' },
      { name: 'placeholder', type: 'text', default: 'Enter your email' },
      { name: 'button_text', type: 'text', default: 'Subscribe' },
      { name: 'style', type: 'select', default: 'inline', options: [
        { label: 'Inline', value: 'inline' },
        { label: 'Stacked', value: 'stacked' }
      ]}
    ],
    example: '[newsletter title="Stay Updated" button_text="Join"]'
  },
  // Social Shortcodes
  {
    id: 'social_share',
    name: 'Share Buttons',
    description: 'Social sharing buttons',
    category: 'social',
    icon: Share2,
    syntax: '[social_share]',
    attributes: [
      { name: 'networks', type: 'text', default: 'facebook,twitter,linkedin', description: 'Comma-separated networks' },
      { name: 'style', type: 'select', default: 'icons', options: [
        { label: 'Icons Only', value: 'icons' },
        { label: 'Icons with Labels', value: 'labels' },
        { label: 'Buttons', value: 'buttons' }
      ]},
      { name: 'show_count', type: 'boolean', default: false }
    ],
    example: '[social_share networks="facebook,twitter,linkedin" style="icons"]'
  },
  {
    id: 'user_profile',
    name: 'User Profile',
    description: 'Display user/author profile',
    category: 'social',
    icon: Users,
    syntax: '[user_profile]',
    attributes: [
      { name: 'id', type: 'id', description: 'User ID (blank for current author)' },
      { name: 'show_avatar', type: 'boolean', default: true },
      { name: 'show_bio', type: 'boolean', default: true },
      { name: 'show_social', type: 'boolean', default: true }
    ],
    example: '[user_profile show_bio="true" show_social="true"]'
  },
  // Utility Shortcodes
  {
    id: 'date',
    name: 'Dynamic Date',
    description: 'Display current or formatted date',
    category: 'utility',
    icon: Calendar,
    syntax: '[date]',
    attributes: [
      { name: 'format', type: 'text', default: 'MMMM D, YYYY', placeholder: 'MMMM D, YYYY' },
      { name: 'offset', type: 'number', default: 0, description: 'Days offset from today' }
    ],
    example: '[date format="MMMM D, YYYY"]'
  },
  {
    id: 'map',
    name: 'Map Embed',
    description: 'Embed a Google Map',
    category: 'utility',
    icon: Map,
    syntax: '[map]',
    attributes: [
      { name: 'address', type: 'text', required: true, placeholder: '123 Main St, City' },
      { name: 'zoom', type: 'number', default: 14 },
      { name: 'height', type: 'number', default: 400 }
    ],
    example: '[map address="New York, NY" zoom="12" height="300"]'
  },
  {
    id: 'rating',
    name: 'Star Rating',
    description: 'Display a star rating',
    category: 'utility',
    icon: Star,
    syntax: '[rating]',
    attributes: [
      { name: 'value', type: 'number', required: true, description: 'Rating value (0-5)' },
      { name: 'max', type: 'number', default: 5 },
      { name: 'size', type: 'select', default: 'md', options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' }
      ]}
    ],
    example: '[rating value="4.5" max="5"]'
  },
  {
    id: 'progress',
    name: 'Progress Bar',
    description: 'Display a progress bar',
    category: 'utility',
    icon: BarChart3,
    syntax: '[progress]',
    attributes: [
      { name: 'value', type: 'number', required: true, description: 'Progress value (0-100)' },
      { name: 'label', type: 'text' },
      { name: 'color', type: 'select', default: 'primary', options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Success', value: 'success' },
        { label: 'Warning', value: 'warning' },
        { label: 'Error', value: 'error' }
      ]},
      { name: 'show_percent', type: 'boolean', default: true }
    ],
    example: '[progress value="75" label="Progress" color="success"]'
  }
];

// Category metadata
const categoryMeta = {
  content: { label: 'Content', icon: FileText, color: 'blue' },
  ecommerce: { label: 'E-commerce', icon: ShoppingCart, color: 'green' },
  media: { label: 'Media', icon: Image, color: 'purple' },
  forms: { label: 'Forms', icon: Mail, color: 'orange' },
  social: { label: 'Social', icon: Users, color: 'pink' },
  layout: { label: 'Layout', icon: FileText, color: 'indigo' },
  utility: { label: 'Utility', icon: Settings, color: 'gray' }
};

interface ShortcodeSystemProps {
  onInsert: (shortcode: string) => void;
  className?: string;
}

// Generate shortcode string from definition and values
function generateShortcode(
  shortcode: Shortcode,
  values: Record<string, string | number | boolean>,
  content?: string
): string {
  const attrs = shortcode.attributes
    .filter(attr => {
      const value = values[attr.name];
      // Include if has value and not default
      return value !== undefined && value !== '' && value !== attr.default;
    })
    .map(attr => {
      const value = values[attr.name];
      if (attr.type === 'boolean') {
        return `${attr.name}="${value ? 'true' : 'false'}"`;
      }
      return `${attr.name}="${value}"`;
    })
    .join(' ');

  const tag = shortcode.id.replace(/_/g, '_');
  const opening = attrs ? `[${tag} ${attrs}]` : `[${tag}]`;

  if (shortcode.hasContent) {
    const innerContent = content || 'Your content here';
    return `${opening}${innerContent}[/${tag}]`;
  }

  return opening;
}

// Parse shortcode string to extract tag and attributes
export function parseShortcode(shortcodeStr: string): { tag: string; attributes: Record<string, string>; content?: string } | null {
  const match = shortcodeStr.match(/\[(\w+)([^\]]*)\](?:([\s\S]*?)\[\/\1\])?/);
  if (!match) return null;

  const [, tag, attrStr, content] = match;
  const attributes: Record<string, string> = {};

  // Parse attributes
  const attrRegex = /(\w+)="([^"]*)"/g;
  let attrMatch;
  while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
    attributes[attrMatch[1]] = attrMatch[2];
  }

  return { tag, attributes, content };
}

export default function ShortcodeSystem({ onInsert, className }: ShortcodeSystemProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedShortcode, setSelectedShortcode] = useState<Shortcode | null>(null);
  const [attributeValues, setAttributeValues] = useState<Record<string, string | number | boolean>>({});
  const [shortcodeContent, setShortcodeContent] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter shortcodes
  const filteredShortcodes = useMemo(() => {
    return shortcodeLibrary.filter(sc => {
      const matchesSearch = searchQuery === '' ||
        sc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sc.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || sc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Group by category
  const groupedShortcodes = useMemo(() => {
    return filteredShortcodes.reduce((acc, sc) => {
      if (!acc[sc.category]) acc[sc.category] = [];
      acc[sc.category].push(sc);
      return acc;
    }, {} as Record<string, Shortcode[]>);
  }, [filteredShortcodes]);

  const handleSelectShortcode = useCallback((sc: Shortcode) => {
    setSelectedShortcode(sc);
    // Initialize default values
    const defaults: Record<string, string | number | boolean> = {};
    sc.attributes.forEach(attr => {
      if (attr.default !== undefined) {
        defaults[attr.name] = attr.default;
      }
    });
    setAttributeValues(defaults);
    setShortcodeContent('');
  }, []);

  const handleInsert = useCallback(() => {
    if (!selectedShortcode) return;
    const code = generateShortcode(selectedShortcode, attributeValues, shortcodeContent);
    onInsert(code);
    toast.success(`Inserted [${selectedShortcode.id}] shortcode`);
    setSelectedShortcode(null);
  }, [selectedShortcode, attributeValues, shortcodeContent, onInsert]);

  const handleCopyExample = useCallback((sc: Shortcode) => {
    if (sc.example) {
      navigator.clipboard.writeText(sc.example);
      setCopiedId(sc.id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success('Example copied to clipboard');
    }
  }, []);

  return (
    <div className={clsx('shortcode-system', className)}>
      {/* Search and Filter */}
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search shortcodes..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={clsx(
              'px-3 py-1.5 text-sm rounded-lg transition-colors',
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            All
          </button>
          {Object.entries(categoryMeta).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={clsx(
                'px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5',
                selectedCategory === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              <meta.icon size={14} />
              {meta.label}
            </button>
          ))}
        </div>
      </div>

      {/* Shortcode Editor Modal */}
      <AnimatePresence>
        {selectedShortcode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  {React.createElement(selectedShortcode.icon, { size: 18, className: 'text-blue-600 dark:text-blue-400' })}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{selectedShortcode.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedShortcode.description}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedShortcode(null)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Attributes */}
              {selectedShortcode.attributes.map(attr => (
                <div key={attr.name}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {attr.name}
                    {attr.required && <span className="text-red-500 ml-1">*</span>}
                    {attr.description && (
                      <span className="font-normal text-gray-500 ml-2">- {attr.description}</span>
                    )}
                  </label>

                  {attr.type === 'select' && attr.options && (
                    <select
                      value={String(attributeValues[attr.name] ?? attr.default ?? '')}
                      onChange={e => setAttributeValues(prev => ({ ...prev, [attr.name]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {attr.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  )}

                  {attr.type === 'boolean' && (
                    <button
                      onClick={() => setAttributeValues(prev => ({
                        ...prev,
                        [attr.name]: !prev[attr.name]
                      }))}
                      className={clsx(
                        'relative w-12 h-6 rounded-full transition-colors',
                        attributeValues[attr.name] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      )}
                    >
                      <span className={clsx(
                        'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                        attributeValues[attr.name] ? 'left-7' : 'left-1'
                      )} />
                    </button>
                  )}

                  {(attr.type === 'text' || attr.type === 'url' || attr.type === 'id') && (
                    <input
                      type={attr.type === 'url' ? 'url' : 'text'}
                      value={String(attributeValues[attr.name] ?? '')}
                      onChange={e => setAttributeValues(prev => ({ ...prev, [attr.name]: e.target.value }))}
                      placeholder={attr.placeholder}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500"
                    />
                  )}

                  {attr.type === 'number' && (
                    <input
                      type="number"
                      value={Number(attributeValues[attr.name] ?? attr.default ?? 0)}
                      onChange={e => setAttributeValues(prev => ({ ...prev, [attr.name]: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  )}
                </div>
              ))}

              {/* Content field for wrapping shortcodes */}
              {selectedShortcode.hasContent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content
                  </label>
                  <textarea
                    value={shortcodeContent}
                    onChange={e => setShortcodeContent(e.target.value)}
                    placeholder="Enter content to wrap..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 resize-none"
                  />
                </div>
              )}

              {/* Preview */}
              <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-lg">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Preview</label>
                <code className="text-sm text-blue-600 dark:text-blue-400 break-all">
                  {generateShortcode(selectedShortcode, attributeValues, shortcodeContent)}
                </code>
              </div>

              {/* Insert Button */}
              <button
                onClick={handleInsert}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Insert Shortcode
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shortcodes List */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {Object.entries(groupedShortcodes).map(([category, shortcodes]) => (
          <div key={category}>
            <div className="flex items-center gap-2 mb-2">
              {React.createElement(categoryMeta[category as keyof typeof categoryMeta]?.icon || Code, {
                size: 14,
                className: 'text-gray-500'
              })}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {categoryMeta[category as keyof typeof categoryMeta]?.label || category}
              </span>
              <span className="text-xs text-gray-500">({shortcodes.length})</span>
            </div>

            <div className="grid gap-2">
              {shortcodes.map(sc => {
                const Icon = sc.icon;
                return (
                  <div
                    key={sc.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
                        <Icon size={16} className="text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white text-sm">{sc.name}</span>
                          <code className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                            {sc.syntax}
                          </code>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{sc.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {sc.example && (
                        <button
                          onClick={() => handleCopyExample(sc)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 transition-colors"
                          title="Copy example"
                        >
                          {copiedId === sc.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                      )}
                      <button
                        onClick={() => handleSelectShortcode(sc)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                      >
                        <Plus size={12} />
                        Insert
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredShortcodes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Code size={32} className="mb-2 opacity-50" />
            <p className="text-sm">No shortcodes found</p>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-2">
          <Info size={14} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700 dark:text-blue-300">
            Shortcodes are special tags that let you add dynamic content to your posts.
            They are processed when the page is rendered to the visitor.
          </p>
        </div>
      </div>
    </div>
  );
}
