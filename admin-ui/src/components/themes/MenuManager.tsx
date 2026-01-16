import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Menu,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Link,
  FileText,
  Tag,
  Folder,
  ExternalLink,
  Home,
  Settings,
  Eye,
  EyeOff,
  Copy,
  MoreVertical,
  Search,
  Hash,
  Image,
  ShoppingBag,
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Heart,
  Bookmark,
  MessageSquare,
  Bell,
  Shield,
  Zap,
  Globe,
  Lock,
  Unlock,
  Check,
  X,
  Edit3,
  Save,
  RotateCcw,
  Smartphone,
  Monitor,
  Tablet,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  LayoutGrid,
  Sparkles,
  Wand2
} from 'lucide-react';
import clsx from 'clsx';
import { MegaMenuBuilder, type MegaMenuConfig } from '../megamenu';

type MenuStyle = 'classic' | 'megamenu';

interface MenuItem {
  id: string;
  type: 'page' | 'post' | 'category' | 'custom' | 'mega-menu';
  label: string;
  url: string;
  icon?: string;
  target: '_self' | '_blank';
  cssClass?: string;
  description?: string;
  visible: boolean;
  children: MenuItem[];
  menuStyle: MenuStyle;
  hasMegaMenu?: boolean;
  megaMenuColumns?: MegaMenuColumn[];
  megaMenuConfig?: MegaMenuConfig;
}

interface MegaMenuColumn {
  id: string;
  width: number;
  widgets: MegaMenuWidget[];
}

interface MegaMenuWidget {
  id: string;
  type: 'links' | 'image' | 'text' | 'posts' | 'products';
  title: string;
  content: any;
}

interface MenuLocation {
  id: string;
  name: string;
  description: string;
  assignedMenu: string | null;
}

interface MenuData {
  id: string;
  name: string;
  items: MenuItem[];
  settings: MenuSettings;
}

interface MenuSettings {
  mobileBreakpoint: number;
  mobileStyle: 'slide' | 'overlay' | 'accordion';
  showIcons: boolean;
  iconPosition: 'left' | 'right';
  submenuAnimation: 'fade' | 'slide' | 'scale';
  submenuIndicator: 'arrow' | 'plus' | 'none';
  depth: number;
  alignment: 'left' | 'center' | 'right';
  spacing: number;
  fontSize: number;
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
  hoverStyle: 'underline' | 'background' | 'color' | 'none';
  activeStyle: 'underline' | 'background' | 'bold';
  textColor: string;
  hoverColor: string;
  activeColor: string;
  backgroundColor: string;
  dropdownBg: string;
  borderRadius: number;
}

const AVAILABLE_ICONS = [
  { name: 'home', icon: Home },
  { name: 'file', icon: FileText },
  { name: 'tag', icon: Tag },
  { name: 'folder', icon: Folder },
  { name: 'link', icon: Link },
  { name: 'search', icon: Search },
  { name: 'image', icon: Image },
  { name: 'shop', icon: ShoppingBag },
  { name: 'users', icon: Users },
  { name: 'mail', icon: Mail },
  { name: 'phone', icon: Phone },
  { name: 'location', icon: MapPin },
  { name: 'calendar', icon: Calendar },
  { name: 'star', icon: Star },
  { name: 'heart', icon: Heart },
  { name: 'bookmark', icon: Bookmark },
  { name: 'message', icon: MessageSquare },
  { name: 'bell', icon: Bell },
  { name: 'shield', icon: Shield },
  { name: 'zap', icon: Zap },
  { name: 'globe', icon: Globe }
];

const defaultMenuSettings: MenuSettings = {
  mobileBreakpoint: 768,
  mobileStyle: 'slide',
  showIcons: true,
  iconPosition: 'left',
  submenuAnimation: 'fade',
  submenuIndicator: 'arrow',
  depth: 3,
  alignment: 'left',
  spacing: 24,
  fontSize: 14,
  fontWeight: 'medium',
  hoverStyle: 'underline',
  activeStyle: 'underline',
  textColor: '#1f2937',
  hoverColor: '#3b82f6',
  activeColor: '#3b82f6',
  backgroundColor: 'transparent',
  dropdownBg: '#ffffff',
  borderRadius: 8
};

const defaultLocations: MenuLocation[] = [
  { id: 'primary', name: 'Primary Menu', description: 'Main navigation in header', assignedMenu: null },
  { id: 'secondary', name: 'Secondary Menu', description: 'Top bar navigation', assignedMenu: null },
  { id: 'footer', name: 'Footer Menu', description: 'Footer navigation links', assignedMenu: null },
  { id: 'mobile', name: 'Mobile Menu', description: 'Mobile navigation overlay', assignedMenu: null },
  { id: 'sidebar', name: 'Sidebar Menu', description: 'Sidebar navigation widget', assignedMenu: null }
];

const samplePages = [
  { id: 'home', title: 'Home', url: '/' },
  { id: 'about', title: 'About Us', url: '/about' },
  { id: 'services', title: 'Services', url: '/services' },
  { id: 'blog', title: 'Blog', url: '/blog' },
  { id: 'contact', title: 'Contact', url: '/contact' },
  { id: 'portfolio', title: 'Portfolio', url: '/portfolio' },
  { id: 'shop', title: 'Shop', url: '/shop' },
  { id: 'faq', title: 'FAQ', url: '/faq' },
  { id: 'privacy', title: 'Privacy Policy', url: '/privacy' },
  { id: 'terms', title: 'Terms of Service', url: '/terms' }
];

const sampleCategories = [
  { id: 'tech', title: 'Technology', url: '/category/technology' },
  { id: 'design', title: 'Design', url: '/category/design' },
  { id: 'business', title: 'Business', url: '/category/business' },
  { id: 'lifestyle', title: 'Lifestyle', url: '/category/lifestyle' },
  { id: 'travel', title: 'Travel', url: '/category/travel' }
];

export const MenuManager: React.FC = () => {
  const [menus, setMenus] = useState<MenuData[]>([
    {
      id: 'main-menu',
      name: 'Main Menu',
      items: [
        { id: '1', type: 'page', label: 'Home', url: '/', icon: 'home', target: '_self', visible: true, menuStyle: 'classic', children: [] },
        { id: '2', type: 'page', label: 'About', url: '/about', target: '_self', visible: true, menuStyle: 'classic', children: [] },
        { id: '3', type: 'custom', label: 'Services', url: '/services', target: '_self', visible: true, menuStyle: 'classic', children: [
          { id: '3-1', type: 'custom', label: 'Web Design', url: '/services/web-design', target: '_self', visible: true, menuStyle: 'classic', children: [] },
          { id: '3-2', type: 'custom', label: 'Development', url: '/services/development', target: '_self', visible: true, menuStyle: 'classic', children: [] },
          { id: '3-3', type: 'custom', label: 'Marketing', url: '/services/marketing', target: '_self', visible: true, menuStyle: 'classic', children: [] }
        ]},
        { id: '4', type: 'page', label: 'Blog', url: '/blog', target: '_self', visible: true, menuStyle: 'classic', children: [] },
        { id: '5', type: 'page', label: 'Contact', url: '/contact', icon: 'mail', target: '_self', visible: true, menuStyle: 'classic', children: [] }
      ],
      settings: defaultMenuSettings
    }
  ]);

  const [activeMenuId, setActiveMenuId] = useState<string>('main-menu');
  const [locations, setLocations] = useState<MenuLocation[]>(defaultLocations);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'structure' | 'settings' | 'locations'>('structure');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [addPanelTab, setAddPanelTab] = useState<'pages' | 'categories' | 'custom'>('pages');
  const [customLinkLabel, setCustomLinkLabel] = useState('');
  const [customLinkUrl, setCustomLinkUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [megaMenuBuilderOpen, setMegaMenuBuilderOpen] = useState(false);
  const [megaMenuTargetItem, setMegaMenuTargetItem] = useState<MenuItem | null>(null);
  const [selectedAddStyle, setSelectedAddStyle] = useState<MenuStyle>('classic');

  const activeMenu = menus.find(m => m.id === activeMenuId);

  // Mega Menu Functions
  const openMegaMenuBuilder = (item: MenuItem) => {
    setMegaMenuTargetItem(item);
    setMegaMenuBuilderOpen(true);
  };

  const closeMegaMenuBuilder = () => {
    setMegaMenuBuilderOpen(false);
    setMegaMenuTargetItem(null);
  };

  const saveMegaMenuConfig = (config: MegaMenuConfig) => {
    if (!megaMenuTargetItem) return;
    handleUpdateMenuItem(megaMenuTargetItem.id, {
      megaMenuConfig: config,
      hasMegaMenu: true,
      type: 'mega-menu'
    });
    closeMegaMenuBuilder();
  };

  const removeMegaMenu = (itemId: string) => {
    handleUpdateMenuItem(itemId, {
      megaMenuConfig: undefined,
      hasMegaMenu: false,
      type: 'custom'
    });
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const toggleExpand = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const createMenu = () => {
    const newMenu: MenuData = {
      id: generateId(),
      name: `New Menu ${menus.length + 1}`,
      items: [],
      settings: { ...defaultMenuSettings }
    };
    setMenus([...menus, newMenu]);
    setActiveMenuId(newMenu.id);
  };

  const deleteMenu = (menuId: string) => {
    if (menus.length <= 1) return;
    setMenus(menus.filter(m => m.id !== menuId));
    if (activeMenuId === menuId) {
      setActiveMenuId(menus[0].id);
    }
  };

  const duplicateMenu = (menuId: string) => {
    const menu = menus.find(m => m.id === menuId);
    if (!menu) return;

    const duplicatedMenu: MenuData = {
      ...menu,
      id: generateId(),
      name: `${menu.name} (Copy)`
    };
    setMenus([...menus, duplicatedMenu]);
  };

  const addMenuItem = (type: 'page' | 'category' | 'custom', data: { title: string; url: string }, style: MenuStyle = 'classic') => {
    if (!activeMenu) return;

    const newItem: MenuItem = {
      id: generateId(),
      type,
      label: data.title,
      url: data.url,
      target: '_self',
      visible: true,
      menuStyle: style,
      children: []
    };

    // If it's a mega menu, open the builder immediately
    if (style === 'megamenu') {
      const updatedMenus = menus.map(m => {
        if (m.id === activeMenuId) {
          return { ...m, items: [...m.items, newItem] };
        }
        return m;
      });
      setMenus(updatedMenus);
      setMegaMenuTargetItem(newItem);
      setMegaMenuBuilderOpen(true);
    } else {
      const updatedMenus = menus.map(m => {
        if (m.id === activeMenuId) {
          return { ...m, items: [...m.items, newItem] };
        }
        return m;
      });
      setMenus(updatedMenus);
    }
  };

  const addCustomLink = () => {
    if (!customLinkLabel || !customLinkUrl) return;
    addMenuItem('custom', { title: customLinkLabel, url: customLinkUrl }, selectedAddStyle);
    setCustomLinkLabel('');
    setCustomLinkUrl('');
  };

  const updateMenuItem = (itemId: string, updates: Partial<MenuItem>, items: MenuItem[] = activeMenu?.items || []): MenuItem[] => {
    return items.map(item => {
      if (item.id === itemId) {
        return { ...item, ...updates };
      }
      if (item.children.length > 0) {
        return { ...item, children: updateMenuItem(itemId, updates, item.children) };
      }
      return item;
    });
  };

  const handleUpdateMenuItem = (itemId: string, updates: Partial<MenuItem>) => {
    const updatedMenus = menus.map(m => {
      if (m.id === activeMenuId) {
        return { ...m, items: updateMenuItem(itemId, updates) };
      }
      return m;
    });
    setMenus(updatedMenus);

    if (selectedItem?.id === itemId) {
      setSelectedItem({ ...selectedItem, ...updates });
    }
  };

  const deleteMenuItem = (itemId: string, items: MenuItem[] = activeMenu?.items || []): MenuItem[] => {
    return items
      .filter(item => item.id !== itemId)
      .map(item => ({
        ...item,
        children: deleteMenuItem(itemId, item.children)
      }));
  };

  const handleDeleteMenuItem = (itemId: string) => {
    const updatedMenus = menus.map(m => {
      if (m.id === activeMenuId) {
        return { ...m, items: deleteMenuItem(itemId) };
      }
      return m;
    });
    setMenus(updatedMenus);

    if (selectedItem?.id === itemId) {
      setSelectedItem(null);
    }
  };

  const updateMenuSettings = (updates: Partial<MenuSettings>) => {
    const updatedMenus = menus.map(m => {
      if (m.id === activeMenuId) {
        return { ...m, settings: { ...m.settings, ...updates } };
      }
      return m;
    });
    setMenus(updatedMenus);
  };

  const assignMenuToLocation = (locationId: string, menuId: string | null) => {
    setLocations(locations.map(loc => {
      if (loc.id === locationId) {
        return { ...loc, assignedMenu: menuId };
      }
      return loc;
    }));
  };

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children.length > 0;
    const isSelected = selectedItem?.id === item.id;
    const IconComponent = AVAILABLE_ICONS.find(i => i.name === item.icon)?.icon;

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="select-none"
      >
        <div
          className={clsx(
            'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all',
            isSelected
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-gray-300',
            !item.visible && 'opacity-50'
          )}
          style={{ marginLeft: depth * 24 }}
          onClick={() => setSelectedItem(item)}
        >
          <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />

          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(item.id);
              }}
              className="p-0.5 hover:bg-gray-100 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}

          {!hasChildren && <div className="w-5" />}

          {IconComponent && (
            <IconComponent className="w-4 h-4 text-gray-500" />
          )}

          <span className="flex-1 font-medium text-gray-700 truncate">
            {item.label}
          </span>

          <span className="text-xs text-gray-400 truncate max-w-[120px]">
            {item.url}
          </span>

          {/* Menu Style Badge */}
          {item.menuStyle === 'megamenu' || item.hasMegaMenu ? (
            <span className={clsx(
              'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
              item.megaMenuConfig
                ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700'
                : 'bg-purple-100 text-purple-600 border border-dashed border-purple-300'
            )}>
              <LayoutGrid className="w-3 h-3" />
              {item.megaMenuConfig ? 'Mega' : 'Mega (configure)'}
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
              <Menu className="w-3 h-3" />
              Classic
            </span>
          )}

          {item.target === '_blank' && (
            <ExternalLink className="w-3 h-3 text-gray-400" />
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUpdateMenuItem(item.id, { visible: !item.visible });
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {item.visible ? (
              <Eye className="w-4 h-4 text-gray-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-gray-400" />
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteMenuItem(item.id);
            }}
            className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-1 space-y-1"
            >
              {item.children.map(child => renderMenuItem(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderPreview = () => {
    if (!activeMenu) return null;
    const { settings, items } = activeMenu;

    const visibleItems = items.filter(item => item.visible);

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-3 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Live Preview</span>
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
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-400 hover:bg-gray-100'
                )}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        <div className={clsx(
          'p-4 flex justify-center',
          previewDevice === 'mobile' && 'bg-gray-100'
        )}>
          <div
            className={clsx(
              'transition-all duration-300',
              previewDevice === 'desktop' && 'w-full',
              previewDevice === 'tablet' && 'w-[600px]',
              previewDevice === 'mobile' && 'w-[320px]'
            )}
          >
            {previewDevice === 'mobile' ? (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <span className="font-semibold text-gray-800">Menu</span>
                  <X className="w-5 h-5 text-gray-500" />
                </div>
                <div className="p-2">
                  {visibleItems.map(item => (
                    <div key={item.id} className="border-b border-gray-100 last:border-0">
                      <div
                        className="flex items-center justify-between p-3 hover:bg-gray-50"
                        style={{ color: settings.textColor }}
                      >
                        <div className="flex items-center gap-3">
                          {settings.showIcons && item.icon && (
                            <span className="text-gray-400">
                              {React.createElement(
                                AVAILABLE_ICONS.find(i => i.name === item.icon)?.icon || Menu,
                                { className: 'w-4 h-4' }
                              )}
                            </span>
                          )}
                          <span style={{ fontSize: settings.fontSize }}>{item.label}</span>
                        </div>
                        {item.children.length > 0 && (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <nav
                className="flex items-center gap-1 p-3 rounded-lg"
                style={{
                  backgroundColor: settings.backgroundColor,
                  justifyContent: settings.alignment === 'center'
                    ? 'center'
                    : settings.alignment === 'right'
                      ? 'flex-end'
                      : 'flex-start',
                  gap: settings.spacing
                }}
              >
                {visibleItems.map(item => {
                  const IconComponent = AVAILABLE_ICONS.find(i => i.name === item.icon)?.icon;

                  return (
                    <div key={item.id} className="relative group">
                      <a
                        href="#"
                        className="flex items-center gap-2 px-3 py-2 rounded-md transition-colors"
                        style={{
                          color: settings.textColor,
                          fontSize: settings.fontSize,
                          fontWeight: settings.fontWeight === 'normal' ? 400
                            : settings.fontWeight === 'medium' ? 500
                            : settings.fontWeight === 'semibold' ? 600 : 700,
                          borderRadius: settings.borderRadius
                        }}
                        onMouseEnter={(e) => {
                          if (settings.hoverStyle === 'underline') {
                            e.currentTarget.style.textDecoration = 'underline';
                          } else if (settings.hoverStyle === 'background') {
                            e.currentTarget.style.backgroundColor = settings.hoverColor + '20';
                          }
                          e.currentTarget.style.color = settings.hoverColor;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.textDecoration = 'none';
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = settings.textColor;
                        }}
                      >
                        {settings.showIcons && IconComponent && settings.iconPosition === 'left' && (
                          <IconComponent className="w-4 h-4" />
                        )}
                        <span>{item.label}</span>
                        {settings.showIcons && IconComponent && settings.iconPosition === 'right' && (
                          <IconComponent className="w-4 h-4" />
                        )}
                        {item.children.length > 0 && settings.submenuIndicator !== 'none' && (
                          settings.submenuIndicator === 'arrow'
                            ? <ChevronDown className="w-3 h-3" />
                            : <Plus className="w-3 h-3" />
                        )}
                      </a>

                      {item.children.length > 0 && (
                        <div
                          className="absolute top-full left-0 mt-1 py-2 min-w-[200px] rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10"
                          style={{
                            backgroundColor: settings.dropdownBg,
                            borderRadius: settings.borderRadius
                          }}
                        >
                          {item.children.filter(c => c.visible).map(child => (
                            <a
                              key={child.id}
                              href="#"
                              className="block px-4 py-2 hover:bg-gray-50 transition-colors"
                              style={{
                                color: settings.textColor,
                                fontSize: settings.fontSize - 1
                              }}
                            >
                              {child.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Menu className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Menu Manager</h2>
              <p className="text-sm text-gray-500">Create and organize navigation menus</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={createMenu}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Menu
            </button>
          </div>
        </div>

        {/* Menu Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {menus.map(menu => (
            <button
              key={menu.id}
              onClick={() => setActiveMenuId(menu.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors',
                activeMenuId === menu.id
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              )}
            >
              <Menu className="w-4 h-4" />
              <span className="font-medium">{menu.name}</span>
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                {menu.items.length} items
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex gap-1">
          {[
            { id: 'structure' as const, label: 'Menu Structure', icon: Menu },
            { id: 'settings' as const, label: 'Settings', icon: Settings },
            { id: 'locations' as const, label: 'Locations', icon: MapPin }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-3 border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
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
        {activeTab === 'structure' && activeMenu && (
          <div className="h-full flex">
            {/* Left: Menu Items */}
            <div className="w-1/2 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <span className="font-medium text-gray-700">Menu Items</span>
                <button
                  onClick={() => setShowAddPanel(!showAddPanel)}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors',
                    showAddPanel
                      ? 'bg-purple-100 text-purple-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  <Plus className="w-4 h-4" />
                  Add Items
                </button>
              </div>

              {/* Add Panel */}
              <AnimatePresence>
                {showAddPanel && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-b border-gray-200 overflow-hidden"
                  >
                    <div className="p-4 bg-gray-50">
                      {/* Menu Style Selector */}
                      <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                          Choose Menu Style
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setSelectedAddStyle('classic')}
                            className={clsx(
                              'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                              selectedAddStyle === 'classic'
                                ? 'border-purple-500 bg-purple-50 shadow-md'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            )}
                          >
                            {selectedAddStyle === 'classic' && (
                              <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                            <div className={clsx(
                              'p-3 rounded-lg',
                              selectedAddStyle === 'classic' ? 'bg-purple-100' : 'bg-gray-100'
                            )}>
                              <Menu className={clsx(
                                'w-6 h-6',
                                selectedAddStyle === 'classic' ? 'text-purple-600' : 'text-gray-500'
                              )} />
                            </div>
                            <div className="text-center">
                              <span className={clsx(
                                'font-semibold block',
                                selectedAddStyle === 'classic' ? 'text-purple-700' : 'text-gray-700'
                              )}>
                                Classic Menu
                              </span>
                              <span className="text-xs text-gray-500">Simple dropdown</span>
                            </div>
                          </button>

                          <button
                            onClick={() => setSelectedAddStyle('megamenu')}
                            className={clsx(
                              'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                              selectedAddStyle === 'megamenu'
                                ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            )}
                          >
                            {selectedAddStyle === 'megamenu' && (
                              <div className="absolute top-2 right-2 w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                            <div className={clsx(
                              'p-3 rounded-lg relative',
                              selectedAddStyle === 'megamenu' ? 'bg-gradient-to-r from-purple-100 to-pink-100' : 'bg-gray-100'
                            )}>
                              <LayoutGrid className={clsx(
                                'w-6 h-6',
                                selectedAddStyle === 'megamenu' ? 'text-purple-600' : 'text-gray-500'
                              )} />
                              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-pink-500" />
                            </div>
                            <div className="text-center">
                              <span className={clsx(
                                'font-semibold block',
                                selectedAddStyle === 'megamenu' ? 'text-purple-700' : 'text-gray-700'
                              )}>
                                Mega Menu
                              </span>
                              <span className="text-xs text-gray-500">Rich content grid</span>
                            </div>
                          </button>
                        </div>
                        {selectedAddStyle === 'megamenu' && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 text-xs text-purple-600 flex items-center gap-1"
                          >
                            <Wand2 className="w-3 h-3" />
                            Mega Menu builder will open after adding
                          </motion.p>
                        )}
                      </div>

                      <div className="h-px bg-gray-200 mb-4" />

                      <div className="flex gap-1 mb-4">
                        {[
                          { id: 'pages' as const, label: 'Pages' },
                          { id: 'categories' as const, label: 'Categories' },
                          { id: 'custom' as const, label: 'Custom Link' }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setAddPanelTab(tab.id)}
                            className={clsx(
                              'px-3 py-1.5 rounded-lg text-sm transition-colors',
                              addPanelTab === tab.id
                                ? 'bg-white text-gray-800 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            )}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {addPanelTab === 'custom' ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={customLinkLabel}
                            onChange={(e) => setCustomLinkLabel(e.target.value)}
                            placeholder="Link Label"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          />
                          <input
                            type="text"
                            value={customLinkUrl}
                            onChange={(e) => setCustomLinkUrl(e.target.value)}
                            placeholder="URL (e.g., /page or https://...)"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                          />
                          <button
                            onClick={addCustomLink}
                            disabled={!customLinkLabel || !customLinkUrl}
                            className={clsx(
                              'w-full px-3 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2',
                              selectedAddStyle === 'megamenu'
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                                : 'bg-purple-600 text-white hover:bg-purple-700'
                            )}
                          >
                            {selectedAddStyle === 'megamenu' && <LayoutGrid className="w-4 h-4" />}
                            {selectedAddStyle === 'megamenu' ? 'Add as Mega Menu' : 'Add to Menu'}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                          {(addPanelTab === 'pages' ? samplePages : sampleCategories).map(item => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100"
                            >
                              <div className="flex items-center gap-2">
                                {addPanelTab === 'pages' ? (
                                  <FileText className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <Folder className="w-4 h-4 text-gray-400" />
                                )}
                                <span className="text-sm text-gray-700">{item.title}</span>
                              </div>
                              <button
                                onClick={() => addMenuItem(
                                  addPanelTab === 'pages' ? 'page' : 'category',
                                  { title: item.title, url: item.url },
                                  selectedAddStyle
                                )}
                                className={clsx(
                                  'px-2 py-1 text-xs rounded flex items-center gap-1',
                                  selectedAddStyle === 'megamenu'
                                    ? 'text-purple-600 hover:bg-purple-50'
                                    : 'text-purple-600 hover:bg-purple-50'
                                )}
                              >
                                {selectedAddStyle === 'megamenu' && <LayoutGrid className="w-3 h-3" />}
                                Add{selectedAddStyle === 'megamenu' ? ' as Mega' : ''}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {activeMenu.items.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Menu className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">No menu items yet</p>
                    <p className="text-sm">Click "Add Items" to get started</p>
                  </div>
                ) : (
                  activeMenu.items.map(item => renderMenuItem(item))
                )}
              </div>
            </div>

            {/* Right: Item Settings & Preview */}
            <div className="w-1/2 flex flex-col">
              {selectedItem ? (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">Edit Menu Item</h3>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Label
                      </label>
                      <input
                        type="text"
                        value={selectedItem.label}
                        onChange={(e) => handleUpdateMenuItem(selectedItem.id, { label: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL
                      </label>
                      <input
                        type="text"
                        value={selectedItem.url}
                        onChange={(e) => handleUpdateMenuItem(selectedItem.id, { url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon
                      </label>
                      <div className="grid grid-cols-7 gap-2">
                        <button
                          onClick={() => handleUpdateMenuItem(selectedItem.id, { icon: undefined })}
                          className={clsx(
                            'p-2 rounded-lg border transition-colors',
                            !selectedItem.icon
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          )}
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                        {AVAILABLE_ICONS.map(({ name, icon: Icon }) => (
                          <button
                            key={name}
                            onClick={() => handleUpdateMenuItem(selectedItem.id, { icon: name })}
                            className={clsx(
                              'p-2 rounded-lg border transition-colors',
                              selectedItem.icon === name
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            )}
                          >
                            <Icon className="w-4 h-4 text-gray-600" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Link Target
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateMenuItem(selectedItem.id, { target: '_self' })}
                          className={clsx(
                            'flex-1 px-3 py-2 rounded-lg border transition-colors text-sm',
                            selectedItem.target === '_self'
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          )}
                        >
                          Same Window
                        </button>
                        <button
                          onClick={() => handleUpdateMenuItem(selectedItem.id, { target: '_blank' })}
                          className={clsx(
                            'flex-1 px-3 py-2 rounded-lg border transition-colors text-sm',
                            selectedItem.target === '_blank'
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          )}
                        >
                          <span className="flex items-center justify-center gap-1">
                            New Tab <ExternalLink className="w-3 h-3" />
                          </span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (optional)
                      </label>
                      <textarea
                        value={selectedItem.description || ''}
                        onChange={(e) => handleUpdateMenuItem(selectedItem.id, { description: e.target.value })}
                        placeholder="Shown in mega menus or tooltips"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg resize-none"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CSS Class (optional)
                      </label>
                      <input
                        type="text"
                        value={selectedItem.cssClass || ''}
                        onChange={(e) => handleUpdateMenuItem(selectedItem.id, { cssClass: e.target.value })}
                        placeholder="e.g., highlighted-item"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                      />
                    </div>

                    {/* Menu Style Section */}
                    <div className="pt-4 mt-4 border-t border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Menu Style
                      </label>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <button
                          onClick={() => {
                            handleUpdateMenuItem(selectedItem.id, {
                              menuStyle: 'classic',
                              hasMegaMenu: false
                            });
                          }}
                          className={clsx(
                            'flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all text-sm',
                            selectedItem.menuStyle !== 'megamenu' && !selectedItem.hasMegaMenu
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          )}
                        >
                          <Menu className="w-4 h-4" />
                          Classic
                        </button>
                        <button
                          onClick={() => {
                            handleUpdateMenuItem(selectedItem.id, { menuStyle: 'megamenu' });
                            if (!selectedItem.megaMenuConfig) {
                              openMegaMenuBuilder(selectedItem);
                            }
                          }}
                          className={clsx(
                            'flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 transition-all text-sm',
                            selectedItem.menuStyle === 'megamenu' || selectedItem.hasMegaMenu
                              ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          )}
                        >
                          <LayoutGrid className="w-4 h-4" />
                          Mega Menu
                        </button>
                      </div>

                      {(selectedItem.menuStyle === 'megamenu' || selectedItem.hasMegaMenu) && (
                        <>
                          {selectedItem.megaMenuConfig ? (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <LayoutGrid className="w-5 h-5 text-purple-600" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-purple-700">Mega Menu Configured</p>
                                  <p className="text-xs text-purple-500">
                                    {selectedItem.megaMenuConfig?.columns.length || 0} columns, {' '}
                                    {selectedItem.megaMenuConfig?.columns.reduce((sum, col) => sum + col.widgets.length, 0) || 0} widgets
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openMegaMenuBuilder(selectedItem)}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                  <Edit3 className="w-4 h-4" />
                                  Edit Mega Menu
                                </button>
                                <button
                                  onClick={() => removeMegaMenu(selectedItem.id)}
                                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => openMegaMenuBuilder(selectedItem)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-purple-300 text-purple-600 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors"
                            >
                              <Sparkles className="w-5 h-5" />
                              <span className="font-medium">Configure Mega Menu</span>
                            </button>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Add advanced dropdown content with columns, images, posts, products, and more.
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4">
                  {renderPreview()}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && activeMenu && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Menu Name */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">Menu Name</h3>
                <input
                  type="text"
                  value={activeMenu.name}
                  onChange={(e) => {
                    setMenus(menus.map(m =>
                      m.id === activeMenuId ? { ...m, name: e.target.value } : m
                    ));
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>

              {/* Typography */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">Typography</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Font Size</label>
                    <input
                      type="number"
                      value={activeMenu.settings.fontSize}
                      onChange={(e) => updateMenuSettings({ fontSize: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Font Weight</label>
                    <select
                      value={activeMenu.settings.fontWeight}
                      onChange={(e) => updateMenuSettings({ fontWeight: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    >
                      <option value="normal">Normal</option>
                      <option value="medium">Medium</option>
                      <option value="semibold">Semibold</option>
                      <option value="bold">Bold</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Layout */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">Layout</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Alignment</label>
                    <div className="flex gap-2">
                      {[
                        { value: 'left', icon: AlignLeft },
                        { value: 'center', icon: AlignCenter },
                        { value: 'right', icon: AlignRight }
                      ].map(({ value, icon: Icon }) => (
                        <button
                          key={value}
                          onClick={() => updateMenuSettings({ alignment: value as any })}
                          className={clsx(
                            'flex-1 p-3 rounded-lg border transition-colors',
                            activeMenu.settings.alignment === value
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          )}
                        >
                          <Icon className="w-5 h-5 mx-auto text-gray-600" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Item Spacing: {activeMenu.settings.spacing}px
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="48"
                      value={activeMenu.settings.spacing}
                      onChange={(e) => updateMenuSettings({ spacing: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Border Radius: {activeMenu.settings.borderRadius}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={activeMenu.settings.borderRadius}
                      onChange={(e) => updateMenuSettings({ borderRadius: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">Colors</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'textColor', label: 'Text Color' },
                    { key: 'hoverColor', label: 'Hover Color' },
                    { key: 'activeColor', label: 'Active Color' },
                    { key: 'backgroundColor', label: 'Background' },
                    { key: 'dropdownBg', label: 'Dropdown Background' }
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-sm text-gray-600 mb-1">{label}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={(activeMenu.settings as any)[key]}
                          onChange={(e) => updateMenuSettings({ [key]: e.target.value } as any)}
                          className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={(activeMenu.settings as any)[key]}
                          onChange={(e) => updateMenuSettings({ [key]: e.target.value } as any)}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Icons */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">Icons</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={activeMenu.settings.showIcons}
                      onChange={(e) => updateMenuSettings({ showIcons: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Show Icons</span>
                  </label>

                  {activeMenu.settings.showIcons && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Icon Position</label>
                      <div className="flex gap-2">
                        {['left', 'right'].map(pos => (
                          <button
                            key={pos}
                            onClick={() => updateMenuSettings({ iconPosition: pos as any })}
                            className={clsx(
                              'flex-1 px-4 py-2 rounded-lg border capitalize transition-colors',
                              activeMenu.settings.iconPosition === pos
                                ? 'border-purple-500 bg-purple-50 text-purple-700'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            )}
                          >
                            {pos}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submenu */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">Submenu</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Animation</label>
                    <div className="flex gap-2">
                      {['fade', 'slide', 'scale'].map(anim => (
                        <button
                          key={anim}
                          onClick={() => updateMenuSettings({ submenuAnimation: anim as any })}
                          className={clsx(
                            'flex-1 px-4 py-2 rounded-lg border capitalize transition-colors',
                            activeMenu.settings.submenuAnimation === anim
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          )}
                        >
                          {anim}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Indicator</label>
                    <div className="flex gap-2">
                      {[
                        { value: 'arrow', label: 'Arrow' },
                        { value: 'plus', label: 'Plus' },
                        { value: 'none', label: 'None' }
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => updateMenuSettings({ submenuIndicator: value as any })}
                          className={clsx(
                            'flex-1 px-4 py-2 rounded-lg border transition-colors',
                            activeMenu.settings.submenuIndicator === value
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Max Depth: {activeMenu.settings.depth} levels
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={activeMenu.settings.depth}
                      onChange={(e) => updateMenuSettings({ depth: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Hover & Active Styles */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">Hover & Active Styles</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Hover Style</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['underline', 'background', 'color', 'none'].map(style => (
                        <button
                          key={style}
                          onClick={() => updateMenuSettings({ hoverStyle: style as any })}
                          className={clsx(
                            'px-3 py-2 rounded-lg border capitalize text-sm transition-colors',
                            activeMenu.settings.hoverStyle === style
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          )}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Active Style</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['underline', 'background', 'bold'].map(style => (
                        <button
                          key={style}
                          onClick={() => updateMenuSettings({ activeStyle: style as any })}
                          className={clsx(
                            'px-3 py-2 rounded-lg border capitalize text-sm transition-colors',
                            activeMenu.settings.activeStyle === style
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          )}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Settings */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">Mobile Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Mobile Breakpoint: {activeMenu.settings.mobileBreakpoint}px
                    </label>
                    <input
                      type="range"
                      min="480"
                      max="1024"
                      step="8"
                      value={activeMenu.settings.mobileBreakpoint}
                      onChange={(e) => updateMenuSettings({ mobileBreakpoint: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Mobile Menu Style</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['slide', 'overlay', 'accordion'].map(style => (
                        <button
                          key={style}
                          onClick={() => updateMenuSettings({ mobileStyle: style as any })}
                          className={clsx(
                            'px-3 py-2 rounded-lg border capitalize text-sm transition-colors',
                            activeMenu.settings.mobileStyle === style
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          )}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {renderPreview()}
            </div>
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                <h3 className="font-medium text-gray-800 mb-2">Menu Locations</h3>
                <p className="text-sm text-gray-500">
                  Assign menus to different locations in your theme. Each location can have one menu assigned.
                </p>
              </div>

              {locations.map(location => (
                <div
                  key={location.id}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">{location.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{location.description}</p>
                    </div>
                    <select
                      value={location.assignedMenu || ''}
                      onChange={(e) => assignMenuToLocation(location.id, e.target.value || null)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm min-w-[200px]"
                    >
                      <option value="">-- Select Menu --</option>
                      {menus.map(menu => (
                        <option key={menu.id} value={menu.id}>
                          {menu.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {location.assignedMenu && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>
                          Using "{menus.find(m => m.id === location.assignedMenu)?.name}"
                        </span>
                        <span className="text-gray-400">
                          ({menus.find(m => m.id === location.assignedMenu)?.items.length} items)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-6 text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Need more locations? Edit your theme's code to register additional menu locations.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mega Menu Builder Modal */}
      {megaMenuBuilderOpen && megaMenuTargetItem && (
        <MegaMenuBuilder
          menuItemId={megaMenuTargetItem.id}
          config={megaMenuTargetItem.megaMenuConfig || null}
          onChange={saveMegaMenuConfig}
          onClose={closeMegaMenuBuilder}
        />
      )}
    </div>
  );
};

export default MenuManager;
