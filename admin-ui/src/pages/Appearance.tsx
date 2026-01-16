import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout,
  Palette,
  Type,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  Trash2,
  Edit3,
  GripVertical,
  Eye,
  EyeOff,
  Save,
  ChevronDown,
  ChevronRight,
  Settings,
  Check,
  X,
  Link,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  Upload,
  Grid,
  Columns,
  Monitor,
  Tablet,
  Smartphone,
  Undo,
  Redo,
  Copy,
  Layers,
  Box,
  Menu,
  Search,
  ShoppingCart,
  User,
  Heart,
  Bell,
  Sun,
  Moon,
  Globe,
  Clock,
  Calendar,
  ExternalLink,
  AlertCircle,
  LayoutGrid,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import Modal from '../components/ui/Modal';
import { GlassCard, PageHeader, GradientText, AnimatedBackground, staggerContainer, fadeInUp, EnhancedButton } from '../components/ui/EnhancedUI';
import { Sparkles } from 'lucide-react';

// Types
type WidgetType = 'logo' | 'menu' | 'search' | 'social' | 'cart' | 'user' | 'custom' | 'text' | 'button' | 'html' | 'spacer' | 'divider' | 'contact' | 'copyright' | 'newsletter' | 'language';

interface HeaderWidget {
  id: string;
  type: WidgetType;
  settings: Record<string, any>;
  position: 'left' | 'center' | 'right';
}

interface FooterColumn {
  id: string;
  title: string;
  widgets: FooterWidget[];
  width: 1 | 2 | 3 | 4;
}

interface FooterWidget {
  id: string;
  type: WidgetType;
  settings: Record<string, any>;
}

interface HeaderConfig {
  layout: 'simple' | 'centered' | 'split' | 'stacked';
  sticky: boolean;
  transparent: boolean;
  background: string;
  textColor: string;
  height: number;
  showTopBar: boolean;
  topBarBackground: string;
  topBarText: string;
  widgets: HeaderWidget[];
}

interface FooterConfig {
  layout: 'simple' | 'columns' | 'centered' | 'minimal';
  columns: FooterColumn[];
  background: string;
  textColor: string;
  showBottomBar: boolean;
  bottomBarBackground: string;
  bottomBarText: string;
  copyrightText: string;
}

// Initial data
const defaultHeaderConfig: HeaderConfig = {
  layout: 'simple',
  sticky: true,
  transparent: false,
  background: '#ffffff',
  textColor: '#1f2937',
  height: 72,
  showTopBar: true,
  topBarBackground: '#1f2937',
  topBarText: '#ffffff',
  widgets: [
    { id: 'logo-1', type: 'logo', settings: { text: 'RustPress', showImage: false }, position: 'left' },
    { id: 'menu-1', type: 'menu', settings: { menuId: 'main-navigation' }, position: 'center' },
    { id: 'search-1', type: 'search', settings: { placeholder: 'Search...' }, position: 'right' },
    { id: 'user-1', type: 'user', settings: { showName: false }, position: 'right' },
  ],
};

const defaultFooterConfig: FooterConfig = {
  layout: 'columns',
  background: '#1f2937',
  textColor: '#ffffff',
  showBottomBar: true,
  bottomBarBackground: '#111827',
  bottomBarText: '#9ca3af',
  copyrightText: '© 2025 RustPress. All rights reserved.',
  columns: [
    {
      id: 'col-1',
      title: 'About',
      width: 3,
      widgets: [
        { id: 'logo-f', type: 'logo', settings: { text: 'RustPress', showImage: false, variant: 'light' } },
        { id: 'text-1', type: 'text', settings: { content: 'A modern, blazing-fast CMS built with Rust. Create beautiful websites with ease.' } },
        { id: 'social-1', type: 'social', settings: { platforms: ['facebook', 'twitter', 'instagram', 'linkedin'] } },
      ],
    },
    {
      id: 'col-2',
      title: 'Quick Links',
      width: 2,
      widgets: [
        { id: 'menu-f1', type: 'menu', settings: { menuId: 'footer-menu', direction: 'vertical' } },
      ],
    },
    {
      id: 'col-3',
      title: 'Resources',
      width: 2,
      widgets: [
        { id: 'menu-f2', type: 'menu', settings: { menuId: 'resources-menu', direction: 'vertical' } },
      ],
    },
    {
      id: 'col-4',
      title: 'Contact',
      width: 3,
      widgets: [
        { id: 'contact-1', type: 'contact', settings: { email: 'hello@rustpress.io', phone: '+1 (555) 123-4567', address: '123 Main St, City' } },
        { id: 'newsletter-1', type: 'newsletter', settings: { placeholder: 'Enter your email', buttonText: 'Subscribe' } },
      ],
    },
  ],
};

// Widget palette for drag & drop
const widgetPalette: { type: WidgetType; label: string; icon: any; description: string }[] = [
  { type: 'logo', label: 'Logo', icon: Image, description: 'Site logo or text' },
  { type: 'menu', label: 'Menu', icon: Menu, description: 'Navigation menu' },
  { type: 'search', label: 'Search', icon: Search, description: 'Search bar' },
  { type: 'social', label: 'Social Links', icon: Heart, description: 'Social media icons' },
  { type: 'cart', label: 'Cart', icon: ShoppingCart, description: 'Shopping cart' },
  { type: 'user', label: 'User', icon: User, description: 'User account' },
  { type: 'text', label: 'Text', icon: Type, description: 'Custom text' },
  { type: 'button', label: 'Button', icon: Box, description: 'Call to action' },
  { type: 'contact', label: 'Contact', icon: Phone, description: 'Contact info' },
  { type: 'newsletter', label: 'Newsletter', icon: Mail, description: 'Email signup' },
  { type: 'language', label: 'Language', icon: Globe, description: 'Language switcher' },
  { type: 'spacer', label: 'Spacer', icon: Box, description: 'Empty space' },
  { type: 'divider', label: 'Divider', icon: Box, description: 'Vertical line' },
  { type: 'html', label: 'Custom HTML', icon: Code, description: 'Raw HTML code' },
  { type: 'copyright', label: 'Copyright', icon: Calendar, description: 'Copyright text' },
];

// Widget renderer for preview
function WidgetPreview({ widget, variant = 'dark' }: { widget: { type: WidgetType; settings: Record<string, any> }; variant?: 'dark' | 'light' }) {
  const textClass = variant === 'light' ? 'text-white' : 'text-gray-900';

  switch (widget.type) {
    case 'logo':
      return (
        <div className={clsx('font-bold text-xl', textClass)}>
          {widget.settings.text || 'Logo'}
        </div>
      );
    case 'menu':
      return (
        <nav className="flex gap-6">
          {['Home', 'About', 'Services', 'Blog', 'Contact'].map((item) => (
            <a key={item} href="#" className={clsx('text-sm hover:opacity-75', textClass)}>{item}</a>
          ))}
        </nav>
      );
    case 'search':
      return (
        <div className={clsx(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg',
          variant === 'light' ? 'bg-white/20' : 'bg-gray-900/10'
        )}>
          <Search size={16} className={variant === 'light' ? 'text-white/60' : 'text-gray-500'} />
          <span className={clsx('text-sm', variant === 'light' ? 'text-white/60' : 'text-gray-500')}>
            {widget.settings.placeholder || 'Search...'}
          </span>
        </div>
      );
    case 'social':
      const icons = { facebook: Facebook, twitter: Twitter, instagram: Instagram, linkedin: Linkedin, youtube: Youtube, github: Github };
      return (
        <div className="flex gap-3">
          {(widget.settings.platforms || ['facebook', 'twitter']).map((p: string) => {
            const Icon = icons[p as keyof typeof icons] || Link;
            return <Icon key={p} size={18} className={textClass} />;
          })}
        </div>
      );
    case 'cart':
      return (
        <div className="relative">
          <ShoppingCart size={20} className={textClass} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">3</span>
        </div>
      );
    case 'user':
      return <User size={20} className={textClass} />;
    case 'text':
      return <p className={clsx('text-sm', textClass)}>{widget.settings.content || 'Custom text'}</p>;
    case 'button':
      return (
        <button className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg">
          {widget.settings.text || 'Button'}
        </button>
      );
    case 'contact':
      return (
        <div className={clsx('space-y-2 text-sm', textClass)}>
          {widget.settings.email && <div className="flex items-center gap-2"><Mail size={14} /> {widget.settings.email}</div>}
          {widget.settings.phone && <div className="flex items-center gap-2"><Phone size={14} /> {widget.settings.phone}</div>}
          {widget.settings.address && <div className="flex items-center gap-2"><MapPin size={14} /> {widget.settings.address}</div>}
        </div>
      );
    case 'newsletter':
      return (
        <div className="flex gap-2">
          <input
            type="email"
            placeholder={widget.settings.placeholder || 'Enter email'}
            className={clsx(
              'px-3 py-2 text-sm rounded-lg w-48 border',
              variant === 'light'
                ? 'bg-white/10 border-white/20 text-white placeholder-white/50'
                : 'bg-gray-900/10 border-gray-900/20 text-gray-900 placeholder-gray-500'
            )}
          />
          <button className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg">
            {widget.settings.buttonText || 'Subscribe'}
          </button>
        </div>
      );
    case 'language':
      return (
        <div className={clsx('flex items-center gap-1 text-sm', textClass)}>
          <Globe size={16} />
          <span>EN</span>
          <ChevronDown size={14} />
        </div>
      );
    case 'spacer':
      return <div className="w-8" />;
    case 'divider':
      return <div className="h-6 w-px bg-current opacity-20" />;
    case 'copyright':
      return <p className={clsx('text-sm', textClass)}>{widget.settings.text || '© 2025 All rights reserved.'}</p>;
    default:
      return (
        <div className={clsx(
          'px-2 py-1 rounded text-xs',
          variant === 'light' ? 'bg-white/20 text-white' : 'bg-gray-900/10 text-gray-900'
        )}>
          {widget.type}
        </div>
      );
  }
}

// Missing import - add Code icon
function Code(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16,18 22,12 16,6" />
      <polyline points="8,6 2,12 8,18" />
    </svg>
  );
}

// Widget Picker Modal
function WidgetPickerModal({
  isOpen,
  onClose,
  onSelect,
  position,
  targetType,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: WidgetType) => void;
  position?: 'left' | 'center' | 'right';
  targetType: 'header' | 'footer';
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const headerWidgets = widgetPalette.filter(w =>
    ['logo', 'menu', 'search', 'social', 'cart', 'user', 'button', 'language', 'spacer', 'divider'].includes(w.type)
  );
  const footerWidgets = widgetPalette.filter(w =>
    ['logo', 'text', 'menu', 'social', 'contact', 'newsletter', 'copyright', 'html'].includes(w.type)
  );

  const availableWidgets = targetType === 'header' ? headerWidgets : footerWidgets;

  const filteredWidgets = searchQuery
    ? availableWidgets.filter(w =>
        w.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableWidgets;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Widget" size="3xl">
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search widgets..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            autoFocus
          />
        </div>

        {position && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
            <LayoutGrid size={16} />
            Adding to: <span className="font-medium text-gray-900 dark:text-white capitalize">{position}</span> zone
          </div>
        )}

        {/* Widgets Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto">
          {filteredWidgets.map((widget) => (
            <button
              key={widget.type}
              onClick={() => {
                onSelect(widget.type);
                onClose();
                setSearchQuery('');
              }}
              className="flex items-start gap-3 p-4 text-left rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all hover:shadow-md group"
            >
              <div className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                <widget.icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 dark:text-white">{widget.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{widget.description}</p>
              </div>
            </button>
          ))}
        </div>

        {filteredWidgets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Search size={32} className="mx-auto mb-2 opacity-30" />
            <p>No widgets found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

// Header Builder Component
function HeaderBuilder({
  config,
  onChange,
}: {
  config: HeaderConfig;
  onChange: (config: HeaderConfig) => void;
}) {
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [editingWidget, setEditingWidget] = useState<HeaderWidget | null>(null);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState<'left' | 'center' | 'right'>('left');

  const generateId = () => `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addWidget = (type: WidgetType, position: 'left' | 'center' | 'right') => {
    const newWidget: HeaderWidget = {
      id: generateId(),
      type,
      settings: {},
      position,
    };
    onChange({
      ...config,
      widgets: [...config.widgets, newWidget],
    });
    toast.success(`${type} widget added to ${position}`);
  };

  const removeWidget = (id: string) => {
    if (!confirm('Remove this widget from the header?')) return;
    onChange({
      ...config,
      widgets: config.widgets.filter(w => w.id !== id),
    });
    toast.success('Widget removed');
  };

  const updateWidget = (id: string, updates: Partial<HeaderWidget>) => {
    onChange({
      ...config,
      widgets: config.widgets.map(w => w.id === id ? { ...w, ...updates } : w),
    });
  };

  const widgetsByPosition = useMemo(() => ({
    left: config.widgets.filter(w => w.position === 'left'),
    center: config.widgets.filter(w => w.position === 'center'),
    right: config.widgets.filter(w => w.position === 'right'),
  }), [config.widgets]);

  const openWidgetPicker = (position: 'left' | 'center' | 'right') => {
    setPickerPosition(position);
    setShowWidgetPicker(true);
  };

  return (
    <div className="space-y-6">
      {/* Layout Options */}
      <div className="grid grid-cols-4 gap-4">
        {(['simple', 'centered', 'split', 'stacked'] as const).map((layout) => (
          <button
            key={layout}
            onClick={() => onChange({ ...config, layout })}
            className={clsx(
              'p-4 border-2 rounded-lg transition-all',
              config.layout === layout
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            )}
          >
            <div className="flex flex-col items-center gap-2">
              <Layout size={24} className={config.layout === layout ? 'text-primary-600' : 'text-gray-400'} />
              <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">{layout}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Header Settings */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.sticky}
            onChange={(e) => onChange({ ...config, sticky: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Sticky Header</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.transparent}
            onChange={(e) => onChange({ ...config, transparent: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Transparent</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.showTopBar}
            onChange={(e) => onChange({ ...config, showTopBar: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Show Top Bar</span>
        </label>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">Height:</label>
          <input
            type="number"
            value={config.height}
            onChange={(e) => onChange({ ...config, height: parseInt(e.target.value) || 72 })}
            className="w-20 px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">px</span>
        </div>
      </div>

      {/* Color Settings */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">Background:</label>
          <input
            type="color"
            value={config.background}
            onChange={(e) => onChange({ ...config, background: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">Text:</label>
          <input
            type="color"
            value={config.textColor}
            onChange={(e) => onChange({ ...config, textColor: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer"
          />
        </div>
        {config.showTopBar && (
          <>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 dark:text-gray-300">Top Bar BG:</label>
              <input
                type="color"
                value={config.topBarBackground}
                onChange={(e) => onChange({ ...config, topBarBackground: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 dark:text-gray-300">Top Bar Text:</label>
              <input
                type="color"
                value={config.topBarText}
                onChange={(e) => onChange({ ...config, topBarText: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer"
              />
            </div>
          </>
        )}
      </div>

      {/* Widget Zones - Improved UI */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white">Header Widgets</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add, remove, and reorder widgets in each header zone</p>
        </div>

        {/* Drop Zones with Clear Add Buttons */}
        <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700">
          {(['left', 'center', 'right'] as const).map((position) => (
            <div key={position} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  {position === 'left' && <AlignLeft size={14} />}
                  {position === 'center' && <AlignCenter size={14} />}
                  {position === 'right' && <AlignRight size={14} />}
                  {position}
                </span>
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                  {widgetsByPosition[position].length} widgets
                </span>
              </div>

              <div className="min-h-[100px] space-y-2 mb-3">
                {widgetsByPosition[position].map((widget) => {
                  const widgetDef = widgetPalette.find(w => w.type === widget.type);
                  const Icon = widgetDef?.icon || Box;
                  return (
                    <div
                      key={widget.id}
                      className={clsx(
                        'flex items-center gap-2 p-2.5 bg-white dark:bg-gray-700 border rounded-lg group transition-all',
                        selectedWidget === widget.id
                          ? 'border-primary-500 ring-2 ring-primary-100 dark:ring-primary-900/30'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      )}
                      onClick={() => setSelectedWidget(widget.id)}
                    >
                      <div className="cursor-grab text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <GripVertical size={14} />
                      </div>
                      <div className="p-1 rounded bg-gray-100 dark:bg-gray-600">
                        <Icon size={12} className="text-gray-500 dark:text-gray-400" />
                      </div>
                      <span className="flex-1 text-sm capitalize text-gray-700 dark:text-gray-200">{widget.type}</span>

                      {/* Always visible action buttons */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingWidget(widget); }}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded transition-colors"
                        title="Edit settings"
                      >
                        <Settings size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Remove widget"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}

                {widgetsByPosition[position].length === 0 && (
                  <div className="h-full min-h-[60px] border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center text-sm text-gray-400 gap-1">
                    <Box size={20} className="opacity-50" />
                    <span>No widgets</span>
                  </div>
                )}
              </div>

              {/* Prominent Add Button */}
              <button
                onClick={() => openWidgetPicker(position)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 hover:border-primary-400 transition-all"
              >
                <Plus size={16} />
                <span className="font-medium text-sm">Add Widget</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Widget Picker Modal */}
      <WidgetPickerModal
        isOpen={showWidgetPicker}
        onClose={() => setShowWidgetPicker(false)}
        onSelect={(type) => addWidget(type, pickerPosition)}
        position={pickerPosition}
        targetType="header"
      />

      {/* Widget Settings Modal */}
      <AnimatePresence>
        {editingWidget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setEditingWidget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full m-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold capitalize text-gray-900 dark:text-white flex items-center gap-2">
                  <Settings size={20} />
                  {editingWidget.type} Settings
                </h3>
                <button
                  onClick={() => setEditingWidget(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                >
                  <X size={20} />
                </button>
              </div>

              {editingWidget.type === 'logo' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Logo Text</label>
                    <input
                      type="text"
                      value={editingWidget.settings.text || ''}
                      onChange={(e) => {
                        const updated = { ...editingWidget, settings: { ...editingWidget.settings, text: e.target.value } };
                        setEditingWidget(updated);
                      }}
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {editingWidget.type === 'search' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Placeholder</label>
                    <input
                      type="text"
                      value={editingWidget.settings.placeholder || ''}
                      onChange={(e) => {
                        const updated = { ...editingWidget, settings: { ...editingWidget.settings, placeholder: e.target.value } };
                        setEditingWidget(updated);
                      }}
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {editingWidget.type === 'button' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Button Text</label>
                    <input
                      type="text"
                      value={editingWidget.settings.text || ''}
                      onChange={(e) => {
                        const updated = { ...editingWidget, settings: { ...editingWidget.settings, text: e.target.value } };
                        setEditingWidget(updated);
                      }}
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">URL</label>
                    <input
                      type="text"
                      value={editingWidget.settings.url || ''}
                      onChange={(e) => {
                        const updated = { ...editingWidget, settings: { ...editingWidget.settings, url: e.target.value } };
                        setEditingWidget(updated);
                      }}
                      className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="mt-4">
                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Position</label>
                <select
                  value={editingWidget.position}
                  onChange={(e) => {
                    const updated = { ...editingWidget, position: e.target.value as 'left' | 'center' | 'right' };
                    setEditingWidget(updated);
                  }}
                  className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <div className="flex justify-between gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    removeWidget(editingWidget.id);
                    setEditingWidget(null);
                  }}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingWidget(null)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      updateWidget(editingWidget.id, editingWidget);
                      setEditingWidget(null);
                      toast.success('Widget updated');
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
                  >
                    <Save size={16} />
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Footer Builder Component
function FooterBuilder({
  config,
  onChange,
}: {
  config: FooterConfig;
  onChange: (config: FooterConfig) => void;
}) {
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [editingColumn, setEditingColumn] = useState<FooterColumn | null>(null);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  const generateId = () => `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addColumn = () => {
    const newColumn: FooterColumn = {
      id: generateId(),
      title: 'New Column',
      width: 2,
      widgets: [],
    };
    onChange({
      ...config,
      columns: [...config.columns, newColumn],
    });
    toast.success('Column added to footer');
  };

  const removeColumn = (id: string) => {
    if (!confirm('Remove this column and all its widgets?')) return;
    onChange({
      ...config,
      columns: config.columns.filter(c => c.id !== id),
    });
    toast.success('Column removed');
  };

  const updateColumn = (id: string, updates: Partial<FooterColumn>) => {
    onChange({
      ...config,
      columns: config.columns.map(c => c.id === id ? { ...c, ...updates } : c),
    });
  };

  const addWidgetToColumn = (columnId: string, type: WidgetType) => {
    const newWidget: FooterWidget = {
      id: `widget-${Date.now()}`,
      type,
      settings: {},
    };
    onChange({
      ...config,
      columns: config.columns.map(c =>
        c.id === columnId ? { ...c, widgets: [...c.widgets, newWidget] } : c
      ),
    });
    toast.success(`${type} widget added`);
  };

  const removeWidgetFromColumn = (columnId: string, widgetId: string) => {
    if (!confirm('Remove this widget?')) return;
    onChange({
      ...config,
      columns: config.columns.map(c =>
        c.id === columnId ? { ...c, widgets: c.widgets.filter(w => w.id !== widgetId) } : c
      ),
    });
    toast.success('Widget removed');
  };

  const openWidgetPicker = (columnId: string) => {
    setActiveColumnId(columnId);
    setShowWidgetPicker(true);
  };

  return (
    <div className="space-y-6">
      {/* Layout Options */}
      <div className="grid grid-cols-4 gap-4">
        {(['simple', 'columns', 'centered', 'minimal'] as const).map((layout) => (
          <button
            key={layout}
            onClick={() => onChange({ ...config, layout })}
            className={clsx(
              'p-4 border-2 rounded-lg transition-all',
              config.layout === layout
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            )}
          >
            <div className="flex flex-col items-center gap-2">
              <Columns size={24} className={config.layout === layout ? 'text-primary-600' : 'text-gray-400'} />
              <span className="text-sm font-medium capitalize text-gray-700 dark:text-gray-300">{layout}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Color Settings */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">Background:</label>
          <input
            type="color"
            value={config.background}
            onChange={(e) => onChange({ ...config, background: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">Text:</label>
          <input
            type="color"
            value={config.textColor}
            onChange={(e) => onChange({ ...config, textColor: e.target.value })}
            className="w-8 h-8 rounded cursor-pointer"
          />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.showBottomBar}
            onChange={(e) => onChange({ ...config, showBottomBar: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Show Bottom Bar</span>
        </label>
      </div>

      {/* Copyright Text */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Copyright Text</label>
        <input
          type="text"
          value={config.copyrightText}
          onChange={(e) => onChange({ ...config, copyrightText: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="© 2025 Your Company. All rights reserved."
        />
      </div>

      {/* Footer Columns - Improved UI */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Footer Columns</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add columns and widgets to customize your footer</p>
          </div>
          <button
            onClick={addColumn}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={16} />
            Add Column
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {config.columns.map((column) => (
            <div
              key={column.id}
              className={clsx(
                'border rounded-xl overflow-hidden transition-all',
                selectedColumn === column.id
                  ? 'border-primary-500 ring-2 ring-primary-100 dark:ring-primary-900/30'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              )}
              onClick={() => setSelectedColumn(column.id)}
            >
              {/* Column Header */}
              <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <input
                    type="text"
                    value={column.title}
                    onChange={(e) => updateColumn(column.id, { title: e.target.value })}
                    className="font-medium bg-transparent border-none p-0 text-gray-900 dark:text-white focus:ring-0 w-full"
                    placeholder="Column Title"
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); removeColumn(column.id); }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Remove column"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Width:</span>
                  <select
                    value={column.width}
                    onChange={(e) => updateColumn(column.id, { width: parseInt(e.target.value) as 1 | 2 | 3 | 4 })}
                    className="text-xs border rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white flex-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value={1}>Small (1/12)</option>
                    <option value={2}>Medium (2/12)</option>
                    <option value={3}>Large (3/12)</option>
                    <option value={4}>Extra Large (4/12)</option>
                  </select>
                </div>
              </div>

              {/* Column Widgets */}
              <div className="p-3 space-y-2 min-h-[120px] bg-white dark:bg-gray-900/50">
                {column.widgets.map((widget) => {
                  const widgetDef = widgetPalette.find(w => w.type === widget.type);
                  const Icon = widgetDef?.icon || Box;
                  return (
                    <div
                      key={widget.id}
                      className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg group transition-all hover:border-gray-300 dark:hover:border-gray-600"
                    >
                      <div className="cursor-grab text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <GripVertical size={14} />
                      </div>
                      <div className="p-1 rounded bg-gray-200 dark:bg-gray-700">
                        <Icon size={12} className="text-gray-500 dark:text-gray-400" />
                      </div>
                      <span className="flex-1 text-sm capitalize text-gray-700 dark:text-gray-300">{widget.type}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeWidgetFromColumn(column.id, widget.id); }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Remove widget"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}

                {column.widgets.length === 0 && (
                  <div className="h-[60px] border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg flex flex-col items-center justify-center text-sm text-gray-400 gap-1">
                    <Box size={16} className="opacity-50" />
                    <span className="text-xs">No widgets</span>
                  </div>
                )}

                {/* Prominent Add Widget Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); openWidgetPicker(column.id); }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 hover:border-primary-400 transition-all text-sm"
                >
                  <Plus size={14} />
                  <span className="font-medium">Add Widget</span>
                </button>
              </div>
            </div>
          ))}

          {config.columns.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <Columns size={32} className="text-gray-400" />
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">No columns yet</h4>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Add your first column to start building your footer</p>
              <button
                onClick={addColumn}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus size={16} />
                Add First Column
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Widget Picker Modal for Footer */}
      <WidgetPickerModal
        isOpen={showWidgetPicker}
        onClose={() => {
          setShowWidgetPicker(false);
          setActiveColumnId(null);
        }}
        onSelect={(type) => {
          if (activeColumnId) {
            addWidgetToColumn(activeColumnId, type);
          }
        }}
        targetType="footer"
      />
    </div>
  );
}

// Helper function to determine if a color is light or dark based on luminance
function isLightColor(hexColor: string): boolean {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate relative luminance (WCAG formula)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return true if the color is light (luminance > 0.5)
  return luminance > 0.5;
}

// Preview Component
function LivePreview({
  headerConfig,
  footerConfig,
  device,
}: {
  headerConfig: HeaderConfig;
  footerConfig: FooterConfig;
  device: 'desktop' | 'tablet' | 'mobile';
}) {
  // Determine variants based on background colors
  const headerVariant = isLightColor(headerConfig.background) ? 'dark' : 'light';
  const footerVariant = isLightColor(footerConfig.background) ? 'dark' : 'light';

  const deviceWidths = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  };

  return (
    <div className={clsx('mx-auto bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700', deviceWidths[device])}>
      {/* Header Preview */}
      <div>
        {headerConfig.showTopBar && (
          <div
            className="px-4 py-2 text-xs flex items-center justify-between"
            style={{ backgroundColor: headerConfig.topBarBackground, color: headerConfig.topBarText }}
          >
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><Phone size={12} /> +1 (555) 123-4567</span>
              <span className="flex items-center gap-1"><Mail size={12} /> hello@rustpress.io</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1"><Globe size={12} /> EN</span>
              <span className="flex items-center gap-1"><Clock size={12} /> Mon-Fri 9-5</span>
            </div>
          </div>
        )}

        <header
          className="px-6 flex items-center justify-between"
          style={{
            backgroundColor: headerConfig.transparent ? 'transparent' : headerConfig.background,
            color: headerConfig.textColor,
            height: headerConfig.height,
          }}
        >
          <div className="flex items-center gap-4">
            {headerConfig.widgets.filter(w => w.position === 'left').map(w => (
              <WidgetPreview key={w.id} widget={w} variant={headerVariant} />
            ))}
          </div>
          <div className="flex items-center gap-4">
            {headerConfig.widgets.filter(w => w.position === 'center').map(w => (
              <WidgetPreview key={w.id} widget={w} variant={headerVariant} />
            ))}
          </div>
          <div className="flex items-center gap-4">
            {headerConfig.widgets.filter(w => w.position === 'right').map(w => (
              <WidgetPreview key={w.id} widget={w} variant={headerVariant} />
            ))}
          </div>
        </header>
      </div>

      {/* Content Placeholder */}
      <div className="p-8 min-h-[300px] bg-gray-50 dark:bg-gray-800">
        <div className="max-w-2xl mx-auto text-center">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mx-auto mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mx-auto" />
        </div>
      </div>

      {/* Footer Preview */}
      <footer style={{ backgroundColor: footerConfig.background, color: footerConfig.textColor }}>
        {footerConfig.layout === 'columns' && footerConfig.columns.length > 0 && (
          <div className="px-6 py-12">
            <div className="grid grid-cols-12 gap-8">
              {footerConfig.columns.map((column) => {
                const colSpanClasses: Record<number, string> = {
                  1: 'col-span-3',
                  2: 'col-span-6',
                  3: 'col-span-9',
                  4: 'col-span-12',
                };
                return (
                  <div key={column.id} className={colSpanClasses[column.width] || 'col-span-3'}>
                    <h4 className="font-semibold mb-4">{column.title}</h4>
                    <div className="space-y-3">
                      {column.widgets.map(w => (
                        <WidgetPreview key={w.id} widget={w} variant={footerVariant} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {footerConfig.showBottomBar && (
          <div
            className="px-6 py-4 text-sm flex items-center justify-between"
            style={{ backgroundColor: footerConfig.bottomBarBackground, color: footerConfig.bottomBarText }}
          >
            <span>{footerConfig.copyrightText}</span>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:underline">Privacy</a>
              <a href="#" className="hover:underline">Terms</a>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}

// Main Appearance Page
export default function Appearance() {
  const [activeTab, setActiveTab] = useState<'header' | 'footer'>('header');
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(defaultHeaderConfig);
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(defaultFooterConfig);
  const [showPreview, setShowPreview] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleHeaderChange = (config: HeaderConfig) => {
    setHeaderConfig(config);
    setHasUnsavedChanges(true);
  };

  const handleFooterChange = (config: FooterConfig) => {
    setFooterConfig(config);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    // In real app, save to backend
    setHasUnsavedChanges(false);
    toast.success('Appearance settings saved');
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
          title="Header & Footer"
          subtitle="Customize your site's header and footer appearance with modern design tools"
          icon={<Sparkles size={24} />}
          gradient
          actions={
            <div className="flex items-center gap-3">
              {hasUnsavedChanges && (
                <span className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
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

        {/* Tabs */}
        <GlassCard padding="none" className="overflow-hidden">
          <div className="flex border-b border-gray-200/50 dark:border-gray-700/50">
        {(['header', 'footer'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-6 py-3 font-medium text-sm transition-colors relative',
              activeTab === tab
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
              />
            )}
          </button>
        ))}
      </div>

        </GlassCard>

        <motion.div 
          className="grid grid-cols-1 xl:grid-cols-2 gap-6"
          variants={fadeInUp}
        >
          {/* Builder Panel */}
          <GlassCard variant="gradient" className="overflow-hidden">
            <div className="p-6">
          {activeTab === 'header' ? (
            <HeaderBuilder config={headerConfig} onChange={handleHeaderChange} />
          ) : (
            <FooterBuilder config={footerConfig} onChange={handleFooterChange} />
          )}
            </div>
          </GlassCard>

          {/* Preview Panel */}
          {showPreview && (
            <GlassCard variant="default" className="overflow-hidden">
              <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Eye size={18} />
                Live Preview
              </h3>
              <div className="flex items-center gap-1 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
                {(['desktop', 'tablet', 'mobile'] as const).map((device) => {
                  const icons = { desktop: Monitor, tablet: Tablet, mobile: Smartphone };
                  const Icon = icons[device];
                  return (
                    <button
                      key={device}
                      onClick={() => setPreviewDevice(device)}
                      className={clsx(
                        'p-2 rounded transition-colors',
                        previewDevice === device
                          ? 'bg-white dark:bg-gray-600 text-primary-600 shadow-sm'
                          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                      )}
                    >
                      <Icon size={16} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="overflow-x-auto">
              <LivePreview
                headerConfig={headerConfig}
                footerConfig={footerConfig}
                device={previewDevice}
              />
              </div>
            </div>
          </GlassCard>
        )}
        </motion.div>
      </div>
    </motion.div>
  );
}
