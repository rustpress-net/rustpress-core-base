import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sidebar,
  Plus,
  Trash2,
  Edit3,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Save,
  Settings,
  Check,
  X,
  Search,
  FileText,
  Calendar,
  Tag,
  FolderTree,
  MessageSquare,
  Image,
  Link,
  List,
  Archive,
  User,
  Rss,
  Hash,
  Clock,
  Bookmark,
  Star,
  Heart,
  Share2,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Globe,
  Code,
  LayoutGrid,
  AlertCircle,
  Copy,
  Layers,
  Box,
  Type,
  Video,
  Music,
  ShoppingCart,
  ShoppingBag,
  DollarSign,
  Percent,
  BarChart2,
  PieChart,
  TrendingUp,
  Cloud,
  Zap,
  Sparkles,
  Palette,
  MousePointer,
  ExternalLink,
  ArrowUp,
  Menu,
  ChevronUp,
  Grid,
  PlayCircle,
  HelpCircle,
  Columns,
  Maximize2,
  RotateCw,
  Info,
  LogIn,
  Terminal,
  Database,
  Layout,
  FileInput,
  Quote,
  Heading,
  Minus,
  Square,
  Table,
  MessageCircle,
  UserPlus,
  Map,
  Folder,
  Download,
  Upload,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import {
  useSidebarElementsStore,
  elementDefinitions,
  elementCategories,
  createElementInstance,
  ElementType,
  ElementCategory,
  SidebarElement,
  ElementDefinition,
  ElementStyle,
} from '../store/sidebarElementsStore';
import { GlassCard, PageHeader, GradientText, AnimatedBackground, staggerContainer, fadeInUp, EnhancedButton } from '../components/ui/EnhancedUI';

// Icon mapping for dynamic icons
const iconMap: Record<string, any> = {
  Type, Heading, FileText, Quote, Code, Minus, Square, List, Table, HelpCircle, MessageCircle, User,
  Image, Grid, Layers, Video, PlayCircle, Music, Columns, Maximize2, Box,
  Share2, Rss, Twitter, Instagram, Facebook, UserPlus, Menu, ChevronRight, Folder, Hash, Map,
  Search, Mail, MessageSquare, LogIn, BarChart2, Star, ShoppingBag, ShoppingCart, DollarSign, Heart, Eye, Clock, Tag,
  ChevronDown, Timer: Clock, Percent, RotateCw, MousePointer, Info, ExternalLink, ArrowUp,
  Layout, Container: Square, AlertCircle, Calendar, Cloud, Database, Terminal, Zap, PieChart, TrendingUp, Palette, Sparkles,
};

// Get icon component by name
const getIcon = (iconName: string) => iconMap[iconName] || Box;

interface SidebarData {
  id: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  elements: SidebarElement[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SidebarLocation {
  id: string;
  name: string;
  description: string;
  assignedSidebar: string | null;
}

// Mock Data
const mockSidebars: SidebarData[] = [
  {
    id: 'sidebar-1',
    name: 'Blog Sidebar',
    slug: 'blog-sidebar',
    description: 'Main sidebar for blog pages',
    location: 'right',
    isActive: true,
    elements: [
      createElementInstance('search-form', 'Search'),
      createElementInstance('posts-list', 'Recent Posts'),
      createElementInstance('category-list', 'Categories'),
      createElementInstance('tag-cloud', 'Popular Tags'),
      createElementInstance('newsletter-form', 'Newsletter'),
    ],
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-20T14:30:00Z',
  },
  {
    id: 'sidebar-2',
    name: 'Shop Sidebar',
    slug: 'shop-sidebar',
    description: 'Sidebar for shop/product pages',
    location: 'left',
    isActive: true,
    elements: [
      createElementInstance('search-form', 'Product Search'),
      createElementInstance('product-carousel', 'Featured Products'),
      createElementInstance('price-table', 'Pricing'),
    ],
    createdAt: '2025-01-16T11:00:00Z',
    updatedAt: '2025-01-18T09:15:00Z',
  },
];

const sidebarLocations: SidebarLocation[] = [
  { id: 'blog-right', name: 'Blog Right Sidebar', description: 'Right sidebar on blog pages', assignedSidebar: 'sidebar-1' },
  { id: 'blog-left', name: 'Blog Left Sidebar', description: 'Left sidebar on blog pages', assignedSidebar: null },
  { id: 'shop-left', name: 'Shop Left Sidebar', description: 'Left sidebar on shop pages', assignedSidebar: 'sidebar-2' },
  { id: 'shop-right', name: 'Shop Right Sidebar', description: 'Right sidebar on shop pages', assignedSidebar: null },
  { id: 'page-right', name: 'Page Right Sidebar', description: 'Right sidebar on static pages', assignedSidebar: null },
  { id: 'footer-widgets', name: 'Footer Widget Area', description: 'Widget area in footer', assignedSidebar: null },
];

// Element Settings Modal
function ElementSettingsModal({
  element,
  onSave,
  onClose,
}: {
  element: SidebarElement;
  onSave: (settings: Record<string, any>, style: Partial<ElementStyle>) => void;
  onClose: () => void;
}) {
  const [settings, setSettings] = useState(element.settings);
  const [style, setStyle] = useState(element.style);
  const [activeTab, setActiveTab] = useState<'settings' | 'style'>('settings');

  const definition = elementDefinitions.find(d => d.type === element.type);

  const handleSave = () => {
    onSave(settings, style);
    onClose();
    toast.success('Element settings saved');
  };

  const renderSettingField = (field: any) => {
    const value = settings[field.key] ?? field.defaultValue;

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        );
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
            placeholder={field.placeholder}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => setSettings({ ...settings, [field.key]: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        );
      case 'range':
        return (
          <div className="flex items-center gap-3">
            <input
              type="range"
              value={value}
              min={field.min || 0}
              max={field.max || 100}
              step={field.step || 1}
              onChange={(e) => setSettings({ ...settings, [field.key]: parseInt(e.target.value) })}
              className="flex-1"
            />
            <span className="text-sm font-medium w-10 text-center text-gray-900 dark:text-white">{value}</span>
          </div>
        );
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {field.options?.map((opt: any) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => setSettings({ ...settings, [field.key]: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Enable</span>
          </label>
        );
      case 'color':
        return (
          <div className="flex gap-2">
            <input
              type="color"
              value={value}
              onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer border-0"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        );
      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map((opt: any) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(value as string[])?.includes(opt.value)}
                  onChange={(e) => {
                    const current = value as string[] || [];
                    if (e.target.checked) {
                      setSettings({ ...settings, [field.key]: [...current, opt.value] });
                    } else {
                      setSettings({ ...settings, [field.key]: current.filter(v => v !== opt.value) });
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{opt.label}</span>
              </label>
            ))}
          </div>
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        );
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`${element.title} Settings`} size="lg">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
        <button
          onClick={() => setActiveTab('settings')}
          className={clsx(
            'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
            activeTab === 'settings'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          )}
        >
          <Settings size={16} className="inline mr-2" />
          Settings
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={clsx(
            'flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors',
            activeTab === 'style'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          )}
        >
          <Palette size={16} className="inline mr-2" />
          Style
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {definition?.settingsSchema.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {field.label}
                </label>
                {field.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{field.description}</p>
                )}
                {renderSettingField(field)}
              </div>
            ))}
            {(!definition?.settingsSchema || definition.settingsSchema.length === 0) && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No settings available for this element</p>
            )}
          </div>
        )}

        {activeTab === 'style' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={style.backgroundColor || '#ffffff'}
                    onChange={(e) => setStyle({ ...style, backgroundColor: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={style.backgroundColor || 'transparent'}
                    onChange={(e) => setStyle({ ...style, backgroundColor: e.target.value })}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Text Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={style.textColor || '#000000'}
                    onChange={(e) => setStyle({ ...style, textColor: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={style.textColor || 'inherit'}
                    onChange={(e) => setStyle({ ...style, textColor: e.target.value })}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Padding</label>
                <input
                  type="text"
                  value={style.padding || '16px'}
                  onChange={(e) => setStyle({ ...style, padding: e.target.value })}
                  placeholder="16px"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Margin</label>
                <input
                  type="text"
                  value={style.margin || '0px'}
                  onChange={(e) => setStyle({ ...style, margin: e.target.value })}
                  placeholder="0px"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Border Radius</label>
                <input
                  type="text"
                  value={style.borderRadius || '8px'}
                  onChange={(e) => setStyle({ ...style, borderRadius: e.target.value })}
                  placeholder="8px"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Box Shadow</label>
                <select
                  value={style.boxShadow || 'none'}
                  onChange={(e) => setStyle({ ...style, boxShadow: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="none">None</option>
                  <option value="sm">Small</option>
                  <option value="md">Medium</option>
                  <option value="lg">Large</option>
                  <option value="xl">Extra Large</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Animation</label>
                <select
                  value={style.animation || 'none'}
                  onChange={(e) => setStyle({ ...style, animation: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="none">None</option>
                  <option value="fade">Fade In</option>
                  <option value="slide">Slide In</option>
                  <option value="zoom">Zoom In</option>
                  <option value="bounce">Bounce</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hover Effect</label>
                <select
                  value={style.hoverEffect || 'none'}
                  onChange={(e) => setStyle({ ...style, hoverEffect: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="none">None</option>
                  <option value="lift">Lift</option>
                  <option value="glow">Glow</option>
                  <option value="scale">Scale</option>
                  <option value="darken">Darken</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Text Align</label>
              <div className="flex gap-2">
                {['left', 'center', 'right'].map((align) => (
                  <button
                    key={align}
                    onClick={() => setStyle({ ...style, textAlign: align as any })}
                    className={clsx(
                      'flex-1 py-2 px-4 text-sm rounded-lg border transition-colors capitalize',
                      style.textAlign === align
                        ? 'bg-primary-100 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-300'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    )}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button onClick={onClose} className="btn btn-secondary">Cancel</button>
        <button onClick={handleSave} className="btn btn-primary flex items-center gap-2">
          <Save size={16} />
          Save Changes
        </button>
      </div>
    </Modal>
  );
}

// Element Picker Modal
function ElementPickerModal({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: ElementType) => void;
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ElementCategory | 'all'>('all');

  const filteredElements = useMemo(() => {
    let elements = elementDefinitions;

    if (selectedCategory !== 'all') {
      elements = elements.filter(e => e.category === selectedCategory);
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      elements = elements.filter(e =>
        e.label.toLowerCase().includes(lowerSearch) ||
        e.description.toLowerCase().includes(lowerSearch)
      );
    }

    return elements;
  }, [search, selectedCategory]);

  const handleSelect = (type: ElementType) => {
    onSelect(type);
    onClose();
    setSearch('');
    setSelectedCategory('all');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Element" size="full">
      <div className="flex gap-6 max-h-[80vh]">
        {/* Category Sidebar */}
        <div className="w-56 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 pr-4 space-y-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={clsx(
              'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left',
              selectedCategory === 'all'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            )}
          >
            <LayoutGrid size={16} />
            All Elements
            <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">{elementDefinitions.length}</span>
          </button>

          <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

          {elementCategories.map((cat) => {
            const Icon = getIcon(cat.icon);
            const count = elementDefinitions.filter(e => e.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={clsx(
                  'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors text-left',
                  selectedCategory === cat.id
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                )}
              >
                <Icon size={16} />
                {cat.name}
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Element Grid */}
        <div className="flex-1 overflow-y-auto">
          {/* Search */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 pb-4 z-10">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search elements..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Elements Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredElements.map((element) => {
              const Icon = getIcon(element.icon);
              return (
                <button
                  key={element.type}
                  onClick={() => handleSelect(element.type)}
                  className="group p-4 text-left rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{element.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{element.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredElements.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Search size={48} className="mx-auto mb-4 opacity-30" />
              <p>No elements found matching "{search}"</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

// Element Item in Sidebar
function ElementItem({
  element,
  onToggle,
  onUpdate,
  onDelete,
  onSettings,
  onVisibilityToggle,
}: {
  element: SidebarElement;
  onToggle: () => void;
  onUpdate: (title: string) => void;
  onDelete: () => void;
  onSettings: () => void;
  onVisibilityToggle: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(element.title);

  const definition = elementDefinitions.find(d => d.type === element.type);
  const Icon = getIcon(definition?.icon || 'Box');

  const handleSave = () => {
    onUpdate(editTitle);
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={clsx(
        'bg-white dark:bg-gray-800 border rounded-lg overflow-hidden transition-all',
        element.isVisible
          ? 'border-gray-200 dark:border-gray-700'
          : 'border-dashed border-gray-300 dark:border-gray-600 opacity-60'
      )}
    >
      {/* Element Header */}
      <div
        className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 cursor-pointer group"
        onClick={onToggle}
      >
        <div className="cursor-grab text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <GripVertical size={16} />
        </div>

        <div className={clsx(
          'p-1.5 rounded',
          element.isVisible
            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
            : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
        )}>
          <Icon size={14} />
        </div>

        {isEditing ? (
          <div className="flex-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button onClick={handleSave} className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded">
              <Check size={14} />
            </button>
            <button onClick={() => { setEditTitle(element.title); setIsEditing(false); }} className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <span className="flex-1 font-medium text-sm text-gray-900 dark:text-white">{element.title}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
              {definition?.label}
            </span>
          </>
        )}

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onVisibilityToggle}
            className={clsx(
              'p-1 rounded',
              element.isVisible
                ? 'text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                : 'text-gray-400 hover:text-green-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
            title={element.isVisible ? 'Hide' : 'Show'}
          >
            {element.isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Rename"
          >
            <Edit3 size={12} />
          </button>
          <button
            onClick={onSettings}
            className="p-1 text-gray-400 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Settings"
          >
            <Settings size={12} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
            title="Remove"
          >
            <Trash2 size={12} />
          </button>
        </div>

        {element.isExpanded ? <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" /> : <ChevronRight size={16} className="text-gray-500 dark:text-gray-400" />}
      </div>

      {/* Element Preview */}
      <AnimatePresence>
        {element.isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
                <ElementPreview element={element} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Element Preview Component
function ElementPreview({ element }: { element: SidebarElement }) {
  const { type, settings } = element;

  // Comprehensive preview for all elements
  switch (type) {
    // ==================== CONTENT ELEMENTS ====================
    case 'text-block':
      return (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {settings.content || 'This is a sample text block. You can customize this content in the settings.'}
        </p>
      );

    case 'heading':
      const HeadingTag = (settings.level || 'h2') as keyof JSX.IntrinsicElements;
      return (
        <HeadingTag className="font-bold text-gray-900 dark:text-white" style={{ fontSize: settings.level === 'h1' ? '1.5rem' : settings.level === 'h3' ? '1rem' : '1.25rem' }}>
          {settings.text || 'Sample Heading'}
        </HeadingTag>
      );

    case 'rich-text':
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-sm text-gray-700 dark:text-gray-300">{settings.content || 'Rich text content with formatting support.'}</p>
        </div>
      );

    case 'blockquote':
      return (
        <blockquote className="border-l-4 border-primary-500 pl-4 italic text-gray-600 dark:text-gray-400">
          "{settings.quote || 'A beautiful quote that inspires and motivates.'}"
          {settings.author && <footer className="text-sm mt-2 text-gray-500 dark:text-gray-400">— {settings.author}</footer>}
        </blockquote>
      );

    case 'code-block':
      return (
        <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto">
          <code>{settings.code || 'const hello = "world";\nconsole.log(hello);'}</code>
        </pre>
      );

    case 'divider':
      return <hr className="border-gray-300 dark:border-gray-600" style={{ borderStyle: settings.style || 'solid' }} />;

    case 'spacer':
      return <div style={{ height: settings.height || '24px' }} />;

    case 'list':
      return (
        <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
          {['First item', 'Second item', 'Third item'].map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              {settings.style === 'numbered' ? <span>{i + 1}.</span> : <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />}
              {item}
            </li>
          ))}
        </ul>
      );

    case 'table':
      return (
        <table className="w-full text-xs">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="p-2 text-left text-gray-900 dark:text-white">Header 1</th>
              <th className="p-2 text-left text-gray-900 dark:text-white">Header 2</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <tr><td className="p-2 text-gray-700 dark:text-gray-300">Data 1</td><td className="p-2 text-gray-700 dark:text-gray-300">Data 2</td></tr>
            <tr><td className="p-2 text-gray-700 dark:text-gray-300">Data 3</td><td className="p-2 text-gray-700 dark:text-gray-300">Data 4</td></tr>
          </tbody>
        </table>
      );

    case 'faq-accordion':
      return (
        <div className="space-y-2">
          {[{ q: 'What is this?', a: 'A FAQ accordion' }, { q: 'How does it work?', a: 'Click to expand' }].map((faq, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{faq.q}</span>
                <ChevronDown size={14} className="text-gray-500" />
              </div>
            </div>
          ))}
        </div>
      );

    case 'testimonial':
      return (
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div className="flex mb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={14} className={clsx(i <= (settings.rating || 5) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300')} />
            ))}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-3">"{settings.quote || 'Great product!'}"</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{settings.author || 'John Doe'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{settings.role || 'Customer'}</p>
        </div>
      );

    case 'team-member':
      return (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2">
            <User size={24} className="text-gray-400" />
          </div>
          <p className="font-medium text-gray-900 dark:text-white">{settings.name || 'John Doe'}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{settings.position || 'Developer'}</p>
        </div>
      );

    // ==================== MEDIA ELEMENTS ====================
    case 'image':
      return (
        <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <Image size={32} className="text-gray-400" />
        </div>
      );

    case 'image-gallery':
      return (
        <div className="grid grid-cols-3 gap-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
              <Image size={16} className="text-gray-400" />
            </div>
          ))}
        </div>
      );

    case 'image-carousel':
      return (
        <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <Layers size={48} />
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className={clsx('w-2 h-2 rounded-full', i === 1 ? 'bg-primary-500' : 'bg-white/50')} />
            ))}
          </div>
        </div>
      );

    case 'video':
      return (
        <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
          <PlayCircle size={40} className="text-white/80" />
        </div>
      );

    case 'video-playlist':
      return (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-2">
              <div className="w-20 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                <PlayCircle size={16} className="text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-white">Video {i}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">3:45</p>
              </div>
            </div>
          ))}
        </div>
      );

    case 'audio-player':
      return (
        <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg flex items-center gap-3">
          <button className="p-2 bg-primary-600 text-white rounded-full"><PlayCircle size={16} /></button>
          <div className="flex-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full">
            <div className="w-1/3 h-full bg-primary-500 rounded-full" />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">2:30</span>
        </div>
      );

    case 'logo-grid':
      return (
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
              <Box size={20} className="text-gray-400" />
            </div>
          ))}
        </div>
      );

    case 'icon-box':
      return (
        <div className="text-center p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
          <div className="w-12 h-12 mx-auto bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-2">
            <Star size={24} className="text-primary-600 dark:text-primary-400" />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{settings.description || 'Description here'}</p>
        </div>
      );

    // ==================== SOCIAL ELEMENTS ====================
    case 'social-links':
      return (
        <div className="flex gap-3">
          {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
            <a key={i} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-primary-100">
              <Icon size={18} className="text-gray-600 dark:text-gray-400" />
            </a>
          ))}
        </div>
      );

    case 'social-feed':
    case 'twitter-feed':
    case 'instagram-feed':
    case 'facebook-feed':
      const feedName = type.replace('-feed', '').replace('social', 'Social');
      return (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full" />
                <div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">@user{i}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">2h ago</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Sample {feedName} post content...</p>
            </div>
          ))}
        </div>
      );

    case 'share-buttons':
      return (
        <div className="flex gap-2">
          {[Facebook, Twitter, Linkedin, Mail].map((Icon, i) => (
            <button key={i} className="flex-1 p-2 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
              <Icon size={14} className="text-gray-600 dark:text-gray-400" />
            </button>
          ))}
        </div>
      );

    case 'author-box':
      return (
        <div className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <User size={20} className="text-gray-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white text-sm">{settings.name || 'Author Name'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{settings.bio || 'Writer & Developer'}</p>
          </div>
        </div>
      );

    // ==================== NAVIGATION ELEMENTS ====================
    case 'nav-menu':
      return (
        <nav className="space-y-1">
          {['Home', 'About', 'Services', 'Contact'].map((item) => (
            <a key={item} className="block px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              {item}
            </a>
          ))}
        </nav>
      );

    case 'breadcrumbs':
      return (
        <nav className="flex items-center gap-2 text-sm flex-wrap">
          <a className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Home</a>
          <ChevronRight size={14} className="text-gray-400 shrink-0" />
          <a className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Category</a>
          <ChevronRight size={14} className="text-gray-400 shrink-0" />
          <span className="text-gray-900 dark:text-white">Current</span>
        </nav>
      );

    case 'page-list':
      return (
        <ul className="space-y-1">
          {['About Us', 'Our Team', 'Careers', 'Contact'].map((page) => (
            <li key={page}>
              <a className="text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600">{page}</a>
            </li>
          ))}
        </ul>
      );

    case 'category-list':
      return (
        <ul className="space-y-2">
          {['Technology', 'Design', 'Business'].map((cat, i) => (
            <li key={cat} className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 cursor-pointer">{cat}</span>
              {settings.showCount !== false && (
                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">{5 + i}</span>
              )}
            </li>
          ))}
        </ul>
      );

    case 'tag-cloud':
      return (
        <div className="flex flex-wrap gap-2">
          {['React', 'TypeScript', 'JavaScript', 'CSS', 'Node.js'].map((tag) => (
            <span key={tag} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-primary-100 cursor-pointer">
              {tag}
            </span>
          ))}
        </div>
      );

    case 'sitemap':
      return (
        <div className="text-xs space-y-2">
          <div className="font-medium text-gray-900 dark:text-white">Pages</div>
          <ul className="pl-3 space-y-1 text-gray-600 dark:text-gray-400">
            <li>Home</li><li>About</li><li>Contact</li>
          </ul>
        </div>
      );

    // ==================== FORM ELEMENTS ====================
    case 'search-form':
      return (
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={settings.placeholder || 'Search...'}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
            readOnly
          />
        </div>
      );

    case 'newsletter-form':
      return (
        <div className="space-y-2">
          <p className="text-xs text-gray-600 dark:text-gray-400">{settings.description || 'Get the latest updates.'}</p>
          <input
            type="email"
            placeholder={settings.placeholder || 'Enter your email'}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
            readOnly
          />
          <button className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg font-medium">
            {settings.buttonText || 'Subscribe'}
          </button>
        </div>
      );

    case 'contact-form':
      return (
        <div className="space-y-3">
          <input type="text" placeholder="Your Name" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400" readOnly />
          <input type="email" placeholder="Your Email" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400" readOnly />
          <textarea placeholder="Your Message" rows={2} className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 resize-none" readOnly />
          <button className="w-full px-4 py-2 bg-primary-600 text-white text-sm rounded-lg">Send Message</button>
        </div>
      );

    case 'login-form':
      return (
        <div className="space-y-3">
          <input type="text" placeholder="Username" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400" readOnly />
          <input type="password" placeholder="Password" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400" readOnly />
          <button className="w-full px-4 py-2 bg-primary-600 text-white text-sm rounded-lg">Login</button>
        </div>
      );

    case 'survey-poll':
      return (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{settings.question || 'What do you prefer?'}</p>
          {['Option A', 'Option B', 'Option C'].map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="radio" name="poll" className="text-primary-600" /> {opt}
            </label>
          ))}
        </div>
      );

    case 'rating-form':
      return (
        <div className="text-center">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Rate your experience</p>
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={24} className="text-gray-300 hover:text-yellow-400 cursor-pointer" />
            ))}
          </div>
        </div>
      );

    // ==================== E-COMMERCE ELEMENTS ====================
    case 'product-carousel':
      return (
        <div className="space-y-2">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-shrink-0 w-20">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-1 flex items-center justify-center">
                  <ShoppingBag size={20} className="text-gray-400" />
                </div>
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">Product {i}</p>
                <p className="text-xs text-primary-600">${(19.99 * i).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'product-grid':
      return (
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-1 flex items-center justify-center">
                <ShoppingBag size={16} className="text-gray-400" />
              </div>
              <p className="text-xs font-medium text-gray-900 dark:text-white">Product {i}</p>
              <p className="text-xs text-primary-600">${(29.99).toFixed(2)}</p>
            </div>
          ))}
        </div>
      );

    case 'price-table':
      return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-primary-600 text-white p-3 text-center">
            <p className="font-bold">{settings.planName || 'Pro Plan'}</p>
            <p className="text-2xl font-bold">${settings.price || '29'}<span className="text-sm font-normal">/mo</span></p>
          </div>
          <div className="p-3 space-y-2">
            {['Feature 1', 'Feature 2', 'Feature 3'].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                <Check size={12} className="text-green-500" /> {f}
              </div>
            ))}
            <button className="w-full mt-2 px-3 py-1.5 bg-primary-600 text-white text-xs rounded">Choose Plan</button>
          </div>
        </div>
      );

    case 'cart-widget':
      return (
        <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
          <div className="relative">
            <ShoppingCart size={24} className="text-gray-600 dark:text-gray-400" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">3</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">3 items</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">$99.99</p>
          </div>
        </div>
      );

    case 'wishlist':
      return (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded" />
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900 dark:text-white">Wishlist Item {i}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">$49.99</p>
              </div>
              <Heart size={14} className="text-red-500 fill-red-500" />
            </div>
          ))}
        </div>
      );

    case 'recently-viewed':
      return (
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
              <Eye size={12} className="text-gray-400" />
            </div>
          ))}
        </div>
      );

    case 'sale-countdown':
      return (
        <div className="bg-red-600 text-white p-3 rounded-lg text-center">
          <p className="text-xs mb-2 font-semibold">SALE ENDS IN</p>
          <div className="flex justify-center gap-2">
            {[{ v: '02', l: 'D' }, { v: '15', l: 'H' }, { v: '30', l: 'M' }].map((t, i) => (
              <div key={i} className="bg-white/20 px-2 py-1 rounded">
                <p className="text-lg font-bold">{t.v}</p>
                <p className="text-xs opacity-80">{t.l}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'promo-banner':
      return (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-lg text-center">
          <p className="font-bold">{settings.title || 'Special Offer!'}</p>
          <p className="text-sm opacity-90">{settings.description || 'Get 20% off today'}</p>
        </div>
      );

    // ==================== INTERACTIVE ELEMENTS ====================
    case 'accordion':
      return (
        <div className="space-y-2">
          {['Section 1', 'Section 2'].map((s, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{s}</span>
                <ChevronDown size={14} className="text-gray-500" />
              </div>
            </div>
          ))}
        </div>
      );

    case 'tabs':
      return (
        <div>
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {['Tab 1', 'Tab 2', 'Tab 3'].map((tab, i) => (
              <button key={i} className={clsx('px-3 py-2 text-xs', i === 0 ? 'border-b-2 border-primary-600 text-primary-600' : 'text-gray-500')}>
                {tab}
              </button>
            ))}
          </div>
          <div className="p-3 text-sm text-gray-600 dark:text-gray-400">Tab content here...</div>
        </div>
      );

    case 'countdown-timer':
      return (
        <div className="grid grid-cols-4 gap-2">
          {['Days', 'Hrs', 'Min', 'Sec'].map((unit, i) => (
            <div key={unit} className="text-center">
              <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-lg font-bold text-gray-900 dark:text-white">
                {[15, 8, 32, 45][i]}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{unit}</p>
            </div>
          ))}
        </div>
      );

    case 'progress-bar':
      return (
        <div className="space-y-3">
          {[{ label: 'Skill 1', value: 75 }, { label: 'Skill 2', value: 90 }].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                <span className="text-gray-500 dark:text-gray-400">{item.value}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full" style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      );

    case 'counter':
      return (
        <div className="text-center">
          <p className="text-3xl font-bold text-primary-600">{settings.value || '1,234'}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{settings.label || 'Total Users'}</p>
        </div>
      );

    case 'flip-box':
      return (
        <div className="aspect-square bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white">
          <div className="text-center">
            <RotateCw size={24} className="mx-auto mb-2" />
            <p className="text-sm">Hover to flip</p>
          </div>
        </div>
      );

    case 'scroll-to-top':
      return (
        <div className="flex justify-center">
          <button className="p-3 bg-primary-600 text-white rounded-full shadow-lg">
            <ArrowUp size={20} />
          </button>
        </div>
      );

    // ==================== LAYOUT ELEMENTS ====================
    case 'container':
      return (
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Container - Drop elements here
        </div>
      );

    case 'columns':
      return (
        <div className="grid grid-cols-2 gap-2">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded p-3 text-center text-xs text-gray-500 dark:text-gray-400">Col 1</div>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded p-3 text-center text-xs text-gray-500 dark:text-gray-400">Col 2</div>
        </div>
      );

    case 'card':
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
          <div className="w-full h-20 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
          <p className="text-xs text-gray-500 dark:text-gray-400">{settings.description || 'Card description text'}</p>
        </div>
      );

    case 'alert-box':
      return (
        <div className={clsx('p-3 rounded-lg flex items-start gap-2', settings.type === 'error' ? 'bg-red-100 dark:bg-red-900/30' : settings.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30')}>
          <AlertCircle size={16} className={settings.type === 'error' ? 'text-red-600' : settings.type === 'success' ? 'text-green-600' : 'text-blue-600'} />
          <p className="text-sm text-gray-700 dark:text-gray-300">{settings.message || 'This is an alert message'}</p>
        </div>
      );

    // ==================== DATA ELEMENTS ====================
    case 'posts-list':
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              {settings.showThumbnail !== false && <div className="w-16 h-12 bg-gray-200 dark:bg-gray-700 rounded" />}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Example Post {i}</p>
                {settings.showDate !== false && <p className="text-xs text-gray-500 dark:text-gray-400">Jan {10 + i}, 2025</p>}
              </div>
            </div>
          ))}
        </div>
      );

    case 'posts-grid':
      return (
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded mb-1" />
              <p className="text-xs font-medium text-gray-900 dark:text-white">Post {i}</p>
            </div>
          ))}
        </div>
      );

    case 'posts-carousel':
      return (
        <div className="relative">
          <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-2" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">Featured Post Title</p>
          <div className="flex justify-center gap-1 mt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={clsx('w-2 h-2 rounded-full', i === 1 ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600')} />
            ))}
          </div>
        </div>
      );

    case 'calendar':
      return (
        <div className="text-center">
          <div className="flex items-center justify-between mb-2">
            <ChevronRight size={14} className="text-gray-400 rotate-180" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">January 2025</span>
            <ChevronRight size={14} className="text-gray-400" />
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <div key={`${d}-${i}`} className="text-gray-500 dark:text-gray-400 p-1">{d}</div>
            ))}
            {Array.from({ length: 14 }, (_, i) => (
              <div key={i} className={clsx('p-1 rounded', i === 7 ? 'bg-primary-600 text-white' : 'text-gray-700 dark:text-gray-300')}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      );

    case 'weather':
      return (
        <div className="text-center p-3 bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-lg">
          <Cloud size={32} className="mx-auto mb-1" />
          <p className="text-2xl font-bold">72°F</p>
          <p className="text-sm opacity-90">{settings.location || 'New York'}</p>
        </div>
      );

    case 'rss-feed':
      return (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-2">
              <Rss size={14} className="text-orange-500 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-gray-900 dark:text-white">Feed Item {i}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">2 hours ago</p>
              </div>
            </div>
          ))}
        </div>
      );

    // ==================== CUSTOM ELEMENTS ====================
    case 'custom-html':
      return (
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded border-2 border-dashed border-gray-300 dark:border-gray-600">
          <Code size={20} className="mx-auto text-gray-400 mb-1" />
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">Custom HTML</p>
        </div>
      );

    case 'shortcode':
      return (
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded font-mono text-xs text-gray-600 dark:text-gray-400">
          [{settings.shortcode || 'shortcode'}]
        </div>
      );

    // ==================== MARKETING ELEMENTS ====================
    case 'cta-banner':
      return (
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white p-4 rounded-lg text-center">
          <p className="font-bold">{settings.title || 'Call to Action'}</p>
          <p className="text-sm opacity-90 mb-2">{settings.subtitle || 'Take action now!'}</p>
          <button className="px-4 py-1.5 bg-white text-primary-600 text-sm font-medium rounded">{settings.buttonText || 'Get Started'}</button>
        </div>
      );

    case 'announcement-bar':
      return (
        <div className="bg-yellow-400 text-yellow-900 p-2 text-center text-sm font-medium rounded">
          {settings.message || 'Important announcement here!'}
        </div>
      );

    case 'trust-badges':
      return (
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Check size={20} className="text-green-500" />
            </div>
          ))}
        </div>
      );

    case 'stats-counter':
      return (
        <div className="grid grid-cols-3 gap-2 text-center">
          {[{ v: '10K+', l: 'Users' }, { v: '500+', l: 'Projects' }, { v: '99%', l: 'Happy' }].map((s, i) => (
            <div key={i}>
              <p className="text-lg font-bold text-primary-600">{s.v}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{s.l}</p>
            </div>
          ))}
        </div>
      );

    // ==================== ANALYTICS ELEMENTS ====================
    case 'chart-bar':
      return (
        <div className="grid grid-cols-5 gap-2 h-24 items-end">
          {[40, 70, 55, 90, 65].map((h, i) => (
            <div key={i} className="bg-primary-500 rounded-t" style={{ height: `${h}%` }} />
          ))}
        </div>
      );

    case 'chart-line':
      return (
        <div className="h-20 flex items-center justify-center">
          <TrendingUp size={48} className="text-primary-500" />
        </div>
      );

    case 'chart-pie':
    case 'chart-donut':
      return (
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full border-8 border-primary-500 border-t-purple-500 border-r-green-500" />
        </div>
      );

    case 'stats-card':
      return (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">{settings.label || 'Total Revenue'}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{settings.value || '$12,345'}</p>
          <p className="text-xs text-green-500">↑ 12% from last month</p>
        </div>
      );

    case 'metrics-grid':
      return (
        <div className="grid grid-cols-2 gap-2">
          {[{ l: 'Views', v: '1.2K' }, { l: 'Clicks', v: '340' }, { l: 'Sales', v: '89' }, { l: 'Revenue', v: '$2.5K' }].map((m, i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">{m.l}</p>
              <p className="font-bold text-gray-900 dark:text-white">{m.v}</p>
            </div>
          ))}
        </div>
      );

    // ==================== BOOKING ELEMENTS ====================
    case 'appointment-booking':
    case 'booking-form':
      return (
        <div className="space-y-2">
          <select className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
            <option>Select Service</option>
          </select>
          <input type="date" className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
          <button className="w-full px-4 py-2 bg-primary-600 text-white text-sm rounded-lg">Book Now</button>
        </div>
      );

    case 'event-list':
      return (
        <div className="space-y-2">
          {[{ d: 'Jan 25', t: 'Workshop' }, { d: 'Feb 10', t: 'Webinar' }].map((e, i) => (
            <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">{e.d.split(' ')[0]}</p>
                <p className="text-lg font-bold text-primary-600">{e.d.split(' ')[1]}</p>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{e.t}</p>
            </div>
          ))}
        </div>
      );

    case 'time-slots':
      return (
        <div className="grid grid-cols-3 gap-1">
          {['9:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map((t) => (
            <button key={t} className="px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-700 dark:text-gray-300">
              {t}
            </button>
          ))}
        </div>
      );

    // ==================== MAPS ELEMENTS ====================
    case 'google-map':
    case 'interactive-map':
      return (
        <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <Map size={32} className="text-gray-400" />
        </div>
      );

    case 'location-card':
      return (
        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <MapPin size={20} className="text-primary-600 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900 dark:text-white text-sm">{settings.name || 'Our Office'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{settings.address || '123 Main St, City'}</p>
          </div>
        </div>
      );

    // ==================== PORTFOLIO ELEMENTS ====================
    case 'project-grid':
      return (
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <Folder size={20} className="text-gray-400" />
            </div>
          ))}
        </div>
      );

    case 'skills-chart':
      return (
        <div className="space-y-2">
          {[{ s: 'React', v: 90 }, { s: 'Node.js', v: 80 }, { s: 'Design', v: 70 }].map((skill) => (
            <div key={skill.s}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-700 dark:text-gray-300">{skill.s}</span>
                <span className="text-gray-500 dark:text-gray-400">{skill.v}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div className="h-full bg-primary-500 rounded-full" style={{ width: `${skill.v}%` }} />
              </div>
            </div>
          ))}
        </div>
      );

    case 'experience-timeline':
      return (
        <div className="space-y-3 pl-4 border-l-2 border-primary-500">
          {[{ y: '2023', t: 'Senior Dev' }, { y: '2021', t: 'Developer' }].map((e, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[21px] w-3 h-3 bg-primary-500 rounded-full" />
              <p className="text-xs text-gray-500 dark:text-gray-400">{e.y}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{e.t}</p>
            </div>
          ))}
        </div>
      );

    case 'client-logos':
      return (
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[3/2] bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
              <Box size={14} className="text-gray-400" />
            </div>
          ))}
        </div>
      );

    // ==================== ADDITIONAL ELEMENTS ====================
    case 'cookie-consent':
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg text-sm">
          <p className="mb-2">We use cookies to enhance your experience.</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-primary-600 rounded text-xs">Accept</button>
            <button className="px-3 py-1 bg-gray-700 rounded text-xs">Decline</button>
          </div>
        </div>
      );

    case 'language-switcher':
      return (
        <select className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          <option>English</option>
          <option>Spanish</option>
          <option>French</option>
        </select>
      );

    case 'dark-mode-toggle':
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">Dark Mode</span>
          <button className="w-10 h-6 bg-gray-300 dark:bg-primary-600 rounded-full relative">
            <div className="absolute top-1 left-1 dark:left-5 w-4 h-4 bg-white rounded-full transition-all" />
          </button>
        </div>
      );

    case 'qr-code':
      return (
        <div className="w-24 h-24 mx-auto bg-white p-2 rounded">
          <div className="w-full h-full bg-gray-900" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 4px, white 4px, white 8px), repeating-linear-gradient(90deg, transparent, transparent 4px, white 4px, white 8px)' }} />
        </div>
      );

    case 'live-chat':
      return (
        <div className="flex justify-end">
          <button className="p-3 bg-primary-600 text-white rounded-full shadow-lg">
            <MessageCircle size={20} />
          </button>
        </div>
      );

    default:
      const definition = elementDefinitions.find(d => d.type === type);
      const DefaultIcon = getIcon(definition?.icon || 'Box');
      return (
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">
          <DefaultIcon size={24} className="mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">{definition?.label || type}</p>
          <p className="text-xs text-gray-500 mt-1">{definition?.description || 'Preview not available'}</p>
        </div>
      );
  }
}

// Sidebar Preview Panel
function SidebarPreviewPanel({ sidebar }: { sidebar: SidebarData }) {
  const visibleElements = sidebar.elements.filter(e => e.isVisible);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Eye size={18} />
          Live Preview
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          {visibleElements.length} visible
        </span>
      </div>

      <div className="p-4">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 max-w-xs mx-auto space-y-6">
          {visibleElements.length > 0 ? (
            visibleElements.map((element) => (
              <div key={element.id} style={element.style as any}>
                <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {element.title}
                </h5>
                <ElementPreview element={element} />
              </div>
            ))
          ) : (
            <div className="h-32 flex flex-col items-center justify-center text-gray-400">
              <EyeOff size={32} className="mb-2 opacity-50" />
              <span className="text-sm">No visible elements</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Sidebars Page
export default function Sidebars() {
  const [sidebars, setSidebars] = useState<SidebarData[]>(mockSidebars);
  const [locations, setLocations] = useState<SidebarLocation[]>(sidebarLocations);
  const [selectedSidebarId, setSelectedSidebarId] = useState<string | null>(mockSidebars[0]?.id || null);
  const [isCreating, setIsCreating] = useState(false);
  const [newSidebarName, setNewSidebarName] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showElementPicker, setShowElementPicker] = useState(false);
  const [editingElement, setEditingElement] = useState<SidebarElement | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  const selectedSidebar = useMemo(() =>
    sidebars.find(s => s.id === selectedSidebarId),
    [sidebars, selectedSidebarId]
  );

  // Create new sidebar
  const handleCreateSidebar = () => {
    if (!newSidebarName.trim()) {
      toast.error('Please enter a sidebar name');
      return;
    }

    const newSidebar: SidebarData = {
      id: `sidebar-${Date.now()}`,
      name: newSidebarName,
      slug: newSidebarName.toLowerCase().replace(/\s+/g, '-'),
      description: '',
      location: 'right',
      isActive: true,
      elements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSidebars(prev => [...prev, newSidebar]);
    setSelectedSidebarId(newSidebar.id);
    setNewSidebarName('');
    setIsCreating(false);
    toast.success('Sidebar created');
  };

  // Delete sidebar
  const handleDeleteSidebar = (sidebarId: string) => {
    if (!confirm('Are you sure you want to delete this sidebar?')) return;

    setSidebars(prev => prev.filter(s => s.id !== sidebarId));
    if (selectedSidebarId === sidebarId) {
      setSelectedSidebarId(sidebars[0]?.id || null);
    }
    toast.success('Sidebar deleted');
  };

  // Toggle sidebar active
  const toggleSidebarActive = (sidebarId: string) => {
    setSidebars(prev => prev.map(s =>
      s.id === sidebarId ? { ...s, isActive: !s.isActive } : s
    ));
    setHasUnsavedChanges(true);
  };

  // Export sidebar
  const handleExportSidebar = (sidebar: typeof sidebars[0]) => {
    const exportData = {
      name: sidebar.name,
      elements: sidebar.elements,
      isActive: sidebar.isActive,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sidebar.name.toLowerCase().replace(/\s+/g, '-')}-sidebar.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported "${sidebar.name}"`);
  };

  // Import sidebar
  const handleImportSidebar = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);

          if (!data.name || !Array.isArray(data.elements)) {
            throw new Error('Invalid sidebar file format');
          }

          const newSidebar = {
            id: `sidebar-${Date.now()}`,
            name: data.name + ' (Imported)',
            slug: data.slug || `sidebar-${Date.now()}`,
            description: data.description || '',
            location: data.location || 'primary',
            elements: data.elements,
            isActive: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          setSidebars(prev => [...prev, newSidebar]);
          setSelectedSidebarId(newSidebar.id);
          toast.success(`Imported "${data.name}"`);
        } catch (error) {
          toast.error('Failed to import sidebar. Invalid file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Add element
  const handleAddElement = useCallback((type: ElementType) => {
    if (!selectedSidebarId) return;

    const newElement = createElementInstance(type);

    setSidebars(prev => prev.map(sidebar => {
      if (sidebar.id === selectedSidebarId) {
        return {
          ...sidebar,
          elements: [...sidebar.elements, newElement],
          updatedAt: new Date().toISOString(),
        };
      }
      return sidebar;
    }));
    setHasUnsavedChanges(true);

    const definition = elementDefinitions.find(d => d.type === type);
    toast.success(`${definition?.label} added`);
  }, [selectedSidebarId]);

  // Update element
  const handleUpdateElement = useCallback((elementId: string, updates: Partial<SidebarElement>) => {
    if (!selectedSidebarId) return;

    setSidebars(prev => prev.map(sidebar => {
      if (sidebar.id === selectedSidebarId) {
        return {
          ...sidebar,
          elements: sidebar.elements.map(e => e.id === elementId ? { ...e, ...updates } : e),
          updatedAt: new Date().toISOString(),
        };
      }
      return sidebar;
    }));
    setHasUnsavedChanges(true);
  }, [selectedSidebarId]);

  // Delete element
  const handleDeleteElement = useCallback((elementId: string) => {
    if (!selectedSidebarId) return;

    setSidebars(prev => prev.map(sidebar => {
      if (sidebar.id === selectedSidebarId) {
        return {
          ...sidebar,
          elements: sidebar.elements.filter(e => e.id !== elementId),
          updatedAt: new Date().toISOString(),
        };
      }
      return sidebar;
    }));
    setHasUnsavedChanges(true);
    toast.success('Element removed');
  }, [selectedSidebarId]);

  // Toggle element expand
  const toggleElement = useCallback((elementId: string) => {
    if (!selectedSidebarId) return;

    setSidebars(prev => prev.map(sidebar => {
      if (sidebar.id === selectedSidebarId) {
        return {
          ...sidebar,
          elements: sidebar.elements.map(e =>
            e.id === elementId ? { ...e, isExpanded: !e.isExpanded } : e
          ),
        };
      }
      return sidebar;
    }));
  }, [selectedSidebarId]);

  // Toggle element visibility
  const toggleElementVisibility = useCallback((elementId: string) => {
    if (!selectedSidebarId) return;

    setSidebars(prev => prev.map(sidebar => {
      if (sidebar.id === selectedSidebarId) {
        return {
          ...sidebar,
          elements: sidebar.elements.map(e =>
            e.id === elementId ? { ...e, isVisible: !e.isVisible } : e
          ),
        };
      }
      return sidebar;
    }));
    setHasUnsavedChanges(true);
  }, [selectedSidebarId]);

  // Assign location
  const handleAssignLocation = (locationId: string, sidebarId: string | null) => {
    setLocations(prev => prev.map(loc =>
      loc.id === locationId ? { ...loc, assignedSidebar: sidebarId } : loc
    ));
    toast.success('Location updated');
  };

  // Save
  const handleSave = () => {
    setHasUnsavedChanges(false);
    toast.success('Sidebars saved');
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
          title="Widget Sidebars"
          subtitle="Add and customize sidebar elements with 50+ modern components"
          icon={<Sidebar size={24} />}
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
                variant={showPreview ? 'primary' : 'outline'}
                onClick={() => setShowPreview(!showPreview)}
                icon={<Eye size={18} />}
              >
                Preview
              </EnhancedButton>
              <EnhancedButton
                variant="primary"
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
                icon={<Save size={18} />}
                glow
              >
                Save Changes
              </EnhancedButton>
            </div>
          }
        />

        <motion.div 
          className={clsx('grid gap-6', showPreview ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1 lg:grid-cols-3')}
          variants={fadeInUp}
        >
          {/* Sidebar Selector */}
          <div className="lg:col-span-1 space-y-6">
            <GlassCard variant="gradient" padding="none" className="overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Sidebar size={18} />
                Sidebars
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={handleImportSidebar}
                  className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                  title="Import sidebar"
                >
                  <Upload size={18} />
                </button>
                <button
                  onClick={() => setIsCreating(true)}
                  className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded"
                  title="Create new sidebar"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="p-2">
              {isCreating && (
                <div className="p-3 mb-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
                  <input
                    type="text"
                    value={newSidebarName}
                    onChange={(e) => setNewSidebarName(e.target.value)}
                    placeholder="Sidebar name..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateSidebar()}
                  />
                  <div className="flex gap-2">
                    <button onClick={handleCreateSidebar} className="flex-1 py-1.5 bg-primary-600 text-white text-sm rounded-lg">
                      Create
                    </button>
                    <button
                      onClick={() => { setIsCreating(false); setNewSidebarName(''); }}
                      className="flex-1 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {sidebars.map((sidebar) => (
                <button
                  key={sidebar.id}
                  onClick={() => setSelectedSidebarId(sidebar.id)}
                  className={clsx(
                    'w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left group',
                    selectedSidebarId === sidebar.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate text-gray-900 dark:text-white">{sidebar.name}</p>
                      {!sidebar.isActive && (
                        <span className="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">Off</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{sidebar.elements.length} elements</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleExportSidebar(sidebar); }}
                      className="p-1 text-gray-400 hover:text-primary-600 rounded"
                      title="Export sidebar"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSidebarActive(sidebar.id); }}
                      className={clsx('p-1 rounded', sidebar.isActive ? 'text-green-600' : 'text-gray-400')}
                      title={sidebar.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {sidebar.isActive ? <Check size={14} /> : <X size={14} />}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteSidebar(sidebar.id); }}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                      title="Delete sidebar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Locations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Layers size={18} />
                Locations
              </h3>
            </div>
            <div className="p-4 space-y-4">
              {locations.slice(0, 4).map((location) => (
                <div key={location.id}>
                  <label className="text-sm font-medium text-gray-900 dark:text-white block mb-1">
                    {location.name}
                  </label>
                  <select
                    value={location.assignedSidebar || ''}
                    onChange={(e) => handleAssignLocation(location.id, e.target.value || null)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">— None —</option>
                    {sidebars.filter(s => s.isActive).map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Elements Editor */}
        <div className={clsx(showPreview ? 'lg:col-span-2' : 'lg:col-span-2')}>
          {selectedSidebar ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <LayoutGrid size={18} />
                    {selectedSidebar.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Click to expand • Drag to reorder</p>
                </div>
                <button
                  onClick={() => setShowElementPicker(true)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add Element
                </button>
              </div>

              <div className="p-4">
                {selectedSidebar.elements.length > 0 ? (
                  <div className="space-y-2">
                    <AnimatePresence>
                      {selectedSidebar.elements.map((element) => (
                        <ElementItem
                          key={element.id}
                          element={element}
                          onToggle={() => toggleElement(element.id)}
                          onUpdate={(title) => handleUpdateElement(element.id, { title })}
                          onDelete={() => handleDeleteElement(element.id)}
                          onSettings={() => setEditingElement(element)}
                          onVisibilityToggle={() => toggleElementVisibility(element.id)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <Plus size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No elements yet</p>
                    <p className="text-sm mt-1 mb-4">Add your first element to get started</p>
                    <button
                      onClick={() => setShowElementPicker(true)}
                      className="btn btn-primary"
                    >
                      Add Element
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Sidebar size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Select a Sidebar</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Choose or create a sidebar to add elements</p>
              <button onClick={() => setIsCreating(true)} className="btn btn-primary">
                Create Sidebar
              </button>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        {showPreview && selectedSidebar && (
          <div className="lg:col-span-1">
            <SidebarPreviewPanel sidebar={selectedSidebar} />
          </div>
        )}
      </motion.div>

      {/* Element Picker Modal */}
      <ElementPickerModal
        isOpen={showElementPicker}
        onClose={() => setShowElementPicker(false)}
        onSelect={handleAddElement}
      />

      {/* Element Settings Modal */}
      {editingElement && (
        <ElementSettingsModal
          element={editingElement}
          onSave={(settings, style) => {
            handleUpdateElement(editingElement.id, { settings, style });
            setEditingElement(null);
          }}
          onClose={() => setEditingElement(null)}
        />
      )}
      </div>
    </motion.div>
  );
}
