/**
 * TaxonomyManager - Categories and tags management
 * RustPress-specific taxonomy functionality
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tags, FolderTree, Plus, Trash2, Edit2, Save, X,
  ChevronRight, ChevronDown, GripVertical, Search,
  MoreVertical, Hash, Eye, Link, AlertCircle
} from 'lucide-react';

export interface Taxonomy {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string;
  count: number;
  children?: Taxonomy[];
}

interface TaxonomyManagerProps {
  onSave?: (taxonomies: Taxonomy[]) => void;
  onDelete?: (taxonomy: Taxonomy) => void;
}

const mockCategories: Taxonomy[] = [
  {
    id: '1',
    name: 'Technology',
    slug: 'technology',
    description: 'Tech news and tutorials',
    count: 45,
    children: [
      { id: '1-1', name: 'Programming', slug: 'programming', parent: '1', count: 22, children: [
        { id: '1-1-1', name: 'Rust', slug: 'rust', parent: '1-1', count: 8 },
        { id: '1-1-2', name: 'JavaScript', slug: 'javascript', parent: '1-1', count: 10 },
        { id: '1-1-3', name: 'Python', slug: 'python', parent: '1-1', count: 4 },
      ]},
      { id: '1-2', name: 'DevOps', slug: 'devops', parent: '1', count: 12 },
      { id: '1-3', name: 'AI/ML', slug: 'ai-ml', parent: '1', count: 11 },
    ]
  },
  {
    id: '2',
    name: 'Business',
    slug: 'business',
    description: 'Business and entrepreneurship',
    count: 28,
    children: [
      { id: '2-1', name: 'Startups', slug: 'startups', parent: '2', count: 15 },
      { id: '2-2', name: 'Marketing', slug: 'marketing', parent: '2', count: 13 },
    ]
  },
  { id: '3', name: 'Design', slug: 'design', description: 'UI/UX and graphic design', count: 18 },
  { id: '4', name: 'Tutorials', slug: 'tutorials', description: 'How-to guides', count: 32 },
  { id: '5', name: 'News', slug: 'news', description: 'Latest updates', count: 56 },
];

const mockTags: Taxonomy[] = [
  { id: 't1', name: 'rust', slug: 'rust', count: 24 },
  { id: 't2', name: 'web-development', slug: 'web-development', count: 45 },
  { id: 't3', name: 'tutorial', slug: 'tutorial', count: 38 },
  { id: 't4', name: 'performance', slug: 'performance', count: 19 },
  { id: 't5', name: 'security', slug: 'security', count: 22 },
  { id: 't6', name: 'api', slug: 'api', count: 31 },
  { id: 't7', name: 'database', slug: 'database', count: 17 },
  { id: 't8', name: 'frontend', slug: 'frontend', count: 28 },
  { id: 't9', name: 'backend', slug: 'backend', count: 33 },
  { id: 't10', name: 'devops', slug: 'devops', count: 14 },
  { id: 't11', name: 'cloud', slug: 'cloud', count: 21 },
  { id: 't12', name: 'docker', slug: 'docker', count: 16 },
];

export const TaxonomyManager: React.FC<TaxonomyManagerProps> = ({
  onSave,
  onDelete
}) => {
  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>('categories');
  const [categories, setCategories] = useState<Taxonomy[]>(mockCategories);
  const [tags, setTags] = useState<Taxonomy[]>(mockTags);
  const [expandedItems, setExpandedItems] = useState<string[]>(['1']);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newItem, setNewItem] = useState({ name: '', slug: '', description: '', parent: '' });
  const [showNewForm, setShowNewForm] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const handleAddCategory = () => {
    if (!newItem.name) return;
    const newCategory: Taxonomy = {
      id: `cat-${Date.now()}`,
      name: newItem.name,
      slug: newItem.slug || generateSlug(newItem.name),
      description: newItem.description,
      count: 0,
      parent: newItem.parent || undefined
    };

    if (newItem.parent) {
      // Add as child
      setCategories(prev => prev.map(cat => {
        if (cat.id === newItem.parent) {
          return { ...cat, children: [...(cat.children || []), newCategory] };
        }
        return cat;
      }));
    } else {
      setCategories([...categories, newCategory]);
    }

    setNewItem({ name: '', slug: '', description: '', parent: '' });
    setShowNewForm(false);
  };

  const handleAddTag = () => {
    if (!newItem.name) return;
    const newTag: Taxonomy = {
      id: `tag-${Date.now()}`,
      name: newItem.name,
      slug: newItem.slug || generateSlug(newItem.name),
      count: 0
    };
    setTags([...tags, newTag]);
    setNewItem({ name: '', slug: '', description: '', parent: '' });
    setShowNewForm(false);
  };

  const handleDelete = (id: string, type: 'category' | 'tag') => {
    if (type === 'category') {
      setCategories(prev => {
        const removeItem = (items: Taxonomy[]): Taxonomy[] => {
          return items.filter(item => {
            if (item.id === id) return false;
            if (item.children) {
              item.children = removeItem(item.children);
            }
            return true;
          });
        };
        return removeItem(prev);
      });
    } else {
      setTags(prev => prev.filter(t => t.id !== id));
    }
  };

  const renderCategoryTree = (items: Taxonomy[], level: number = 0) => {
    return items
      .filter(item =>
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map(item => (
        <div key={item.id}>
          <div
            className={`flex items-center gap-2 p-2 hover:bg-gray-800/50 rounded-lg group`}
            style={{ paddingLeft: `${level * 20 + 8}px` }}
          >
            {item.children && item.children.length > 0 ? (
              <button
                onClick={() => toggleExpand(item.id)}
                className="p-0.5 hover:bg-gray-700 rounded"
              >
                {expandedItems.includes(item.id) ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>
            ) : (
              <span className="w-5" />
            )}

            <FolderTree className="w-4 h-4 text-purple-400" />

            <div className="flex-1 min-w-0">
              <span className="text-white">{item.name}</span>
              <span className="text-xs text-gray-500 ml-2">/{item.slug}</span>
            </div>

            <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-800 rounded">
              {item.count}
            </span>

            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
              <button
                onClick={() => setEditingItem(item.id)}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <Edit2 className="w-3 h-3 text-gray-400" />
              </button>
              <button
                onClick={() => handleDelete(item.id, 'category')}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <Trash2 className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {item.children && expandedItems.includes(item.id) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                {renderCategoryTree(item.children, level + 1)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ));
  };

  const filteredTags = tags.filter(tag =>
    !searchQuery ||
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAllCategories = (items: Taxonomy[], prefix = ''): { id: string; name: string }[] => {
    return items.flatMap(item => [
      { id: item.id, name: prefix + item.name },
      ...(item.children ? getAllCategories(item.children, prefix + '— ') : [])
    ]);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="flex">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'categories'
                ? 'text-purple-400 border-purple-400'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            <FolderTree className="w-4 h-4 inline-block mr-2" />
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'tags'
                ? 'text-purple-400 border-purple-400'
                : 'text-gray-400 border-transparent hover:text-white'
            }`}
          >
            <Tags className="w-4 h-4 inline-block mr-2" />
            Tags ({tags.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* List */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-800">
          {/* Search */}
          <div className="p-3 border-b border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
              />
            </div>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-auto p-3">
            {activeTab === 'categories' ? (
              <div className="space-y-1">
                {renderCategoryTree(categories)}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filteredTags.map(tag => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 hover:bg-gray-800 rounded-lg group"
                  >
                    <Hash className="w-3 h-3 text-purple-400" />
                    <span className="text-white">{tag.name}</span>
                    <span className="text-xs text-gray-500">({tag.count})</span>
                    <button
                      onClick={() => handleDelete(tag.id, 'tag')}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-700 rounded"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Form */}
        <div className="w-80 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-sm font-medium text-white">
              Add New {activeTab === 'categories' ? 'Category' : 'Tag'}
            </h3>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({
                    ...newItem,
                    name: e.target.value,
                    slug: generateSlug(e.target.value)
                  })}
                  placeholder={activeTab === 'categories' ? 'Category name' : 'Tag name'}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Slug</label>
                <input
                  type="text"
                  value={newItem.slug}
                  onChange={(e) => setNewItem({ ...newItem, slug: e.target.value })}
                  placeholder="url-friendly-name"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL: /{activeTab === 'categories' ? 'category' : 'tag'}/{newItem.slug || 'slug'}
                </p>
              </div>

              {activeTab === 'categories' && (
                <>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Parent Category</label>
                    <select
                      value={newItem.parent}
                      onChange={(e) => setNewItem({ ...newItem, parent: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                    >
                      <option value="">None (Top Level)</option>
                      {getAllCategories(categories).map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Description</label>
                    <textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder="Optional description..."
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                      rows={3}
                    />
                  </div>
                </>
              )}

              <button
                onClick={activeTab === 'categories' ? handleAddCategory : handleAddTag}
                disabled={!newItem.name}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add {activeTab === 'categories' ? 'Category' : 'Tag'}
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-4 border-t border-gray-800 bg-gray-800/30">
            <h4 className="text-xs text-gray-400 uppercase mb-2">Statistics</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-400">Total:</span>
                <span className="text-white ml-2">
                  {activeTab === 'categories' ? categories.length : tags.length}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Posts:</span>
                <span className="text-white ml-2">
                  {activeTab === 'categories'
                    ? categories.reduce((sum, c) => sum + c.count, 0)
                    : tags.reduce((sum, t) => sum + t.count, 0)
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxonomyManager;
