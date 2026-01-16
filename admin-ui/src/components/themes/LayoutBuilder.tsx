import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import {
  Layout,
  Grid,
  Columns,
  Rows,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Plus,
  Minus,
  Trash2,
  Copy,
  Save,
  Download,
  Upload,
  Eye,
  EyeOff,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronLeft,
  X,
  Check,
  Move,
  Maximize,
  Minimize,
  Smartphone,
  Tablet,
  Monitor,
  GripVertical,
  GripHorizontal,
  Layers,
  Image,
  Type,
  Video,
  Code,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  Sparkles,
  LayoutGrid,
  LayoutList,
  SplitSquareVertical,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  Menu,
  Home,
  User,
  Search,
  ShoppingCart,
  Bell,
  Heart,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Link,
  ArrowUpDown,
  Loader2,
  RotateCcw,
  Lock,
  Unlock,
  Wand2,
  // Additional icons for 50+ widgets
  Calendar,
  Clock,
  Tag,
  Tags,
  FileText,
  Files,
  Folder,
  FolderOpen,
  MessageSquare,
  MessageCircle,
  Share2,
  ThumbsUp,
  Star,
  Award,
  Trophy,
  Target,
  Zap,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Gauge,
  Users,
  UserPlus,
  UserCheck,
  CreditCard,
  DollarSign,
  Percent,
  Gift,
  Package,
  Truck,
  Store,
  Building2,
  Globe,
  Map,
  Navigation,
  Compass,
  Cloud,
  CloudRain,
  Sun,
  Moon,
  Thermometer,
  Wind,
  Droplets,
  Music,
  Headphones,
  Mic,
  Radio,
  Tv,
  Film,
  Camera,
  Aperture,
  Palette,
  Brush,
  Pencil,
  Edit3,
  Scissors,
  Printer,
  QrCode,
  Barcode,
  Wifi,
  Bluetooth,
  Battery,
  Cpu,
  HardDrive,
  Server,
  Database,
  Terminal,
  GitBranch,
  GitCommit,
  Bug,
  Shield,
  ShieldCheck,
  Key,
  Fingerprint,
  Scan,
  AlertTriangle,
  AlertCircle,
  Info,
  HelpCircle,
  CircleDot,
  MoreHorizontal,
  Grip,
  Hash,
  AtSign,
  Quote,
  ListChecks,
  CheckSquare,
  XSquare,
  ToggleLeft,
  ToggleRight,
  Sliders,
  Filter,
  SortAsc,
  SortDesc,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  CornerDownRight,
  Reply,
  Forward,
  Undo,
  Redo,
  History,
  Archive,
  Inbox,
  Send,
  Paperclip,
  Pin,
  Flag,
  Megaphone,
  Rss,
  Podcast,
  Radio as RadioIcon,
  Newspaper,
  BookOpen,
  Library,
  GraduationCap,
  School,
  Briefcase,
  Landmark,
  Building,
  Factory,
  Warehouse,
  HomeIcon,
  Bed,
  Bath,
  Utensils,
  Coffee,
  Wine,
  Beer,
  Pizza,
  Cake,
  Apple,
  Carrot,
  Leaf,
  Flower2,
  TreeDeciduous,
  Mountain,
  Waves,
  Anchor,
  Plane,
  Car,
  Bus,
  Train,
  Bike,
  Footprints,
  Accessibility,
  Baby,
  Cat,
  Dog,
  Bird,
  Fish,
  Rabbit,
  Gamepad2,
  Dice1,
  Puzzle,
  Shapes,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Pentagon,
  Diamond,
  Gem,
  Crown,
  Glasses,
  Watch,
  Shirt,
  Footprints as Shoe,
  Umbrella,
  Wallet,
  Receipt,
  Ticket,
  BadgeCheck,
  BadgeAlert,
  BadgeInfo,
  BadgeHelp,
  Banknote,
  Coins,
  PiggyBank,
  Calculator,
  Scale,
  Ruler,
  Wrench,
  Hammer,
  Axe,
  Shovel,
  Flashlight,
  Lightbulb,
  Lamp,
  Fan,
  AirVent,
  Heater,
  Refrigerator,
  WashingMachine,
  Microwave,
  Tv2,
  Speaker,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Rewind,
  FastForward,
  Repeat,
  Shuffle,
  ListMusic,
  Disc,
  Youtube,
  Twitch,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

// ============================================
// TYPES & INTERFACES
// ============================================

type DeviceBreakpoint = 'mobile' | 'tablet' | 'desktop';
type BlockType = 'hero' | 'features' | 'content' | 'gallery' | 'cta' | 'testimonials' | 'pricing' | 'contact' | 'custom';
type WidgetType = string; // Flexible widget type to support 50+ widgets

interface GridConfig {
  columns: number;
  gap: number;
  rowGap: number;
  columnGap: number;
}

interface SpacingPreset {
  id: string;
  name: string;
  values: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    '2xl': number;
  };
}

interface LayoutBlock {
  id: string;
  type: BlockType;
  name: string;
  columns: number;
  rows: number;
  padding: { top: number; right: number; bottom: number; left: number };
  margin: { top: number; right: number; bottom: number; left: number };
  background: string;
  isLocked: boolean;
  isVisible: boolean;
  responsive: {
    mobile: { columns: number; visible: boolean };
    tablet: { columns: number; visible: boolean };
    desktop: { columns: number; visible: boolean };
  };
}

interface SectionTemplate {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  blocks: LayoutBlock[];
  description: string;
  popularity: number;
}

interface HeaderConfig {
  layout: 'centered' | 'split' | 'stacked' | 'minimal';
  sticky: boolean;
  transparent: boolean;
  showLogo: boolean;
  showSearch: boolean;
  showCart: boolean;
  showUser: boolean;
  menuPosition: 'left' | 'center' | 'right';
  ctaButton: { show: boolean; text: string; link: string };
}

interface FooterConfig {
  layout: 'simple' | 'columns' | 'centered' | 'minimal';
  columns: number;
  showLogo: boolean;
  showSocial: boolean;
  showNewsletter: boolean;
  showCopyright: boolean;
  copyrightText: string;
  socialLinks: { platform: string; url: string }[];
}

interface WidgetArea {
  id: string;
  name: string;
  position: 'sidebar-left' | 'sidebar-right' | 'footer' | 'header';
  widgets: Widget[];
}

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  settings: Record<string, any>;
}

interface LayoutPreset {
  id: string;
  name: string;
  header: HeaderConfig;
  footer: FooterConfig;
  blocks: LayoutBlock[];
  grid: GridConfig;
  widgetAreas: WidgetArea[];
  createdAt: string;
  isFavorite: boolean;
}

interface LayoutSettings {
  header: HeaderConfig;
  footer: FooterConfig;
  blocks: LayoutBlock[];
  grid: ResponsiveGridConfig;
  spacing: SpacingPreset;
  widgetAreas: WidgetArea[];
}

interface ResponsiveGridConfig {
  mobile: GridConfig;
  tablet: GridConfig;
  desktop: GridConfig;
}

interface LayoutBuilderProps {
  settings: LayoutSettings;
  onSettingsChange: (settings: LayoutSettings) => void;
  onClose?: () => void;
}

// ============================================
// SAMPLE DATA
// ============================================

const defaultBlocks: LayoutBlock[] = [
  {
    id: 'hero-1',
    type: 'hero',
    name: 'Hero Section',
    columns: 12,
    rows: 1,
    padding: { top: 64, right: 32, bottom: 64, left: 32 },
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    isLocked: false,
    isVisible: true,
    responsive: {
      mobile: { columns: 12, visible: true },
      tablet: { columns: 12, visible: true },
      desktop: { columns: 12, visible: true },
    },
  },
  {
    id: 'features-1',
    type: 'features',
    name: 'Features Grid',
    columns: 12,
    rows: 1,
    padding: { top: 48, right: 32, bottom: 48, left: 32 },
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    background: '#ffffff',
    isLocked: false,
    isVisible: true,
    responsive: {
      mobile: { columns: 12, visible: true },
      tablet: { columns: 12, visible: true },
      desktop: { columns: 12, visible: true },
    },
  },
];

const sectionTemplates: SectionTemplate[] = [
  {
    id: 'hero-1',
    name: 'Hero with CTA',
    category: 'Hero',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop',
    blocks: [defaultBlocks[0]],
    description: 'Full-width hero section with centered content and CTA button',
    popularity: 95,
  },
  {
    id: 'hero-2',
    name: 'Split Hero',
    category: 'Hero',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    blocks: [],
    description: 'Two-column hero with image and text side by side',
    popularity: 88,
  },
  {
    id: 'features-1',
    name: '3-Column Features',
    category: 'Features',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    blocks: [],
    description: 'Three equal columns showcasing key features',
    popularity: 92,
  },
  {
    id: 'features-2',
    name: 'Icon Grid',
    category: 'Features',
    thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop',
    blocks: [],
    description: '4x2 grid of feature cards with icons',
    popularity: 85,
  },
  {
    id: 'testimonials-1',
    name: 'Testimonial Carousel',
    category: 'Testimonials',
    thumbnail: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop',
    blocks: [],
    description: 'Sliding testimonial cards with avatars',
    popularity: 78,
  },
  {
    id: 'cta-1',
    name: 'Banner CTA',
    category: 'CTA',
    thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop',
    blocks: [],
    description: 'Full-width call-to-action banner',
    popularity: 90,
  },
  {
    id: 'pricing-1',
    name: 'Pricing Table',
    category: 'Pricing',
    thumbnail: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=400&h=300&fit=crop',
    blocks: [],
    description: 'Three-tier pricing comparison table',
    popularity: 82,
  },
  {
    id: 'contact-1',
    name: 'Contact Form',
    category: 'Contact',
    thumbnail: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=400&h=300&fit=crop',
    blocks: [],
    description: 'Contact form with map sidebar',
    popularity: 75,
  },
];

const defaultSpacingPresets: SpacingPreset[] = [
  { id: 'compact', name: 'Compact', values: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 48 } },
  { id: 'comfortable', name: 'Comfortable', values: { xs: 8, sm: 16, md: 24, lg: 32, xl: 48, '2xl': 64 } },
  { id: 'spacious', name: 'Spacious', values: { xs: 12, sm: 24, md: 32, lg: 48, xl: 64, '2xl': 96 } },
];

const blockTypeIcons: Record<BlockType, React.FC<any>> = {
  hero: Layout,
  features: Grid,
  content: Type,
  gallery: Image,
  cta: RectangleHorizontal,
  testimonials: User,
  pricing: ListOrdered,
  contact: Mail,
  custom: Code,
};

// ============================================
// ENHANCEMENT 37: DRAG & DROP LAYOUT EDITOR
// ============================================

interface DragDropEditorProps {
  blocks: LayoutBlock[];
  onChange: (blocks: LayoutBlock[]) => void;
  selectedDevice: DeviceBreakpoint;
  grid: GridConfig;
}

const DragDropEditor: React.FC<DragDropEditorProps> = ({
  blocks,
  onChange,
  selectedDevice,
  grid,
}) => {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleAddBlock = (type: BlockType) => {
    const newBlock: LayoutBlock = {
      id: `${type}-${Date.now()}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
      columns: 12,
      rows: 1,
      padding: { top: 48, right: 32, bottom: 48, left: 32 },
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      background: '#ffffff',
      isLocked: false,
      isVisible: true,
      responsive: {
        mobile: { columns: 12, visible: true },
        tablet: { columns: 12, visible: true },
        desktop: { columns: 12, visible: true },
      },
    };
    onChange([...blocks, newBlock]);
    setShowAddMenu(false);
    toast.success(`Added ${type} section`);
  };

  const handleDeleteBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id));
    toast.success('Section removed');
  };

  const handleDuplicateBlock = (block: LayoutBlock) => {
    const duplicate = { ...block, id: `${block.type}-${Date.now()}`, name: `${block.name} (Copy)` };
    const index = blocks.findIndex(b => b.id === block.id);
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, duplicate);
    onChange(newBlocks);
    toast.success('Section duplicated');
  };

  const handleToggleVisibility = (id: string) => {
    onChange(blocks.map(b => b.id === id ? { ...b, isVisible: !b.isVisible } : b));
  };

  const handleToggleLock = (id: string) => {
    onChange(blocks.map(b => b.id === id ? { ...b, isLocked: !b.isLocked } : b));
  };

  const blockTypes: BlockType[] = ['hero', 'features', 'content', 'gallery', 'cta', 'testimonials', 'pricing', 'contact', 'custom'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Move className="w-4 h-4" />
          Layout Sections
        </h3>
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Section
          </button>

          <AnimatePresence>
            {showAddMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-10 overflow-hidden"
              >
                {blockTypes.map(type => {
                  const Icon = blockTypeIcons[type];
                  return (
                    <button
                      key={type}
                      onClick={() => handleAddBlock(type)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-left"
                    >
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {type}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Grid Preview */}
      <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
        <div
          className="grid gap-2 mb-2"
          style={{
            gridTemplateColumns: `repeat(${grid.columns}, 1fr)`,
            gap: `${grid.gap}px`,
          }}
        >
          {Array.from({ length: grid.columns }).map((_, i) => (
            <div
              key={i}
              className="h-2 bg-blue-200 dark:bg-blue-800/50 rounded"
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 text-center">{grid.columns} columns • {grid.gap}px gap</p>
      </div>

      {/* Blocks List */}
      <Reorder.Group
        axis="y"
        values={blocks}
        onReorder={onChange}
        className="space-y-2"
      >
        {blocks.map(block => {
          const Icon = blockTypeIcons[block.type];
          const isSelected = selectedBlock === block.id;

          return (
            <Reorder.Item
              key={block.id}
              value={block}
              dragListener={!block.isLocked}
              className={clsx(
                'rounded-xl border-2 transition-all',
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
                block.isLocked && 'opacity-75'
              )}
            >
              <div className="p-4">
                <div className="flex items-center gap-3">
                  {!block.isLocked && (
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing" />
                  )}

                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: block.background }}
                  >
                    <Icon className="w-5 h-5 text-white mix-blend-difference" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {block.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {block.responsive[selectedDevice].columns} columns •{' '}
                      {block.responsive[selectedDevice].visible ? 'Visible' : 'Hidden'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleVisibility(block.id)}
                      className={clsx(
                        'p-1.5 rounded transition-colors',
                        block.isVisible
                          ? 'text-gray-400 hover:text-gray-600'
                          : 'text-red-400 hover:text-red-600'
                      )}
                    >
                      {block.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleToggleLock(block.id)}
                      className={clsx(
                        'p-1.5 rounded transition-colors',
                        block.isLocked
                          ? 'text-yellow-500 hover:text-yellow-600'
                          : 'text-gray-400 hover:text-gray-600'
                      )}
                    >
                      {block.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDuplicateBlock(block)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedBlock(isSelected ? null : block.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBlock(block.id)}
                      disabled={block.isLocked}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Settings */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Columns ({selectedDevice})
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="12"
                            value={block.responsive[selectedDevice].columns}
                            onChange={(e) => {
                              const newBlocks = blocks.map(b =>
                                b.id === block.id
                                  ? {
                                      ...b,
                                      responsive: {
                                        ...b.responsive,
                                        [selectedDevice]: {
                                          ...b.responsive[selectedDevice],
                                          columns: parseInt(e.target.value),
                                        },
                                      },
                                    }
                                  : b
                              );
                              onChange(newBlocks);
                            }}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Background
                          </label>
                          <input
                            type="color"
                            value={block.background.startsWith('#') ? block.background : '#ffffff'}
                            onChange={(e) => {
                              const newBlocks = blocks.map(b =>
                                b.id === block.id ? { ...b, background: e.target.value } : b
                              );
                              onChange(newBlocks);
                            }}
                            className="w-full h-8 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      {blocks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Layout className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No sections yet</p>
          <p className="text-xs">Click "Add Section" to start building</p>
        </div>
      )}
    </div>
  );
};

// ============================================
// ENHANCEMENT 38: SECTION TEMPLATES LIBRARY
// ============================================

interface SectionTemplatesProps {
  onSelectTemplate: (template: SectionTemplate) => void;
}

const SectionTemplates: React.FC<SectionTemplatesProps> = ({ onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = useMemo(() => {
    const cats = new Set<string>();
    sectionTemplates.forEach(t => cats.add(t.category));
    return Array.from(cats);
  }, []);

  const filteredTemplates = useMemo(() => {
    let result = sectionTemplates;

    if (selectedCategory) {
      result = result.filter(t => t.category === selectedCategory);
    }

    if (searchQuery) {
      result = result.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result.sort((a, b) => b.popularity - a.popularity);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-purple-500" />
        Section Templates
      </h3>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search templates..."
          className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={clsx(
            'px-3 py-1 rounded-full text-xs font-medium transition-colors',
            !selectedCategory
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          )}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={clsx(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              selectedCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
        {filteredTemplates.map(template => (
          <motion.div
            key={template.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onSelectTemplate(template);
              toast.success(`Added: ${template.name}`);
            }}
            className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:border-blue-300 transition-all bg-white dark:bg-gray-800"
          >
            <div
              className="h-24 bg-cover bg-center"
              style={{ backgroundImage: `url(${template.thumbnail})` }}
            />
            <div className="p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-blue-600">{template.category}</span>
                <span className="text-xs text-gray-400">{template.popularity}%</span>
              </div>
              <p className="font-medium text-sm text-gray-900 dark:text-white">{template.name}</p>
              <p className="text-xs text-gray-500 line-clamp-2">{template.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// ENHANCEMENT 39: RESPONSIVE LAYOUT CONTROLS
// ============================================

interface ResponsiveLayoutControlsProps {
  blocks: LayoutBlock[];
  onChange: (blocks: LayoutBlock[]) => void;
  selectedDevice: DeviceBreakpoint;
  onDeviceChange: (device: DeviceBreakpoint) => void;
}

const ResponsiveLayoutControls: React.FC<ResponsiveLayoutControlsProps> = ({
  blocks,
  onChange,
  selectedDevice,
  onDeviceChange,
}) => {
  const devices: { id: DeviceBreakpoint; label: string; icon: React.FC<any>; width: string }[] = [
    { id: 'mobile', label: 'Mobile', icon: Smartphone, width: '< 640px' },
    { id: 'tablet', label: 'Tablet', icon: Tablet, width: '640-1024px' },
    { id: 'desktop', label: 'Desktop', icon: Monitor, width: '> 1024px' },
  ];

  const handleVisibilityChange = (blockId: string, visible: boolean) => {
    onChange(
      blocks.map(b =>
        b.id === blockId
          ? {
              ...b,
              responsive: {
                ...b.responsive,
                [selectedDevice]: { ...b.responsive[selectedDevice], visible },
              },
            }
          : b
      )
    );
  };

  const handleColumnsChange = (blockId: string, columns: number) => {
    onChange(
      blocks.map(b =>
        b.id === blockId
          ? {
              ...b,
              responsive: {
                ...b.responsive,
                [selectedDevice]: { ...b.responsive[selectedDevice], columns },
              },
            }
          : b
      )
    );
  };

  const copyToAllDevices = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    const currentSettings = block.responsive[selectedDevice];
    onChange(
      blocks.map(b =>
        b.id === blockId
          ? {
              ...b,
              responsive: {
                mobile: { ...currentSettings },
                tablet: { ...currentSettings },
                desktop: { ...currentSettings },
              },
            }
          : b
      )
    );
    toast.success('Settings copied to all devices');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <Smartphone className="w-4 h-4" />
        Responsive Controls
      </h3>

      {/* Device Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {devices.map(device => {
          const Icon = device.icon;
          return (
            <button
              key={device.id}
              onClick={() => onDeviceChange(device.id)}
              className={clsx(
                'flex-1 flex flex-col items-center gap-1 py-2 rounded-md text-xs font-medium transition-colors',
                selectedDevice === device.id
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              <Icon className="w-4 h-4" />
              {device.label}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 text-center">
        {devices.find(d => d.id === selectedDevice)?.width}
      </p>

      {/* Per-Block Settings */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {blocks.map(block => {
          const Icon = blockTypeIcons[block.type];
          const deviceSettings = block.responsive[selectedDevice];

          return (
            <div
              key={block.id}
              className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
            >
              <div className="flex items-center gap-3 mb-3">
                <Icon className="w-4 h-4 text-gray-500" />
                <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white truncate">
                  {block.name}
                </span>
                <button
                  onClick={() => copyToAllDevices(block.id)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Copy to all
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Visible</label>
                  <button
                    onClick={() => handleVisibilityChange(block.id, !deviceSettings.visible)}
                    className={clsx(
                      'w-full py-1.5 rounded text-xs font-medium transition-colors',
                      deviceSettings.visible
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    )}
                  >
                    {deviceSettings.visible ? 'Yes' : 'No'}
                  </button>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Columns: {deviceSettings.columns}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={deviceSettings.columns}
                    onChange={(e) => handleColumnsChange(block.id, parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// ENHANCEMENT 40: GRID SYSTEM CUSTOMIZER
// ============================================

interface GridCustomizerProps {
  grid: ResponsiveGridConfig;
  onChange: (grid: ResponsiveGridConfig) => void;
  selectedDevice: DeviceBreakpoint;
}

const GridCustomizer: React.FC<GridCustomizerProps> = ({ grid, onChange, selectedDevice }) => {
  const [linkGaps, setLinkGaps] = useState(true);

  const currentGrid = grid[selectedDevice];

  const handleChange = (key: keyof GridConfig, value: number) => {
    if (key === 'gap' || (linkGaps && (key === 'rowGap' || key === 'columnGap'))) {
      onChange({
        ...grid,
        [selectedDevice]: {
          ...currentGrid,
          gap: value,
          rowGap: value,
          columnGap: value,
        },
      });
    } else {
      onChange({
        ...grid,
        [selectedDevice]: {
          ...currentGrid,
          [key]: value,
        },
      });
    }
  };

  const presets = [
    { name: '12 Column', columns: 12, gap: 24 },
    { name: '16 Column', columns: 16, gap: 16 },
    { name: '6 Column', columns: 6, gap: 32 },
    { name: '4 Column', columns: 4, gap: 48 },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <Grid className="w-4 h-4" />
        Grid System
      </h3>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {presets.map(preset => (
          <button
            key={preset.name}
            onClick={() => handleChange('columns', preset.columns)}
            className={clsx(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              currentGrid.columns === preset.columns
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
            )}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Grid Preview */}
      <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${currentGrid.columns}, 1fr)`,
            gap: `${currentGrid.rowGap}px ${currentGrid.columnGap}px`,
          }}
        >
          {Array.from({ length: currentGrid.columns }).map((_, i) => (
            <div
              key={i}
              className="h-8 bg-blue-200 dark:bg-blue-800/50 rounded flex items-center justify-center"
            >
              <span className="text-xs text-blue-600 dark:text-blue-400">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Columns: {currentGrid.columns}
            </label>
          </div>
          <input
            type="range"
            min="1"
            max="24"
            value={currentGrid.columns}
            onChange={(e) => handleChange('columns', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Link row/column gaps</span>
          <button
            onClick={() => setLinkGaps(!linkGaps)}
            className={clsx(
              'p-1.5 rounded transition-colors',
              linkGaps ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
            )}
          >
            {linkGaps ? <Link className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
          </button>
        </div>

        {linkGaps ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gap: {currentGrid.gap}px
            </label>
            <input
              type="range"
              min="0"
              max="64"
              value={currentGrid.gap}
              onChange={(e) => handleChange('gap', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Row Gap: {currentGrid.rowGap}px
              </label>
              <input
                type="range"
                min="0"
                max="64"
                value={currentGrid.rowGap}
                onChange={(e) => handleChange('rowGap', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Column Gap: {currentGrid.columnGap}px
              </label>
              <input
                type="range"
                min="0"
                max="64"
                value={currentGrid.columnGap}
                onChange={(e) => handleChange('columnGap', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// ENHANCEMENT 41: SPACING SYSTEM EDITOR
// ============================================

interface SpacingEditorProps {
  spacing: SpacingPreset;
  onChange: (spacing: SpacingPreset) => void;
}

const SpacingEditor: React.FC<SpacingEditorProps> = ({ spacing, onChange }) => {
  const [customMode, setCustomMode] = useState(false);

  const spacingKeys = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

  const handlePresetSelect = (preset: SpacingPreset) => {
    onChange(preset);
    setCustomMode(false);
  };

  const handleValueChange = (key: typeof spacingKeys[number], value: number) => {
    onChange({
      ...spacing,
      id: 'custom',
      name: 'Custom',
      values: { ...spacing.values, [key]: value },
    });
    setCustomMode(true);
  };

  const generateFromBase = (base: number) => {
    const scale = 1.5;
    const values = {
      xs: Math.round(base / (scale * scale)),
      sm: Math.round(base / scale),
      md: base,
      lg: Math.round(base * scale),
      xl: Math.round(base * scale * scale),
      '2xl': Math.round(base * Math.pow(scale, 3)),
    };
    onChange({ id: 'generated', name: 'Generated', values });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <RectangleHorizontal className="w-4 h-4" />
        Spacing System
      </h3>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {defaultSpacingPresets.map(preset => (
          <button
            key={preset.id}
            onClick={() => handlePresetSelect(preset)}
            className={clsx(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              spacing.id === preset.id && !customMode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
            )}
          >
            {preset.name}
          </button>
        ))}
        {customMode && (
          <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">
            Custom
          </span>
        )}
      </div>

      {/* Visual Preview */}
      <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-xl">
        <div className="flex items-end gap-2 justify-center">
          {spacingKeys.map(key => (
            <div key={key} className="text-center">
              <div
                className="bg-blue-500 rounded-sm mx-auto"
                style={{ width: spacing.values[key], height: spacing.values[key] }}
              />
              <p className="text-xs text-gray-500 mt-1">{key}</p>
              <p className="text-xs text-gray-400">{spacing.values[key]}px</p>
            </div>
          ))}
        </div>
      </div>

      {/* Value Controls */}
      <div className="space-y-3">
        {spacingKeys.map(key => (
          <div key={key} className="flex items-center gap-3">
            <span className="w-8 text-xs font-medium text-gray-500 uppercase">{key}</span>
            <input
              type="range"
              min="0"
              max="128"
              value={spacing.values[key]}
              onChange={(e) => handleValueChange(key, parseInt(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              value={spacing.values[key]}
              onChange={(e) => handleValueChange(key, parseInt(e.target.value) || 0)}
              className="w-16 px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm text-center"
            />
          </div>
        ))}
      </div>

      {/* Generate Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => generateFromBase(spacing.values.md)}
          className="flex-1 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 flex items-center justify-center gap-2"
        >
          <Wand2 className="w-4 h-4" />
          Auto-generate from base
        </button>
        <button
          onClick={() => handlePresetSelect(defaultSpacingPresets[1])}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ============================================
// ENHANCEMENT 42: HEADER/FOOTER BUILDER
// ============================================

interface HeaderFooterBuilderProps {
  header: HeaderConfig;
  footer: FooterConfig;
  onHeaderChange: (header: HeaderConfig) => void;
  onFooterChange: (footer: FooterConfig) => void;
}

const HeaderFooterBuilder: React.FC<HeaderFooterBuilderProps> = ({
  header,
  footer,
  onHeaderChange,
  onFooterChange,
}) => {
  const [activeSection, setActiveSection] = useState<'header' | 'footer'>('header');

  const headerLayouts = [
    { id: 'centered', label: 'Centered', icon: AlignCenter },
    { id: 'split', label: 'Split', icon: SplitSquareVertical },
    { id: 'stacked', label: 'Stacked', icon: Rows },
    { id: 'minimal', label: 'Minimal', icon: Minus },
  ];

  const footerLayouts = [
    { id: 'simple', label: 'Simple', icon: RectangleHorizontal },
    { id: 'columns', label: 'Columns', icon: Columns },
    { id: 'centered', label: 'Centered', icon: AlignCenter },
    { id: 'minimal', label: 'Minimal', icon: Minus },
  ];

  return (
    <div className="space-y-4">
      {/* Section Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <button
          onClick={() => setActiveSection('header')}
          className={clsx(
            'flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors',
            activeSection === 'header'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500'
          )}
        >
          <PanelTop className="w-4 h-4" />
          Header
        </button>
        <button
          onClick={() => setActiveSection('footer')}
          className={clsx(
            'flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors',
            activeSection === 'footer'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500'
          )}
        >
          <PanelBottom className="w-4 h-4" />
          Footer
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeSection === 'header' ? (
          <motion.div
            key="header"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {/* Header Preview */}
            <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
              <div className={clsx(
                'flex items-center py-3 px-4 bg-gray-50 dark:bg-gray-900 rounded-lg',
                header.layout === 'centered' && 'justify-center',
                header.layout === 'split' && 'justify-between',
                header.layout === 'stacked' && 'flex-col gap-2',
              )}>
                {header.showLogo && (
                  <div className="font-bold text-gray-900 dark:text-white">Logo</div>
                )}
                <div className={clsx(
                  'flex items-center gap-4',
                  header.menuPosition === 'center' && 'mx-auto',
                )}>
                  <span className="text-sm text-gray-600">Home</span>
                  <span className="text-sm text-gray-600">About</span>
                  <span className="text-sm text-gray-600">Contact</span>
                </div>
                <div className="flex items-center gap-2">
                  {header.showSearch && <Search className="w-4 h-4 text-gray-400" />}
                  {header.showCart && <ShoppingCart className="w-4 h-4 text-gray-400" />}
                  {header.showUser && <User className="w-4 h-4 text-gray-400" />}
                  {header.ctaButton.show && (
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs">
                      {header.ctaButton.text || 'CTA'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Layout Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Layout
              </label>
              <div className="grid grid-cols-4 gap-2">
                {headerLayouts.map(layout => (
                  <button
                    key={layout.id}
                    onClick={() => onHeaderChange({ ...header, layout: layout.id as any })}
                    className={clsx(
                      'p-3 rounded-lg border-2 transition-colors flex flex-col items-center gap-1',
                      header.layout === layout.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    )}
                  >
                    <layout.icon className="w-5 h-5 text-gray-600" />
                    <span className="text-xs text-gray-600">{layout.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">Sticky Header</span>
                <button
                  onClick={() => onHeaderChange({ ...header, sticky: !header.sticky })}
                  className={clsx(
                    'w-10 h-6 rounded-full transition-colors relative',
                    header.sticky ? 'bg-blue-600' : 'bg-gray-300'
                  )}
                >
                  <motion.div
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                    animate={{ left: header.sticky ? 20 : 4 }}
                  />
                </button>
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">Transparent</span>
                <button
                  onClick={() => onHeaderChange({ ...header, transparent: !header.transparent })}
                  className={clsx(
                    'w-10 h-6 rounded-full transition-colors relative',
                    header.transparent ? 'bg-blue-600' : 'bg-gray-300'
                  )}
                >
                  <motion.div
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                    animate={{ left: header.transparent ? 20 : 4 }}
                  />
                </button>
              </label>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'showLogo', label: 'Logo' },
                  { key: 'showSearch', label: 'Search' },
                  { key: 'showCart', label: 'Cart' },
                  { key: 'showUser', label: 'User' },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={header[key as keyof HeaderConfig] as boolean}
                      onChange={(e) => onHeaderChange({ ...header, [key]: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="footer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            {/* Footer Preview */}
            <div className="p-4 bg-gray-900 rounded-xl">
              <div className={clsx(
                'py-4',
                footer.layout === 'columns' && 'grid grid-cols-4 gap-4',
                footer.layout === 'centered' && 'text-center',
              )}>
                {footer.showLogo && (
                  <div className="font-bold text-white mb-2">Logo</div>
                )}
                {footer.layout === 'columns' && (
                  <>
                    <div>
                      <p className="text-white text-sm font-medium mb-2">Company</p>
                      <p className="text-gray-400 text-xs">About</p>
                      <p className="text-gray-400 text-xs">Careers</p>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium mb-2">Resources</p>
                      <p className="text-gray-400 text-xs">Blog</p>
                      <p className="text-gray-400 text-xs">Help</p>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium mb-2">Legal</p>
                      <p className="text-gray-400 text-xs">Privacy</p>
                      <p className="text-gray-400 text-xs">Terms</p>
                    </div>
                  </>
                )}
                {footer.showSocial && (
                  <div className="flex gap-2 mt-2 justify-center">
                    <Facebook className="w-4 h-4 text-gray-400" />
                    <Twitter className="w-4 h-4 text-gray-400" />
                    <Instagram className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                {footer.showCopyright && (
                  <p className="text-gray-500 text-xs mt-4">
                    {footer.copyrightText || '© 2025 Company. All rights reserved.'}
                  </p>
                )}
              </div>
            </div>

            {/* Layout Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Layout
              </label>
              <div className="grid grid-cols-4 gap-2">
                {footerLayouts.map(layout => (
                  <button
                    key={layout.id}
                    onClick={() => onFooterChange({ ...footer, layout: layout.id as any })}
                    className={clsx(
                      'p-3 rounded-lg border-2 transition-colors flex flex-col items-center gap-1',
                      footer.layout === layout.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    )}
                  >
                    <layout.icon className="w-5 h-5 text-gray-600" />
                    <span className="text-xs text-gray-600">{layout.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'showLogo', label: 'Logo' },
                { key: 'showSocial', label: 'Social Links' },
                { key: 'showNewsletter', label: 'Newsletter' },
                { key: 'showCopyright', label: 'Copyright' },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={footer[key as keyof FooterConfig] as boolean}
                    onChange={(e) => onFooterChange({ ...footer, [key]: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                </label>
              ))}
            </div>

            {footer.layout === 'columns' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Columns: {footer.columns}
                </label>
                <input
                  type="range"
                  min="2"
                  max="6"
                  value={footer.columns}
                  onChange={(e) => onFooterChange({ ...footer, columns: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// ENHANCEMENT 43: WIDGET AREA MANAGER
// ============================================

interface WidgetAreaManagerProps {
  widgetAreas: WidgetArea[];
  onChange: (widgetAreas: WidgetArea[]) => void;
}

// 50+ Widget Types organized by categories
const widgetCategories: {
  id: string;
  label: string;
  icon: React.FC<any>;
  widgets: { type: WidgetType; label: string; icon: React.FC<any>; description?: string }[]
}[] = [
  {
    id: 'content',
    label: 'Content',
    icon: FileText,
    widgets: [
      { type: 'recent-posts', label: 'Recent Posts', icon: ListOrdered, description: 'Display latest blog posts' },
      { type: 'featured-posts', label: 'Featured Posts', icon: Star, description: 'Highlight important posts' },
      { type: 'popular-posts', label: 'Popular Posts', icon: TrendingUp, description: 'Most viewed content' },
      { type: 'related-posts', label: 'Related Posts', icon: Link, description: 'Similar content suggestions' },
      { type: 'post-carousel', label: 'Post Carousel', icon: Layers, description: 'Sliding post display' },
      { type: 'categories', label: 'Categories', icon: Folder, description: 'Content categories list' },
      { type: 'tags', label: 'Tags Cloud', icon: Tags, description: 'Tag cloud display' },
      { type: 'archives', label: 'Archives', icon: Archive, description: 'Monthly/yearly archives' },
      { type: 'pages-list', label: 'Pages List', icon: Files, description: 'Site pages navigation' },
      { type: 'table-of-contents', label: 'Table of Contents', icon: ListChecks, description: 'Article navigation' },
    ]
  },
  {
    id: 'navigation',
    label: 'Navigation',
    icon: Menu,
    widgets: [
      { type: 'nav-menu', label: 'Navigation Menu', icon: Menu, description: 'Custom navigation menu' },
      { type: 'breadcrumbs', label: 'Breadcrumbs', icon: CornerDownRight, description: 'Page path navigation' },
      { type: 'search', label: 'Search Box', icon: Search, description: 'Site search functionality' },
      { type: 'sitemap', label: 'Site Map', icon: Map, description: 'Full site structure' },
      { type: 'quick-links', label: 'Quick Links', icon: ExternalLink, description: 'Important page shortcuts' },
      { type: 'back-to-top', label: 'Back to Top', icon: ChevronUp, description: 'Scroll to top button' },
      { type: 'pagination', label: 'Pagination', icon: MoreHorizontal, description: 'Page navigation controls' },
    ]
  },
  {
    id: 'social',
    label: 'Social & Engagement',
    icon: Share2,
    widgets: [
      { type: 'social-links', label: 'Social Links', icon: Share2, description: 'Social media profiles' },
      { type: 'social-share', label: 'Share Buttons', icon: Forward, description: 'Content sharing options' },
      { type: 'social-feed', label: 'Social Feed', icon: Rss, description: 'Social media feed display' },
      { type: 'twitter-feed', label: 'Twitter/X Feed', icon: Twitter, description: 'Twitter timeline' },
      { type: 'instagram-feed', label: 'Instagram Feed', icon: Instagram, description: 'Instagram gallery' },
      { type: 'facebook-page', label: 'Facebook Page', icon: Facebook, description: 'Facebook page widget' },
      { type: 'youtube-channel', label: 'YouTube Videos', icon: Youtube, description: 'YouTube video embed' },
      { type: 'twitch-stream', label: 'Twitch Stream', icon: Twitch, description: 'Live stream embed' },
      { type: 'discord-widget', label: 'Discord Widget', icon: MessageCircle, description: 'Discord server widget' },
      { type: 'like-button', label: 'Like Button', icon: ThumbsUp, description: 'Content appreciation' },
      { type: 'rating-stars', label: 'Rating Stars', icon: Star, description: 'Star rating display' },
    ]
  },
  {
    id: 'user',
    label: 'User & Auth',
    icon: User,
    widgets: [
      { type: 'login-form', label: 'Login Form', icon: Key, description: 'User authentication' },
      { type: 'register-form', label: 'Register Form', icon: UserPlus, description: 'New user signup' },
      { type: 'user-profile', label: 'User Profile', icon: User, description: 'User info display' },
      { type: 'user-avatar', label: 'User Avatar', icon: UserCheck, description: 'Profile picture' },
      { type: 'author-bio', label: 'Author Bio', icon: Edit3, description: 'Writer information' },
      { type: 'member-directory', label: 'Member Directory', icon: Users, description: 'User listing' },
      { type: 'online-users', label: 'Online Users', icon: Activity, description: 'Active users count' },
    ]
  },
  {
    id: 'media',
    label: 'Media & Gallery',
    icon: Image,
    widgets: [
      { type: 'image-gallery', label: 'Image Gallery', icon: Image, description: 'Photo collection display' },
      { type: 'image-slider', label: 'Image Slider', icon: Layers, description: 'Sliding image carousel' },
      { type: 'video-player', label: 'Video Player', icon: Video, description: 'Video embed widget' },
      { type: 'video-playlist', label: 'Video Playlist', icon: ListMusic, description: 'Video collection' },
      { type: 'audio-player', label: 'Audio Player', icon: Music, description: 'Music/podcast player' },
      { type: 'podcast-player', label: 'Podcast Player', icon: Podcast, description: 'Podcast episodes' },
      { type: 'media-carousel', label: 'Media Carousel', icon: Film, description: 'Mixed media slider' },
      { type: 'lightbox', label: 'Lightbox Gallery', icon: Maximize, description: 'Full-screen viewer' },
      { type: 'before-after', label: 'Before/After', icon: Columns, description: 'Image comparison' },
    ]
  },
  {
    id: 'forms',
    label: 'Forms & Input',
    icon: MessageSquare,
    widgets: [
      { type: 'contact-form', label: 'Contact Form', icon: Mail, description: 'Contact submission' },
      { type: 'newsletter', label: 'Newsletter Signup', icon: Inbox, description: 'Email subscription' },
      { type: 'comment-form', label: 'Comment Form', icon: MessageSquare, description: 'User comments' },
      { type: 'feedback-form', label: 'Feedback Form', icon: MessageCircle, description: 'User feedback' },
      { type: 'survey-poll', label: 'Survey/Poll', icon: CheckSquare, description: 'Quick polls' },
      { type: 'booking-form', label: 'Booking Form', icon: Calendar, description: 'Appointment booking' },
      { type: 'quote-request', label: 'Quote Request', icon: Receipt, description: 'Price quote form' },
      { type: 'file-upload', label: 'File Upload', icon: Upload, description: 'Document submission' },
    ]
  },
  {
    id: 'ecommerce',
    label: 'E-Commerce',
    icon: ShoppingCart,
    widgets: [
      { type: 'product-grid', label: 'Product Grid', icon: LayoutGrid, description: 'Product catalog display' },
      { type: 'product-carousel', label: 'Product Carousel', icon: Layers, description: 'Sliding products' },
      { type: 'featured-products', label: 'Featured Products', icon: Star, description: 'Highlighted items' },
      { type: 'cart-widget', label: 'Shopping Cart', icon: ShoppingCart, description: 'Cart summary' },
      { type: 'mini-cart', label: 'Mini Cart', icon: Package, description: 'Compact cart view' },
      { type: 'price-filter', label: 'Price Filter', icon: DollarSign, description: 'Price range filter' },
      { type: 'product-categories', label: 'Product Categories', icon: Folder, description: 'Shop categories' },
      { type: 'sale-countdown', label: 'Sale Countdown', icon: Clock, description: 'Promotion timer' },
      { type: 'coupon-code', label: 'Coupon Code', icon: Ticket, description: 'Discount code input' },
      { type: 'wishlist', label: 'Wishlist', icon: Heart, description: 'Saved items' },
      { type: 'compare-products', label: 'Compare Products', icon: Scale, description: 'Product comparison' },
      { type: 'recently-viewed', label: 'Recently Viewed', icon: History, description: 'Browsing history' },
    ]
  },
  {
    id: 'statistics',
    label: 'Stats & Analytics',
    icon: BarChart3,
    widgets: [
      { type: 'visitor-counter', label: 'Visitor Counter', icon: Users, description: 'Site visits display' },
      { type: 'stats-counter', label: 'Stats Counter', icon: BarChart3, description: 'Animated numbers' },
      { type: 'progress-bar', label: 'Progress Bar', icon: Activity, description: 'Progress indicator' },
      { type: 'chart-widget', label: 'Chart Widget', icon: PieChart, description: 'Data visualization' },
      { type: 'live-stats', label: 'Live Statistics', icon: Gauge, description: 'Real-time metrics' },
      { type: 'goal-tracker', label: 'Goal Tracker', icon: Target, description: 'Milestone tracking' },
      { type: 'leaderboard', label: 'Leaderboard', icon: Trophy, description: 'Rankings display' },
    ]
  },
  {
    id: 'info',
    label: 'Information',
    icon: Info,
    widgets: [
      { type: 'about-us', label: 'About Us', icon: Info, description: 'Company information' },
      { type: 'contact-info', label: 'Contact Info', icon: Phone, description: 'Contact details' },
      { type: 'address-map', label: 'Address & Map', icon: MapPin, description: 'Location display' },
      { type: 'business-hours', label: 'Business Hours', icon: Clock, description: 'Opening times' },
      { type: 'faq-accordion', label: 'FAQ Accordion', icon: HelpCircle, description: 'Questions & Answers' },
      { type: 'testimonials', label: 'Testimonials', icon: Quote, description: 'Customer reviews' },
      { type: 'team-members', label: 'Team Members', icon: Users, description: 'Staff profiles' },
      { type: 'clients-logos', label: 'Client Logos', icon: Building2, description: 'Partner showcase' },
      { type: 'certifications', label: 'Certifications', icon: Award, description: 'Badges & awards' },
      { type: 'timeline', label: 'Timeline', icon: GitBranch, description: 'History/milestones' },
    ]
  },
  {
    id: 'utility',
    label: 'Utility',
    icon: Settings,
    widgets: [
      { type: 'custom-html', label: 'Custom HTML', icon: Code, description: 'Raw HTML content' },
      { type: 'custom-css', label: 'Custom CSS', icon: Palette, description: 'Style injection' },
      { type: 'embed-code', label: 'Embed Code', icon: Terminal, description: 'Third-party embeds' },
      { type: 'shortcode', label: 'Shortcode', icon: Hash, description: 'Shortcode renderer' },
      { type: 'spacer', label: 'Spacer', icon: Square, description: 'Empty space' },
      { type: 'divider', label: 'Divider', icon: Minus, description: 'Visual separator' },
      { type: 'text-block', label: 'Text Block', icon: Type, description: 'Rich text content' },
      { type: 'heading', label: 'Heading', icon: Type, description: 'Section title' },
      { type: 'button', label: 'Button', icon: Square, description: 'Call to action' },
      { type: 'icon-box', label: 'Icon Box', icon: Shapes, description: 'Icon with text' },
      { type: 'alert-box', label: 'Alert Box', icon: AlertCircle, description: 'Notice/warning' },
      { type: 'accordion', label: 'Accordion', icon: ChevronDown, description: 'Collapsible sections' },
      { type: 'tabs', label: 'Tabs', icon: Layers, description: 'Tabbed content' },
      { type: 'modal-trigger', label: 'Modal Trigger', icon: Maximize, description: 'Popup launcher' },
    ]
  },
  {
    id: 'weather',
    label: 'Weather & External',
    icon: Cloud,
    widgets: [
      { type: 'weather-widget', label: 'Weather Widget', icon: Cloud, description: 'Current weather' },
      { type: 'weather-forecast', label: 'Weather Forecast', icon: CloudRain, description: 'Multi-day forecast' },
      { type: 'clock-widget', label: 'Clock Widget', icon: Clock, description: 'Current time' },
      { type: 'world-clock', label: 'World Clock', icon: Globe, description: 'Multiple timezones' },
      { type: 'calendar-widget', label: 'Calendar', icon: Calendar, description: 'Date display' },
      { type: 'events-calendar', label: 'Events Calendar', icon: Calendar, description: 'Upcoming events' },
      { type: 'countdown-timer', label: 'Countdown Timer', icon: Clock, description: 'Event countdown' },
      { type: 'currency-converter', label: 'Currency Converter', icon: DollarSign, description: 'Exchange rates' },
      { type: 'stock-ticker', label: 'Stock Ticker', icon: TrendingUp, description: 'Market prices' },
      { type: 'crypto-prices', label: 'Crypto Prices', icon: Coins, description: 'Cryptocurrency rates' },
    ]
  },
];

// Flatten all widgets for easy lookup
const allWidgets = widgetCategories.flatMap(cat => cat.widgets);

const WidgetAreaManager: React.FC<WidgetAreaManagerProps> = ({ widgetAreas, onChange }) => {
  const [selectedArea, setSelectedArea] = useState<string | null>(widgetAreas[0]?.id || null);
  const [selectedCategory, setSelectedCategory] = useState<string>(widgetCategories[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllWidgets, setShowAllWidgets] = useState(false);

  const filteredWidgets = useMemo(() => {
    if (searchQuery) {
      return allWidgets.filter(w =>
        w.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (showAllWidgets) {
      return allWidgets;
    }
    return widgetCategories.find(c => c.id === selectedCategory)?.widgets || [];
  }, [selectedCategory, searchQuery, showAllWidgets]);

  const addWidget = (type: WidgetType) => {
    if (!selectedArea) return;

    const widgetInfo = allWidgets.find(w => w.type === type);
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      title: widgetInfo?.label || 'Widget',
      settings: {},
    };

    onChange(
      widgetAreas.map(area =>
        area.id === selectedArea
          ? { ...area, widgets: [...area.widgets, newWidget] }
          : area
      )
    );
    toast.success(`${widgetInfo?.label || 'Widget'} added`);
  };

  const removeWidget = (widgetId: string) => {
    onChange(
      widgetAreas.map(area => ({
        ...area,
        widgets: area.widgets.filter(w => w.id !== widgetId),
      }))
    );
    toast.success('Widget removed');
  };

  const getWidgetIcon = (type: string) => {
    const widget = allWidgets.find(w => w.type === type);
    return widget?.icon || Code;
  };

  const selectedAreaData = widgetAreas.find(a => a.id === selectedArea);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <PanelLeft className="w-4 h-4" />
        Widget Areas
        <span className="ml-auto text-xs font-normal text-gray-500">
          {allWidgets.length} widgets available
        </span>
      </h3>

      {/* Area Tabs */}
      <div className="flex flex-wrap gap-2">
        {widgetAreas.map(area => (
          <button
            key={area.id}
            onClick={() => setSelectedArea(area.id)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              selectedArea === area.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {area.name}
            <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded text-xs">
              {area.widgets.length}
            </span>
          </button>
        ))}
      </div>

      {selectedAreaData && (
        <>
          {/* Widgets in Area */}
          <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {selectedAreaData.widgets.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <Layers className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No widgets in this area</p>
                <p className="text-xs">Select a widget below to add</p>
              </div>
            ) : (
              selectedAreaData.widgets.map((widget) => {
                const WidgetIcon = getWidgetIcon(widget.type);
                return (
                  <div
                    key={widget.id}
                    className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg group"
                  >
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                    <WidgetIcon className="w-4 h-4 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{widget.title}</p>
                    </div>
                    <button
                      onClick={() => removeWidget(widget.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Widget Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search widgets..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          {!searchQuery && (
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setShowAllWidgets(!showAllWidgets)}
                className={clsx(
                  'px-2 py-1 rounded text-xs font-medium transition-colors',
                  showAllWidgets
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                )}
              >
                All ({allWidgets.length})
              </button>
              {widgetCategories.map(cat => {
                const CatIcon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setShowAllWidgets(false); }}
                    className={clsx(
                      'px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1',
                      selectedCategory === cat.id && !showAllWidgets
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                    )}
                  >
                    <CatIcon className="w-3 h-3" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Widget Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 p-1">
            {filteredWidgets.map(({ type, label, icon: Icon, description }) => (
              <button
                key={type}
                onClick={() => addWidget(type)}
                title={description}
                className="p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700 border border-transparent transition-all flex flex-col items-center gap-1 group"
              >
                <Icon className="w-5 h-5 text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                <span className="text-[10px] text-gray-600 dark:text-gray-400 text-center leading-tight line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">{label}</span>
              </button>
            ))}
          </div>

          {filteredWidgets.length === 0 && searchQuery && (
            <div className="text-center py-4 text-gray-500">
              <Search className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No widgets found for "{searchQuery}"</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ============================================
// ENHANCEMENT 44: LAYOUT PRESETS
// ============================================

interface LayoutPresetsProps {
  presets: LayoutPreset[];
  currentSettings: LayoutSettings;
  onApply: (preset: LayoutPreset) => void;
  onSave: (name: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

const LayoutPresets: React.FC<LayoutPresetsProps> = ({
  presets,
  currentSettings,
  onApply,
  onSave,
  onDelete,
  onToggleFavorite,
}) => {
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');

  const filteredPresets = filter === 'favorites'
    ? presets.filter(p => p.isFavorite)
    : presets;

  const handleSave = () => {
    if (!newPresetName.trim()) return;
    onSave(newPresetName.trim());
    setNewPresetName('');
    setShowSaveInput(false);
    toast.success('Layout preset saved!');
  };

  const builtInPresets = [
    { id: 'classic', name: 'Classic Blog', description: 'Traditional blog layout with sidebar' },
    { id: 'landing', name: 'Landing Page', description: 'Full-width sections for marketing pages' },
    { id: 'portfolio', name: 'Portfolio', description: 'Grid-based portfolio showcase' },
    { id: 'magazine', name: 'Magazine', description: 'Multi-column editorial layout' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={clsx(
              'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            )}
          >
            All ({presets.length + builtInPresets.length})
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={clsx(
              'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
              filter === 'favorites'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            )}
          >
            Favorites ({presets.filter(p => p.isFavorite).length})
          </button>
        </div>
        <button
          onClick={() => setShowSaveInput(true)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" />
          Save Current
        </button>
      </div>

      {showSaveInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            placeholder="Preset name..."
            className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
            autoFocus
          />
          <button onClick={handleSave} className="px-3 py-2 bg-blue-600 text-white rounded-lg">
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSaveInput(false)}
            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Built-in Presets */}
      {filter === 'all' && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-500">Built-in Layouts</h4>
          <div className="grid grid-cols-2 gap-2">
            {builtInPresets.map(preset => (
              <button
                key={preset.id}
                onClick={() => toast.success(`Applied: ${preset.name}`)}
                className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 transition-all text-left"
              >
                <p className="font-medium text-gray-900 dark:text-white text-sm mb-1">{preset.name}</p>
                <p className="text-xs text-gray-500">{preset.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* User Presets */}
      {filteredPresets.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-500">Your Presets</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filteredPresets.map(preset => (
              <div
                key={preset.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
              >
                <Layout className="w-5 h-5 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {preset.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {preset.blocks.length} sections • {new Date(preset.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onToggleFavorite(preset.id)}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    {preset.isFavorite ? (
                      <BookmarkCheck className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <Bookmark className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => onApply(preset)}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    <Check className="w-4 h-4 text-green-600" />
                  </button>
                  <button
                    onClick={() => onDelete(preset.id)}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredPresets.length === 0 && filter === 'favorites' && (
        <div className="text-center py-8 text-gray-500">
          <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No favorite presets yet</p>
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN LAYOUT BUILDER COMPONENT
// ============================================

const LayoutBuilder: React.FC<LayoutBuilderProps> = ({
  settings,
  onSettingsChange,
  onClose,
}) => {
  // State
  const [activeTab, setActiveTab] = useState<'layout' | 'grid' | 'header' | 'presets'>('layout');
  const [selectedDevice, setSelectedDevice] = useState<DeviceBreakpoint>('desktop');
  const [showPreview, setShowPreview] = useState(true);
  const [savedPresets, setSavedPresets] = useState<LayoutPreset[]>([]);

  // Handlers
  const handleBlocksChange = (blocks: LayoutBlock[]) => {
    onSettingsChange({ ...settings, blocks });
  };

  const handleGridChange = (grid: ResponsiveGridConfig) => {
    onSettingsChange({ ...settings, grid });
  };

  const handleHeaderChange = (header: HeaderConfig) => {
    onSettingsChange({ ...settings, header });
  };

  const handleFooterChange = (footer: FooterConfig) => {
    onSettingsChange({ ...settings, footer });
  };

  const handleSpacingChange = (spacing: SpacingPreset) => {
    onSettingsChange({ ...settings, spacing });
  };

  const handleWidgetAreasChange = (widgetAreas: WidgetArea[]) => {
    onSettingsChange({ ...settings, widgetAreas });
  };

  const handleTemplateSelect = (template: SectionTemplate) => {
    const newBlocks = [...settings.blocks, ...template.blocks];
    onSettingsChange({ ...settings, blocks: newBlocks });
  };

  const handleSavePreset = (name: string) => {
    const newPreset: LayoutPreset = {
      id: Date.now().toString(),
      name,
      header: settings.header,
      footer: settings.footer,
      blocks: settings.blocks,
      grid: settings.grid.desktop,
      widgetAreas: settings.widgetAreas,
      createdAt: new Date().toISOString(),
      isFavorite: false,
    };
    setSavedPresets(prev => [newPreset, ...prev]);
  };

  const handleApplyPreset = (preset: LayoutPreset) => {
    onSettingsChange({
      ...settings,
      header: preset.header,
      footer: preset.footer,
      blocks: preset.blocks,
      widgetAreas: preset.widgetAreas,
    });
    toast.success(`Applied: ${preset.name}`);
  };

  const tabs = [
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'grid', label: 'Grid', icon: Grid },
    { id: 'header', label: 'Header/Footer', icon: PanelTop },
    { id: 'presets', label: 'Presets', icon: Bookmark },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-[90vw] w-full max-h-[95vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Layout className="w-6 h-6 text-blue-600" />
          Layout Builder
        </h2>
        <div className="flex items-center gap-2">
          {/* Device Switcher */}
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {[
              { id: 'mobile' as const, icon: Smartphone },
              { id: 'tablet' as const, icon: Tablet },
              { id: 'desktop' as const, icon: Monitor },
            ].map(device => (
              <button
                key={device.id}
                onClick={() => setSelectedDevice(device.id)}
                className={clsx(
                  'p-1.5 rounded transition-colors',
                  selectedDevice === device.id
                    ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <device.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              showPreview ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
            )}
          >
            {showPreview ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
              activeTab === id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Settings Panel */}
        <div className={clsx(
          'overflow-y-auto p-6',
          showPreview ? 'w-1/2 border-r border-gray-200 dark:border-gray-800' : 'w-full'
        )}>
          <AnimatePresence mode="wait">
            {activeTab === 'layout' && (
              <motion.div
                key="layout"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <DragDropEditor
                  blocks={settings.blocks}
                  onChange={handleBlocksChange}
                  selectedDevice={selectedDevice}
                  grid={settings.grid[selectedDevice]}
                />

                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  <SectionTemplates onSelectTemplate={handleTemplateSelect} />
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  <ResponsiveLayoutControls
                    blocks={settings.blocks}
                    onChange={handleBlocksChange}
                    selectedDevice={selectedDevice}
                    onDeviceChange={setSelectedDevice}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'grid' && (
              <motion.div
                key="grid"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <GridCustomizer
                  grid={settings.grid}
                  onChange={handleGridChange}
                  selectedDevice={selectedDevice}
                />

                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  <SpacingEditor
                    spacing={settings.spacing}
                    onChange={handleSpacingChange}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'header' && (
              <motion.div
                key="header"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <HeaderFooterBuilder
                  header={settings.header}
                  footer={settings.footer}
                  onHeaderChange={handleHeaderChange}
                  onFooterChange={handleFooterChange}
                />

                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  <WidgetAreaManager
                    widgetAreas={settings.widgetAreas}
                    onChange={handleWidgetAreasChange}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'presets' && (
              <motion.div
                key="presets"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <LayoutPresets
                  presets={savedPresets}
                  currentSettings={settings}
                  onApply={handleApplyPreset}
                  onSave={handleSavePreset}
                  onDelete={(id) => setSavedPresets(prev => prev.filter(p => p.id !== id))}
                  onToggleFavorite={(id) =>
                    setSavedPresets(prev =>
                      prev.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p)
                    )
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="w-1/2 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-950">
            <div className={clsx(
              'mx-auto bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg transition-all',
              selectedDevice === 'mobile' && 'max-w-[320px]',
              selectedDevice === 'tablet' && 'max-w-[768px]',
              selectedDevice === 'desktop' && 'w-full'
            )}>
              {/* Header Preview */}
              <div className={clsx(
                'flex items-center py-3 px-4 border-b border-gray-200 dark:border-gray-700',
                settings.header.transparent && 'bg-transparent',
                !settings.header.transparent && 'bg-white dark:bg-gray-800'
              )}>
                <span className="font-bold text-gray-900 dark:text-white">Logo</span>
                <div className="flex-1 flex justify-center gap-4">
                  <span className="text-sm text-gray-600">Home</span>
                  <span className="text-sm text-gray-600">About</span>
                </div>
                {settings.header.ctaButton.show && (
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs">
                    {settings.header.ctaButton.text || 'CTA'}
                  </button>
                )}
              </div>

              {/* Blocks Preview */}
              <div
                className="min-h-[400px]"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${settings.grid[selectedDevice].columns}, 1fr)`,
                  gap: `${settings.grid[selectedDevice].gap}px`,
                }}
              >
                {settings.blocks.filter(b => b.responsive[selectedDevice].visible).map(block => {
                  const Icon = blockTypeIcons[block.type];
                  return (
                    <div
                      key={block.id}
                      className="flex items-center justify-center rounded"
                      style={{
                        gridColumn: `span ${block.responsive[selectedDevice].columns}`,
                        background: block.background,
                        padding: `${block.padding.top}px ${block.padding.right}px ${block.padding.bottom}px ${block.padding.left}px`,
                        minHeight: '120px',
                      }}
                    >
                      <div className="text-center text-white/80">
                        <Icon className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">{block.name}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Preview */}
              <div className="py-6 px-4 bg-gray-900 text-center">
                {settings.footer.showLogo && (
                  <p className="text-white font-bold mb-2">Logo</p>
                )}
                {settings.footer.showSocial && (
                  <div className="flex justify-center gap-3 mb-3">
                    <Facebook className="w-4 h-4 text-gray-400" />
                    <Twitter className="w-4 h-4 text-gray-400" />
                    <Instagram className="w-4 h-4 text-gray-400" />
                  </div>
                )}
                {settings.footer.showCopyright && (
                  <p className="text-gray-500 text-xs">
                    {settings.footer.copyrightText || '© 2025 Company'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <button
          onClick={() => {
            const json = JSON.stringify(settings, null, 2);
            navigator.clipboard.writeText(json);
            toast.success('Layout JSON copied!');
          }}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <Copy className="w-4 h-4" />
          Export Layout
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => handleSavePreset(`Layout ${new Date().toLocaleDateString()}`)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Preset
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LayoutBuilder;
