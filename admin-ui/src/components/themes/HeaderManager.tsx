import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout,
  Plus,
  Trash2,
  Move,
  Eye,
  EyeOff,
  Settings,
  Copy,
  Save,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Image,
  Type,
  Menu,
  Search,
  ShoppingCart,
  User,
  Bell,
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Palette,
  Maximize2,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';
import clsx from 'clsx';

interface HeaderElement {
  id: string;
  type: 'logo' | 'menu' | 'search' | 'cart' | 'user' | 'button' | 'social' | 'contact' | 'custom';
  position: 'left' | 'center' | 'right';
  settings: Record<string, any>;
  visible: boolean;
  order: number;
}

interface HeaderRow {
  id: string;
  name: string;
  elements: HeaderElement[];
  visible: boolean;
  sticky: boolean;
  backgroundColor: string;
  textColor: string;
  height: number;
}

interface HeaderConfig {
  id: string;
  name: string;
  rows: HeaderRow[];
  isDefault: boolean;
  responsive: {
    mobileBreakpoint: number;
    showMobileMenu: boolean;
    mobileMenuStyle: 'slide' | 'dropdown' | 'fullscreen';
  };
}

interface HeaderManagerProps {
  config?: HeaderConfig;
  onSave?: (config: HeaderConfig) => void;
  className?: string;
}

const defaultConfig: HeaderConfig = {
  id: 'header-1',
  name: 'Main Header',
  rows: [
    {
      id: 'topbar',
      name: 'Top Bar',
      visible: true,
      sticky: false,
      backgroundColor: '#1f2937',
      textColor: '#ffffff',
      height: 40,
      elements: [
        { id: 'e1', type: 'contact', position: 'left', settings: { showPhone: true, showEmail: true, phone: '+1 234 567 890', email: 'info@example.com' }, visible: true, order: 1 },
        { id: 'e2', type: 'social', position: 'right', settings: { platforms: ['facebook', 'twitter', 'instagram', 'linkedin'] }, visible: true, order: 1 }
      ]
    },
    {
      id: 'main-header',
      name: 'Main Header',
      visible: true,
      sticky: true,
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      height: 80,
      elements: [
        { id: 'e3', type: 'logo', position: 'left', settings: { type: 'image', src: '/logo.png', alt: 'Logo', width: 150 }, visible: true, order: 1 },
        { id: 'e4', type: 'menu', position: 'center', settings: { menuId: 'primary', style: 'horizontal' }, visible: true, order: 1 },
        { id: 'e5', type: 'search', position: 'right', settings: { style: 'icon', placeholder: 'Search...' }, visible: true, order: 1 },
        { id: 'e6', type: 'cart', position: 'right', settings: { showCount: true, showTotal: false }, visible: true, order: 2 },
        { id: 'e7', type: 'user', position: 'right', settings: { showName: false, showAvatar: true }, visible: true, order: 3 }
      ]
    }
  ],
  isDefault: true,
  responsive: {
    mobileBreakpoint: 768,
    showMobileMenu: true,
    mobileMenuStyle: 'slide'
  }
};

const elementTypes = [
  { type: 'logo', icon: Image, label: 'Logo' },
  { type: 'menu', icon: Menu, label: 'Menu' },
  { type: 'search', icon: Search, label: 'Search' },
  { type: 'cart', icon: ShoppingCart, label: 'Cart' },
  { type: 'user', icon: User, label: 'User' },
  { type: 'button', icon: Type, label: 'Button' },
  { type: 'social', icon: Facebook, label: 'Social Icons' },
  { type: 'contact', icon: Phone, label: 'Contact Info' }
];

export const HeaderManager: React.FC<HeaderManagerProps> = ({
  config = defaultConfig,
  onSave,
  className
}) => {
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(config);
  const [activeRow, setActiveRow] = useState<string | null>(null);
  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const updateRow = (rowId: string, updates: Partial<HeaderRow>) => {
    setHeaderConfig(prev => ({
      ...prev,
      rows: prev.rows.map(row => row.id === rowId ? { ...row, ...updates } : row)
    }));
  };

  const updateElement = (rowId: string, elementId: string, updates: Partial<HeaderElement>) => {
    setHeaderConfig(prev => ({
      ...prev,
      rows: prev.rows.map(row => row.id === rowId ? {
        ...row,
        elements: row.elements.map(el => el.id === elementId ? { ...el, ...updates } : el)
      } : row)
    }));
  };

  const addRow = () => {
    const newRow: HeaderRow = {
      id: `row-${Date.now()}`,
      name: 'New Row',
      elements: [],
      visible: true,
      sticky: false,
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      height: 60
    };
    setHeaderConfig(prev => ({
      ...prev,
      rows: [...prev.rows, newRow]
    }));
  };

  const deleteRow = (rowId: string) => {
    setHeaderConfig(prev => ({
      ...prev,
      rows: prev.rows.filter(row => row.id !== rowId)
    }));
  };

  const addElement = (rowId: string, type: HeaderElement['type']) => {
    const newElement: HeaderElement = {
      id: `el-${Date.now()}`,
      type,
      position: 'left',
      settings: {},
      visible: true,
      order: 1
    };
    setHeaderConfig(prev => ({
      ...prev,
      rows: prev.rows.map(row => row.id === rowId ? {
        ...row,
        elements: [...row.elements, newElement]
      } : row)
    }));
  };

  const deleteElement = (rowId: string, elementId: string) => {
    setHeaderConfig(prev => ({
      ...prev,
      rows: prev.rows.map(row => row.id === rowId ? {
        ...row,
        elements: row.elements.filter(el => el.id !== elementId)
      } : row)
    }));
  };

  const getElementIcon = (type: HeaderElement['type']) => {
    const found = elementTypes.find(e => e.type === type);
    return found?.icon || Type;
  };

  const renderPreview = () => {
    const deviceWidth = previewDevice === 'desktop' ? '100%' : previewDevice === 'tablet' ? '768px' : '375px';

    return (
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <div
          className="mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden transition-all"
          style={{ maxWidth: deviceWidth }}
        >
          {headerConfig.rows.filter(row => row.visible).map(row => (
            <div
              key={row.id}
              className={clsx(
                'flex items-center px-4',
                row.sticky && 'sticky top-0'
              )}
              style={{
                backgroundColor: row.backgroundColor,
                color: row.textColor,
                height: row.height
              }}
            >
              {/* Left Elements */}
              <div className="flex items-center gap-4">
                {row.elements.filter(e => e.position === 'left' && e.visible).map(el => {
                  const Icon = getElementIcon(el.type);
                  return (
                    <div key={el.id} className="flex items-center gap-2">
                      {el.type === 'logo' ? (
                        <div className="w-32 h-8 bg-gray-300 rounded flex items-center justify-center text-xs">LOGO</div>
                      ) : el.type === 'contact' ? (
                        <div className="flex items-center gap-4 text-sm">
                          {el.settings.showPhone && <span className="flex items-center gap-1"><Phone size={14} /> {el.settings.phone}</span>}
                          {el.settings.showEmail && <span className="flex items-center gap-1"><Mail size={14} /> {el.settings.email}</span>}
                        </div>
                      ) : (
                        <Icon size={20} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Center Elements */}
              <div className="flex-1 flex items-center justify-center gap-4">
                {row.elements.filter(e => e.position === 'center' && e.visible).map(el => {
                  if (el.type === 'menu') {
                    return (
                      <div key={el.id} className="flex items-center gap-6">
                        {['Home', 'About', 'Services', 'Blog', 'Contact'].map(item => (
                          <span key={item} className="text-sm font-medium hover:opacity-70 cursor-pointer">{item}</span>
                        ))}
                      </div>
                    );
                  }
                  const Icon = getElementIcon(el.type);
                  return <Icon key={el.id} size={20} />;
                })}
              </div>

              {/* Right Elements */}
              <div className="flex items-center gap-4">
                {row.elements.filter(e => e.position === 'right' && e.visible).map(el => {
                  const Icon = getElementIcon(el.type);
                  if (el.type === 'social') {
                    return (
                      <div key={el.id} className="flex items-center gap-2">
                        <Facebook size={16} />
                        <Twitter size={16} />
                        <Instagram size={16} />
                        <Linkedin size={16} />
                      </div>
                    );
                  }
                  if (el.type === 'cart') {
                    return (
                      <div key={el.id} className="relative">
                        <ShoppingCart size={20} />
                        {el.settings.showCount && (
                          <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
                        )}
                      </div>
                    );
                  }
                  return <Icon key={el.id} size={20} />;
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={clsx('bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Layout size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Header Manager</h2>
            <p className="text-sm text-gray-500">Customize your site header</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={clsx('p-2 rounded-lg', showPreview ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100')}
          >
            {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button
            onClick={() => onSave?.(headerConfig)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save size={16} />
            Save Header
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Rows Editor */}
        <div className="flex-1 p-4 border-r">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Header Rows</h3>
            <button
              onClick={addRow}
              className="px-3 py-1.5 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 flex items-center gap-1"
            >
              <Plus size={14} />
              Add Row
            </button>
          </div>

          <div className="space-y-4">
            {headerConfig.rows.map((row, rowIdx) => (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg overflow-hidden"
              >
                {/* Row Header */}
                <div
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 cursor-pointer"
                  onClick={() => setActiveRow(activeRow === row.id ? null : row.id)}
                >
                  <GripVertical size={16} className="text-gray-400 cursor-grab" />
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => updateRow(row.id, { name: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-transparent font-medium focus:outline-none"
                  />
                  <div className="flex-1" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateRow(row.id, { visible: !row.visible });
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {row.visible ? <Eye size={16} /> : <EyeOff size={16} className="text-gray-400" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRow(row.id);
                    }}
                    className="p-1 hover:bg-red-100 text-red-600 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                  {activeRow === row.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

                {/* Row Content */}
                <AnimatePresence>
                  {activeRow === row.id && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 space-y-4">
                        {/* Row Settings */}
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Height</label>
                            <input
                              type="number"
                              value={row.height}
                              onChange={(e) => updateRow(row.id, { height: parseInt(e.target.value) })}
                              className="w-full px-2 py-1 text-sm border rounded"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Background</label>
                            <input
                              type="color"
                              value={row.backgroundColor}
                              onChange={(e) => updateRow(row.id, { backgroundColor: e.target.value })}
                              className="w-full h-8 rounded cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Text Color</label>
                            <input
                              type="color"
                              value={row.textColor}
                              onChange={(e) => updateRow(row.id, { textColor: e.target.value })}
                              className="w-full h-8 rounded cursor-pointer"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Sticky</label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={row.sticky}
                                onChange={(e) => updateRow(row.id, { sticky: e.target.checked })}
                                className="rounded"
                              />
                              <span className="text-sm">Enable</span>
                            </label>
                          </div>
                        </div>

                        {/* Elements */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium">Elements</label>
                            <div className="flex gap-1">
                              {elementTypes.map(({ type, icon: Icon, label }) => (
                                <button
                                  key={type}
                                  onClick={() => addElement(row.id, type as HeaderElement['type'])}
                                  className="p-1.5 hover:bg-gray-100 rounded"
                                  title={`Add ${label}`}
                                >
                                  <Icon size={16} />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Elements by Position */}
                          {(['left', 'center', 'right'] as const).map(position => (
                            <div key={position} className="mb-3">
                              <div className="text-xs text-gray-400 uppercase mb-1">{position}</div>
                              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                {row.elements.filter(el => el.position === position).map(el => {
                                  const Icon = getElementIcon(el.type);
                                  return (
                                    <div
                                      key={el.id}
                                      className={clsx(
                                        'flex items-center gap-2 px-2 py-1 rounded border cursor-pointer',
                                        el.visible ? 'bg-white dark:bg-gray-700' : 'bg-gray-200 opacity-50'
                                      )}
                                    >
                                      <Icon size={14} />
                                      <span className="text-xs capitalize">{el.type}</span>
                                      <select
                                        value={el.position}
                                        onChange={(e) => updateElement(row.id, el.id, { position: e.target.value as any })}
                                        className="text-xs bg-transparent border-none"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <option value="left">Left</option>
                                        <option value="center">Center</option>
                                        <option value="right">Right</option>
                                      </select>
                                      <button
                                        onClick={() => updateElement(row.id, el.id, { visible: !el.visible })}
                                        className="p-0.5 hover:bg-gray-200 rounded"
                                      >
                                        {el.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                                      </button>
                                      <button
                                        onClick={() => deleteElement(row.id, el.id)}
                                        className="p-0.5 hover:bg-red-100 text-red-600 rounded"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  );
                                })}
                                {row.elements.filter(el => el.position === position).length === 0 && (
                                  <span className="text-xs text-gray-400">Drop elements here</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="w-1/2 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Preview</h3>
              <div className="flex border rounded-lg overflow-hidden">
                {(['desktop', 'tablet', 'mobile'] as const).map(device => (
                  <button
                    key={device}
                    onClick={() => setPreviewDevice(device)}
                    className={clsx(
                      'px-3 py-1 text-xs capitalize',
                      previewDevice === device ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                    )}
                  >
                    {device}
                  </button>
                ))}
              </div>
            </div>
            {renderPreview()}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderManager;
