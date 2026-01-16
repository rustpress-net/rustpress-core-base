import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Save,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Image,
  Type,
  Menu,
  FileText,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Copyright,
  Link,
  Heart,
  CreditCard,
  Shield,
  Columns,
  Settings
} from 'lucide-react';
import clsx from 'clsx';

interface FooterWidget {
  id: string;
  type: 'logo' | 'text' | 'menu' | 'social' | 'newsletter' | 'contact' | 'links' | 'custom';
  title: string;
  content: Record<string, any>;
  visible: boolean;
}

interface FooterColumn {
  id: string;
  width: number; // 1-12 grid
  widgets: FooterWidget[];
}

interface FooterRow {
  id: string;
  name: string;
  columns: FooterColumn[];
  backgroundColor: string;
  textColor: string;
  padding: number;
  visible: boolean;
}

interface FooterConfig {
  id: string;
  name: string;
  rows: FooterRow[];
  copyrightText: string;
  showPaymentIcons: boolean;
  showBackToTop: boolean;
  customCSS: string;
}

interface FooterManagerProps {
  config?: FooterConfig;
  onSave?: (config: FooterConfig) => void;
  className?: string;
}

const defaultConfig: FooterConfig = {
  id: 'footer-1',
  name: 'Main Footer',
  rows: [
    {
      id: 'main-footer',
      name: 'Main Footer',
      backgroundColor: '#1f2937',
      textColor: '#ffffff',
      padding: 60,
      visible: true,
      columns: [
        {
          id: 'col-1',
          width: 4,
          widgets: [
            {
              id: 'w1',
              type: 'logo',
              title: '',
              content: { src: '/logo-white.png', description: 'We are a modern web development company focused on creating beautiful, functional websites.' },
              visible: true
            },
            {
              id: 'w2',
              type: 'social',
              title: 'Follow Us',
              content: { platforms: ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'] },
              visible: true
            }
          ]
        },
        {
          id: 'col-2',
          width: 2,
          widgets: [
            {
              id: 'w3',
              type: 'links',
              title: 'Quick Links',
              content: { links: [{ label: 'Home', url: '/' }, { label: 'About', url: '/about' }, { label: 'Services', url: '/services' }, { label: 'Blog', url: '/blog' }, { label: 'Contact', url: '/contact' }] },
              visible: true
            }
          ]
        },
        {
          id: 'col-3',
          width: 2,
          widgets: [
            {
              id: 'w4',
              type: 'links',
              title: 'Services',
              content: { links: [{ label: 'Web Design', url: '/services/web-design' }, { label: 'Development', url: '/services/development' }, { label: 'SEO', url: '/services/seo' }, { label: 'Marketing', url: '/services/marketing' }] },
              visible: true
            }
          ]
        },
        {
          id: 'col-4',
          width: 4,
          widgets: [
            {
              id: 'w5',
              type: 'contact',
              title: 'Contact Info',
              content: { address: '123 Business Street, City, Country', phone: '+1 234 567 890', email: 'info@example.com', hours: 'Mon-Fri: 9AM-6PM' },
              visible: true
            },
            {
              id: 'w6',
              type: 'newsletter',
              title: 'Newsletter',
              content: { placeholder: 'Enter your email', buttonText: 'Subscribe', description: 'Stay updated with our latest news and offers.' },
              visible: true
            }
          ]
        }
      ]
    },
    {
      id: 'bottom-bar',
      name: 'Bottom Bar',
      backgroundColor: '#111827',
      textColor: '#9ca3af',
      padding: 20,
      visible: true,
      columns: [
        {
          id: 'col-5',
          width: 6,
          widgets: [
            {
              id: 'w7',
              type: 'text',
              title: '',
              content: { text: '© 2024 RustPress. All rights reserved.' },
              visible: true
            }
          ]
        },
        {
          id: 'col-6',
          width: 6,
          widgets: [
            {
              id: 'w8',
              type: 'links',
              title: '',
              content: { links: [{ label: 'Privacy Policy', url: '/privacy' }, { label: 'Terms of Service', url: '/terms' }, { label: 'Cookie Policy', url: '/cookies' }], inline: true },
              visible: true
            }
          ]
        }
      ]
    }
  ],
  copyrightText: '© 2024 RustPress. All rights reserved.',
  showPaymentIcons: true,
  showBackToTop: true,
  customCSS: ''
};

const widgetTypes = [
  { type: 'logo', icon: Image, label: 'Logo & Description' },
  { type: 'text', icon: Type, label: 'Text' },
  { type: 'menu', icon: Menu, label: 'Menu' },
  { type: 'links', icon: Link, label: 'Links List' },
  { type: 'contact', icon: MapPin, label: 'Contact Info' },
  { type: 'social', icon: Facebook, label: 'Social Icons' },
  { type: 'newsletter', icon: Mail, label: 'Newsletter' },
  { type: 'custom', icon: FileText, label: 'Custom HTML' }
];

export const FooterManager: React.FC<FooterManagerProps> = ({
  config = defaultConfig,
  onSave,
  className
}) => {
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(config);
  const [activeRow, setActiveRow] = useState<string | null>('main-footer');
  const [editingWidget, setEditingWidget] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  const updateRow = (rowId: string, updates: Partial<FooterRow>) => {
    setFooterConfig(prev => ({
      ...prev,
      rows: prev.rows.map(row => row.id === rowId ? { ...row, ...updates } : row)
    }));
  };

  const updateWidget = (rowId: string, colId: string, widgetId: string, updates: Partial<FooterWidget>) => {
    setFooterConfig(prev => ({
      ...prev,
      rows: prev.rows.map(row => row.id === rowId ? {
        ...row,
        columns: row.columns.map(col => col.id === colId ? {
          ...col,
          widgets: col.widgets.map(w => w.id === widgetId ? { ...w, ...updates } : w)
        } : col)
      } : row)
    }));
  };

  const addRow = () => {
    const newRow: FooterRow = {
      id: `row-${Date.now()}`,
      name: 'New Row',
      backgroundColor: '#1f2937',
      textColor: '#ffffff',
      padding: 40,
      visible: true,
      columns: [
        { id: `col-${Date.now()}`, width: 12, widgets: [] }
      ]
    };
    setFooterConfig(prev => ({
      ...prev,
      rows: [...prev.rows, newRow]
    }));
  };

  const addColumn = (rowId: string) => {
    setFooterConfig(prev => ({
      ...prev,
      rows: prev.rows.map(row => row.id === rowId ? {
        ...row,
        columns: [...row.columns, { id: `col-${Date.now()}`, width: 3, widgets: [] }]
      } : row)
    }));
  };

  const addWidget = (rowId: string, colId: string, type: FooterWidget['type']) => {
    const newWidget: FooterWidget = {
      id: `widget-${Date.now()}`,
      type,
      title: widgetTypes.find(w => w.type === type)?.label || 'Widget',
      content: {},
      visible: true
    };
    setFooterConfig(prev => ({
      ...prev,
      rows: prev.rows.map(row => row.id === rowId ? {
        ...row,
        columns: row.columns.map(col => col.id === colId ? {
          ...col,
          widgets: [...col.widgets, newWidget]
        } : col)
      } : row)
    }));
  };

  const deleteWidget = (rowId: string, colId: string, widgetId: string) => {
    setFooterConfig(prev => ({
      ...prev,
      rows: prev.rows.map(row => row.id === rowId ? {
        ...row,
        columns: row.columns.map(col => col.id === colId ? {
          ...col,
          widgets: col.widgets.filter(w => w.id !== widgetId)
        } : col)
      } : row)
    }));
  };

  const getWidgetIcon = (type: FooterWidget['type']) => {
    const found = widgetTypes.find(w => w.type === type);
    return found?.icon || Type;
  };

  const renderWidgetPreview = (widget: FooterWidget) => {
    switch (widget.type) {
      case 'logo':
        return (
          <div>
            <div className="w-24 h-8 bg-gray-500 rounded mb-3" />
            <p className="text-sm opacity-70">{widget.content.description}</p>
          </div>
        );
      case 'text':
        return <p className="text-sm">{widget.content.text}</p>;
      case 'links':
        return (
          <ul className={clsx(widget.content.inline ? 'flex gap-4' : 'space-y-2')}>
            {(widget.content.links || []).map((link: any, i: number) => (
              <li key={i} className="text-sm hover:opacity-70 cursor-pointer">{link.label}</li>
            ))}
          </ul>
        );
      case 'contact':
        return (
          <div className="space-y-2 text-sm">
            {widget.content.address && <p className="flex items-center gap-2"><MapPin size={14} /> {widget.content.address}</p>}
            {widget.content.phone && <p className="flex items-center gap-2"><Phone size={14} /> {widget.content.phone}</p>}
            {widget.content.email && <p className="flex items-center gap-2"><Mail size={14} /> {widget.content.email}</p>}
          </div>
        );
      case 'social':
        return (
          <div className="flex gap-3">
            {(widget.content.platforms || []).map((p: string) => {
              const icons: Record<string, React.ElementType> = { facebook: Facebook, twitter: Twitter, instagram: Instagram, linkedin: Linkedin, youtube: Youtube };
              const Icon = icons[p] || Link;
              return <Icon key={p} size={20} className="hover:opacity-70 cursor-pointer" />;
            })}
          </div>
        );
      case 'newsletter':
        return (
          <div>
            <p className="text-sm mb-2">{widget.content.description}</p>
            <div className="flex">
              <input type="email" placeholder={widget.content.placeholder} className="flex-1 px-3 py-2 text-sm bg-white/10 rounded-l" />
              <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-r">{widget.content.buttonText}</button>
            </div>
          </div>
        );
      default:
        return <p className="text-sm text-gray-400">Widget content</p>;
    }
  };

  const renderPreview = () => (
    <div className="rounded-lg overflow-hidden shadow-lg">
      {footerConfig.rows.filter(row => row.visible).map(row => (
        <div
          key={row.id}
          style={{ backgroundColor: row.backgroundColor, color: row.textColor, padding: row.padding }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-12 gap-8">
              {row.columns.map(col => (
                <div key={col.id} className={`col-span-${col.width}`} style={{ gridColumn: `span ${col.width}` }}>
                  {col.widgets.filter(w => w.visible).map(widget => (
                    <div key={widget.id} className="mb-6">
                      {widget.title && <h4 className="font-semibold mb-3">{widget.title}</h4>}
                      {renderWidgetPreview(widget)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      {footerConfig.showPaymentIcons && (
        <div className="bg-gray-900 py-4 flex justify-center gap-4">
          {['Visa', 'MC', 'Amex', 'PayPal'].map(p => (
            <div key={p} className="w-12 h-8 bg-white/20 rounded flex items-center justify-center text-xs text-white">{p}</div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className={clsx('bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg">
            <Layout size={20} className="text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Footer Manager</h2>
            <p className="text-sm text-gray-500">Design your site footer</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={clsx('p-2 rounded-lg', showPreview ? 'bg-gray-200 text-gray-700' : 'hover:bg-gray-100')}
          >
            {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button
            onClick={() => onSave?.(footerConfig)}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <Save size={16} />
            Save Footer
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Editor */}
        <div className="flex-1 p-4 border-r max-h-[600px] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Footer Rows</h3>
            <button
              onClick={addRow}
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-1"
            >
              <Plus size={14} />
              Add Row
            </button>
          </div>

          <div className="space-y-4">
            {footerConfig.rows.map(row => (
              <div key={row.id} className="border rounded-lg overflow-hidden">
                <div
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 cursor-pointer"
                  onClick={() => setActiveRow(activeRow === row.id ? null : row.id)}
                >
                  <GripVertical size={16} className="text-gray-400" />
                  <span className="font-medium">{row.name}</span>
                  <div className="flex-1" />
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: row.backgroundColor }} />
                  <button onClick={(e) => { e.stopPropagation(); updateRow(row.id, { visible: !row.visible }); }}>
                    {row.visible ? <Eye size={16} /> : <EyeOff size={16} className="text-gray-400" />}
                  </button>
                  {activeRow === row.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

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
                            <label className="text-xs text-gray-500 block mb-1">Background</label>
                            <input type="color" value={row.backgroundColor} onChange={(e) => updateRow(row.id, { backgroundColor: e.target.value })} className="w-full h-8 rounded cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Text Color</label>
                            <input type="color" value={row.textColor} onChange={(e) => updateRow(row.id, { textColor: e.target.value })} className="w-full h-8 rounded cursor-pointer" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Padding</label>
                            <input type="number" value={row.padding} onChange={(e) => updateRow(row.id, { padding: parseInt(e.target.value) })} className="w-full px-2 py-1 text-sm border rounded" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Columns</label>
                            <button onClick={() => addColumn(row.id)} className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-1">
                              <Columns size={14} /> Add Column
                            </button>
                          </div>
                        </div>

                        {/* Columns */}
                        <div className="space-y-3">
                          {row.columns.map((col, colIdx) => (
                            <div key={col.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-3 mb-3">
                                <span className="text-sm font-medium">Column {colIdx + 1}</span>
                                <input
                                  type="number"
                                  value={col.width}
                                  onChange={(e) => {
                                    const newCols = row.columns.map(c => c.id === col.id ? { ...c, width: parseInt(e.target.value) } : c);
                                    updateRow(row.id, { columns: newCols });
                                  }}
                                  className="w-16 px-2 py-1 text-xs border rounded"
                                  min={1}
                                  max={12}
                                />
                                <span className="text-xs text-gray-500">/12</span>
                                <div className="flex-1" />
                                <div className="flex gap-1">
                                  {widgetTypes.slice(0, 4).map(({ type, icon: Icon }) => (
                                    <button
                                      key={type}
                                      onClick={() => addWidget(row.id, col.id, type as FooterWidget['type'])}
                                      className="p-1 hover:bg-gray-200 rounded"
                                      title={`Add ${type}`}
                                    >
                                      <Icon size={14} />
                                    </button>
                                  ))}
                                  <button className="p-1 hover:bg-gray-200 rounded group relative">
                                    <Plus size={14} />
                                    <div className="absolute top-full right-0 mt-1 bg-white shadow-lg rounded-lg p-2 hidden group-hover:block z-10">
                                      {widgetTypes.map(({ type, icon: Icon, label }) => (
                                        <button
                                          key={type}
                                          onClick={() => addWidget(row.id, col.id, type as FooterWidget['type'])}
                                          className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100 rounded w-full"
                                        >
                                          <Icon size={14} /> {label}
                                        </button>
                                      ))}
                                    </div>
                                  </button>
                                </div>
                              </div>

                              {/* Widgets */}
                              <div className="space-y-2">
                                {col.widgets.map(widget => {
                                  const Icon = getWidgetIcon(widget.type);
                                  return (
                                    <div key={widget.id} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded border">
                                      <GripVertical size={14} className="text-gray-400 cursor-grab" />
                                      <Icon size={14} />
                                      <input
                                        type="text"
                                        value={widget.title}
                                        onChange={(e) => updateWidget(row.id, col.id, widget.id, { title: e.target.value })}
                                        className="flex-1 text-sm bg-transparent focus:outline-none"
                                        placeholder="Widget title"
                                      />
                                      <button onClick={() => updateWidget(row.id, col.id, widget.id, { visible: !widget.visible })}>
                                        {widget.visible ? <Eye size={14} /> : <EyeOff size={14} className="text-gray-400" />}
                                      </button>
                                      <button onClick={() => setEditingWidget(widget.id)} className="p-1 hover:bg-gray-100 rounded">
                                        <Settings size={14} />
                                      </button>
                                      <button onClick={() => deleteWidget(row.id, col.id, widget.id)} className="p-1 hover:bg-red-100 text-red-600 rounded">
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Global Settings */}
          <div className="mt-6 p-4 border rounded-lg">
            <h4 className="font-medium mb-3">Global Settings</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={footerConfig.showPaymentIcons}
                  onChange={(e) => setFooterConfig(prev => ({ ...prev, showPaymentIcons: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Show payment icons</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={footerConfig.showBackToTop}
                  onChange={(e) => setFooterConfig(prev => ({ ...prev, showBackToTop: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Show back to top button</span>
              </label>
            </div>
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="w-1/2 p-4 bg-gray-100 dark:bg-gray-800">
            <h3 className="font-medium mb-4">Preview</h3>
            {renderPreview()}
          </div>
        )}
      </div>
    </div>
  );
};

export default FooterManager;
