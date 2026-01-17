/**
 * MenuBuilder - Visual navigation menu builder
 * RustPress-specific menu management functionality
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Menu, Plus, Edit, Trash2, ChevronRight, ChevronDown,
  GripVertical, ExternalLink, Link, Home, FileText, Tag,
  Folder, Search, Copy, Eye, Save, Settings, LayoutList
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  url: string;
  type: 'custom' | 'page' | 'post' | 'category' | 'tag';
  target?: '_self' | '_blank';
  icon?: string;
  children?: MenuItem[];
  cssClass?: string;
}

export interface MenuLocation {
  id: string;
  name: string;
  description: string;
  assignedMenu?: string;
}

export interface MenuConfig {
  id: string;
  name: string;
  items: MenuItem[];
  location?: string;
}

interface MenuBuilderProps {
  onSave?: (menu: MenuConfig) => void;
}

// Mock data
const mockMenus: MenuConfig[] = [
  {
    id: 'main',
    name: 'Main Navigation',
    location: 'header',
    items: [
      { id: '1', label: 'Home', url: '/', type: 'custom', icon: 'home' },
      { id: '2', label: 'Blog', url: '/blog', type: 'custom', children: [
        { id: '2a', label: 'All Posts', url: '/blog', type: 'custom' },
        { id: '2b', label: 'Categories', url: '/categories', type: 'custom' },
        { id: '2c', label: 'Tags', url: '/tags', type: 'custom' }
      ]},
      { id: '3', label: 'Products', url: '/products', type: 'custom' },
      { id: '4', label: 'About', url: '/about', type: 'page' },
      { id: '5', label: 'Contact', url: '/contact', type: 'page' }
    ]
  },
  {
    id: 'footer',
    name: 'Footer Menu',
    location: 'footer',
    items: [
      { id: 'f1', label: 'Privacy Policy', url: '/privacy', type: 'page' },
      { id: 'f2', label: 'Terms of Service', url: '/terms', type: 'page' },
      { id: 'f3', label: 'Sitemap', url: '/sitemap', type: 'custom' }
    ]
  }
];

const mockLocations: MenuLocation[] = [
  { id: 'header', name: 'Header Navigation', description: 'Main navigation in the header', assignedMenu: 'main' },
  { id: 'footer', name: 'Footer Navigation', description: 'Links in the footer', assignedMenu: 'footer' },
  { id: 'mobile', name: 'Mobile Menu', description: 'Navigation for mobile devices' }
];

const mockPages = [
  { id: 'p1', title: 'About Us', slug: 'about' },
  { id: 'p2', title: 'Contact', slug: 'contact' },
  { id: 'p3', title: 'Privacy Policy', slug: 'privacy' },
  { id: 'p4', title: 'Terms of Service', slug: 'terms' }
];

const mockCategories = [
  { id: 'c1', name: 'Technology', slug: 'technology' },
  { id: 'c2', name: 'Business', slug: 'business' },
  { id: 'c3', name: 'Lifestyle', slug: 'lifestyle' }
];

export const MenuBuilder: React.FC<MenuBuilderProps> = ({ onSave }) => {
  const [menus, setMenus] = useState<MenuConfig[]>(mockMenus);
  const [locations] = useState<MenuLocation[]>(mockLocations);
  const [selectedMenu, setSelectedMenu] = useState<MenuConfig | null>(mockMenus[0]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [addItemType, setAddItemType] = useState<'custom' | 'page' | 'category' | null>(null);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'page': return <FileText className="w-4 h-4 text-blue-400" />;
      case 'category': return <Folder className="w-4 h-4 text-green-400" />;
      case 'tag': return <Tag className="w-4 h-4 text-purple-400" />;
      default: return <Link className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleAddItem = (item: Partial<MenuItem>) => {
    if (!selectedMenu) return;

    const newItem: MenuItem = {
      id: Date.now().toString(),
      label: item.label || 'New Item',
      url: item.url || '/',
      type: item.type || 'custom'
    };

    setSelectedMenu({
      ...selectedMenu,
      items: [...selectedMenu.items, newItem]
    });
    setAddItemType(null);
  };

  const handleUpdateItem = (itemId: string, updates: Partial<MenuItem>) => {
    if (!selectedMenu) return;

    const updateItems = (items: MenuItem[]): MenuItem[] => {
      return items.map(item => {
        if (item.id === itemId) {
          return { ...item, ...updates };
        }
        if (item.children) {
          return { ...item, children: updateItems(item.children) };
        }
        return item;
      });
    };

    setSelectedMenu({
      ...selectedMenu,
      items: updateItems(selectedMenu.items)
    });
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!selectedMenu) return;

    const deleteFromItems = (items: MenuItem[]): MenuItem[] => {
      return items
        .filter(item => item.id !== itemId)
        .map(item => ({
          ...item,
          children: item.children ? deleteFromItems(item.children) : undefined
        }));
    };

    setSelectedMenu({
      ...selectedMenu,
      items: deleteFromItems(selectedMenu.items)
    });
  };

  const handleSave = () => {
    if (!selectedMenu) return;

    setMenus(menus.map(m => m.id === selectedMenu.id ? selectedMenu : m));
    onSave?.(selectedMenu);
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800/50 group ${
            depth > 0 ? 'ml-6' : ''
          }`}
        >
          <GripVertical className="w-4 h-4 text-gray-600 cursor-grab opacity-0 group-hover:opacity-100" />

          {hasChildren ? (
            <button onClick={() => toggleExpand(item.id)} className="p-0.5">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}

          {getTypeIcon(item.type)}

          <div className="flex-1 min-w-0">
            <span className="text-white font-medium">{item.label}</span>
            <span className="text-xs text-gray-500 ml-2 truncate">{item.url}</span>
          </div>

          {item.target === '_blank' && (
            <ExternalLink className="w-3 h-3 text-gray-500" />
          )}

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
            <button
              onClick={() => setEditingItem(item)}
              className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-gray-700"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={() => handleDeleteItem(item.id)}
              className="p-1.5 text-gray-400 hover:text-red-400 rounded hover:bg-gray-700"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {item.children!.map(child => renderMenuItem(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="h-full flex bg-gray-900">
      {/* Sidebar - Menu List */}
      <div className="w-64 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Menu className="w-5 h-5 text-indigo-400" />
            Menu Builder
          </h2>
        </div>

        <div className="p-4 border-b border-gray-800">
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Menus</h3>
          <div className="space-y-1">
            {menus.map(menu => (
              <button
                key={menu.id}
                onClick={() => setSelectedMenu(menu)}
                className={`w-full px-3 py-2 text-left rounded-lg transition-colors ${
                  selectedMenu?.id === menu.id
                    ? 'bg-indigo-600/20 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="font-medium">{menu.name}</div>
                <div className="text-xs text-gray-500">{menu.items.length} items</div>
              </button>
            ))}
          </div>
          <button
            className="w-full mt-2 px-3 py-2 border border-dashed border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-gray-600 flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" />
            New Menu
          </button>
        </div>

        <div className="p-4 flex-1">
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Locations</h3>
          <div className="space-y-2">
            {locations.map(location => (
              <div key={location.id} className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-sm text-white font-medium">{location.name}</div>
                <div className="text-xs text-gray-500 mt-1">{location.description}</div>
                <div className="mt-2">
                  <select
                    value={location.assignedMenu || ''}
                    className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-white"
                  >
                    <option value="">-- Select Menu --</option>
                    {menus.map(menu => (
                      <option key={menu.id} value={menu.id}>{menu.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedMenu ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{selectedMenu.name}</h3>
                <p className="text-sm text-gray-500">{selectedMenu.items.length} menu items</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600">
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg"
                >
                  <Save className="w-4 h-4" />
                  Save Menu
                </button>
              </div>
            </div>

            {/* Add Item Section */}
            <div className="p-4 border-b border-gray-800">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Add Menu Items</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAddItemType(addItemType === 'custom' ? null : 'custom')}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    addItemType === 'custom' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <Link className="w-4 h-4 inline mr-1" />
                  Custom Link
                </button>
                <button
                  onClick={() => setAddItemType(addItemType === 'page' ? null : 'page')}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    addItemType === 'page' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-1" />
                  Pages
                </button>
                <button
                  onClick={() => setAddItemType(addItemType === 'category' ? null : 'category')}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                    addItemType === 'category' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <Folder className="w-4 h-4 inline mr-1" />
                  Categories
                </button>
              </div>

              <AnimatePresence>
                {addItemType && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 overflow-hidden"
                  >
                    {addItemType === 'custom' && (
                      <div className="bg-gray-800/50 rounded-lg p-3 space-y-3">
                        <input
                          type="text"
                          placeholder="Label"
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white"
                        />
                        <input
                          type="text"
                          placeholder="URL"
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white"
                        />
                        <button
                          onClick={() => handleAddItem({ type: 'custom', label: 'New Link', url: '/' })}
                          className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg"
                        >
                          Add to Menu
                        </button>
                      </div>
                    )}

                    {addItemType === 'page' && (
                      <div className="bg-gray-800/50 rounded-lg p-3 space-y-2 max-h-40 overflow-auto">
                        {mockPages.map(page => (
                          <button
                            key={page.id}
                            onClick={() => handleAddItem({ type: 'page', label: page.title, url: `/${page.slug}` })}
                            className="w-full px-3 py-2 text-left bg-gray-900 hover:bg-gray-700 rounded-lg text-sm text-white"
                          >
                            {page.title}
                          </button>
                        ))}
                      </div>
                    )}

                    {addItemType === 'category' && (
                      <div className="bg-gray-800/50 rounded-lg p-3 space-y-2 max-h-40 overflow-auto">
                        {mockCategories.map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => handleAddItem({ type: 'category', label: cat.name, url: `/category/${cat.slug}` })}
                            className="w-full px-3 py-2 text-left bg-gray-900 hover:bg-gray-700 rounded-lg text-sm text-white"
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-auto p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Menu Structure</h4>
              {selectedMenu.items.length > 0 ? (
                <div className="space-y-1">
                  {selectedMenu.items.map(item => renderMenuItem(item))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <LayoutList className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No menu items yet</p>
                  <p className="text-sm">Add items using the options above</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Menu className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Select a menu</p>
              <p className="text-sm">Choose a menu from the sidebar to edit</p>
            </div>
          </div>
        )}
      </div>

      {/* Edit Item Modal */}
      <AnimatePresence>
        {editingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setEditingItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-900 rounded-xl p-6 w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-white mb-4">Edit Menu Item</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Label</label>
                  <input
                    type="text"
                    value={editingItem.label}
                    onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">URL</label>
                  <input
                    type="text"
                    value={editingItem.url}
                    onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Open in</label>
                  <select
                    value={editingItem.target || '_self'}
                    onChange={(e) => setEditingItem({ ...editingItem, target: e.target.value as any })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="_self">Same window</option>
                    <option value="_blank">New window</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-2">CSS Class (optional)</label>
                  <input
                    type="text"
                    value={editingItem.cssClass || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, cssClass: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateItem(editingItem.id, editingItem)}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Update
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuBuilder;
