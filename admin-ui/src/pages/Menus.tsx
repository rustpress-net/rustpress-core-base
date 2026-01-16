import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Menu,
  Plus,
  Trash2,
  Edit3,
  GripVertical,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  FolderTree,
  Link,
  Hash,
  Settings,
  Eye,
  Save,
  Copy,
  MoreVertical,
  Search,
  Check,
  X,
  Home,
  Layers,
  Target,
  AlertCircle,
  LayoutGrid,
  Sparkles,
  Wand2,
  Monitor,
  ArrowRight,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { SimpleMegaMenuBuilder, type MegaMenuConfig } from '../components/megamenu';
import { GlassCard, PageHeader, GradientText, AnimatedBackground, staggerContainer, fadeInUp, EnhancedButton } from '../components/ui/EnhancedUI';

type MenuStyle = 'classic' | 'megamenu';

// Types
interface MenuItem {
  id: string;
  title: string;
  url: string;
  type: 'page' | 'post' | 'category' | 'custom' | 'home';
  target: '_self' | '_blank';
  cssClass?: string;
  description?: string;
  children: MenuItem[];
  isOpen?: boolean;
  menuStyle: MenuStyle;
  megaMenuConfig?: MegaMenuConfig;
}

type MenuType = 'classic' | 'megamenu';

interface MenuData {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  menuType: MenuType;
  megaMenuConfig?: MegaMenuConfig;
  items: MenuItem[];
  createdAt: string;
  updatedAt: string;
}

interface ThemeLocation {
  id: string;
  name: string;
  description: string;
  assignedMenu: string | null;
}

// Mock data
const mockMenus: MenuData[] = [
  {
    id: 'menu-1',
    name: 'Main Navigation',
    slug: 'main-navigation',
    location: 'primary',
    menuType: 'classic',
    items: [
      { id: 'item-1', title: 'Home', url: '/', type: 'home', target: '_self', children: [], menuStyle: 'classic' },
      {
        id: 'item-2',
        title: 'About Us',
        url: '/about',
        type: 'page',
        target: '_self',
        menuStyle: 'classic',
        children: [
          { id: 'item-2-1', title: 'Our Team', url: '/about/team', type: 'page', target: '_self', children: [], menuStyle: 'classic' },
          { id: 'item-2-2', title: 'Careers', url: '/about/careers', type: 'page', target: '_self', children: [], menuStyle: 'classic' },
        ]
      },
      {
        id: 'item-3',
        title: 'Services',
        url: '/services',
        type: 'page',
        target: '_self',
        children: [],
        menuStyle: 'megamenu',
        megaMenuConfig: {
          id: 'mega-1',
          enabled: true,
          width: 'container',
          columns: [
            {
              id: 'col-1',
              width: 33,
              widgets: [
                {
                  id: 'w-1',
                  type: 'links',
                  title: 'Web Development',
                  showTitle: true,
                  config: {
                    links: [
                      { id: 'l-1', label: 'Frontend Development', url: '/services/frontend', target: '_self' },
                      { id: 'l-2', label: 'Backend Development', url: '/services/backend', target: '_self' },
                      { id: 'l-3', label: 'Full Stack Solutions', url: '/services/fullstack', target: '_self' },
                    ]
                  },
                  style: { padding: { top: 0, right: 0, bottom: 0, left: 0 }, margin: { top: 0, right: 0, bottom: 0, left: 0 }, borderRadius: 0 }
                }
              ],
              alignment: 'start',
              verticalAlign: 'top'
            },
            {
              id: 'col-2',
              width: 33,
              widgets: [
                {
                  id: 'w-2',
                  type: 'links',
                  title: 'Mobile Apps',
                  showTitle: true,
                  config: {
                    links: [
                      { id: 'l-4', label: 'iOS Development', url: '/services/ios', target: '_self' },
                      { id: 'l-5', label: 'Android Development', url: '/services/android', target: '_self' },
                      { id: 'l-6', label: 'Cross-Platform Apps', url: '/services/cross-platform', target: '_self' },
                    ]
                  },
                  style: { padding: { top: 0, right: 0, bottom: 0, left: 0 }, margin: { top: 0, right: 0, bottom: 0, left: 0 }, borderRadius: 0 }
                }
              ],
              alignment: 'start',
              verticalAlign: 'top'
            },
            {
              id: 'col-3',
              width: 34,
              widgets: [
                {
                  id: 'w-3',
                  type: 'cta-button',
                  title: 'Get Started',
                  showTitle: false,
                  config: {
                    ctaButton: {
                      text: 'Request a Quote',
                      url: '/contact',
                      target: '_self',
                      style: 'solid',
                      size: 'md',
                      color: '#3b82f6',
                      iconPosition: 'left',
                      fullWidth: true,
                      animation: 'none'
                    }
                  },
                  style: { padding: { top: 0, right: 0, bottom: 0, left: 0 }, margin: { top: 0, right: 0, bottom: 0, left: 0 }, borderRadius: 0 }
                }
              ],
              alignment: 'start',
              verticalAlign: 'top'
            }
          ],
          background: { type: 'solid', color: '#ffffff' },
          padding: { top: 24, right: 24, bottom: 24, left: 24 },
          animation: { entrance: { type: 'fade', duration: 200, delay: 0, easing: 'ease-out' }, exit: { type: 'fade', duration: 150, easing: 'ease-in' }, stagger: { enabled: false, delay: 50, from: 'start' }, hover: { type: 'none', intensity: 0 } },
          effects: { glassmorphism: { enabled: false, blur: 0, opacity: 0.8, borderOpacity: 0.2 }, blur: { enabled: false, amount: 0 }, noise: { enabled: false, opacity: 0.05 }, grain: { enabled: false, opacity: 0.1 }, parallax: { enabled: false, intensity: 10 }, cursor: { type: 'pointer' } },
          responsive: { tablet: { columns: 'inherit', width: 'full', hidden: false }, mobile: { columns: 1, width: 'full', hidden: false, accordion: true } },
          advanced: { closeOnClick: false, closeOnOutsideClick: true, openDelay: 0, closeDelay: 200, hoverIntent: true, touchBehavior: 'toggle', preventBodyScroll: false, trapFocus: true, ariaBehavior: 'menu' }
        }
      },
      { id: 'item-4', title: 'Blog', url: '/blog', type: 'page', target: '_self', children: [], menuStyle: 'classic' },
      { id: 'item-5', title: 'Contact', url: '/contact', type: 'page', target: '_self', children: [], menuStyle: 'classic' },
    ],
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-20T14:30:00Z',
  },
  {
    id: 'menu-2',
    name: 'Footer Menu',
    slug: 'footer-menu',
    location: 'footer',
    menuType: 'classic',
    items: [
      { id: 'f-item-1', title: 'Privacy Policy', url: '/privacy', type: 'page', target: '_self', children: [], menuStyle: 'classic' },
      { id: 'f-item-2', title: 'Terms of Service', url: '/terms', type: 'page', target: '_self', children: [], menuStyle: 'classic' },
      { id: 'f-item-3', title: 'Cookie Policy', url: '/cookies', type: 'page', target: '_self', children: [], menuStyle: 'classic' },
    ],
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-18T09:15:00Z',
  },
  {
    id: 'menu-3',
    name: 'Social Links',
    slug: 'social-links',
    location: 'social',
    menuType: 'classic',
    items: [
      { id: 's-item-1', title: 'Twitter', url: 'https://twitter.com', type: 'custom', target: '_blank', children: [], menuStyle: 'classic' },
      { id: 's-item-2', title: 'Facebook', url: 'https://facebook.com', type: 'custom', target: '_blank', children: [], menuStyle: 'classic' },
      { id: 's-item-3', title: 'LinkedIn', url: 'https://linkedin.com', type: 'custom', target: '_blank', children: [], menuStyle: 'classic' },
    ],
    createdAt: '2025-01-16T11:00:00Z',
    updatedAt: '2025-01-16T11:00:00Z',
  },
];

const themeLocations: ThemeLocation[] = [
  { id: 'primary', name: 'Primary Navigation', description: 'Main menu in the header', assignedMenu: 'menu-1' },
  { id: 'secondary', name: 'Secondary Navigation', description: 'Secondary menu below header', assignedMenu: null },
  { id: 'footer', name: 'Footer Menu', description: 'Links in the footer area', assignedMenu: 'menu-2' },
  { id: 'social', name: 'Social Links', description: 'Social media links', assignedMenu: 'menu-3' },
  { id: 'mobile', name: 'Mobile Menu', description: 'Menu for mobile devices', assignedMenu: null },
];

const mockPages = [
  { id: 'p-1', title: 'Home', url: '/' },
  { id: 'p-2', title: 'About Us', url: '/about' },
  { id: 'p-3', title: 'Services', url: '/services' },
  { id: 'p-4', title: 'Blog', url: '/blog' },
  { id: 'p-5', title: 'Contact', url: '/contact' },
  { id: 'p-6', title: 'Privacy Policy', url: '/privacy' },
  { id: 'p-7', title: 'Terms of Service', url: '/terms' },
];

const mockPosts = [
  { id: 'post-1', title: 'Getting Started with RustPress', url: '/blog/getting-started' },
  { id: 'post-2', title: 'Advanced Theming Guide', url: '/blog/theming-guide' },
  { id: 'post-3', title: 'Performance Optimization', url: '/blog/performance' },
];

const mockCategories = [
  { id: 'cat-1', title: 'Technology', url: '/category/technology' },
  { id: 'cat-2', title: 'Design', url: '/category/design' },
  { id: 'cat-3', title: 'Business', url: '/category/business' },
];

// Menu Item Component with drag and drop
function MenuItemRow({
  item,
  depth = 0,
  onUpdate,
  onDelete,
  onAddChild,
  onToggle,
  onConfigureMegaMenu,
}: {
  item: MenuItem;
  depth?: number;
  onUpdate: (id: string, updates: Partial<MenuItem>) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onToggle: (id: string) => void;
  onConfigureMegaMenu: (item: MenuItem) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editUrl, setEditUrl] = useState(item.url);
  const [showOptions, setShowOptions] = useState(false);

  const hasChildren = item.children && item.children.length > 0;
  const isOpen = item.isOpen !== false;

  const handleSave = () => {
    onUpdate(item.id, { title: editTitle, url: editUrl });
    setIsEditing(false);
    toast.success('Menu item updated');
  };

  const typeIcons = {
    page: FileText,
    post: FileText,
    category: FolderTree,
    custom: Link,
    home: Home,
  };
  const TypeIcon = typeIcons[item.type] || Link;

  return (
    <motion.div className="select-none" variants={fadeInUp}>
      <div
        className={clsx(
          'flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mb-2 group hover:border-primary-300 dark:hover:border-primary-600 transition-colors',
          isEditing && 'ring-2 ring-primary-500'
        )}
        style={{ marginLeft: depth * 24 }}
      >
        {/* Drag handle */}
        <div className="cursor-grab text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <GripVertical size={18} />
        </div>

        {/* Expand/collapse for nested items */}
        {hasChildren ? (
          <button
            onClick={() => onToggle(item.id)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 dark:text-gray-400"
          >
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <div className="w-6" />
        )}

        {/* Type icon */}
        <div className={clsx(
          'p-1.5 rounded',
          item.type === 'home' && 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
          item.type === 'page' && 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
          item.type === 'post' && 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
          item.type === 'category' && 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
          item.type === 'custom' && 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
        )}>
          <TypeIcon size={14} />
        </div>

        {/* Title and URL */}
        {isEditing ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Title"
              autoFocus
            />
            <input
              type="text"
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="URL"
            />
            <button
              onClick={handleSave}
              className="p-1.5 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Check size={14} />
            </button>
            <button
              onClick={() => {
                setEditTitle(item.title);
                setEditUrl(item.url);
                setIsEditing(false);
              }}
              className="p-1.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">{item.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.url}</p>
            </div>

            {/* Menu Style Badge */}
            {item.menuStyle === 'megamenu' ? (
              <span className={clsx(
                'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                item.megaMenuConfig
                  ? 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 text-purple-700 dark:text-purple-300'
                  : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-dashed border-purple-300 dark:border-purple-600'
              )}>
                <LayoutGrid size={10} />
                {item.megaMenuConfig ? 'Mega Menu' : 'Mega (configure)'}
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full text-xs">
                <Menu size={10} />
                Classic
              </span>
            )}

            {/* Target indicator */}
            {item.target === '_blank' && (
              <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                <ExternalLink size={10} className="inline mr-1" />
                New Tab
              </span>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Edit"
              >
                <Edit3 size={14} />
              </button>
              {item.menuStyle === 'megamenu' && (
                <button
                  onClick={() => onConfigureMegaMenu(item)}
                  className="p-1.5 text-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded"
                  title="Configure Mega Menu"
                >
                  <Wand2 size={14} />
                </button>
              )}
              <button
                onClick={() => onAddChild(item.id)}
                className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Add sub-item"
              >
                <Plus size={14} />
              </button>
              <button
                onClick={() => {
                  if (confirm('Delete this menu item?')) {
                    onDelete(item.id);
                    toast.success('Menu item deleted');
                  }
                }}
                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Render children */}
      {hasChildren && isOpen && (
        <div>
          {item.children.map((child) => (
            <MenuItemRow
              key={child.id}
              item={child}
              depth={depth + 1}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onToggle={onToggle}
              onConfigureMegaMenu={onConfigureMegaMenu}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// Add Item Panel
function AddItemPanel({
  onAdd
}: {
  onAdd: (item: Omit<MenuItem, 'id' | 'children'>) => void
}) {
  const [activeTab, setActiveTab] = useState<'pages' | 'posts' | 'categories' | 'custom'>('pages');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [customTitle, setCustomTitle] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<MenuStyle>('classic');

  const toggleItem = (id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAddSelected = () => {
    const items = activeTab === 'pages'
      ? mockPages.filter(p => selectedItems.has(p.id))
      : activeTab === 'posts'
        ? mockPosts.filter(p => selectedItems.has(p.id))
        : mockCategories.filter(c => selectedItems.has(c.id));

    items.forEach(item => {
      onAdd({
        title: item.title,
        url: item.url,
        type: activeTab === 'pages' ? 'page' : activeTab === 'posts' ? 'post' : 'category',
        target: '_self',
        menuStyle: selectedStyle,
      });
    });

    setSelectedItems(new Set());
    const styleLabel = selectedStyle === 'megamenu' ? ' as Mega Menu' : '';
    toast.success(`Added ${items.length} item(s)${styleLabel} to menu`);
  };

  const handleAddCustom = () => {
    if (!customTitle || !customUrl) {
      toast.error('Please enter title and URL');
      return;
    }
    onAdd({
      title: customTitle,
      url: customUrl,
      type: 'custom',
      target: customUrl.startsWith('http') ? '_blank' : '_self',
      menuStyle: selectedStyle,
    });
    setCustomTitle('');
    setCustomUrl('');
    const styleLabel = selectedStyle === 'megamenu' ? ' as Mega Menu' : '';
    toast.success(`Custom link added${styleLabel}`);
  };

  const filteredPages = mockPages.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredPosts = mockPosts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCategories = mockCategories.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Plus size={18} />
          Add Menu Items
        </h3>
      </div>

      {/* Menu Style Selector */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Menu Style
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setSelectedStyle('classic')}
            className={clsx(
              'flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all text-sm',
              selectedStyle === 'classic'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
            )}
          >
            <Menu size={16} />
            <span className="font-medium">Classic</span>
          </button>
          <button
            onClick={() => setSelectedStyle('megamenu')}
            className={clsx(
              'flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all text-sm relative overflow-hidden',
              selectedStyle === 'megamenu'
                ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300'
                : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
            )}
          >
            <LayoutGrid size={16} />
            <span className="font-medium">Mega Menu</span>
            <Sparkles size={12} className="absolute top-1 right-1 text-pink-500" />
          </button>
        </div>
        {selectedStyle === 'megamenu' && (
          <p className="mt-2 text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
            <Wand2 size={12} />
            Configure after adding to customize columns & widgets
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {(['pages', 'posts', 'categories', 'custom'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSearchQuery('');
              setSelectedItems(new Set());
            }}
            className={clsx(
              'flex-1 px-4 py-3 text-sm font-medium transition-colors -mb-px',
              activeTab === tab
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border-b-2 border-transparent'
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab !== 'custom' && (
          <>
            {/* Search */}
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Items list */}
            <div className="max-h-48 overflow-y-auto space-y-1 mb-3">
              {(activeTab === 'pages' ? filteredPages : activeTab === 'posts' ? filteredPosts : filteredCategories).map((item) => (
                <label
                  key={item.id}
                  className={clsx(
                    'flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors',
                    selectedItems.has(item.id)
                      ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => toggleItem(item.id)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.url}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Add button */}
            <button
              onClick={handleAddSelected}
              disabled={selectedItems.size === 0}
              className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Add Selected ({selectedItems.size})
            </button>
          </>
        )}

        {activeTab === 'custom' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Link text"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL
              </label>
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <button
              onClick={handleAddCustom}
              className="w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
            >
              Add Custom Link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Menu Locations Panel
function MenuLocationsPanel({
  menus,
  locations,
  onAssign,
}: {
  menus: MenuData[];
  locations: ThemeLocation[];
  onAssign: (locationId: string, menuId: string | null) => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Target size={18} />
          Menu Locations
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Assign menus to theme locations
        </p>
      </div>

      <div className="p-4 space-y-4">
        {locations.map((location) => (
          <div key={location.id} className="space-y-2">
            <label className="block">
              <span className="text-sm font-medium text-gray-900 dark:text-white">{location.name}</span>
              <span className="block text-xs text-gray-500 dark:text-gray-400">{location.description}</span>
            </label>
            <select
              value={location.assignedMenu || ''}
              onChange={(e) => onAssign(location.id, e.target.value || null)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">— Select a Menu —</option>
              {menus.map((menu) => (
                <option key={menu.id} value={menu.id}>{menu.name}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Menus Page
export default function Menus() {
  const [menus, setMenus] = useState<MenuData[]>(mockMenus);
  const [locations, setLocations] = useState<ThemeLocation[]>(themeLocations);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(mockMenus[0]?.id || null);
  const [isCreating, setIsCreating] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Mega Menu Builder state
  const [megaMenuBuilderOpen, setMegaMenuBuilderOpen] = useState(false);
  const [megaMenuTargetItem, setMegaMenuTargetItem] = useState<MenuItem | null>(null);

  const selectedMenu = useMemo(() =>
    menus.find(m => m.id === selectedMenuId),
    [menus, selectedMenuId]
  );

  // Generate unique ID
  const generateId = () => `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Create new menu
  const handleCreateMenu = () => {
    if (!newMenuName.trim()) {
      toast.error('Please enter a menu name');
      return;
    }

    const newMenu: MenuData = {
      id: `menu-${Date.now()}`,
      name: newMenuName,
      slug: newMenuName.toLowerCase().replace(/\s+/g, '-'),
      location: null,
      menuType: 'classic',
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMenus(prev => [...prev, newMenu]);
    setSelectedMenuId(newMenu.id);
    setNewMenuName('');
    setIsCreating(false);
    toast.success('Menu created');
  };

  // Delete menu
  const handleDeleteMenu = (menuId: string) => {
    if (!confirm('Are you sure you want to delete this menu?')) return;

    setMenus(prev => prev.filter(m => m.id !== menuId));
    if (selectedMenuId === menuId) {
      setSelectedMenuId(menus[0]?.id || null);
    }
    toast.success('Menu deleted');
  };

  // Add item to menu
  const handleAddItem = useCallback((item: Omit<MenuItem, 'id' | 'children'>) => {
    if (!selectedMenuId) return;

    const newItem: MenuItem = {
      ...item,
      id: generateId(),
      children: [],
    };

    setMenus(prev => prev.map(menu => {
      if (menu.id === selectedMenuId) {
        return {
          ...menu,
          items: [...menu.items, newItem],
          updatedAt: new Date().toISOString(),
        };
      }
      return menu;
    }));
    setHasUnsavedChanges(true);
  }, [selectedMenuId]);

  // Update menu item (recursive)
  const updateItemRecursive = (items: MenuItem[], id: string, updates: Partial<MenuItem>): MenuItem[] => {
    return items.map(item => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      if (item.children.length > 0) {
        return { ...item, children: updateItemRecursive(item.children, id, updates) };
      }
      return item;
    });
  };

  const handleUpdateItem = useCallback((id: string, updates: Partial<MenuItem>) => {
    if (!selectedMenuId) return;

    setMenus(prev => prev.map(menu => {
      if (menu.id === selectedMenuId) {
        return {
          ...menu,
          items: updateItemRecursive(menu.items, id, updates),
          updatedAt: new Date().toISOString(),
        };
      }
      return menu;
    }));
    setHasUnsavedChanges(true);
  }, [selectedMenuId]);

  // Mega Menu Builder functions
  const handleConfigureMegaMenu = useCallback((item: MenuItem) => {
    setMegaMenuTargetItem(item);
    setMegaMenuBuilderOpen(true);
  }, []);

  const handleCloseMegaMenuBuilder = () => {
    setMegaMenuBuilderOpen(false);
    setMegaMenuTargetItem(null);
  };

  const handleSaveMegaMenuConfig = (config: MegaMenuConfig) => {
    if (!megaMenuTargetItem) return;
    handleUpdateItem(megaMenuTargetItem.id, { megaMenuConfig: config });
    handleCloseMegaMenuBuilder();
    toast.success('Mega Menu configured successfully');
  };

  // Delete menu item (recursive)
  const deleteItemRecursive = (items: MenuItem[], id: string): MenuItem[] => {
    return items.filter(item => {
      if (item.id === id) return false;
      if (item.children.length > 0) {
        item.children = deleteItemRecursive(item.children, id);
      }
      return true;
    });
  };

  const handleDeleteItem = useCallback((id: string) => {
    if (!selectedMenuId) return;

    setMenus(prev => prev.map(menu => {
      if (menu.id === selectedMenuId) {
        return {
          ...menu,
          items: deleteItemRecursive(menu.items, id),
          updatedAt: new Date().toISOString(),
        };
      }
      return menu;
    }));
    setHasUnsavedChanges(true);
  }, [selectedMenuId]);

  // Add child item
  const handleAddChild = useCallback((parentId: string) => {
    if (!selectedMenuId) return;

    const newChild: MenuItem = {
      id: generateId(),
      title: 'New Item',
      url: '#',
      type: 'custom',
      target: '_self',
      children: [],
      menuStyle: 'classic',
    };

    const addChildRecursive = (items: MenuItem[]): MenuItem[] => {
      return items.map(item => {
        if (item.id === parentId) {
          return { ...item, children: [...item.children, newChild], isOpen: true };
        }
        if (item.children.length > 0) {
          return { ...item, children: addChildRecursive(item.children) };
        }
        return item;
      });
    };

    setMenus(prev => prev.map(menu => {
      if (menu.id === selectedMenuId) {
        return {
          ...menu,
          items: addChildRecursive(menu.items),
          updatedAt: new Date().toISOString(),
        };
      }
      return menu;
    }));
    setHasUnsavedChanges(true);
  }, [selectedMenuId]);

  // Toggle item expansion
  const handleToggleItem = useCallback((id: string) => {
    if (!selectedMenuId) return;

    const toggleRecursive = (items: MenuItem[]): MenuItem[] => {
      return items.map(item => {
        if (item.id === id) {
          return { ...item, isOpen: item.isOpen === false };
        }
        if (item.children.length > 0) {
          return { ...item, children: toggleRecursive(item.children) };
        }
        return item;
      });
    };

    setMenus(prev => prev.map(menu => {
      if (menu.id === selectedMenuId) {
        return { ...menu, items: toggleRecursive(menu.items) };
      }
      return menu;
    }));
  }, [selectedMenuId]);

  // Assign menu to location
  const handleAssignLocation = (locationId: string, menuId: string | null) => {
    setLocations(prev => prev.map(loc => {
      if (loc.id === locationId) {
        return { ...loc, assignedMenu: menuId };
      }
      return loc;
    }));
    toast.success('Menu location updated');
  };

  // Save menu
  const handleSave = () => {
    // In real app, this would save to backend
    setHasUnsavedChanges(false);
    toast.success('Menu saved successfully');
  };

  return (
    <motion.div 
      className="relative min-h-screen"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Animated Background */}
      <AnimatedBackground className="fixed" />
      
      <div className="relative z-10 space-y-6">
        {/* Enhanced Header */}
        <PageHeader
          title="Navigation Menus"
          subtitle="Create and manage navigation menus for your site with mega menu support"
          icon={<Menu size={24} />}
          gradient
          actions={
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <span className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full">
                  <AlertCircle size={16} />
                  Unsaved changes
                </span>
              )}
              <EnhancedButton
                variant="primary"
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
                icon={<Save size={18} />}
                glow
              >
                Save Menu
              </EnhancedButton>
            </div>
          }
        />

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-4 gap-6"
          variants={fadeInUp}
        >
          {/* Left sidebar - Menu selector and Add items */}
          <div className="lg:col-span-1 space-y-6">
            {/* Menu selector */}
            <GlassCard variant="gradient" padding="none" className="overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Menu size={18} />
                Select Menu
              </h3>
              <button
                onClick={() => setIsCreating(true)}
                className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                title="Create new menu"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="p-2">
              {/* Create new menu form */}
              {isCreating && (
                <div className="p-3 mb-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
                  <input
                    type="text"
                    value={newMenuName}
                    onChange={(e) => setNewMenuName(e.target.value)}
                    placeholder="Menu name..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateMenu}
                      className="flex-1 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setIsCreating(false);
                        setNewMenuName('');
                      }}
                      className="flex-1 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Menu list */}
              {menus.map((menu) => (
                <button
                  key={menu.id}
                  onClick={() => setSelectedMenuId(menu.id)}
                  className={clsx(
                    'w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left group',
                    selectedMenuId === menu.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                  )}
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{menu.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {menu.items.length} items
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMenu(menu.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </button>
              ))}

              {menus.length === 0 && !isCreating && (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <Menu size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No menus yet</p>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="mt-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                  >
                    Create your first menu
                  </button>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Add items panel */}
          {selectedMenu && (
            <AddItemPanel onAdd={handleAddItem} />
          )}

          {/* Menu locations */}
          <MenuLocationsPanel
            menus={menus}
            locations={locations}
            onAssign={handleAssignLocation}
          />
        </div>

        {/* Right side - Menu structure */}
        <div className="lg:col-span-3">
          {selectedMenu ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Menu header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Layers size={18} />
                    {selectedMenu.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Drag items to reorder • Click to edit • Add sub-items for dropdowns
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // Copy menu
                      const copy: MenuData = {
                        ...selectedMenu,
                        id: `menu-${Date.now()}`,
                        name: `${selectedMenu.name} (Copy)`,
                        slug: `${selectedMenu.slug}-copy`,
                        location: null,
                      };
                      setMenus(prev => [...prev, copy]);
                      toast.success('Menu duplicated');
                    }}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    title="Duplicate menu"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-4">
                {selectedMenu.items.length > 0 ? (
                  <div className="space-y-2">
                    {selectedMenu.items.map((item) => (
                      <MenuItemRow
                        key={item.id}
                        item={item}
                        onUpdate={handleUpdateItem}
                        onDelete={handleDeleteItem}
                        onAddChild={handleAddChild}
                        onToggle={handleToggleItem}
                        onConfigureMegaMenu={handleConfigureMegaMenu}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Menu size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No menu items yet</p>
                    <p className="text-sm mt-1">Add pages, posts, categories, or custom links from the panel on the left</p>
                  </div>
                )}
              </div>

              {/* Live Menu Preview */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Monitor size={16} />
                  Live Preview
                  <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
                    <Eye size={12} />
                    Hover items to see dropdowns
                  </span>
                </h4>

                {/* Simulated Browser Frame */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                  {/* Browser Chrome */}
                  <div className="bg-gray-100 dark:bg-gray-900 px-4 py-2 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-white dark:bg-gray-700 rounded-md px-3 py-1 text-xs text-gray-500 text-center">
                        yourwebsite.com
                      </div>
                    </div>
                  </div>

                  {/* Header Simulation */}
                  <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-lg text-gray-900 dark:text-white">Your Logo</div>

                      {/* Navigation */}
                      <nav className="flex items-center gap-6">
                        {selectedMenu.items.map((item) => (
                          <div key={item.id} className="relative group">
                            <a
                              href="#"
                              onClick={(e) => e.preventDefault()}
                              className={clsx(
                                "font-medium text-sm flex items-center gap-1 py-2 transition-colors",
                                item.menuStyle === 'megamenu'
                                  ? "text-purple-600 dark:text-purple-400 hover:text-purple-700"
                                  : "text-gray-700 dark:text-gray-300 hover:text-primary-600"
                              )}
                            >
                              {item.title}
                              {(item.children.length > 0 || item.menuStyle === 'megamenu') && (
                                <ChevronDown size={14} className="text-gray-400 group-hover:rotate-180 transition-transform" />
                              )}
                            </a>

                            {/* Classic Dropdown */}
                            {item.menuStyle === 'classic' && item.children.length > 0 && (
                              <div className="absolute top-full left-0 mt-0 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
                                {item.children.map((child) => (
                                  <a
                                    key={child.id}
                                    href="#"
                                    onClick={(e) => e.preventDefault()}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary-600 transition-colors"
                                  >
                                    <ArrowRight size={12} className="text-gray-400" />
                                    {child.title}
                                    {child.target === '_blank' && <ExternalLink size={10} className="ml-auto text-gray-400" />}
                                  </a>
                                ))}
                              </div>
                            )}

                            {/* Mega Menu Dropdown - Actual Render */}
                            {item.menuStyle === 'megamenu' && item.megaMenuConfig && (
                              <div
                                className="absolute top-full left-1/2 -translate-x-1/2 mt-0 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50"
                                style={{
                                  width: item.megaMenuConfig.width === 'full' ? '800px' :
                                         item.megaMenuConfig.width === 'container' ? '700px' : 'auto',
                                  minWidth: '500px',
                                  background: item.megaMenuConfig.background.type === 'solid'
                                    ? item.megaMenuConfig.background.color
                                    : item.megaMenuConfig.background.type === 'gradient' && item.megaMenuConfig.background.gradient
                                      ? `linear-gradient(${item.megaMenuConfig.background.gradient.angle}deg, ${item.megaMenuConfig.background.gradient.colors.map(c => `${c.color} ${c.position}%`).join(', ')})`
                                      : '#ffffff'
                                }}
                              >
                                <div
                                  className="p-6 grid gap-6"
                                  style={{ gridTemplateColumns: `repeat(${item.megaMenuConfig.columns.length}, 1fr)` }}
                                >
                                  {item.megaMenuConfig.columns.map((column, colIdx) => {
                                    const isDark = item.megaMenuConfig?.background.color?.startsWith('#1') ||
                                                   item.megaMenuConfig?.background.color?.startsWith('#0');
                                    return (
                                      <div key={column.id || colIdx} className="space-y-4">
                                        {column.widgets.map((widget) => (
                                          <div key={widget.id}>
                                            {widget.showTitle && (
                                              <h4 className={clsx(
                                                "font-semibold text-sm mb-3 pb-2 border-b",
                                                isDark ? "text-white border-white/20" : "text-gray-900 border-gray-200"
                                              )}>
                                                {widget.title}
                                              </h4>
                                            )}

                                            {/* Links Widget */}
                                            {widget.type === 'links' && widget.config.links && (
                                              <ul className="space-y-2">
                                                {(widget.config.links as any[]).map((link) => (
                                                  <li key={link.id}>
                                                    <a
                                                      href="#"
                                                      onClick={(e) => e.preventDefault()}
                                                      className={clsx(
                                                        "flex items-center gap-2 text-sm hover:underline",
                                                        isDark ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-gray-900"
                                                      )}
                                                    >
                                                      <ArrowRight size={12} className="opacity-50" />
                                                      {link.label}
                                                    </a>
                                                  </li>
                                                ))}
                                              </ul>
                                            )}

                                            {/* Image Widget */}
                                            {widget.type === 'image' && widget.config.image && (
                                              <div className="rounded-lg overflow-hidden">
                                                <img
                                                  src={(widget.config.image as any).src}
                                                  alt={(widget.config.image as any).alt}
                                                  className="w-full h-auto object-cover"
                                                  style={{ aspectRatio: '16/9', maxHeight: '120px' }}
                                                />
                                              </div>
                                            )}

                                            {/* Text Widget */}
                                            {widget.type === 'text' && widget.config.text && (
                                              <p className={clsx(
                                                "text-sm leading-relaxed",
                                                isDark ? "text-gray-300" : "text-gray-600"
                                              )}>
                                                {(widget.config.text as any).content}
                                              </p>
                                            )}

                                            {/* Posts Widget */}
                                            {widget.type === 'posts' && widget.config.posts && (
                                              <div className="space-y-2">
                                                {Array.from({ length: Math.min((widget.config.posts as any).count || 3, 3) }).map((_, idx) => (
                                                  <div key={idx} className="flex gap-2">
                                                    {(widget.config.posts as any).showImage && (
                                                      <div className="w-12 h-8 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0" />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                      <div className={clsx(
                                                        "text-xs font-medium truncate",
                                                        isDark ? "text-white" : "text-gray-900"
                                                      )}>
                                                        Sample Post {idx + 1}
                                                      </div>
                                                      {(widget.config.posts as any).showDate && (
                                                        <div className="text-xs text-gray-400">Dec 20</div>
                                                      )}
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            )}

                                            {/* CTA Button Widget */}
                                            {widget.type === 'cta-button' && (widget.config as any).cta && (
                                              <button className={clsx(
                                                "px-4 py-2 rounded-lg text-sm font-medium",
                                                ((widget.config as any).cta as any).style === 'primary' && "bg-primary-600 text-white",
                                                ((widget.config as any).cta as any).style === 'secondary' && "bg-gray-200 text-gray-900",
                                                ((widget.config as any).cta as any).style === 'outline' && "border-2 border-primary-600 text-primary-600"
                                              )}>
                                                {((widget.config as any).cta as any).text}
                                              </button>
                                            )}
                                          </div>
                                        ))}

                                        {column.widgets.length === 0 && (
                                          <div className="text-center py-4 text-gray-400 text-xs italic">
                                            Empty column
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Mega Menu - Not Configured */}
                            {item.menuStyle === 'megamenu' && !item.megaMenuConfig && (
                              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-purple-200 dark:border-purple-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-6 z-50 text-center">
                                <LayoutGrid size={32} className="mx-auto mb-3 text-purple-300" />
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                  Configure your mega menu to see the preview
                                </p>
                                <button
                                  onClick={() => handleConfigureMegaMenu(item)}
                                  className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
                                >
                                  <Wand2 size={14} />
                                  Configure
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </nav>

                      <div className="flex items-center gap-3">
                        <Search size={18} className="text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Page Content Placeholder */}
                  <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-[100px]">
                    <div className="text-center text-gray-400 text-sm">
                      <p>Page content area</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Menu size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Select or Create a Menu
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Choose a menu from the list or create a new one to get started
              </p>
              <button
                onClick={() => setIsCreating(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 inline-flex items-center gap-2"
              >
                <Plus size={18} />
                Create New Menu
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Mega Menu Builder Modal */}
      {megaMenuBuilderOpen && megaMenuTargetItem && (
        <SimpleMegaMenuBuilder
          menuItemId={megaMenuTargetItem.id}
          menuItemLabel={megaMenuTargetItem.title}
          config={megaMenuTargetItem.megaMenuConfig || null}
          onSave={handleSaveMegaMenuConfig}
          onClose={handleCloseMegaMenuBuilder}
        />
      )}
      </div>
    </motion.div>
  );
}
