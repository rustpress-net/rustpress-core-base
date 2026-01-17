/**
 * WidgetManager - Widget configuration and placement
 * RustPress-specific widget management functionality
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, Plus, Trash2, Settings, Eye, GripVertical,
  Image, FileText, List, Calendar, Users, MessageSquare,
  Search, Tag, Clock, TrendingUp, ChevronDown, ChevronRight,
  Copy, Code, Save, Layout
} from 'lucide-react';

export interface Widget {
  id: string;
  type: string;
  name: string;
  icon: React.ReactNode;
  settings: Record<string, any>;
  enabled: boolean;
}

export interface WidgetArea {
  id: string;
  name: string;
  description: string;
  widgets: Widget[];
}

interface WidgetManagerProps {
  onSave?: (areas: WidgetArea[]) => void;
}

const widgetTypes = [
  { type: 'recent-posts', name: 'Recent Posts', icon: <FileText className="w-4 h-4" />, defaultSettings: { count: 5, showDate: true, showThumbnail: true } },
  { type: 'categories', name: 'Categories', icon: <List className="w-4 h-4" />, defaultSettings: { showCount: true, hierarchical: true } },
  { type: 'tags', name: 'Tag Cloud', icon: <Tag className="w-4 h-4" />, defaultSettings: { maxTags: 20, showCount: false } },
  { type: 'search', name: 'Search Box', icon: <Search className="w-4 h-4" />, defaultSettings: { placeholder: 'Search...' } },
  { type: 'image', name: 'Image', icon: <Image className="w-4 h-4" />, defaultSettings: { src: '', alt: '', link: '' } },
  { type: 'text', name: 'Rich Text', icon: <FileText className="w-4 h-4" />, defaultSettings: { content: '' } },
  { type: 'calendar', name: 'Calendar', icon: <Calendar className="w-4 h-4" />, defaultSettings: { showEvents: true } },
  { type: 'recent-comments', name: 'Recent Comments', icon: <MessageSquare className="w-4 h-4" />, defaultSettings: { count: 5 } },
  { type: 'archives', name: 'Archives', icon: <Clock className="w-4 h-4" />, defaultSettings: { format: 'monthly', showCount: true } },
  { type: 'popular-posts', name: 'Popular Posts', icon: <TrendingUp className="w-4 h-4" />, defaultSettings: { count: 5, period: 'week' } },
  { type: 'authors', name: 'Authors', icon: <Users className="w-4 h-4" />, defaultSettings: { showAvatar: true, showPostCount: true } },
  { type: 'newsletter', name: 'Newsletter', icon: <MessageSquare className="w-4 h-4" />, defaultSettings: { title: 'Subscribe', buttonText: 'Subscribe' } },
];

const mockAreas: WidgetArea[] = [
  {
    id: 'sidebar-primary',
    name: 'Primary Sidebar',
    description: 'Main sidebar on blog and pages',
    widgets: [
      { id: 'w1', type: 'search', name: 'Search Box', icon: <Search className="w-4 h-4" />, settings: { placeholder: 'Search posts...' }, enabled: true },
      { id: 'w2', type: 'recent-posts', name: 'Recent Posts', icon: <FileText className="w-4 h-4" />, settings: { count: 5, showDate: true, showThumbnail: true }, enabled: true },
      { id: 'w3', type: 'categories', name: 'Categories', icon: <List className="w-4 h-4" />, settings: { showCount: true, hierarchical: true }, enabled: true },
    ]
  },
  {
    id: 'sidebar-secondary',
    name: 'Secondary Sidebar',
    description: 'Additional sidebar for special pages',
    widgets: [
      { id: 'w4', type: 'tags', name: 'Tag Cloud', icon: <Tag className="w-4 h-4" />, settings: { maxTags: 15, showCount: false }, enabled: true },
    ]
  },
  {
    id: 'footer-1',
    name: 'Footer Column 1',
    description: 'First footer column',
    widgets: [
      { id: 'w5', type: 'text', name: 'About Us', icon: <FileText className="w-4 h-4" />, settings: { content: 'About our company...' }, enabled: true },
    ]
  },
  {
    id: 'footer-2',
    name: 'Footer Column 2',
    description: 'Second footer column',
    widgets: []
  },
  {
    id: 'footer-3',
    name: 'Footer Column 3',
    description: 'Third footer column',
    widgets: [
      { id: 'w6', type: 'newsletter', name: 'Newsletter Signup', icon: <MessageSquare className="w-4 h-4" />, settings: { title: 'Stay Updated', buttonText: 'Subscribe Now' }, enabled: true },
    ]
  }
];

export const WidgetManager: React.FC<WidgetManagerProps> = ({
  onSave
}) => {
  const [areas, setAreas] = useState<WidgetArea[]>(mockAreas);
  const [selectedArea, setSelectedArea] = useState<WidgetArea | null>(mockAreas[0]);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [expandedAreas, setExpandedAreas] = useState<string[]>(['sidebar-primary']);
  const [showAvailableWidgets, setShowAvailableWidgets] = useState(true);

  const toggleArea = (areaId: string) => {
    setExpandedAreas(prev =>
      prev.includes(areaId) ? prev.filter(id => id !== areaId) : [...prev, areaId]
    );
  };

  const addWidget = (areaId: string, widgetType: typeof widgetTypes[0]) => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: widgetType.type,
      name: widgetType.name,
      icon: widgetType.icon,
      settings: { ...widgetType.defaultSettings },
      enabled: true
    };

    setAreas(prev => prev.map(area =>
      area.id === areaId
        ? { ...area, widgets: [...area.widgets, newWidget] }
        : area
    ));
  };

  const removeWidget = (areaId: string, widgetId: string) => {
    setAreas(prev => prev.map(area =>
      area.id === areaId
        ? { ...area, widgets: area.widgets.filter(w => w.id !== widgetId) }
        : area
    ));
    if (selectedWidget?.id === widgetId) setSelectedWidget(null);
  };

  const toggleWidget = (areaId: string, widgetId: string) => {
    setAreas(prev => prev.map(area =>
      area.id === areaId
        ? {
            ...area,
            widgets: area.widgets.map(w =>
              w.id === widgetId ? { ...w, enabled: !w.enabled } : w
            )
          }
        : area
    ));
  };

  const updateWidgetSettings = (areaId: string, widgetId: string, settings: Record<string, any>) => {
    setAreas(prev => prev.map(area =>
      area.id === areaId
        ? {
            ...area,
            widgets: area.widgets.map(w =>
              w.id === widgetId ? { ...w, settings: { ...w.settings, ...settings } } : w
            )
          }
        : area
    ));
  };

  const duplicateWidget = (areaId: string, widget: Widget) => {
    const newWidget: Widget = {
      ...widget,
      id: `widget-${Date.now()}`,
      name: `${widget.name} (Copy)`
    };
    setAreas(prev => prev.map(area =>
      area.id === areaId
        ? { ...area, widgets: [...area.widgets, newWidget] }
        : area
    ));
  };

  const moveWidget = (fromArea: string, toArea: string, widgetId: string) => {
    const widget = areas.find(a => a.id === fromArea)?.widgets.find(w => w.id === widgetId);
    if (!widget) return;

    setAreas(prev => prev.map(area => {
      if (area.id === fromArea) {
        return { ...area, widgets: area.widgets.filter(w => w.id !== widgetId) };
      }
      if (area.id === toArea) {
        return { ...area, widgets: [...area.widgets, widget] };
      }
      return area;
    }));
  };

  const getWidgetIcon = (type: string) => {
    return widgetTypes.find(w => w.type === type)?.icon || <LayoutGrid className="w-4 h-4" />;
  };

  const renderWidgetSettings = (widget: Widget, areaId: string) => {
    const commonFields = (
      <>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Widget Title</label>
          <input
            type="text"
            value={widget.name}
            onChange={(e) => {
              setAreas(prev => prev.map(area =>
                area.id === areaId
                  ? { ...area, widgets: area.widgets.map(w => w.id === widget.id ? { ...w, name: e.target.value } : w) }
                  : area
              ));
            }}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
          />
        </div>
      </>
    );

    switch (widget.type) {
      case 'recent-posts':
        return (
          <>
            {commonFields}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Number of Posts</label>
              <input
                type="number"
                value={widget.settings.count || 5}
                onChange={(e) => updateWidgetSettings(areaId, widget.id, { count: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                min={1}
                max={20}
              />
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={widget.settings.showDate}
                onChange={(e) => updateWidgetSettings(areaId, widget.id, { showDate: e.target.checked })}
                className="rounded bg-gray-800 border-gray-600 text-purple-600"
              />
              <span className="text-sm text-white">Show Date</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={widget.settings.showThumbnail}
                onChange={(e) => updateWidgetSettings(areaId, widget.id, { showThumbnail: e.target.checked })}
                className="rounded bg-gray-800 border-gray-600 text-purple-600"
              />
              <span className="text-sm text-white">Show Thumbnail</span>
            </label>
          </>
        );

      case 'search':
        return (
          <>
            {commonFields}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Placeholder Text</label>
              <input
                type="text"
                value={widget.settings.placeholder || ''}
                onChange={(e) => updateWidgetSettings(areaId, widget.id, { placeholder: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
              />
            </div>
          </>
        );

      case 'text':
        return (
          <>
            {commonFields}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Content</label>
              <textarea
                value={widget.settings.content || ''}
                onChange={(e) => updateWidgetSettings(areaId, widget.id, { content: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                rows={6}
              />
            </div>
          </>
        );

      case 'newsletter':
        return (
          <>
            {commonFields}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Heading</label>
              <input
                type="text"
                value={widget.settings.title || ''}
                onChange={(e) => updateWidgetSettings(areaId, widget.id, { title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Button Text</label>
              <input
                type="text"
                value={widget.settings.buttonText || ''}
                onChange={(e) => updateWidgetSettings(areaId, widget.id, { buttonText: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
              />
            </div>
          </>
        );

      default:
        return commonFields;
    }
  };

  return (
    <div className="h-full flex bg-gray-900">
      {/* Left Panel - Widget Areas */}
      <div className="w-80 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-purple-400" />
            Widget Areas
          </h2>
        </div>

        <div className="flex-1 overflow-auto">
          {areas.map(area => (
            <div key={area.id} className="border-b border-gray-800">
              <button
                onClick={() => { toggleArea(area.id); setSelectedArea(area); }}
                className={`w-full p-3 flex items-center gap-2 hover:bg-gray-800/50 text-left ${
                  selectedArea?.id === area.id ? 'bg-gray-800/50' : ''
                }`}
              >
                {expandedAreas.includes(area.id) ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
                <Layout className="w-4 h-4 text-purple-400" />
                <div className="flex-1">
                  <div className="text-white font-medium">{area.name}</div>
                  <div className="text-xs text-gray-500">{area.widgets.length} widgets</div>
                </div>
              </button>

              <AnimatePresence>
                {expandedAreas.includes(area.id) && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-2">
                      {area.widgets.map(widget => (
                        <div
                          key={widget.id}
                          onClick={() => setSelectedWidget(widget)}
                          className={`p-2 bg-gray-800/50 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-gray-800 ${
                            selectedWidget?.id === widget.id ? 'ring-1 ring-purple-500' : ''
                          } ${!widget.enabled ? 'opacity-50' : ''}`}
                        >
                          <GripVertical className="w-3 h-3 text-gray-500" />
                          <span className="text-purple-400">{getWidgetIcon(widget.type)}</span>
                          <span className="text-sm text-white flex-1 truncate">{widget.name}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleWidget(area.id, widget.id); }}
                            className={`p-1 rounded ${widget.enabled ? 'text-green-400' : 'text-gray-500'}`}
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeWidget(area.id, widget.id); }}
                            className="p-1 rounded text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {area.widgets.length === 0 && (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No widgets. Drag one here.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => onSave?.(areas)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Center Panel - Available Widgets */}
      <div className="w-72 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-sm font-medium text-white">Available Widgets</h3>
        </div>

        <div className="flex-1 overflow-auto p-3">
          <div className="grid grid-cols-2 gap-2">
            {widgetTypes.map(widgetType => (
              <button
                key={widgetType.type}
                onClick={() => selectedArea && addWidget(selectedArea.id, widgetType)}
                disabled={!selectedArea}
                className="p-3 bg-gray-800/50 hover:bg-gray-800 disabled:opacity-50 rounded-lg flex flex-col items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
              >
                {widgetType.icon}
                <span className="text-xs text-center">{widgetType.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Widget Settings */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-sm font-medium text-white">Widget Settings</h3>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {selectedWidget && selectedArea ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <span className="text-purple-400">{getWidgetIcon(selectedWidget.type)}</span>
                <div>
                  <div className="text-white font-medium">{selectedWidget.name}</div>
                  <div className="text-xs text-gray-500">in {selectedArea.name}</div>
                </div>
              </div>

              {renderWidgetSettings(selectedWidget, selectedArea.id)}

              <div className="pt-4 border-t border-gray-800 flex gap-2">
                <button
                  onClick={() => duplicateWidget(selectedArea.id, selectedWidget)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
                <button
                  onClick={() => removeWidget(selectedArea.id, selectedWidget.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No widget selected</p>
                <p className="text-sm">Select a widget to configure</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WidgetManager;
