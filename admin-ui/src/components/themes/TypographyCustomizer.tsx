import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Type,
  Upload,
  Download,
  Save,
  Trash2,
  Copy,
  Check,
  X,
  Plus,
  RefreshCw,
  Search,
  Eye,
  EyeOff,
  Smartphone,
  Tablet,
  Monitor,
  ChevronDown,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  RotateCcw,
  Loader2,
  Sparkles,
  ExternalLink,
  Grid,
  List,
  Heart,
  Wand2,
  Minus,
  Settings,
  Layers,
  Link2,
  Unlink,
  ArrowUpDown,
  TextCursor,
  LetterText,
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

// ============================================
// TYPES & INTERFACES
// ============================================

interface FontFamily {
  name: string;
  category: 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace';
  weights: number[];
  isGoogle?: boolean;
  isCustom?: boolean;
  url?: string;
}

interface FontPair {
  id: string;
  name: string;
  heading: string;
  body: string;
  description: string;
  tags: string[];
  popularity: number;
}

interface TypeScale {
  xs: number;
  sm: number;
  base: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
  '5xl': number;
}

interface SpacingConfig {
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  paragraphSpacing: number;
}

interface ResponsiveTypography {
  mobile: TypeScale;
  tablet: TypeScale;
  desktop: TypeScale;
}

interface TypographyPreset {
  id: string;
  name: string;
  headingFont: string;
  bodyFont: string;
  scale: TypeScale;
  spacing: SpacingConfig;
  responsive: ResponsiveTypography;
  createdAt: string;
  isFavorite: boolean;
}

interface TypographySettings {
  headingFont: string;
  headingWeight: number;
  bodyFont: string;
  bodyWeight: number;
  scale: TypeScale;
  spacing: SpacingConfig;
  responsive: ResponsiveTypography;
}

interface TypographyCustomizerProps {
  settings: TypographySettings;
  onSettingsChange: (settings: TypographySettings) => void;
  onClose?: () => void;
}

type DevicePreview = 'mobile' | 'tablet' | 'desktop';

// ============================================
// SAMPLE DATA
// ============================================

const popularGoogleFonts: FontFamily[] = [
  { name: 'Inter', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], isGoogle: true },
  { name: 'Roboto', category: 'sans-serif', weights: [100, 300, 400, 500, 700, 900], isGoogle: true },
  { name: 'Open Sans', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800], isGoogle: true },
  { name: 'Lato', category: 'sans-serif', weights: [100, 300, 400, 700, 900], isGoogle: true },
  { name: 'Montserrat', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], isGoogle: true },
  { name: 'Poppins', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], isGoogle: true },
  { name: 'Source Sans Pro', category: 'sans-serif', weights: [200, 300, 400, 600, 700, 900], isGoogle: true },
  { name: 'Raleway', category: 'sans-serif', weights: [100, 200, 300, 400, 500, 600, 700, 800, 900], isGoogle: true },
  { name: 'Playfair Display', category: 'serif', weights: [400, 500, 600, 700, 800, 900], isGoogle: true },
  { name: 'Merriweather', category: 'serif', weights: [300, 400, 700, 900], isGoogle: true },
  { name: 'Lora', category: 'serif', weights: [400, 500, 600, 700], isGoogle: true },
  { name: 'PT Serif', category: 'serif', weights: [400, 700], isGoogle: true },
  { name: 'Crimson Text', category: 'serif', weights: [400, 600, 700], isGoogle: true },
  { name: 'Libre Baskerville', category: 'serif', weights: [400, 700], isGoogle: true },
  { name: 'Oswald', category: 'display', weights: [200, 300, 400, 500, 600, 700], isGoogle: true },
  { name: 'Bebas Neue', category: 'display', weights: [400], isGoogle: true },
  { name: 'Abril Fatface', category: 'display', weights: [400], isGoogle: true },
  { name: 'Pacifico', category: 'handwriting', weights: [400], isGoogle: true },
  { name: 'Dancing Script', category: 'handwriting', weights: [400, 500, 600, 700], isGoogle: true },
  { name: 'Fira Code', category: 'monospace', weights: [300, 400, 500, 600, 700], isGoogle: true },
  { name: 'JetBrains Mono', category: 'monospace', weights: [100, 200, 300, 400, 500, 600, 700, 800], isGoogle: true },
  { name: 'Source Code Pro', category: 'monospace', weights: [200, 300, 400, 500, 600, 700, 900], isGoogle: true },
];

const fontPairSuggestions: FontPair[] = [
  {
    id: '1',
    name: 'Modern & Clean',
    heading: 'Montserrat',
    body: 'Open Sans',
    description: 'A contemporary pairing perfect for tech and business websites',
    tags: ['modern', 'professional', 'clean'],
    popularity: 95,
  },
  {
    id: '2',
    name: 'Classic Editorial',
    heading: 'Playfair Display',
    body: 'Lato',
    description: 'Elegant combination for blogs, magazines, and editorial content',
    tags: ['elegant', 'editorial', 'classic'],
    popularity: 92,
  },
  {
    id: '3',
    name: 'Bold & Readable',
    heading: 'Oswald',
    body: 'Roboto',
    description: 'High-impact headers with excellent body readability',
    tags: ['bold', 'impactful', 'readable'],
    popularity: 88,
  },
  {
    id: '4',
    name: 'Sophisticated Serif',
    heading: 'Merriweather',
    body: 'Source Sans Pro',
    description: 'Traditional feel with modern sans-serif body text',
    tags: ['sophisticated', 'traditional', 'readable'],
    popularity: 85,
  },
  {
    id: '5',
    name: 'Tech Startup',
    heading: 'Poppins',
    body: 'Inter',
    description: 'Clean geometric fonts ideal for tech and SaaS products',
    tags: ['tech', 'startup', 'geometric'],
    popularity: 90,
  },
  {
    id: '6',
    name: 'Luxury Brand',
    heading: 'Abril Fatface',
    body: 'Lora',
    description: 'Premium feeling for luxury brands and high-end products',
    tags: ['luxury', 'premium', 'brand'],
    popularity: 78,
  },
  {
    id: '7',
    name: 'Creative Agency',
    heading: 'Bebas Neue',
    body: 'Raleway',
    description: 'Bold display font with elegant body text for creative work',
    tags: ['creative', 'bold', 'agency'],
    popularity: 82,
  },
  {
    id: '8',
    name: 'Minimal Blog',
    heading: 'Crimson Text',
    body: 'Inter',
    description: 'Refined serif headers with highly readable body text',
    tags: ['minimal', 'blog', 'refined'],
    popularity: 80,
  },
];

const defaultTypeScale: TypeScale = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
};

const typeScaleRatios = {
  'Minor Second': 1.067,
  'Major Second': 1.125,
  'Minor Third': 1.200,
  'Major Third': 1.250,
  'Perfect Fourth': 1.333,
  'Augmented Fourth': 1.414,
  'Perfect Fifth': 1.500,
  'Golden Ratio': 1.618,
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

const generateTypeScale = (baseSize: number, ratio: number): TypeScale => {
  return {
    xs: Math.round(baseSize / (ratio * ratio)),
    sm: Math.round(baseSize / ratio),
    base: baseSize,
    lg: Math.round(baseSize * ratio),
    xl: Math.round(baseSize * ratio * ratio),
    '2xl': Math.round(baseSize * Math.pow(ratio, 3)),
    '3xl': Math.round(baseSize * Math.pow(ratio, 4)),
    '4xl': Math.round(baseSize * Math.pow(ratio, 5)),
    '5xl': Math.round(baseSize * Math.pow(ratio, 6)),
  };
};

const loadGoogleFont = (fontName: string, weights: number[] = [400, 700]) => {
  const link = document.createElement('link');
  const weightsStr = weights.join(';');
  link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@${weightsStr}&display=swap`;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
};

// ============================================
// ENHANCEMENT 29: FONT PAIR SUGGESTIONS
// ============================================

interface FontPairSuggestionsProps {
  onSelectPair: (heading: string, body: string) => void;
  currentHeading: string;
  currentBody: string;
}

const FontPairSuggestions: React.FC<FontPairSuggestionsProps> = ({
  onSelectPair,
  currentHeading,
  currentBody,
}) => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    fontPairSuggestions.forEach(pair => pair.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, []);

  const filteredPairs = selectedTag
    ? fontPairSuggestions.filter(pair => pair.tags.includes(selectedTag))
    : fontPairSuggestions;

  useEffect(() => {
    // Preload fonts for suggestions
    fontPairSuggestions.forEach(pair => {
      loadGoogleFont(pair.heading);
      loadGoogleFont(pair.body);
    });
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          AI Font Pair Suggestions
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={clsx(
              'p-1.5 rounded transition-colors',
              viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            )}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={clsx(
              'p-1.5 rounded transition-colors',
              viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tag Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedTag(null)}
          className={clsx(
            'px-3 py-1 rounded-full text-xs font-medium transition-colors',
            !selectedTag
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          )}
        >
          All
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={clsx(
              'px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize',
              selectedTag === tag
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Font Pairs Grid/List */}
      <div className={clsx(
        viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-3',
        'max-h-80 overflow-y-auto'
      )}>
        {filteredPairs.map(pair => {
          const isActive = pair.heading === currentHeading && pair.body === currentBody;
          return (
            <motion.div
              key={pair.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onSelectPair(pair.heading, pair.body);
                loadGoogleFont(pair.heading);
                loadGoogleFont(pair.body);
                toast.success(`Applied: ${pair.name}`);
              }}
              className={clsx(
                'p-4 rounded-xl border-2 cursor-pointer transition-all',
                isActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 bg-white dark:bg-gray-800'
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium text-blue-600">{pair.name}</span>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Heart className="w-3 h-3" />
                  {pair.popularity}%
                </div>
              </div>

              {/* Preview */}
              <div className="mb-3">
                <p
                  className="text-lg font-bold text-gray-900 dark:text-white mb-1"
                  style={{ fontFamily: pair.heading }}
                >
                  {pair.heading}
                </p>
                <p
                  className="text-sm text-gray-600 dark:text-gray-400"
                  style={{ fontFamily: pair.body }}
                >
                  {pair.body} - The quick brown fox jumps over the lazy dog.
                </p>
              </div>

              <p className="text-xs text-gray-500">{pair.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-2">
                {pair.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded text-xs capitalize"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// ENHANCEMENT 30: LIVE TYPOGRAPHY PREVIEW
// ============================================

interface LiveTypographyPreviewProps {
  settings: TypographySettings;
  device: DevicePreview;
}

const LiveTypographyPreview: React.FC<LiveTypographyPreviewProps> = ({ settings, device }) => {
  const getScale = () => {
    switch (device) {
      case 'mobile': return settings.responsive.mobile;
      case 'tablet': return settings.responsive.tablet;
      default: return settings.responsive.desktop;
    }
  };

  const scale = getScale();

  const containerClass = clsx(
    'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all',
    device === 'mobile' && 'max-w-[320px]',
    device === 'tablet' && 'max-w-[768px]',
    device === 'desktop' && 'w-full'
  );

  return (
    <div className={containerClass}>
      {/* Browser Chrome */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white dark:bg-gray-900 rounded px-3 py-1 text-xs text-gray-400">
          preview.rustpress.io
        </div>
      </div>

      {/* Content Preview */}
      <div
        className="p-6 space-y-4"
        style={{
          lineHeight: settings.spacing.lineHeight,
          letterSpacing: `${settings.spacing.letterSpacing}em`,
          wordSpacing: `${settings.spacing.wordSpacing}em`,
        }}
      >
        {/* H1 */}
        <h1
          style={{
            fontFamily: settings.headingFont,
            fontWeight: settings.headingWeight,
            fontSize: `${scale['5xl']}px`,
          }}
          className="text-gray-900 dark:text-white"
        >
          Welcome to RustPress
        </h1>

        {/* H2 */}
        <h2
          style={{
            fontFamily: settings.headingFont,
            fontWeight: settings.headingWeight,
            fontSize: `${scale['3xl']}px`,
          }}
          className="text-gray-800 dark:text-gray-100"
        >
          Modern CMS for the Modern Web
        </h2>

        {/* Paragraph */}
        <p
          style={{
            fontFamily: settings.bodyFont,
            fontWeight: settings.bodyWeight,
            fontSize: `${scale.base}px`,
            marginBottom: `${settings.spacing.paragraphSpacing}em`,
          }}
          className="text-gray-600 dark:text-gray-400"
        >
          RustPress is a blazingly fast content management system built with Rust.
          It combines the power of modern web technologies with unparalleled performance
          and security.
        </p>

        {/* H3 */}
        <h3
          style={{
            fontFamily: settings.headingFont,
            fontWeight: settings.headingWeight,
            fontSize: `${scale['2xl']}px`,
          }}
          className="text-gray-800 dark:text-gray-100"
        >
          Key Features
        </h3>

        {/* List */}
        <ul
          className="space-y-2 text-gray-600 dark:text-gray-400"
          style={{
            fontFamily: settings.bodyFont,
            fontWeight: settings.bodyWeight,
            fontSize: `${scale.base}px`,
          }}
        >
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            Lightning-fast page loads
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            Built-in security features
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            Intuitive content editor
          </li>
        </ul>

        {/* Small text */}
        <p
          style={{
            fontFamily: settings.bodyFont,
            fontSize: `${scale.sm}px`,
          }}
          className="text-gray-400"
        >
          *Terms and conditions apply. See our documentation for more details.
        </p>

        {/* Button */}
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          style={{
            fontFamily: settings.bodyFont,
            fontWeight: 600,
            fontSize: `${scale.base}px`,
          }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

// ============================================
// ENHANCEMENT 31: CUSTOM FONT UPLOAD
// ============================================

interface CustomFontUploadProps {
  customFonts: FontFamily[];
  onUpload: (font: FontFamily) => void;
  onDelete: (fontName: string) => void;
}

const CustomFontUpload: React.FC<CustomFontUploadProps> = ({ customFonts, onUpload, onDelete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fontName, setFontName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['.woff', '.woff2', '.ttf', '.otf'];
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!validTypes.includes(ext)) {
        toast.error('Please upload a valid font file (.woff, .woff2, .ttf, .otf)');
        return;
      }
      setSelectedFile(file);
      // Auto-generate font name from file
      if (!fontName) {
        setFontName(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !fontName.trim()) {
      toast.error('Please provide a font name and file');
      return;
    }

    setIsUploading(true);

    try {
      // Create object URL for the font
      const url = URL.createObjectURL(selectedFile);

      // Create @font-face rule
      const fontFace = new FontFace(fontName, `url(${url})`);
      await fontFace.load();
      document.fonts.add(fontFace);

      onUpload({
        name: fontName,
        category: 'sans-serif',
        weights: [400],
        isCustom: true,
        url,
      });

      toast.success(`Font "${fontName}" uploaded successfully!`);
      setFontName('');
      setSelectedFile(null);
    } catch (error) {
      toast.error('Failed to load font file');
    }

    setIsUploading(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <Upload className="w-4 h-4" />
        Custom Fonts
      </h3>

      {/* Upload Form */}
      <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl space-y-3">
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Font Name</label>
          <input
            type="text"
            value={fontName}
            onChange={(e) => setFontName(e.target.value)}
            placeholder="e.g., My Custom Font"
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Font File</label>
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-left truncate"
            >
              {selectedFile ? selectedFile.name : 'Choose file...'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".woff,.woff2,.ttf,.otf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Supports: .woff, .woff2, .ttf, .otf</p>
        </div>

        <button
          onClick={handleUpload}
          disabled={!selectedFile || !fontName.trim() || isUploading}
          className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload Font
            </>
          )}
        </button>
      </div>

      {/* Uploaded Fonts List */}
      {customFonts.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-500">Uploaded Fonts</h4>
          {customFonts.map(font => (
            <div
              key={font.name}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white" style={{ fontFamily: font.name }}>
                  {font.name}
                </p>
                <p className="text-xs text-gray-500">Custom font</p>
              </div>
              <button
                onClick={() => onDelete(font.name)}
                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// ENHANCEMENT 32: GOOGLE FONTS INTEGRATION
// ============================================

interface GoogleFontsBrowserProps {
  onSelectFont: (font: FontFamily, isHeading: boolean) => void;
  selectedHeading: string;
  selectedBody: string;
}

const GoogleFontsBrowser: React.FC<GoogleFontsBrowserProps> = ({
  onSelectFont,
  selectedHeading,
  selectedBody,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState('The quick brown fox jumps over the lazy dog');
  const [previewSize, setPreviewSize] = useState(24);
  const [selectingFor, setSelectingFor] = useState<'heading' | 'body'>('heading');

  const categories = ['serif', 'sans-serif', 'display', 'handwriting', 'monospace'];

  const filteredFonts = useMemo(() => {
    let result = popularGoogleFonts;

    if (searchQuery) {
      result = result.filter(font =>
        font.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      result = result.filter(font => font.category === selectedCategory);
    }

    return result;
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          Google Fonts
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectingFor('heading')}
            className={clsx(
              'px-3 py-1 rounded text-xs font-medium transition-colors',
              selectingFor === 'heading'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            )}
          >
            Heading
          </button>
          <button
            onClick={() => setSelectingFor('body')}
            className={clsx(
              'px-3 py-1 rounded text-xs font-medium transition-colors',
              selectingFor === 'body'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            )}
          >
            Body
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search fonts..."
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
              'px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize',
              selectedCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Preview Controls */}
      <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <input
          type="text"
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          className="flex-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm"
          placeholder="Preview text"
        />
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{previewSize}px</span>
          <input
            type="range"
            min="12"
            max="48"
            value={previewSize}
            onChange={(e) => setPreviewSize(parseInt(e.target.value))}
            className="w-20"
          />
        </div>
      </div>

      {/* Font List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredFonts.map(font => {
          const isSelected = selectingFor === 'heading'
            ? font.name === selectedHeading
            : font.name === selectedBody;

          return (
            <div
              key={font.name}
              onClick={() => {
                loadGoogleFont(font.name, font.weights);
                onSelectFont(font, selectingFor === 'heading');
                toast.success(`${font.name} set as ${selectingFor} font`);
              }}
              className={clsx(
                'p-3 rounded-lg cursor-pointer transition-all border-2',
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-transparent bg-gray-50 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{font.name}</span>
                <span className="text-xs text-gray-400 capitalize">{font.category}</span>
              </div>
              <p
                className="text-gray-700 dark:text-gray-300 truncate"
                style={{ fontFamily: font.name, fontSize: `${previewSize}px` }}
              >
                {previewText}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {font.weights.map(w => (
                  <span key={w} className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-500 text-xs rounded">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// ENHANCEMENT 33: FONT SIZE SCALE EDITOR
// ============================================

interface FontSizeScaleEditorProps {
  scale: TypeScale;
  onChange: (scale: TypeScale) => void;
}

const FontSizeScaleEditor: React.FC<FontSizeScaleEditorProps> = ({ scale, onChange }) => {
  const [baseSize, setBaseSize] = useState(scale.base);
  const [selectedRatio, setSelectedRatio] = useState<string>('Major Third');
  const [isLinked, setIsLinked] = useState(true);

  const handleBaseChange = (newBase: number) => {
    setBaseSize(newBase);
    if (isLinked) {
      const ratio = typeScaleRatios[selectedRatio as keyof typeof typeScaleRatios];
      onChange(generateTypeScale(newBase, ratio));
    } else {
      onChange({ ...scale, base: newBase });
    }
  };

  const handleRatioChange = (ratioName: string) => {
    setSelectedRatio(ratioName);
    const ratio = typeScaleRatios[ratioName as keyof typeof typeScaleRatios];
    onChange(generateTypeScale(baseSize, ratio));
  };

  const handleSizeChange = (key: keyof TypeScale, value: number) => {
    onChange({ ...scale, [key]: value });
  };

  const scaleLabels: Record<keyof TypeScale, string> = {
    xs: 'Extra Small',
    sm: 'Small',
    base: 'Base',
    lg: 'Large',
    xl: 'Extra Large',
    '2xl': '2X Large',
    '3xl': '3X Large',
    '4xl': '4X Large',
    '5xl': '5X Large',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4" />
          Type Scale
        </h3>
        <button
          onClick={() => setIsLinked(!isLinked)}
          className={clsx(
            'flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors',
            isLinked
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-100 text-gray-500'
          )}
        >
          {isLinked ? <Link2 className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
          {isLinked ? 'Linked' : 'Manual'}
        </button>
      </div>

      {/* Base Size & Ratio */}
      {isLinked && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Base Size</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={baseSize}
                onChange={(e) => handleBaseChange(parseInt(e.target.value) || 16)}
                className="w-20 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              />
              <span className="text-sm text-gray-400">px</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Scale Ratio</label>
            <select
              value={selectedRatio}
              onChange={(e) => handleRatioChange(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
            >
              {Object.entries(typeScaleRatios).map(([name, ratio]) => (
                <option key={name} value={name}>
                  {name} ({ratio})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Scale Values */}
      <div className="space-y-2">
        {(Object.keys(scale) as Array<keyof TypeScale>).map(key => (
          <div key={key} className="flex items-center gap-3">
            <div className="w-24">
              <span className="text-xs font-medium text-gray-500">{scaleLabels[key]}</span>
            </div>
            <div className="flex-1 flex items-center gap-2">
              <input
                type="range"
                min="8"
                max="96"
                value={scale[key]}
                onChange={(e) => handleSizeChange(key, parseInt(e.target.value))}
                disabled={isLinked && key !== 'base'}
                className="flex-1"
              />
              <input
                type="number"
                value={scale[key]}
                onChange={(e) => handleSizeChange(key, parseInt(e.target.value) || 16)}
                disabled={isLinked && key !== 'base'}
                className="w-16 px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm text-center"
              />
              <span className="text-xs text-gray-400 w-6">px</span>
            </div>
            <div
              className="text-gray-700 dark:text-gray-300"
              style={{ fontSize: `${Math.min(scale[key], 32)}px` }}
            >
              Aa
            </div>
          </div>
        ))}
      </div>

      {/* Reset */}
      <button
        onClick={() => onChange(defaultTypeScale)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <RotateCcw className="w-4 h-4" />
        Reset to default
      </button>
    </div>
  );
};

// ============================================
// ENHANCEMENT 34: LINE HEIGHT / LETTER SPACING
// ============================================

interface SpacingControlsProps {
  spacing: SpacingConfig;
  onChange: (spacing: SpacingConfig) => void;
}

const SpacingControls: React.FC<SpacingControlsProps> = ({ spacing, onChange }) => {
  const controls = [
    {
      key: 'lineHeight' as const,
      label: 'Line Height',
      min: 1,
      max: 3,
      step: 0.1,
      unit: '',
      description: 'Space between lines of text',
    },
    {
      key: 'letterSpacing' as const,
      label: 'Letter Spacing',
      min: -0.1,
      max: 0.5,
      step: 0.01,
      unit: 'em',
      description: 'Space between individual characters',
    },
    {
      key: 'wordSpacing' as const,
      label: 'Word Spacing',
      min: 0,
      max: 1,
      step: 0.05,
      unit: 'em',
      description: 'Space between words',
    },
    {
      key: 'paragraphSpacing' as const,
      label: 'Paragraph Spacing',
      min: 0.5,
      max: 3,
      step: 0.1,
      unit: 'em',
      description: 'Space between paragraphs',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
        <Sliders className="w-4 h-4" />
        Spacing Controls
      </h3>

      <div className="space-y-4">
        {controls.map(control => (
          <div key={control.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {control.label}
              </label>
              <span className="text-sm text-gray-500">
                {spacing[control.key].toFixed(2)}{control.unit}
              </span>
            </div>
            <input
              type="range"
              min={control.min}
              max={control.max}
              step={control.step}
              value={spacing[control.key]}
              onChange={(e) => onChange({ ...spacing, [control.key]: parseFloat(e.target.value) })}
              className="w-full"
            />
            <p className="text-xs text-gray-400">{control.description}</p>
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <p
          className="text-gray-700 dark:text-gray-300"
          style={{
            lineHeight: spacing.lineHeight,
            letterSpacing: `${spacing.letterSpacing}em`,
            wordSpacing: `${spacing.wordSpacing}em`,
          }}
        >
          The quick brown fox jumps over the lazy dog. This is a sample paragraph to demonstrate
          how your spacing settings affect the readability and appearance of text content.
        </p>
        <p
          className="text-gray-700 dark:text-gray-300 mt-4"
          style={{
            lineHeight: spacing.lineHeight,
            letterSpacing: `${spacing.letterSpacing}em`,
            wordSpacing: `${spacing.wordSpacing}em`,
            marginTop: `${spacing.paragraphSpacing}em`,
          }}
        >
          A second paragraph shows the paragraph spacing in action. Good typography makes content
          easier to read and more enjoyable to consume.
        </p>
      </div>

      {/* Reset */}
      <button
        onClick={() => onChange({
          lineHeight: 1.6,
          letterSpacing: 0,
          wordSpacing: 0,
          paragraphSpacing: 1.5,
        })}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <RotateCcw className="w-4 h-4" />
        Reset to default
      </button>
    </div>
  );
};

// ============================================
// ENHANCEMENT 35: RESPONSIVE TYPOGRAPHY
// ============================================

interface ResponsiveTypographyEditorProps {
  responsive: ResponsiveTypography;
  onChange: (responsive: ResponsiveTypography) => void;
}

const ResponsiveTypographyEditor: React.FC<ResponsiveTypographyEditorProps> = ({
  responsive,
  onChange,
}) => {
  const [activeDevice, setActiveDevice] = useState<DevicePreview>('desktop');
  const [syncDevices, setSyncDevices] = useState(false);

  const devices: { id: DevicePreview; label: string; icon: React.FC<any>; width: string }[] = [
    { id: 'mobile', label: 'Mobile', icon: Smartphone, width: '< 640px' },
    { id: 'tablet', label: 'Tablet', icon: Tablet, width: '640px - 1024px' },
    { id: 'desktop', label: 'Desktop', icon: Monitor, width: '> 1024px' },
  ];

  const handleScaleChange = (device: DevicePreview, key: keyof TypeScale, value: number) => {
    if (syncDevices) {
      // Apply same ratio change to all devices
      const ratio = value / responsive[device][key];
      onChange({
        mobile: {
          ...responsive.mobile,
          [key]: Math.round(responsive.mobile[key] * ratio),
        },
        tablet: {
          ...responsive.tablet,
          [key]: Math.round(responsive.tablet[key] * ratio),
        },
        desktop: {
          ...responsive.desktop,
          [key]: Math.round(responsive.desktop[key] * ratio),
        },
      });
    } else {
      onChange({
        ...responsive,
        [device]: {
          ...responsive[device],
          [key]: value,
        },
      });
    }
  };

  const autoScale = () => {
    // Auto-generate mobile and tablet from desktop
    const desktop = responsive.desktop;
    onChange({
      mobile: {
        xs: Math.round(desktop.xs * 0.85),
        sm: Math.round(desktop.sm * 0.85),
        base: Math.round(desktop.base * 0.9),
        lg: Math.round(desktop.lg * 0.85),
        xl: Math.round(desktop.xl * 0.8),
        '2xl': Math.round(desktop['2xl'] * 0.75),
        '3xl': Math.round(desktop['3xl'] * 0.7),
        '4xl': Math.round(desktop['4xl'] * 0.65),
        '5xl': Math.round(desktop['5xl'] * 0.6),
      },
      tablet: {
        xs: Math.round(desktop.xs * 0.9),
        sm: Math.round(desktop.sm * 0.9),
        base: desktop.base,
        lg: Math.round(desktop.lg * 0.9),
        xl: Math.round(desktop.xl * 0.85),
        '2xl': Math.round(desktop['2xl'] * 0.85),
        '3xl': Math.round(desktop['3xl'] * 0.8),
        '4xl': Math.round(desktop['4xl'] * 0.75),
        '5xl': Math.round(desktop['5xl'] * 0.7),
      },
      desktop,
    });
    toast.success('Auto-scaled typography for all devices');
  };

  const currentScale = responsive[activeDevice];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Responsive Typography
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSyncDevices(!syncDevices)}
            className={clsx(
              'flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors',
              syncDevices ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
            )}
          >
            {syncDevices ? <Link2 className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
            {syncDevices ? 'Synced' : 'Independent'}
          </button>
          <button
            onClick={autoScale}
            className="flex items-center gap-1 text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded hover:bg-purple-200 transition-colors"
          >
            <Wand2 className="w-3 h-3" />
            Auto Scale
          </button>
        </div>
      </div>

      {/* Device Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {devices.map(device => {
          const Icon = device.icon;
          return (
            <button
              key={device.id}
              onClick={() => setActiveDevice(device.id)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors',
                activeDevice === device.id
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

      {/* Breakpoint Info */}
      <div className="text-xs text-gray-500 text-center">
        {devices.find(d => d.id === activeDevice)?.width}
      </div>

      {/* Scale Editor for Current Device */}
      <div className="space-y-2">
        {(Object.keys(currentScale) as Array<keyof TypeScale>).map(key => (
          <div key={key} className="flex items-center gap-3">
            <div className="w-16 text-xs font-medium text-gray-500 uppercase">{key}</div>
            <input
              type="range"
              min="8"
              max="96"
              value={currentScale[key]}
              onChange={(e) => handleScaleChange(activeDevice, key, parseInt(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              value={currentScale[key]}
              onChange={(e) => handleScaleChange(activeDevice, key, parseInt(e.target.value) || 16)}
              className="w-14 px-2 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs text-center"
            />
          </div>
        ))}
      </div>

      {/* Comparison View */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <h4 className="text-xs font-medium text-gray-500 mb-3">Size Comparison</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          {devices.map(device => (
            <div key={device.id}>
              <device.icon className="w-4 h-4 mx-auto mb-1 text-gray-400" />
              <p className="text-xs text-gray-500 mb-2">{device.label}</p>
              <p
                className="text-gray-700 dark:text-gray-300 font-medium"
                style={{ fontSize: `${Math.min(responsive[device.id].base, 20)}px` }}
              >
                {responsive[device.id].base}px
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// ENHANCEMENT 36: TYPOGRAPHY PRESETS
// ============================================

interface TypographyPresetsProps {
  presets: TypographyPreset[];
  currentSettings: TypographySettings;
  onApply: (preset: TypographyPreset) => void;
  onSave: (name: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

const TypographyPresets: React.FC<TypographyPresetsProps> = ({
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
    toast.success('Preset saved!');
  };

  const builtInPresets: Partial<TypographyPreset>[] = [
    {
      id: 'builtin-1',
      name: 'Clean & Modern',
      headingFont: 'Inter',
      bodyFont: 'Inter',
    },
    {
      id: 'builtin-2',
      name: 'Editorial',
      headingFont: 'Playfair Display',
      bodyFont: 'Merriweather',
    },
    {
      id: 'builtin-3',
      name: 'Tech Startup',
      headingFont: 'Poppins',
      bodyFont: 'Inter',
    },
    {
      id: 'builtin-4',
      name: 'Bold Impact',
      headingFont: 'Oswald',
      bodyFont: 'Open Sans',
    },
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
          <button
            onClick={handleSave}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg"
          >
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
          <h4 className="text-xs font-medium text-gray-500">Built-in Presets</h4>
          <div className="grid grid-cols-2 gap-2">
            {builtInPresets.map(preset => (
              <button
                key={preset.id}
                onClick={() => {
                  loadGoogleFont(preset.headingFont!);
                  loadGoogleFont(preset.bodyFont!);
                  onApply({
                    id: preset.id!,
                    name: preset.name!,
                    headingFont: preset.headingFont!,
                    bodyFont: preset.bodyFont!,
                    scale: defaultTypeScale,
                    spacing: {
                      lineHeight: 1.6,
                      letterSpacing: 0,
                      wordSpacing: 0,
                      paragraphSpacing: 1.5,
                    },
                    responsive: {
                      mobile: defaultTypeScale,
                      tablet: defaultTypeScale,
                      desktop: defaultTypeScale,
                    },
                    createdAt: '',
                    isFavorite: false,
                  });
                }}
                className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 transition-all text-left"
              >
                <p className="font-medium text-gray-900 dark:text-white text-sm mb-1">{preset.name}</p>
                <p className="text-xs text-gray-500">{preset.headingFont} + {preset.bodyFont}</p>
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
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                    {preset.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {preset.headingFont} + {preset.bodyFont}
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
// MAIN TYPOGRAPHY CUSTOMIZER COMPONENT
// ============================================

const TypographyCustomizer: React.FC<TypographyCustomizerProps> = ({
  settings,
  onSettingsChange,
  onClose,
}) => {
  // State
  const [activeTab, setActiveTab] = useState<'fonts' | 'scale' | 'spacing' | 'presets'>('fonts');
  const [previewDevice, setPreviewDevice] = useState<DevicePreview>('desktop');
  const [showPreview, setShowPreview] = useState(true);
  const [customFonts, setCustomFonts] = useState<FontFamily[]>([]);
  const [savedPresets, setSavedPresets] = useState<TypographyPreset[]>([]);

  // Load fonts on mount
  useEffect(() => {
    loadGoogleFont(settings.headingFont);
    loadGoogleFont(settings.bodyFont);
  }, []);

  // Handlers
  const handleFontPairSelect = (heading: string, body: string) => {
    onSettingsChange({
      ...settings,
      headingFont: heading,
      bodyFont: body,
    });
  };

  const handleFontSelect = (font: FontFamily, isHeading: boolean) => {
    if (isHeading) {
      onSettingsChange({ ...settings, headingFont: font.name });
    } else {
      onSettingsChange({ ...settings, bodyFont: font.name });
    }
  };

  const handleCustomFontUpload = (font: FontFamily) => {
    setCustomFonts(prev => [...prev, font]);
  };

  const handleCustomFontDelete = (fontName: string) => {
    setCustomFonts(prev => prev.filter(f => f.name !== fontName));
  };

  const handleSavePreset = (name: string) => {
    const newPreset: TypographyPreset = {
      id: Date.now().toString(),
      name,
      headingFont: settings.headingFont,
      bodyFont: settings.bodyFont,
      scale: settings.scale,
      spacing: settings.spacing,
      responsive: settings.responsive,
      createdAt: new Date().toISOString(),
      isFavorite: false,
    };
    setSavedPresets(prev => [newPreset, ...prev]);
  };

  const handleApplyPreset = (preset: TypographyPreset) => {
    loadGoogleFont(preset.headingFont);
    loadGoogleFont(preset.bodyFont);
    onSettingsChange({
      ...settings,
      headingFont: preset.headingFont,
      bodyFont: preset.bodyFont,
      scale: preset.scale,
      spacing: preset.spacing,
      responsive: preset.responsive,
    });
    toast.success(`Applied: ${preset.name}`);
  };

  const tabs = [
    { id: 'fonts', label: 'Fonts', icon: Type },
    { id: 'scale', label: 'Scale', icon: ArrowUpDown },
    { id: 'spacing', label: 'Spacing', icon: Sliders },
    { id: 'presets', label: 'Presets', icon: Bookmark },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-[90vw] w-full max-h-[95vh] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Type className="w-6 h-6 text-blue-600" />
          Typography Customizer
        </h2>
        <div className="flex items-center gap-2">
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
            {activeTab === 'fonts' && (
              <motion.div
                key="fonts"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Current Selection */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <h4 className="text-xs font-medium text-gray-500 mb-3">Current Selection</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Heading</label>
                      <p className="font-bold text-lg" style={{ fontFamily: settings.headingFont }}>
                        {settings.headingFont}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Body</label>
                      <p className="text-lg" style={{ fontFamily: settings.bodyFont }}>
                        {settings.bodyFont}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Font Pair Suggestions */}
                <FontPairSuggestions
                  onSelectPair={handleFontPairSelect}
                  currentHeading={settings.headingFont}
                  currentBody={settings.bodyFont}
                />

                {/* Google Fonts Browser */}
                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  <GoogleFontsBrowser
                    onSelectFont={handleFontSelect}
                    selectedHeading={settings.headingFont}
                    selectedBody={settings.bodyFont}
                  />
                </div>

                {/* Custom Font Upload */}
                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  <CustomFontUpload
                    customFonts={customFonts}
                    onUpload={handleCustomFontUpload}
                    onDelete={handleCustomFontDelete}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'scale' && (
              <motion.div
                key="scale"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <FontSizeScaleEditor
                  scale={settings.scale}
                  onChange={(scale) => onSettingsChange({ ...settings, scale })}
                />

                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                  <ResponsiveTypographyEditor
                    responsive={settings.responsive}
                    onChange={(responsive) => onSettingsChange({ ...settings, responsive })}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'spacing' && (
              <motion.div
                key="spacing"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <SpacingControls
                  spacing={settings.spacing}
                  onChange={(spacing) => onSettingsChange({ ...settings, spacing })}
                />
              </motion.div>
            )}

            {activeTab === 'presets' && (
              <motion.div
                key="presets"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <TypographyPresets
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
            {/* Device Switcher */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {[
                { id: 'mobile' as const, icon: Smartphone },
                { id: 'tablet' as const, icon: Tablet },
                { id: 'desktop' as const, icon: Monitor },
              ].map(device => (
                <button
                  key={device.id}
                  onClick={() => setPreviewDevice(device.id)}
                  className={clsx(
                    'p-2 rounded-lg transition-colors',
                    previewDevice === device.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-700'
                  )}
                >
                  <device.icon className="w-5 h-5" />
                </button>
              ))}
            </div>

            {/* Preview */}
            <div className="flex justify-center">
              <LiveTypographyPreview
                settings={settings}
                device={previewDevice}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <button
          onClick={() => {
            const css = `
/* Typography Variables */
:root {
  --font-heading: "${settings.headingFont}", sans-serif;
  --font-body: "${settings.bodyFont}", sans-serif;
  --font-size-xs: ${settings.scale.xs}px;
  --font-size-sm: ${settings.scale.sm}px;
  --font-size-base: ${settings.scale.base}px;
  --font-size-lg: ${settings.scale.lg}px;
  --font-size-xl: ${settings.scale.xl}px;
  --font-size-2xl: ${settings.scale['2xl']}px;
  --font-size-3xl: ${settings.scale['3xl']}px;
  --font-size-4xl: ${settings.scale['4xl']}px;
  --font-size-5xl: ${settings.scale['5xl']}px;
  --line-height: ${settings.spacing.lineHeight};
  --letter-spacing: ${settings.spacing.letterSpacing}em;
}`;
            navigator.clipboard.writeText(css);
            toast.success('CSS variables copied!');
          }}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        >
          <Copy className="w-4 h-4" />
          Copy CSS Variables
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => handleSavePreset(`Typography ${new Date().toLocaleDateString()}`)}
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

export default TypographyCustomizer;
