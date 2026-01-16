import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  PanelLeft,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Settings,
  Eye,
  EyeOff,
  Copy,
  MoreVertical,
  Search,
  FileText,
  Tag,
  Calendar,
  MessageSquare,
  Image,
  Link,
  List,
  Users,
  Mail,
  Rss,
  Share2,
  ShoppingCart,
  Star,
  Clock,
  TrendingUp,
  Archive,
  Folder,
  Hash,
  MapPin,
  Code,
  Type,
  AlignLeft,
  Box,
  Layers,
  X,
  Check,
  Edit3,
  Save,
  RotateCcw,
  Smartphone,
  Monitor,
  Tablet,
  ChevronUp,
  Move,
  Palette
} from 'lucide-react';
import clsx from 'clsx';

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  settings: Record<string, any>;
  visible: boolean;
}

type WidgetType =
  | 'search'
  | 'recent-posts'
  | 'categories'
  | 'tags'
  | 'archives'
  | 'calendar'
  | 'comments'
  | 'custom-html'
  | 'text'
  | 'image'
  | 'gallery'
  | 'navigation'
  | 'social'
  | 'newsletter'
  | 'author'
  | 'popular-posts'
  | 'related-posts'
  | 'advertisement'
  | 'custom-menu'
  | 'rss'
  | 'meta'
  | 'pages'
  | 'recent-comments'
  | 'tag-cloud'
  | 'video'
  | 'audio'
  | 'weather'
  | 'countdown'
  | 'testimonials'
  | 'cta'
  | 'contact-info';

interface SidebarArea {
  id: string;
  name: string;
  description: string;
  location: 'left' | 'right' | 'both';
  widgets: Widget[];
  settings: SidebarSettings;
}

interface SidebarSettings {
  width: number;
  widthUnit: 'px' | '%';
  backgroundColor: string;
  textColor: string;
  padding: number;
  widgetSpacing: number;
  widgetPadding: number;
  widgetBackground: string;
  widgetBorderRadius: number;
  widgetBorder: boolean;
  widgetBorderColor: string;
  widgetTitleSize: number;
  widgetTitleWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  widgetTitleColor: string;
  widgetTitleBorder: boolean;
  stickyEnabled: boolean;
  stickyOffset: number;
  collapsible: boolean;
  defaultCollapsed: boolean;
  hideOnMobile: boolean;
  mobileBreakpoint: number;
}

const WIDGET_TYPES: { type: WidgetType; label: string; icon: any; category: string }[] = [
  // Content Widgets
  { type: 'search', label: 'Search', icon: Search, category: 'Content' },
  { type: 'recent-posts', label: 'Recent Posts', icon: FileText, category: 'Content' },
  { type: 'popular-posts', label: 'Popular Posts', icon: TrendingUp, category: 'Content' },
  { type: 'related-posts', label: 'Related Posts', icon: Layers, category: 'Content' },
  { type: 'categories', label: 'Categories', icon: Folder, category: 'Content' },
  { type: 'tags', label: 'Tags', icon: Tag, category: 'Content' },
  { type: 'tag-cloud', label: 'Tag Cloud', icon: Hash, category: 'Content' },
  { type: 'archives', label: 'Archives', icon: Archive, category: 'Content' },
  { type: 'pages', label: 'Pages', icon: FileText, category: 'Content' },
  { type: 'calendar', label: 'Calendar', icon: Calendar, category: 'Content' },

  // Social & Engagement
  { type: 'comments', label: 'Comments', icon: MessageSquare, category: 'Engagement' },
  { type: 'recent-comments', label: 'Recent Comments', icon: MessageSquare, category: 'Engagement' },
  { type: 'social', label: 'Social Links', icon: Share2, category: 'Engagement' },
  { type: 'newsletter', label: 'Newsletter', icon: Mail, category: 'Engagement' },
  { type: 'rss', label: 'RSS Feed', icon: Rss, category: 'Engagement' },
  { type: 'author', label: 'Author Bio', icon: Users, category: 'Engagement' },
  { type: 'testimonials', label: 'Testimonials', icon: Star, category: 'Engagement' },

  // Media
  { type: 'image', label: 'Image', icon: Image, category: 'Media' },
  { type: 'gallery', label: 'Gallery', icon: Image, category: 'Media' },
  { type: 'video', label: 'Video', icon: Box, category: 'Media' },
  { type: 'audio', label: 'Audio', icon: Box, category: 'Media' },

  // Custom
  { type: 'text', label: 'Text', icon: Type, category: 'Custom' },
  { type: 'custom-html', label: 'Custom HTML', icon: Code, category: 'Custom' },
  { type: 'custom-menu', label: 'Custom Menu', icon: List, category: 'Custom' },
  { type: 'navigation', label: 'Navigation', icon: List, category: 'Custom' },

  // Utility
  { type: 'advertisement', label: 'Advertisement', icon: Box, category: 'Utility' },
  { type: 'cta', label: 'Call to Action', icon: Box, category: 'Utility' },
  { type: 'contact-info', label: 'Contact Info', icon: MapPin, category: 'Utility' },
  { type: 'countdown', label: 'Countdown', icon: Clock, category: 'Utility' },
  { type: 'weather', label: 'Weather', icon: Box, category: 'Utility' },
  { type: 'meta', label: 'Meta', icon: Settings, category: 'Utility' }
];

const defaultSidebarSettings: SidebarSettings = {
  width: 300,
  widthUnit: 'px',
  backgroundColor: '#ffffff',
  textColor: '#374151',
  padding: 20,
  widgetSpacing: 24,
  widgetPadding: 20,
  widgetBackground: '#f9fafb',
  widgetBorderRadius: 8,
  widgetBorder: true,
  widgetBorderColor: '#e5e7eb',
  widgetTitleSize: 16,
  widgetTitleWeight: 'semibold',
  widgetTitleColor: '#111827',
  widgetTitleBorder: true,
  stickyEnabled: false,
  stickyOffset: 80,
  collapsible: false,
  defaultCollapsed: false,
  hideOnMobile: false,
  mobileBreakpoint: 768
};

const getDefaultWidgetSettings = (type: WidgetType): Record<string, any> => {
  switch (type) {
    case 'search':
      return { placeholder: 'Search...', buttonText: 'Search', showButton: true };
    case 'recent-posts':
      return { count: 5, showDate: true, showThumbnail: true, showExcerpt: false };
    case 'popular-posts':
      return { count: 5, timeframe: 'week', showViews: true, showThumbnail: true };
    case 'categories':
      return { showCount: true, hierarchical: true, showEmpty: false };
    case 'tags':
      return { count: 20, showCount: false, orderBy: 'name' };
    case 'tag-cloud':
      return { count: 30, minSize: 12, maxSize: 22, colorful: true };
    case 'archives':
      return { type: 'monthly', showCount: true, limit: 12 };
    case 'calendar':
      return { highlightPosts: true, showNavigation: true };
    case 'comments':
      return { count: 5, showAvatar: true, excerptLength: 50 };
    case 'recent-comments':
      return { count: 5, showAvatar: true, showPostTitle: true };
    case 'social':
      return {
        networks: ['facebook', 'twitter', 'instagram', 'linkedin'],
        style: 'icons',
        iconSize: 24,
        showLabels: false
      };
    case 'newsletter':
      return {
        title: 'Subscribe',
        description: 'Get the latest posts delivered to your inbox',
        buttonText: 'Subscribe',
        showName: false
      };
    case 'author':
      return {
        showAvatar: true,
        showBio: true,
        showSocial: true,
        avatarSize: 80
      };
    case 'image':
      return { url: '', alt: '', link: '', caption: '' };
    case 'gallery':
      return { images: [], columns: 3, lightbox: true };
    case 'text':
      return { content: '' };
    case 'custom-html':
      return { html: '' };
    case 'custom-menu':
      return { menuId: '', showArrows: false };
    case 'navigation':
      return { items: [], style: 'list' };
    case 'advertisement':
      return { code: '', size: '300x250', label: 'Advertisement' };
    case 'cta':
      return {
        title: 'Ready to get started?',
        description: 'Join thousands of satisfied customers today.',
        buttonText: 'Get Started',
        buttonUrl: '#',
        style: 'gradient'
      };
    case 'contact-info':
      return {
        phone: '',
        email: '',
        address: '',
        showMap: false,
        mapUrl: ''
      };
    case 'countdown':
      return {
        targetDate: '',
        title: 'Coming Soon',
        style: 'boxes'
      };
    case 'testimonials':
      return {
        items: [],
        autoplay: true,
        showDots: true,
        showArrows: false
      };
    default:
      return {};
  }
};

export const SidebarManager: React.FC = () => {
  const [sidebars, setSidebars] = useState<SidebarArea[]>([
    {
      id: 'primary-sidebar',
      name: 'Primary Sidebar',
      description: 'Main sidebar for blog and archive pages',
      location: 'right',
      widgets: [
        { id: 'w1', type: 'search', title: 'Search', settings: getDefaultWidgetSettings('search'), visible: true },
        { id: 'w2', type: 'recent-posts', title: 'Recent Posts', settings: getDefaultWidgetSettings('recent-posts'), visible: true },
        { id: 'w3', type: 'categories', title: 'Categories', settings: getDefaultWidgetSettings('categories'), visible: true },
        { id: 'w4', type: 'newsletter', title: 'Newsletter', settings: getDefaultWidgetSettings('newsletter'), visible: true }
      ],
      settings: defaultSidebarSettings
    },
    {
      id: 'shop-sidebar',
      name: 'Shop Sidebar',
      description: 'Sidebar for WooCommerce/shop pages',
      location: 'left',
      widgets: [
        { id: 'ws1', type: 'search', title: 'Product Search', settings: getDefaultWidgetSettings('search'), visible: true },
        { id: 'ws2', type: 'categories', title: 'Product Categories', settings: getDefaultWidgetSettings('categories'), visible: true }
      ],
      settings: { ...defaultSidebarSettings, width: 280 }
    },
    {
      id: 'footer-widgets',
      name: 'Footer Widget Area',
      description: 'Widget area above footer',
      location: 'both',
      widgets: [],
      settings: { ...defaultSidebarSettings, width: 100, widthUnit: '%' }
    }
  ]);

  const [activeSidebarId, setActiveSidebarId] = useState<string>('primary-sidebar');
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [activeTab, setActiveTab] = useState<'widgets' | 'settings'>('widgets');
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [widgetCategory, setWidgetCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [expandedWidgets, setExpandedWidgets] = useState<Set<string>>(new Set());

  const activeSidebar = sidebars.find(s => s.id === activeSidebarId);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const categories = ['all', ...new Set(WIDGET_TYPES.map(w => w.category))];

  const filteredWidgets = WIDGET_TYPES.filter(w => {
    const matchesCategory = widgetCategory === 'all' || w.category === widgetCategory;
    const matchesSearch = w.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const createSidebar = () => {
    const newSidebar: SidebarArea = {
      id: generateId(),
      name: `New Sidebar ${sidebars.length + 1}`,
      description: 'Custom sidebar area',
      location: 'right',
      widgets: [],
      settings: { ...defaultSidebarSettings }
    };
    setSidebars([...sidebars, newSidebar]);
    setActiveSidebarId(newSidebar.id);
  };

  const deleteSidebar = (sidebarId: string) => {
    if (sidebars.length <= 1) return;
    setSidebars(sidebars.filter(s => s.id !== sidebarId));
    if (activeSidebarId === sidebarId) {
      setActiveSidebarId(sidebars[0].id);
    }
  };

  const duplicateSidebar = (sidebarId: string) => {
    const sidebar = sidebars.find(s => s.id === sidebarId);
    if (!sidebar) return;

    const duplicated: SidebarArea = {
      ...sidebar,
      id: generateId(),
      name: `${sidebar.name} (Copy)`,
      widgets: sidebar.widgets.map(w => ({ ...w, id: generateId() }))
    };
    setSidebars([...sidebars, duplicated]);
  };

  const addWidget = (type: WidgetType) => {
    if (!activeSidebar) return;

    const widgetInfo = WIDGET_TYPES.find(w => w.type === type);
    const newWidget: Widget = {
      id: generateId(),
      type,
      title: widgetInfo?.label || type,
      settings: getDefaultWidgetSettings(type),
      visible: true
    };

    const updatedSidebars = sidebars.map(s => {
      if (s.id === activeSidebarId) {
        return { ...s, widgets: [...s.widgets, newWidget] };
      }
      return s;
    });

    setSidebars(updatedSidebars);
    setSelectedWidget(newWidget);
    setShowWidgetLibrary(false);
  };

  const updateWidget = (widgetId: string, updates: Partial<Widget>) => {
    const updatedSidebars = sidebars.map(s => {
      if (s.id === activeSidebarId) {
        return {
          ...s,
          widgets: s.widgets.map(w =>
            w.id === widgetId ? { ...w, ...updates } : w
          )
        };
      }
      return s;
    });

    setSidebars(updatedSidebars);

    if (selectedWidget?.id === widgetId) {
      setSelectedWidget({ ...selectedWidget, ...updates });
    }
  };

  const updateWidgetSettings = (widgetId: string, settings: Record<string, any>) => {
    updateWidget(widgetId, { settings });
  };

  const deleteWidget = (widgetId: string) => {
    const updatedSidebars = sidebars.map(s => {
      if (s.id === activeSidebarId) {
        return {
          ...s,
          widgets: s.widgets.filter(w => w.id !== widgetId)
        };
      }
      return s;
    });

    setSidebars(updatedSidebars);

    if (selectedWidget?.id === widgetId) {
      setSelectedWidget(null);
    }
  };

  const duplicateWidget = (widgetId: string) => {
    if (!activeSidebar) return;

    const widget = activeSidebar.widgets.find(w => w.id === widgetId);
    if (!widget) return;

    const duplicated: Widget = {
      ...widget,
      id: generateId(),
      title: `${widget.title} (Copy)`
    };

    const index = activeSidebar.widgets.findIndex(w => w.id === widgetId);
    const updatedWidgets = [...activeSidebar.widgets];
    updatedWidgets.splice(index + 1, 0, duplicated);

    const updatedSidebars = sidebars.map(s => {
      if (s.id === activeSidebarId) {
        return { ...s, widgets: updatedWidgets };
      }
      return s;
    });

    setSidebars(updatedSidebars);
  };

  const moveWidget = (widgetId: string, direction: 'up' | 'down') => {
    if (!activeSidebar) return;

    const index = activeSidebar.widgets.findIndex(w => w.id === widgetId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === activeSidebar.widgets.length - 1) return;

    const newWidgets = [...activeSidebar.widgets];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newWidgets[index], newWidgets[newIndex]] = [newWidgets[newIndex], newWidgets[index]];

    const updatedSidebars = sidebars.map(s => {
      if (s.id === activeSidebarId) {
        return { ...s, widgets: newWidgets };
      }
      return s;
    });

    setSidebars(updatedSidebars);
  };

  const updateSidebarSettings = (updates: Partial<SidebarSettings>) => {
    const updatedSidebars = sidebars.map(s => {
      if (s.id === activeSidebarId) {
        return { ...s, settings: { ...s.settings, ...updates } };
      }
      return s;
    });
    setSidebars(updatedSidebars);
  };

  const updateSidebarInfo = (updates: Partial<SidebarArea>) => {
    const updatedSidebars = sidebars.map(s => {
      if (s.id === activeSidebarId) {
        return { ...s, ...updates };
      }
      return s;
    });
    setSidebars(updatedSidebars);
  };

  const toggleWidgetExpand = (widgetId: string) => {
    const newExpanded = new Set(expandedWidgets);
    if (newExpanded.has(widgetId)) {
      newExpanded.delete(widgetId);
    } else {
      newExpanded.add(widgetId);
    }
    setExpandedWidgets(newExpanded);
  };

  const renderWidgetSettings = () => {
    if (!selectedWidget) return null;

    const { type, settings } = selectedWidget;

    switch (type) {
      case 'search':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Placeholder</label>
              <input
                type="text"
                value={settings.placeholder || ''}
                onChange={(e) => updateWidgetSettings(selectedWidget.id, { ...settings, placeholder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Button Text</label>
              <input
                type="text"
                value={settings.buttonText || ''}
                onChange={(e) => updateWidgetSettings(selectedWidget.id, { ...settings, buttonText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.showButton}
                onChange={(e) => updateWidgetSettings(selectedWidget.id, { ...settings, showButton: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700">Show Search Button</span>
            </label>
          </div>
        );

      case 'recent-posts':
      case 'popular-posts':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Number of Posts</label>
              <input
                type="number"
                min="1"
                max="20"
                value={settings.count || 5}
                onChange={(e) => updateWidgetSettings(selectedWidget.id, { ...settings, count: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.showDate}
                onChange={(e) => updateWidgetSettings(selectedWidget.id, { ...settings, showDate: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700">Show Date</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.showThumbnail}
                onChange={(e) => updateWidgetSettings(selectedWidget.id, { ...settings, showThumbnail: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700">Show Thumbnail</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.showExcerpt}
                onChange={(e) => updateWidgetSettings(selectedWidget.id, { ...settings, showExcerpt: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700">Show Excerpt</span>
            </label>
          </div>
        );

      case 'categories':
        return (
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.showCount}
                onChange={(e) => updateWidgetSettings(selectedWidget.id, { ...settings, showCount: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700">Show Post Count</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.hierarchical}
                onChange={(e) => updateWidgetSettings(selectedWidget.id, { ...settings, hierarchical: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700">Show Hierarchy</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.showEmpty}
                onChange={(e) => updateWidgetSettings(selectedWidget.id, { ...settings, showEmpty: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700">Show Empty Categories</span>
            </label>
          </div>
        );

      case 'newsletter':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Title</label>
              <input
                type="text"
                value={settings.title || ''}
                onChange={(e) => updateWidgetSettings(selectedWidget.id, { ...settings, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <textarea
                value={settings.description || ''}
                onChange={(e) => updateWidgetSettings(selectedWidget.id, { ...settings, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Button Text</label>
              <input
                type="text"
                value={settings.buttonText || ''}
                onChange={(e) => updateWidgetSettings(selectedWidget.id, { ...settings, buttonText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.showName}
                onChange={(e) => updateWidgetSettings(selectedWidget.id, { ...settings, showName: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700">Show Name Field</span>
            </label>
          </div>
        );

      case 'social':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Style</label>
              <div className="flex gap-2">
                {['icons', 'buttons', 'text'].map(style => (
                  <button
                    key={style}
                    onClick={() => updateWidgetSettings(selectedWidget.id, { ...settings, style })}
                    className={clsx(
                      'flex-1 px-3 py-2 rounded-lg border capitalize text-sm',
                      settings.style === style
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Icon Size: {settings.iconSize}px</label>
              <input
                type="range"
                min="16"
                max="48"
                value={settings.iconSize || 24}
                onChange={(e) => updateWidgetSettings(selectedWidget.id, { ...settings, iconSize: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.showLabels}
                onChange={(e) => updateWidgetSettings(selectedWidget.id, { ...settings, showLabels: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-700">Show Labels</span>
            </label>
          </div>
        );

      case 'cta':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Title</label>
              <input
                type="text"
                value={settings.title || ''}
                onChange={(e) => updateWidgetSettings(selectedWidget.id, { ...settings, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Description</label>
              <textarea
                value={settings.description || ''}
                onChange={(e) => updateWidgetSettings(selectedWidget.id, { ...settings, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Button Text</label>
              <input
                type="text"
                value={settings.buttonText || ''}
                onChange={(e) => updateWidgetSettings(selectedWidget.id, { ...settings, buttonText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Button URL</label>
              <input
                type="text"
                value={settings.buttonUrl || ''}
                onChange={(e) => updateWidgetSettings(selectedWidget.id, { ...settings, buttonUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Style</label>
              <div className="grid grid-cols-3 gap-2">
                {['gradient', 'solid', 'outline'].map(style => (
                  <button
                    key={style}
                    onClick={() => updateWidgetSettings(selectedWidget.id, { ...settings, style })}
                    className={clsx(
                      'px-3 py-2 rounded-lg border capitalize text-sm',
                      settings.style === style
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'text':
        return (
          <div>
            <label className="block text-sm text-gray-600 mb-1">Content</label>
            <textarea
              value={settings.content || ''}
              onChange={(e) => updateWidgetSettings(selectedWidget.id, { ...settings, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none"
              rows={6}
              placeholder="Enter your text content..."
            />
          </div>
        );

      case 'custom-html':
        return (
          <div>
            <label className="block text-sm text-gray-600 mb-1">HTML Code</label>
            <textarea
              value={settings.html || ''}
              onChange={(e) => updateWidgetSettings(selectedWidget.id, { ...settings, html: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none font-mono text-sm"
              rows={8}
              placeholder="<div>Your HTML here...</div>"
            />
          </div>
        );

      default:
        return (
          <p className="text-sm text-gray-500 text-center py-4">
            Widget settings for "{type}" coming soon.
          </p>
        );
    }
  };

  const renderWidgetPreview = (widget: Widget) => {
    const { type, settings, title } = widget;

    switch (type) {
      case 'search':
        return (
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={settings.placeholder}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                readOnly
              />
              {settings.showButton && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                  {settings.buttonText}
                </button>
              )}
            </div>
          </div>
        );

      case 'recent-posts':
        return (
          <div className="space-y-3">
            {[1, 2, 3].slice(0, Math.min(3, settings.count)).map(i => (
              <div key={i} className="flex gap-3">
                {settings.showThumbnail && (
                  <div className="w-16 h-12 bg-gray-200 rounded flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">Sample Post Title {i}</p>
                  {settings.showDate && (
                    <p className="text-xs text-gray-500">Dec 20, 2025</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 'categories':
        return (
          <ul className="space-y-2">
            {['Technology', 'Design', 'Business', 'Lifestyle'].map((cat, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 hover:text-blue-600 cursor-pointer">{cat}</span>
                {settings.showCount && (
                  <span className="text-gray-400">(12)</span>
                )}
              </li>
            ))}
          </ul>
        );

      case 'newsletter':
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">{settings.description}</p>
            {settings.showName && (
              <input
                type="text"
                placeholder="Your name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                readOnly
              />
            )}
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              readOnly
            />
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
              {settings.buttonText}
            </button>
          </div>
        );

      case 'social':
        return (
          <div className="flex flex-wrap gap-2">
            {['FB', 'TW', 'IG', 'LI'].map((network, i) => (
              <div
                key={i}
                className={clsx(
                  'flex items-center justify-center',
                  settings.style === 'buttons'
                    ? 'px-4 py-2 bg-gray-100 rounded-lg'
                    : 'w-10 h-10 bg-gray-100 rounded-full'
                )}
                style={{ width: settings.style === 'icons' ? settings.iconSize + 16 : undefined }}
              >
                <span className="text-sm font-medium text-gray-600">{network}</span>
              </div>
            ))}
          </div>
        );

      case 'cta':
        return (
          <div
            className={clsx(
              'p-4 rounded-lg text-center',
              settings.style === 'gradient' && 'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
              settings.style === 'solid' && 'bg-blue-600 text-white',
              settings.style === 'outline' && 'border-2 border-blue-600 text-blue-600'
            )}
          >
            <h4 className="font-semibold">{settings.title}</h4>
            <p className="text-sm opacity-90 mt-1">{settings.description}</p>
            <button
              className={clsx(
                'mt-3 px-4 py-2 rounded-lg text-sm font-medium',
                settings.style === 'outline'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-blue-600'
              )}
            >
              {settings.buttonText}
            </button>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500 text-center py-4">
            Preview for {type}
          </div>
        );
    }
  };

  const renderSidebarPreview = () => {
    if (!activeSidebar) return null;
    const { settings, widgets } = activeSidebar;

    return (
      <div
        className="rounded-lg overflow-hidden"
        style={{
          width: previewDevice === 'mobile' && settings.hideOnMobile ? '100%' :
                 previewDevice === 'mobile' ? 280 :
                 previewDevice === 'tablet' ? 250 :
                 settings.widthUnit === '%' ? `${settings.width}%` : settings.width,
          backgroundColor: settings.backgroundColor,
          padding: settings.padding,
          color: settings.textColor
        }}
      >
        {previewDevice === 'mobile' && settings.hideOnMobile ? (
          <div className="text-center py-8 text-gray-400">
            <Smartphone className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">Hidden on mobile</p>
          </div>
        ) : (
          <div style={{ gap: settings.widgetSpacing }} className="flex flex-col">
            {widgets.filter(w => w.visible).map(widget => (
              <div
                key={widget.id}
                style={{
                  backgroundColor: settings.widgetBackground,
                  borderRadius: settings.widgetBorderRadius,
                  padding: settings.widgetPadding,
                  border: settings.widgetBorder ? `1px solid ${settings.widgetBorderColor}` : 'none'
                }}
              >
                <h4
                  style={{
                    fontSize: settings.widgetTitleSize,
                    fontWeight: settings.widgetTitleWeight === 'normal' ? 400
                      : settings.widgetTitleWeight === 'medium' ? 500
                      : settings.widgetTitleWeight === 'semibold' ? 600 : 700,
                    color: settings.widgetTitleColor,
                    borderBottom: settings.widgetTitleBorder ? `1px solid ${settings.widgetBorderColor}` : 'none',
                    paddingBottom: settings.widgetTitleBorder ? 8 : 0,
                    marginBottom: 12
                  }}
                >
                  {widget.title}
                </h4>
                {renderWidgetPreview(widget)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <PanelLeft className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Sidebar Manager</h2>
              <p className="text-sm text-gray-500">Manage widget areas and sidebars</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={createSidebar}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Sidebar
            </button>
          </div>
        </div>

        {/* Sidebar Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {sidebars.map(sidebar => (
            <button
              key={sidebar.id}
              onClick={() => setActiveSidebarId(sidebar.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                activeSidebarId === sidebar.id
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              )}
            >
              <PanelLeft className="w-4 h-4" />
              <span className="font-medium">{sidebar.name}</span>
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                {sidebar.widgets.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex gap-1">
          {[
            { id: 'widgets' as const, label: 'Widgets', icon: Layers },
            { id: 'settings' as const, label: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-3 border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'widgets' && activeSidebar && (
          <div className="h-full flex">
            {/* Left: Widgets List */}
            <div className="w-1/2 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <span className="font-medium text-gray-700">Widgets</span>
                <button
                  onClick={() => setShowWidgetLibrary(!showWidgetLibrary)}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors',
                    showWidgetLibrary
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  <Plus className="w-4 h-4" />
                  Add Widget
                </button>
              </div>

              {/* Widget Library */}
              <AnimatePresence>
                {showWidgetLibrary && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-b border-gray-200 overflow-hidden"
                  >
                    <div className="p-4 bg-gray-50">
                      <div className="flex gap-2 mb-3">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search widgets..."
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
                          />
                        </div>
                      </div>

                      <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
                        {categories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setWidgetCategory(cat)}
                            className={clsx(
                              'px-3 py-1 rounded-full text-xs whitespace-nowrap capitalize transition-colors',
                              widgetCategory === cat
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100'
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto">
                        {filteredWidgets.map(({ type, label, icon: Icon }) => (
                          <button
                            key={type}
                            onClick={() => addWidget(type)}
                            className="flex flex-col items-center gap-1 p-3 bg-white rounded-lg border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                          >
                            <Icon className="w-5 h-5 text-gray-600" />
                            <span className="text-xs text-gray-700 text-center">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Widgets List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {activeSidebar.widgets.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Layers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No widgets yet</p>
                    <p className="text-sm">Click "Add Widget" to get started</p>
                  </div>
                ) : (
                  activeSidebar.widgets.map((widget, index) => {
                    const widgetInfo = WIDGET_TYPES.find(w => w.type === widget.type);
                    const Icon = widgetInfo?.icon || Box;
                    const isSelected = selectedWidget?.id === widget.id;

                    return (
                      <motion.div
                        key={widget.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={clsx(
                          'border rounded-lg transition-all',
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 bg-white',
                          !widget.visible && 'opacity-50'
                        )}
                      >
                        <div
                          className="flex items-center gap-2 p-3 cursor-pointer"
                          onClick={() => setSelectedWidget(widget)}
                        >
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                          <Icon className="w-4 h-4 text-gray-500" />
                          <span className="flex-1 font-medium text-gray-700 truncate">
                            {widget.title}
                          </span>
                          <span className="text-xs text-gray-400 capitalize">
                            {widget.type.replace('-', ' ')}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveWidget(widget.id, 'up');
                              }}
                              disabled={index === 0}
                              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                            >
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveWidget(widget.id, 'down');
                              }}
                              disabled={index === activeSidebar.widgets.length - 1}
                              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                            >
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateWidget(widget.id, { visible: !widget.visible });
                              }}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              {widget.visible ? (
                                <Eye className="w-4 h-4 text-gray-400" />
                              ) : (
                                <EyeOff className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateWidget(widget.id);
                              }}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <Copy className="w-4 h-4 text-gray-400" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteWidget(widget.id);
                              }}
                              className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Widget Settings & Preview */}
            <div className="w-1/2 flex flex-col">
              {selectedWidget ? (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">Widget Settings</h3>
                    <button
                      onClick={() => setSelectedWidget(null)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Widget Title
                      </label>
                      <input
                        type="text"
                        value={selectedWidget.title}
                        onChange={(e) => updateWidget(selectedWidget.id, { title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                      />
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Widget Options</h4>
                      {renderWidgetSettings()}
                    </div>
                  </div>

                  {/* Widget Preview */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">
                        {selectedWidget.title}
                      </h5>
                      {renderWidgetPreview(selectedWidget)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Sidebar Preview</span>
                      <div className="flex gap-1">
                        {[
                          { device: 'desktop' as const, icon: Monitor },
                          { device: 'tablet' as const, icon: Tablet },
                          { device: 'mobile' as const, icon: Smartphone }
                        ].map(({ device, icon: Icon }) => (
                          <button
                            key={device}
                            onClick={() => setPreviewDevice(device)}
                            className={clsx(
                              'p-2 rounded-lg transition-colors',
                              previewDevice === device
                                ? 'bg-indigo-100 text-indigo-600'
                                : 'text-gray-400 hover:bg-gray-100'
                            )}
                          >
                            <Icon className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-100 flex justify-center">
                      {renderSidebarPreview()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && activeSidebar && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Sidebar Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">Sidebar Info</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Name</label>
                    <input
                      type="text"
                      value={activeSidebar.name}
                      onChange={(e) => updateSidebarInfo({ name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Description</label>
                    <input
                      type="text"
                      value={activeSidebar.description}
                      onChange={(e) => updateSidebarInfo({ description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Default Location</label>
                    <div className="flex gap-2">
                      {['left', 'right', 'both'].map(loc => (
                        <button
                          key={loc}
                          onClick={() => updateSidebarInfo({ location: loc as any })}
                          className={clsx(
                            'flex-1 px-4 py-2 rounded-lg border capitalize transition-colors',
                            activeSidebar.location === loc
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          )}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dimensions */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">Dimensions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Width</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={activeSidebar.settings.width}
                        onChange={(e) => updateSidebarSettings({ width: parseInt(e.target.value) })}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                      />
                      <select
                        value={activeSidebar.settings.widthUnit}
                        onChange={(e) => updateSidebarSettings({ widthUnit: e.target.value as any })}
                        className="px-3 py-2 border border-gray-200 rounded-lg"
                      >
                        <option value="px">px</option>
                        <option value="%">%</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Padding</label>
                    <input
                      type="number"
                      value={activeSidebar.settings.padding}
                      onChange={(e) => updateSidebarSettings({ padding: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">Colors</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'backgroundColor', label: 'Background' },
                    { key: 'textColor', label: 'Text Color' }
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-sm text-gray-600 mb-1">{label}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={(activeSidebar.settings as any)[key]}
                          onChange={(e) => updateSidebarSettings({ [key]: e.target.value } as any)}
                          className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={(activeSidebar.settings as any)[key]}
                          onChange={(e) => updateSidebarSettings({ [key]: e.target.value } as any)}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Widget Styling */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">Widget Styling</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Widget Spacing: {activeSidebar.settings.widgetSpacing}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="48"
                        value={activeSidebar.settings.widgetSpacing}
                        onChange={(e) => updateSidebarSettings({ widgetSpacing: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Widget Padding: {activeSidebar.settings.widgetPadding}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="32"
                        value={activeSidebar.settings.widgetPadding}
                        onChange={(e) => updateSidebarSettings({ widgetPadding: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'widgetBackground', label: 'Widget Background' },
                      { key: 'widgetBorderColor', label: 'Border Color' }
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-sm text-gray-600 mb-1">{label}</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={(activeSidebar.settings as any)[key]}
                            onChange={(e) => updateSidebarSettings({ [key]: e.target.value } as any)}
                            className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={(activeSidebar.settings as any)[key]}
                            onChange={(e) => updateSidebarSettings({ [key]: e.target.value } as any)}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Border Radius: {activeSidebar.settings.widgetBorderRadius}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={activeSidebar.settings.widgetBorderRadius}
                      onChange={(e) => updateSidebarSettings({ widgetBorderRadius: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={activeSidebar.settings.widgetBorder}
                      onChange={(e) => updateSidebarSettings({ widgetBorder: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-700">Show Widget Border</span>
                  </label>
                </div>
              </div>

              {/* Widget Title Styling */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">Widget Title</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Font Size</label>
                      <input
                        type="number"
                        value={activeSidebar.settings.widgetTitleSize}
                        onChange={(e) => updateSidebarSettings({ widgetTitleSize: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Font Weight</label>
                      <select
                        value={activeSidebar.settings.widgetTitleWeight}
                        onChange={(e) => updateSidebarSettings({ widgetTitleWeight: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                      >
                        <option value="normal">Normal</option>
                        <option value="medium">Medium</option>
                        <option value="semibold">Semibold</option>
                        <option value="bold">Bold</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Title Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={activeSidebar.settings.widgetTitleColor}
                        onChange={(e) => updateSidebarSettings({ widgetTitleColor: e.target.value })}
                        className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={activeSidebar.settings.widgetTitleColor}
                        onChange={(e) => updateSidebarSettings({ widgetTitleColor: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={activeSidebar.settings.widgetTitleBorder}
                      onChange={(e) => updateSidebarSettings({ widgetTitleBorder: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-700">Show Title Border</span>
                  </label>
                </div>
              </div>

              {/* Sticky Settings */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">Sticky Sidebar</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={activeSidebar.settings.stickyEnabled}
                      onChange={(e) => updateSidebarSettings({ stickyEnabled: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-700">Enable Sticky Sidebar</span>
                  </label>

                  {activeSidebar.settings.stickyEnabled && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Sticky Offset: {activeSidebar.settings.stickyOffset}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="200"
                        value={activeSidebar.settings.stickyOffset}
                        onChange={(e) => updateSidebarSettings({ stickyOffset: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Collapsible */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">Collapsible</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={activeSidebar.settings.collapsible}
                      onChange={(e) => updateSidebarSettings({ collapsible: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-700">Allow Collapse/Expand</span>
                  </label>

                  {activeSidebar.settings.collapsible && (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={activeSidebar.settings.defaultCollapsed}
                        onChange={(e) => updateSidebarSettings({ defaultCollapsed: e.target.checked })}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm text-gray-700">Collapsed by Default</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Mobile Settings */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">Mobile Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={activeSidebar.settings.hideOnMobile}
                      onChange={(e) => updateSidebarSettings({ hideOnMobile: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-700">Hide on Mobile</span>
                  </label>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Mobile Breakpoint: {activeSidebar.settings.mobileBreakpoint}px
                    </label>
                    <input
                      type="range"
                      min="480"
                      max="1024"
                      step="8"
                      value={activeSidebar.settings.mobileBreakpoint}
                      onChange={(e) => updateSidebarSettings({ mobileBreakpoint: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">Actions</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => duplicateSidebar(activeSidebar.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => deleteSidebar(activeSidebar.id)}
                    disabled={sidebars.length <= 1}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Preview</span>
                  <div className="flex gap-1">
                    {[
                      { device: 'desktop' as const, icon: Monitor },
                      { device: 'tablet' as const, icon: Tablet },
                      { device: 'mobile' as const, icon: Smartphone }
                    ].map(({ device, icon: Icon }) => (
                      <button
                        key={device}
                        onClick={() => setPreviewDevice(device)}
                        className={clsx(
                          'p-2 rounded-lg transition-colors',
                          previewDevice === device
                            ? 'bg-indigo-100 text-indigo-600'
                            : 'text-gray-400 hover:bg-gray-100'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-100 flex justify-center">
                  {renderSidebarPreview()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarManager;
