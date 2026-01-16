import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout,
  Settings,
  Maximize,
  Minimize,
  PanelLeft,
  PanelRight,
  ChevronDown,
  ChevronRight,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Save,
  RotateCcw,
  Grid,
  Square,
  Columns,
  Rows,
  Box,
  Move,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  X,
  Check,
  Copy,
  Trash2,
  FileText,
  Home,
  ShoppingBag,
  BookOpen,
  Image,
  User,
  Search,
  Archive,
  Tag,
  Palette,
  Sliders,
  Layers,
  Lock,
  Unlock
} from 'lucide-react';
import clsx from 'clsx';

interface LayoutRegion {
  id: string;
  name: string;
  enabled: boolean;
  sticky: boolean;
  fullWidth: boolean;
  order: number;
}

interface ContainerSettings {
  maxWidth: number;
  padding: number;
  mobilePadding: number;
}

interface ResponsiveValue<T> {
  desktop: T;
  tablet: T;
  mobile: T;
}

interface LayoutSettings {
  containerWidth: ResponsiveValue<number>;
  sidebarWidth: ResponsiveValue<number>;
  sidebarPosition: 'left' | 'right' | 'none';
  headerLayout: 'full' | 'contained' | 'boxed';
  footerLayout: 'full' | 'contained' | 'boxed';
  contentLayout: 'full' | 'contained' | 'boxed';
  verticalSpacing: ResponsiveValue<number>;
  horizontalPadding: ResponsiveValue<number>;
  sectionSpacing: number;
  borderRadius: number;
  boxedBackgroundColor: string;
  pageBackgroundColor: string;
}

interface PageLayoutPreset {
  id: string;
  name: string;
  description: string;
  icon: any;
  settings: Partial<LayoutSettings>;
  sidebar: 'left' | 'right' | 'none' | 'both';
  header: boolean;
  footer: boolean;
  preview: string;
}

interface PageTypeLayout {
  id: string;
  name: string;
  icon: any;
  preset: string;
  customSettings: Partial<LayoutSettings>;
}

const defaultLayoutSettings: LayoutSettings = {
  containerWidth: { desktop: 1200, tablet: 768, mobile: 100 },
  sidebarWidth: { desktop: 300, tablet: 280, mobile: 100 },
  sidebarPosition: 'right',
  headerLayout: 'full',
  footerLayout: 'full',
  contentLayout: 'contained',
  verticalSpacing: { desktop: 40, tablet: 32, mobile: 24 },
  horizontalPadding: { desktop: 24, tablet: 20, mobile: 16 },
  sectionSpacing: 60,
  borderRadius: 8,
  boxedBackgroundColor: '#ffffff',
  pageBackgroundColor: '#f9fafb'
};

const layoutPresets: PageLayoutPreset[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Standard layout with right sidebar',
    icon: Layout,
    settings: { sidebarPosition: 'right', contentLayout: 'contained' },
    sidebar: 'right',
    header: true,
    footer: true,
    preview: 'default'
  },
  {
    id: 'full-width',
    name: 'Full Width',
    description: 'No sidebar, full width content',
    icon: Maximize,
    settings: { sidebarPosition: 'none', contentLayout: 'full' },
    sidebar: 'none',
    header: true,
    footer: true,
    preview: 'full'
  },
  {
    id: 'left-sidebar',
    name: 'Left Sidebar',
    description: 'Content with left sidebar',
    icon: PanelLeft,
    settings: { sidebarPosition: 'left', contentLayout: 'contained' },
    sidebar: 'left',
    header: true,
    footer: true,
    preview: 'left'
  },
  {
    id: 'both-sidebars',
    name: 'Both Sidebars',
    description: 'Content with sidebars on both sides',
    icon: Columns,
    settings: { sidebarPosition: 'right', contentLayout: 'contained' },
    sidebar: 'both',
    header: true,
    footer: true,
    preview: 'both'
  },
  {
    id: 'boxed',
    name: 'Boxed',
    description: 'Boxed container with margin',
    icon: Square,
    settings: {
      headerLayout: 'boxed',
      footerLayout: 'boxed',
      contentLayout: 'boxed',
      containerWidth: { desktop: 1140, tablet: 720, mobile: 100 }
    },
    sidebar: 'right',
    header: true,
    footer: true,
    preview: 'boxed'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean layout without header/footer',
    icon: Minimize,
    settings: { sidebarPosition: 'none', contentLayout: 'contained' },
    sidebar: 'none',
    header: false,
    footer: false,
    preview: 'minimal'
  },
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'Full width sections for landing pages',
    icon: Layers,
    settings: {
      sidebarPosition: 'none',
      contentLayout: 'full',
      verticalSpacing: { desktop: 0, tablet: 0, mobile: 0 }
    },
    sidebar: 'none',
    header: true,
    footer: true,
    preview: 'landing'
  },
  {
    id: 'centered',
    name: 'Centered Content',
    description: 'Narrow centered content area',
    icon: AlignCenter,
    settings: {
      sidebarPosition: 'none',
      contentLayout: 'contained',
      containerWidth: { desktop: 800, tablet: 680, mobile: 100 }
    },
    sidebar: 'none',
    header: true,
    footer: true,
    preview: 'centered'
  }
];

const pageTypes: PageTypeLayout[] = [
  { id: 'home', name: 'Homepage', icon: Home, preset: 'full-width', customSettings: {} },
  { id: 'blog', name: 'Blog Index', icon: BookOpen, preset: 'default', customSettings: {} },
  { id: 'single-post', name: 'Single Post', icon: FileText, preset: 'default', customSettings: {} },
  { id: 'page', name: 'Standard Page', icon: FileText, preset: 'full-width', customSettings: {} },
  { id: 'archive', name: 'Archive', icon: Archive, preset: 'default', customSettings: {} },
  { id: 'category', name: 'Category', icon: Tag, preset: 'default', customSettings: {} },
  { id: 'search', name: 'Search Results', icon: Search, preset: 'default', customSettings: {} },
  { id: 'author', name: 'Author Page', icon: User, preset: 'centered', customSettings: {} },
  { id: 'shop', name: 'Shop', icon: ShoppingBag, preset: 'left-sidebar', customSettings: {} },
  { id: 'product', name: 'Single Product', icon: ShoppingBag, preset: 'full-width', customSettings: {} },
  { id: '404', name: '404 Error', icon: X, preset: 'minimal', customSettings: {} },
  { id: 'blank', name: 'Blank Canvas', icon: Square, preset: 'minimal', customSettings: {} }
];

export const ThemeLayoutManager: React.FC = () => {
  const [globalSettings, setGlobalSettings] = useState<LayoutSettings>(defaultLayoutSettings);
  const [pageLayouts, setPageLayouts] = useState<PageTypeLayout[]>(pageTypes);
  const [selectedPageType, setSelectedPageType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'global' | 'pages' | 'breakpoints'>('global');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [regions, setRegions] = useState<LayoutRegion[]>([
    { id: 'topbar', name: 'Top Bar', enabled: true, sticky: false, fullWidth: true, order: 1 },
    { id: 'header', name: 'Header', enabled: true, sticky: true, fullWidth: true, order: 2 },
    { id: 'hero', name: 'Hero Section', enabled: false, sticky: false, fullWidth: true, order: 3 },
    { id: 'breadcrumbs', name: 'Breadcrumbs', enabled: true, sticky: false, fullWidth: false, order: 4 },
    { id: 'content', name: 'Content Area', enabled: true, sticky: false, fullWidth: false, order: 5 },
    { id: 'cta', name: 'Call to Action', enabled: false, sticky: false, fullWidth: true, order: 6 },
    { id: 'footer', name: 'Footer', enabled: true, sticky: false, fullWidth: true, order: 7 },
    { id: 'copyright', name: 'Copyright Bar', enabled: true, sticky: false, fullWidth: true, order: 8 }
  ]);
  const [breakpoints, setBreakpoints] = useState({
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    largeDesktop: 1440
  });

  const selectedPage = pageLayouts.find(p => p.id === selectedPageType);
  const selectedPreset = layoutPresets.find(p => p.id === selectedPage?.preset);

  const updateGlobalSetting = <K extends keyof LayoutSettings>(key: K, value: LayoutSettings[K]) => {
    setGlobalSettings({ ...globalSettings, [key]: value });
  };

  const updateResponsiveValue = <K extends keyof LayoutSettings>(
    key: K,
    device: 'desktop' | 'tablet' | 'mobile',
    value: number
  ) => {
    const current = globalSettings[key] as ResponsiveValue<number>;
    setGlobalSettings({
      ...globalSettings,
      [key]: { ...current, [device]: value }
    });
  };

  const updatePageLayout = (pageId: string, updates: Partial<PageTypeLayout>) => {
    setPageLayouts(pageLayouts.map(p =>
      p.id === pageId ? { ...p, ...updates } : p
    ));
  };

  const updateRegion = (regionId: string, updates: Partial<LayoutRegion>) => {
    setRegions(regions.map(r =>
      r.id === regionId ? { ...r, ...updates } : r
    ));
  };

  const moveRegion = (regionId: string, direction: 'up' | 'down') => {
    const index = regions.findIndex(r => r.id === regionId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === regions.length - 1) return;

    const newRegions = [...regions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newRegions[index], newRegions[newIndex]] = [newRegions[newIndex], newRegions[index]];

    // Update order numbers
    newRegions.forEach((r, i) => {
      r.order = i + 1;
    });

    setRegions(newRegions);
  };

  const renderLayoutPreview = (settings: LayoutSettings = globalSettings, preset?: PageLayoutPreset) => {
    const containerWidth = settings.containerWidth[previewDevice];
    const sidebarWidth = settings.sidebarWidth[previewDevice];
    const showSidebar = settings.sidebarPosition !== 'none' || (preset?.sidebar && preset.sidebar !== 'none');
    const sidebarPos = preset?.sidebar || settings.sidebarPosition;

    return (
      <div
        className="rounded-lg overflow-hidden border border-gray-200"
        style={{ backgroundColor: settings.pageBackgroundColor }}
      >
        {/* Header */}
        {(!preset || preset.header) && (
          <div
            className={clsx(
              'h-12 bg-gray-800 flex items-center justify-center',
              settings.headerLayout === 'boxed' && 'mx-auto max-w-[90%] mt-2 rounded-t-lg'
            )}
          >
            <span className="text-xs text-white">Header</span>
          </div>
        )}

        {/* Content Area */}
        <div
          className={clsx(
            'min-h-[200px] p-4 flex gap-4',
            settings.contentLayout === 'boxed' && 'mx-auto max-w-[90%]'
          )}
          style={{ backgroundColor: settings.boxedBackgroundColor }}
        >
          {/* Left Sidebar */}
          {(sidebarPos === 'left' || sidebarPos === 'both') && (
            <div
              className="bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ width: previewDevice === 'mobile' ? '30%' : '25%' }}
            >
              <span className="text-xs text-gray-500">Sidebar</span>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 bg-white rounded-lg border border-gray-100 flex items-center justify-center">
            <div className="text-center">
              <Box className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <span className="text-xs text-gray-400">Content</span>
            </div>
          </div>

          {/* Right Sidebar */}
          {(sidebarPos === 'right' || sidebarPos === 'both') && (
            <div
              className="bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ width: previewDevice === 'mobile' ? '30%' : '25%' }}
            >
              <span className="text-xs text-gray-500">Sidebar</span>
            </div>
          )}
        </div>

        {/* Footer */}
        {(!preset || preset.footer) && (
          <div
            className={clsx(
              'h-16 bg-gray-700 flex items-center justify-center',
              settings.footerLayout === 'boxed' && 'mx-auto max-w-[90%] mb-2 rounded-b-lg'
            )}
          >
            <span className="text-xs text-white">Footer</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Layout className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Theme Layout Manager</h2>
              <p className="text-sm text-gray-500">Configure global and page-specific layouts</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors">
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex gap-1">
          {[
            { id: 'global' as const, label: 'Global Layout', icon: Layout },
            { id: 'pages' as const, label: 'Page Layouts', icon: FileText },
            { id: 'breakpoints' as const, label: 'Breakpoints', icon: Monitor }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-3 border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-violet-500 text-violet-600'
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
        {activeTab === 'global' && (
          <div className="h-full flex">
            {/* Settings Panel */}
            <div className="w-1/2 border-r border-gray-200 overflow-y-auto p-6 space-y-6">
              {/* Layout Regions */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">Layout Regions</h3>
                <div className="space-y-2">
                  {regions.sort((a, b) => a.order - b.order).map((region, index) => (
                    <div
                      key={region.id}
                      className={clsx(
                        'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                        region.enabled
                          ? 'border-gray-200 bg-white'
                          : 'border-gray-100 bg-gray-50 opacity-60'
                      )}
                    >
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => moveRegion(region.id, 'up')}
                          disabled={index === 0}
                          className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-30"
                        >
                          <ArrowUp className="w-3 h-3 text-gray-400" />
                        </button>
                        <button
                          onClick={() => moveRegion(region.id, 'down')}
                          disabled={index === regions.length - 1}
                          className="p-0.5 hover:bg-gray-100 rounded disabled:opacity-30"
                        >
                          <ArrowDown className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>

                      <span className="flex-1 font-medium text-gray-700">{region.name}</span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateRegion(region.id, { sticky: !region.sticky })}
                          className={clsx(
                            'p-1.5 rounded-lg transition-colors',
                            region.sticky
                              ? 'bg-violet-100 text-violet-600'
                              : 'bg-gray-100 text-gray-400 hover:text-gray-600'
                          )}
                          title="Sticky"
                        >
                          <Lock className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => updateRegion(region.id, { fullWidth: !region.fullWidth })}
                          className={clsx(
                            'p-1.5 rounded-lg transition-colors',
                            region.fullWidth
                              ? 'bg-violet-100 text-violet-600'
                              : 'bg-gray-100 text-gray-400 hover:text-gray-600'
                          )}
                          title="Full Width"
                        >
                          <Maximize className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => updateRegion(region.id, { enabled: !region.enabled })}
                          className={clsx(
                            'p-1.5 rounded-lg transition-colors',
                            region.enabled
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-400'
                          )}
                        >
                          {region.enabled ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Container Settings */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">Container Width</h3>
                <div className="space-y-4">
                  {(['desktop', 'tablet', 'mobile'] as const).map(device => (
                    <div key={device} className="flex items-center gap-4">
                      <div className="w-20 flex items-center gap-2 text-sm text-gray-600 capitalize">
                        {device === 'desktop' && <Monitor className="w-4 h-4" />}
                        {device === 'tablet' && <Tablet className="w-4 h-4" />}
                        {device === 'mobile' && <Smartphone className="w-4 h-4" />}
                        {device}
                      </div>
                      <input
                        type="number"
                        value={globalSettings.containerWidth[device]}
                        onChange={(e) => updateResponsiveValue('containerWidth', device, parseInt(e.target.value))}
                        className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                      <span className="text-sm text-gray-400">
                        {device === 'mobile' ? '%' : 'px'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar Settings */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">Sidebar</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Position</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'left', icon: PanelLeft, label: 'Left' },
                        { value: 'right', icon: PanelRight, label: 'Right' },
                        { value: 'none', icon: X, label: 'None' }
                      ].map(({ value, icon: Icon, label }) => (
                        <button
                          key={value}
                          onClick={() => updateGlobalSetting('sidebarPosition', value as any)}
                          className={clsx(
                            'flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors',
                            globalSettings.sidebarPosition === value
                              ? 'border-violet-500 bg-violet-50'
                              : 'border-gray-200 hover:border-gray-300'
                          )}
                        >
                          <Icon className="w-5 h-5 text-gray-600" />
                          <span className="text-xs text-gray-700">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {globalSettings.sidebarPosition !== 'none' && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">Width</label>
                      <div className="space-y-3">
                        {(['desktop', 'tablet'] as const).map(device => (
                          <div key={device} className="flex items-center gap-4">
                            <div className="w-20 flex items-center gap-2 text-sm text-gray-600 capitalize">
                              {device === 'desktop' && <Monitor className="w-4 h-4" />}
                              {device === 'tablet' && <Tablet className="w-4 h-4" />}
                              {device}
                            </div>
                            <input
                              type="range"
                              min="200"
                              max="400"
                              value={globalSettings.sidebarWidth[device]}
                              onChange={(e) => updateResponsiveValue('sidebarWidth', device, parseInt(e.target.value))}
                              className="flex-1"
                            />
                            <span className="w-16 text-sm text-gray-500">
                              {globalSettings.sidebarWidth[device]}px
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Layout Style */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">Layout Style</h3>
                <div className="space-y-4">
                  {[
                    { key: 'headerLayout', label: 'Header' },
                    { key: 'contentLayout', label: 'Content' },
                    { key: 'footerLayout', label: 'Footer' }
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-sm text-gray-600 mb-2">{label}</label>
                      <div className="flex gap-2">
                        {['full', 'contained', 'boxed'].map(style => (
                          <button
                            key={style}
                            onClick={() => updateGlobalSetting(key as any, style)}
                            className={clsx(
                              'flex-1 px-3 py-2 rounded-lg border capitalize text-sm transition-colors',
                              (globalSettings as any)[key] === style
                                ? 'border-violet-500 bg-violet-50 text-violet-700'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            )}
                          >
                            {style}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spacing */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">Spacing</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      Section Spacing: {globalSettings.sectionSpacing}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="120"
                      step="4"
                      value={globalSettings.sectionSpacing}
                      onChange={(e) => updateGlobalSetting('sectionSpacing', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Vertical Spacing</label>
                    <div className="space-y-3">
                      {(['desktop', 'tablet', 'mobile'] as const).map(device => (
                        <div key={device} className="flex items-center gap-4">
                          <div className="w-20 flex items-center gap-2 text-sm text-gray-600 capitalize">
                            {device === 'desktop' && <Monitor className="w-4 h-4" />}
                            {device === 'tablet' && <Tablet className="w-4 h-4" />}
                            {device === 'mobile' && <Smartphone className="w-4 h-4" />}
                            {device}
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="80"
                            value={globalSettings.verticalSpacing[device]}
                            onChange={(e) => updateResponsiveValue('verticalSpacing', device, parseInt(e.target.value))}
                            className="flex-1"
                          />
                          <span className="w-12 text-sm text-gray-500">
                            {globalSettings.verticalSpacing[device]}px
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">Colors</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: 'pageBackgroundColor', label: 'Page Background' },
                    { key: 'boxedBackgroundColor', label: 'Content Background' }
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-sm text-gray-600 mb-1">{label}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={(globalSettings as any)[key]}
                          onChange={(e) => updateGlobalSetting(key as any, e.target.value)}
                          className="w-10 h-10 rounded border border-gray-200 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={(globalSettings as any)[key]}
                          onChange={(e) => updateGlobalSetting(key as any, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Border Radius */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-medium text-gray-800 mb-4">
                  Border Radius: {globalSettings.borderRadius}px
                </h3>
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={globalSettings.borderRadius}
                  onChange={(e) => updateGlobalSetting('borderRadius', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Preview Panel */}
            <div className="w-1/2 overflow-y-auto p-6">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-0">
                <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Layout Preview</span>
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
                            ? 'bg-violet-100 text-violet-600'
                            : 'text-gray-400 hover:bg-gray-100'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className={clsx(
                  'p-4 bg-gray-100 flex justify-center',
                  previewDevice === 'mobile' && 'px-12'
                )}>
                  <div
                    className={clsx(
                      'transition-all duration-300',
                      previewDevice === 'desktop' && 'w-full',
                      previewDevice === 'tablet' && 'w-[400px]',
                      previewDevice === 'mobile' && 'w-[240px]'
                    )}
                  >
                    {renderLayoutPreview()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pages' && (
          <div className="h-full flex">
            {/* Page Type List */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
              <div className="p-4 space-y-2">
                {pageLayouts.map(page => {
                  const preset = layoutPresets.find(p => p.id === page.preset);
                  const Icon = page.icon;
                  const isSelected = selectedPageType === page.id;

                  return (
                    <button
                      key={page.id}
                      onClick={() => setSelectedPageType(page.id)}
                      className={clsx(
                        'w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left',
                        isSelected
                          ? 'border-violet-500 bg-violet-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      )}
                    >
                      <div className={clsx(
                        'p-2 rounded-lg',
                        isSelected ? 'bg-violet-100' : 'bg-gray-100'
                      )}>
                        <Icon className={clsx(
                          'w-5 h-5',
                          isSelected ? 'text-violet-600' : 'text-gray-600'
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800">{page.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          Using: {preset?.name || 'Default'}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Page Layout Settings */}
            <div className="flex-1 overflow-y-auto">
              {selectedPage ? (
                <div className="p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-100 rounded-lg">
                      <selectedPage.icon className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800">{selectedPage.name}</h3>
                      <p className="text-sm text-gray-500">Configure layout for this page type</p>
                    </div>
                  </div>

                  {/* Preset Selection */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h4 className="font-medium text-gray-800 mb-4">Layout Preset</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {layoutPresets.map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => updatePageLayout(selectedPage.id, { preset: preset.id })}
                          className={clsx(
                            'flex items-start gap-3 p-4 rounded-lg border transition-all text-left',
                            selectedPage.preset === preset.id
                              ? 'border-violet-500 bg-violet-50'
                              : 'border-gray-200 hover:border-gray-300'
                          )}
                        >
                          <div className={clsx(
                            'p-2 rounded-lg flex-shrink-0',
                            selectedPage.preset === preset.id ? 'bg-violet-100' : 'bg-gray-100'
                          )}>
                            <preset.icon className={clsx(
                              'w-5 h-5',
                              selectedPage.preset === preset.id ? 'text-violet-600' : 'text-gray-600'
                            )} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{preset.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{preset.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preset Preview */}
                  {selectedPreset && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="p-3 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-700">Preview</span>
                      </div>
                      <div className="p-4 bg-gray-100">
                        {renderLayoutPreview(
                          { ...globalSettings, ...selectedPreset.settings } as LayoutSettings,
                          selectedPreset
                        )}
                      </div>
                    </div>
                  )}

                  {/* Custom Overrides */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-800">Custom Overrides</h4>
                      <span className="text-xs text-gray-500">Override global settings for this page</span>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
                        Custom overrides allow you to fine-tune layout settings specifically for this page type.
                        Any settings here will override the global layout configuration.
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <input type="checkbox" className="w-4 h-4 rounded" />
                          <span className="text-sm text-gray-700">Hide Header</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <input type="checkbox" className="w-4 h-4 rounded" />
                          <span className="text-sm text-gray-700">Hide Footer</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <input type="checkbox" className="w-4 h-4 rounded" />
                          <span className="text-sm text-gray-700">Hide Sidebar</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <input type="checkbox" className="w-4 h-4 rounded" />
                          <span className="text-sm text-gray-700">Full Width</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">Select a page type</p>
                    <p className="text-sm">Choose a page type to configure its layout</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'breakpoints' && (
          <div className="h-full overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-medium text-gray-800 mb-2">Responsive Breakpoints</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Define the screen widths where layouts adapt for different devices.
                </p>

                <div className="space-y-6">
                  {[
                    { key: 'mobile', label: 'Mobile', icon: Smartphone, description: 'Phones in portrait mode' },
                    { key: 'tablet', label: 'Tablet', icon: Tablet, description: 'Tablets and small laptops' },
                    { key: 'desktop', label: 'Desktop', icon: Monitor, description: 'Standard desktop screens' },
                    { key: 'largeDesktop', label: 'Large Desktop', icon: Monitor, description: 'Large monitors and TVs' }
                  ].map(({ key, label, icon: Icon, description }) => (
                    <div key={key} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="p-3 bg-white rounded-lg shadow-sm">
                        <Icon className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{label}</p>
                        <p className="text-sm text-gray-500">{description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={(breakpoints as any)[key]}
                          onChange={(e) => setBreakpoints({ ...breakpoints, [key]: parseInt(e.target.value) })}
                          className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-right"
                        />
                        <span className="text-sm text-gray-500">px</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Breakpoint Representation */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-medium text-gray-800 mb-4">Visual Representation</h3>
                <div className="relative h-16 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 bg-blue-100 border-r-2 border-blue-500"
                    style={{ left: 0, width: `${(breakpoints.mobile / breakpoints.largeDesktop) * 100}%` }}
                  >
                    <span className="absolute bottom-1 left-2 text-xs text-blue-600">Mobile</span>
                  </div>
                  <div
                    className="absolute top-0 bottom-0 bg-green-100 border-r-2 border-green-500"
                    style={{
                      left: `${(breakpoints.mobile / breakpoints.largeDesktop) * 100}%`,
                      width: `${((breakpoints.tablet - breakpoints.mobile) / breakpoints.largeDesktop) * 100}%`
                    }}
                  >
                    <span className="absolute bottom-1 left-2 text-xs text-green-600">Tablet</span>
                  </div>
                  <div
                    className="absolute top-0 bottom-0 bg-purple-100 border-r-2 border-purple-500"
                    style={{
                      left: `${(breakpoints.tablet / breakpoints.largeDesktop) * 100}%`,
                      width: `${((breakpoints.desktop - breakpoints.tablet) / breakpoints.largeDesktop) * 100}%`
                    }}
                  >
                    <span className="absolute bottom-1 left-2 text-xs text-purple-600">Desktop</span>
                  </div>
                  <div
                    className="absolute top-0 bottom-0 bg-orange-100"
                    style={{
                      left: `${(breakpoints.desktop / breakpoints.largeDesktop) * 100}%`,
                      right: 0
                    }}
                  >
                    <span className="absolute bottom-1 left-2 text-xs text-orange-600">Large</span>
                  </div>
                </div>
              </div>

              {/* Reset to Defaults */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-800">Reset Breakpoints</h4>
                    <p className="text-sm text-gray-500">Restore default responsive breakpoints</p>
                  </div>
                  <button
                    onClick={() => setBreakpoints({
                      mobile: 480,
                      tablet: 768,
                      desktop: 1024,
                      largeDesktop: 1440
                    })}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Reset to Defaults
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemeLayoutManager;
